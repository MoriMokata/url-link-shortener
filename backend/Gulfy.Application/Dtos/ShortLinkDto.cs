namespace Gulfy.Application.Dtos;

public sealed record ShortLinkDto(
    string ShortCode,
    string ShortUrl,
    string OriginalUrl,
    string? CustomAlias,
    string Source,
    bool IsDisabled,
    int ClickCount,
    DateTimeOffset CreatedAt,
    DateTimeOffset? LastAccessedAt,
    IReadOnlyDictionary<string, string> PlatformDestinations);
