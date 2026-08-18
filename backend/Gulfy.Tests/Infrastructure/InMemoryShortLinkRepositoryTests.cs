using Gulfy.Domain;
using Gulfy.Domain.Enums;
using Gulfy.Infrastructure.Persistence;

namespace Gulfy.Tests.Infrastructure;

public class InMemoryShortLinkRepositoryTests
{
    private static ShortLink NewLink(string code = "abc123") =>
        ShortLink.Create(code, "https://example.com", ShortCodeSource.Auto, DateTimeOffset.UtcNow);

    [Fact]
    public async Task AddAsync_then_GetByCodeAsync_returns_the_same_link()
    {
        var repo = new InMemoryShortLinkRepository();
        var link = NewLink();

        await repo.AddAsync(link);
        var fetched = await repo.GetByCodeAsync(link.ShortCode);

        Assert.Same(link, fetched);
    }

    [Fact]
    public async Task GetByCodeAsync_returns_null_for_unknown_code()
    {
        var repo = new InMemoryShortLinkRepository();

        Assert.Null(await repo.GetByCodeAsync("missing"));
    }

    [Fact]
    public async Task AddAsync_throws_on_duplicate_short_code()
    {
        var repo = new InMemoryShortLinkRepository();
        await repo.AddAsync(NewLink("dup1"));

        await Assert.ThrowsAsync<InvalidOperationException>(() => repo.AddAsync(NewLink("dup1")));
    }

    [Fact]
    public async Task ExistsAsync_reflects_added_codes()
    {
        var repo = new InMemoryShortLinkRepository();
        await repo.AddAsync(NewLink("exists1"));

        Assert.True(await repo.ExistsAsync("exists1"));
        Assert.False(await repo.ExistsAsync("nope"));
    }

    [Fact]
    public async Task GetAllAsync_returns_every_added_link()
    {
        var repo = new InMemoryShortLinkRepository();
        await repo.AddAsync(NewLink("all1"));
        await repo.AddAsync(NewLink("all2"));

        var all = await repo.GetAllAsync();

        Assert.Equal(2, all.Count);
        Assert.Contains(all, l => l.ShortCode == "all1");
        Assert.Contains(all, l => l.ShortCode == "all2");
    }

    [Fact]
    public async Task RecordVisitAsync_increments_click_count_and_stamps_last_accessed()
    {
        var repo = new InMemoryShortLinkRepository();
        var link = NewLink("visit1");
        await repo.AddAsync(link);
        var visitedAt = DateTimeOffset.UtcNow;

        var updated = await repo.RecordVisitAsync("visit1", visitedAt);

        Assert.NotNull(updated);
        Assert.Equal(1, updated!.ClickCount);
        Assert.Equal(visitedAt, updated.LastAccessedAt);
    }

    [Fact]
    public async Task RecordVisitAsync_returns_null_for_unknown_code()
    {
        var repo = new InMemoryShortLinkRepository();

        Assert.Null(await repo.RecordVisitAsync("missing", DateTimeOffset.UtcNow));
    }

    [Fact]
    public async Task RecordVisitAsync_is_thread_safe_under_concurrent_visits()
    {
        var repo = new InMemoryShortLinkRepository();
        var link = NewLink("concurrent1");
        await repo.AddAsync(link);

        var tasks = Enumerable.Range(0, 200)
            .Select(_ => repo.RecordVisitAsync("concurrent1", DateTimeOffset.UtcNow));
        await Task.WhenAll(tasks);

        Assert.Equal(200, link.ClickCount);
    }
}
