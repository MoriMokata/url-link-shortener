namespace Gulfy.Domain.Enums;

/// <summary>
/// The visitor platform a short link's destination can be resolved against.
/// Decided at redirect time from the request's User-Agent (see IPlatformResolver
/// in Gulfy.Application, implemented in Gulfy.Infrastructure).
/// </summary>
public enum Platform
{
    /// <summary>No platform-specific override matched — use ShortLink.OriginalUrl.</summary>
    Default = 0,
    Ios = 1,
    Android = 2,
}
