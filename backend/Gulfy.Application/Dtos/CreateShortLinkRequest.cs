namespace Gulfy.Application.Dtos;

public sealed record PlatformDestinationsRequest(string? Ios, string? Android);

public sealed record CreateShortLinkRequest(
    string OriginalUrl,
    string? CustomAlias,
    PlatformDestinationsRequest? PlatformDestinations);
