using Gulfy.Application.Abstractions;
using Gulfy.Application.Configuration;
using Gulfy.Application.Dtos;
using Gulfy.Application.Exceptions;
using Gulfy.Application.Validation;
using Gulfy.Domain;
using Gulfy.Domain.Enums;

namespace Gulfy.Application.Services;

public sealed class ShortLinkService(
    IShortLinkRepository repository,
    IShortCodeGenerator autoGenerator,
    ICustomAliasGenerator aliasGenerator,
    IPlatformResolver platformResolver,
    ShortUrlOptions options) : IShortLinkService
{
    public async Task<ShortLinkDto> CreateAsync(CreateShortLinkRequest request, CancellationToken ct = default)
    {
        if (!UrlValidator.IsValid(request.OriginalUrl))
            throw new ApplicationValidationException($"'{request.OriginalUrl}' is not a valid absolute http(s) URL.");

        var platformDestinations = ValidatePlatformDestinations(request.PlatformDestinations);

        string shortCode;
        ShortCodeSource source;
        if (string.IsNullOrWhiteSpace(request.CustomAlias))
        {
            shortCode = await autoGenerator.GenerateAsync(ct);
            source = ShortCodeSource.Auto;
        }
        else
        {
            shortCode = await aliasGenerator.GenerateAsync(request.CustomAlias, ct);
            source = ShortCodeSource.CustomAlias;
        }

        var link = ShortLink.Create(
            shortCode,
            request.OriginalUrl,
            source,
            DateTimeOffset.UtcNow,
            request.CustomAlias,
            platformDestinations);

        await repository.AddAsync(link, ct);
        await repository.SaveChangesAsync(ct);

        return ToDto(link);
    }

    public async Task<IReadOnlyList<ShortLinkDto>> GetAllAsync(CancellationToken ct = default)
    {
        var links = await repository.GetAllAsync(ct);
        return links.Select(ToDto).ToList();
    }

    public async Task<ShortLinkDto> GetByCodeAsync(string code, CancellationToken ct = default) =>
        ToDto(await GetExistingAsync(code, ct));

    public async Task DisableAsync(string code, CancellationToken ct = default)
    {
        var link = await GetExistingAsync(code, ct);
        link.Disable();
        await repository.SaveChangesAsync(ct);
    }

    public async Task EnableAsync(string code, CancellationToken ct = default)
    {
        var link = await GetExistingAsync(code, ct);
        link.Enable();
        await repository.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(string code, CancellationToken ct = default)
    {
        var link = await GetExistingAsync(code, ct);
        link.MarkDeleted();
        await repository.SaveChangesAsync(ct);
    }

    public async Task<string> ResolveAsync(string code, string? userAgent, CancellationToken ct = default)
    {
        var link = await repository.GetByCodeAsync(code, ct);
        if (link is null || !link.IsActive)
            throw new ShortLinkNotFoundException(code);

        var platform = platformResolver.Detect(userAgent);
        var destination = link.GetDestination(platform);

        await repository.RecordVisitAsync(code, DateTimeOffset.UtcNow, ct);

        return destination;
    }

    private async Task<ShortLink> GetExistingAsync(string code, CancellationToken ct)
    {
        var link = await repository.GetByCodeAsync(code, ct);
        return link ?? throw new ShortLinkNotFoundException(code);
    }

    private static Dictionary<Platform, string> ValidatePlatformDestinations(PlatformDestinationsRequest? request)
    {
        var destinations = new Dictionary<Platform, string>();
        if (request is null)
            return destinations;

        AddIfPresent(Platform.Ios, request.Ios);
        AddIfPresent(Platform.Android, request.Android);
        return destinations;

        void AddIfPresent(Platform platform, string? url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return;
            if (!UrlValidator.IsValid(url))
                throw new ApplicationValidationException($"'{url}' is not a valid absolute http(s) URL for platform '{platform}'.");
            destinations[platform] = url;
        }
    }

    private ShortLinkDto ToDto(ShortLink link) => new(
        link.ShortCode,
        $"{options.BaseUrl.TrimEnd('/')}/{link.ShortCode}",
        link.OriginalUrl,
        link.CustomAlias,
        link.Source.ToString(),
        link.IsDisabled,
        link.ClickCount,
        link.CreatedAt,
        link.LastAccessedAt,
        link.PlatformDestinations.ToDictionary(kv => kv.Key.ToString(), kv => kv.Value));
}
