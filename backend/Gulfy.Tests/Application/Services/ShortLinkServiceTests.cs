using Gulfy.Application.Configuration;
using Gulfy.Application.Dtos;
using Gulfy.Application.Exceptions;
using Gulfy.Application.Services;
using Gulfy.Infrastructure.Persistence;
using Gulfy.Infrastructure.Platform;
using Gulfy.Infrastructure.ShortCodes;

namespace Gulfy.Tests.Application.Services;

public class ShortLinkServiceTests
{
    private static ShortLinkService NewService(out InMemoryShortLinkRepository repository)
    {
        repository = new InMemoryShortLinkRepository();
        return new ShortLinkService(
            repository,
            new RandomBase62ShortCodeGenerator(repository),
            new CustomAliasShortCodeGenerator(repository),
            new UserAgentPlatformResolver(),
            new ShortUrlOptions { BaseUrl = "http://localhost:5001" });
    }

    [Fact]
    public async Task CreateAsync_generates_an_auto_code_when_no_alias_given()
    {
        var service = NewService(out _);

        var dto = await service.CreateAsync(new CreateShortLinkRequest("https://example.com", null, null));

        Assert.Equal("Auto", dto.Source);
        Assert.Equal("http://localhost:5001/" + dto.ShortCode, dto.ShortUrl);
        Assert.Equal(0, dto.ClickCount);
        Assert.False(dto.IsDisabled);
    }

    [Fact]
    public async Task CreateAsync_uses_the_requested_alias_as_the_short_code()
    {
        var service = NewService(out _);

        var dto = await service.CreateAsync(new CreateShortLinkRequest("https://example.com", "my-alias", null));

        Assert.Equal("my-alias", dto.ShortCode);
        Assert.Equal("CustomAlias", dto.Source);
    }

    [Fact]
    public async Task CreateAsync_rejects_an_invalid_original_url()
    {
        var service = NewService(out _);

        await Assert.ThrowsAsync<ApplicationValidationException>(
            () => service.CreateAsync(new CreateShortLinkRequest("not-a-url", null, null)));
    }

    [Fact]
    public async Task CreateAsync_rejects_a_taken_alias()
    {
        var service = NewService(out _);
        await service.CreateAsync(new CreateShortLinkRequest("https://example.com", "taken", null));

        await Assert.ThrowsAsync<ShortCodeConflictException>(
            () => service.CreateAsync(new CreateShortLinkRequest("https://example.org", "taken", null)));
    }

    [Fact]
    public async Task CreateAsync_stores_platform_destination_overrides()
    {
        var service = NewService(out _);

        var dto = await service.CreateAsync(new CreateShortLinkRequest(
            "https://example.com",
            "with-platforms",
            new PlatformDestinationsRequest("https://example.com/ios", "https://example.com/android")));

        Assert.Equal("https://example.com/ios", dto.PlatformDestinations["Ios"]);
        Assert.Equal("https://example.com/android", dto.PlatformDestinations["Android"]);
    }

    [Fact]
    public async Task ResolveAsync_increments_click_count_and_updates_last_accessed()
    {
        var service = NewService(out var repository);
        var dto = await service.CreateAsync(new CreateShortLinkRequest("https://example.com", "clicky", null));
        Assert.Null((await repository.GetByCodeAsync(dto.ShortCode))!.LastAccessedAt);

        await service.ResolveAsync(dto.ShortCode, userAgent: null);
        await service.ResolveAsync(dto.ShortCode, userAgent: null);

        var link = await repository.GetByCodeAsync(dto.ShortCode);
        Assert.Equal(2, link!.ClickCount);
        Assert.NotNull(link.LastAccessedAt);
    }

    [Fact]
    public async Task ResolveAsync_returns_platform_override_when_present()
    {
        var service = NewService(out _);
        var dto = await service.CreateAsync(new CreateShortLinkRequest(
            "https://example.com",
            "platform-aware",
            new PlatformDestinationsRequest(Ios: "https://example.com/ios", Android: null)));

        var destination = await service.ResolveAsync(dto.ShortCode, "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)");

        Assert.Equal("https://example.com/ios", destination);
    }

    [Fact]
    public async Task ResolveAsync_falls_back_to_original_url_when_no_override_matches()
    {
        var service = NewService(out _);
        var dto = await service.CreateAsync(new CreateShortLinkRequest(
            "https://example.com",
            "fallback",
            new PlatformDestinationsRequest(Ios: "https://example.com/ios", Android: null)));

        var destination = await service.ResolveAsync(dto.ShortCode, "Mozilla/5.0 (Linux; Android 14)");

        Assert.Equal("https://example.com", destination);
    }

    [Fact]
    public async Task ResolveAsync_throws_not_found_for_unknown_code()
    {
        var service = NewService(out _);

        await Assert.ThrowsAsync<ShortLinkNotFoundException>(() => service.ResolveAsync("missing", null));
    }

    [Fact]
    public async Task ResolveAsync_throws_not_found_for_a_disabled_link()
    {
        var service = NewService(out _);
        var dto = await service.CreateAsync(new CreateShortLinkRequest("https://example.com", "disabled-link", null));
        await service.DisableAsync(dto.ShortCode);

        await Assert.ThrowsAsync<ShortLinkNotFoundException>(() => service.ResolveAsync(dto.ShortCode, null));
    }

    [Fact]
    public async Task ResolveAsync_throws_not_found_for_a_deleted_link()
    {
        var service = NewService(out _);
        var dto = await service.CreateAsync(new CreateShortLinkRequest("https://example.com", "deleted-link", null));
        await service.DeleteAsync(dto.ShortCode);

        await Assert.ThrowsAsync<ShortLinkNotFoundException>(() => service.ResolveAsync(dto.ShortCode, null));
    }

    [Fact]
    public async Task DisableAsync_then_EnableAsync_restores_resolution()
    {
        var service = NewService(out _);
        var dto = await service.CreateAsync(new CreateShortLinkRequest("https://example.com", "toggle", null));

        await service.DisableAsync(dto.ShortCode);
        Assert.True((await service.GetByCodeAsync(dto.ShortCode)).IsDisabled);

        await service.EnableAsync(dto.ShortCode);
        Assert.False((await service.GetByCodeAsync(dto.ShortCode)).IsDisabled);
        await service.ResolveAsync(dto.ShortCode, null); // does not throw
    }

    [Fact]
    public async Task EnableAsync_after_delete_throws_not_found()
    {
        var service = NewService(out _);
        var dto = await service.CreateAsync(new CreateShortLinkRequest("https://example.com", "delete-then-enable", null));

        await service.DeleteAsync(dto.ShortCode);

        await Assert.ThrowsAsync<ShortLinkNotFoundException>(() => service.EnableAsync(dto.ShortCode));
        await Assert.ThrowsAsync<ShortLinkNotFoundException>(() => service.ResolveAsync(dto.ShortCode, null));
    }

    [Fact]
    public async Task DeleteAsync_removes_link_from_GetAllAsync()
    {
        var service = NewService(out _);
        var dto = await service.CreateAsync(new CreateShortLinkRequest("https://example.com", "list-then-delete", null));

        await service.DeleteAsync(dto.ShortCode);

        Assert.DoesNotContain(await service.GetAllAsync(), l => l.ShortCode == dto.ShortCode);
    }

    [Fact]
    public async Task GetByCodeAsync_throws_not_found_for_a_deleted_link()
    {
        var service = NewService(out _);
        var dto = await service.CreateAsync(new CreateShortLinkRequest("https://example.com", "get-then-delete", null));

        await service.DeleteAsync(dto.ShortCode);

        await Assert.ThrowsAsync<ShortLinkNotFoundException>(() => service.GetByCodeAsync(dto.ShortCode));
    }

    [Fact]
    public async Task GetAllAsync_returns_every_created_link()
    {
        var service = NewService(out _);
        await service.CreateAsync(new CreateShortLinkRequest("https://example.com", "one", null));
        await service.CreateAsync(new CreateShortLinkRequest("https://example.org", "two", null));

        var all = await service.GetAllAsync();

        Assert.Equal(2, all.Count);
    }

    [Fact]
    public async Task GetByCodeAsync_throws_not_found_for_unknown_code()
    {
        var service = NewService(out _);

        await Assert.ThrowsAsync<ShortLinkNotFoundException>(() => service.GetByCodeAsync("missing"));
    }

    [Fact]
    public async Task DisableAsync_throws_not_found_for_unknown_code()
    {
        var service = NewService(out _);

        await Assert.ThrowsAsync<ShortLinkNotFoundException>(() => service.DisableAsync("missing"));
    }
}
