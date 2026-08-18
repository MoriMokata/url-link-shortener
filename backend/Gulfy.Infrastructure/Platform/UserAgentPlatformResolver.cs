using Gulfy.Application.Abstractions;
using Gulfy.Domain.Enums;

namespace Gulfy.Infrastructure.Platform;

/// <summary>
/// Substring-matches well-known User-Agent tokens. Deliberately simple (see
/// ARCHITECTURE.md §8 trade-off table) — a proper UA-parsing library is an easy
/// swap later since callers only depend on <see cref="IPlatformResolver"/>.
/// </summary>
public sealed class UserAgentPlatformResolver : IPlatformResolver
{
    public Domain.Enums.Platform Detect(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent))
            return Domain.Enums.Platform.Default;

        if (userAgent.Contains("Android", StringComparison.OrdinalIgnoreCase))
            return Domain.Enums.Platform.Android;

        if (userAgent.Contains("iPhone", StringComparison.OrdinalIgnoreCase) ||
            userAgent.Contains("iPad", StringComparison.OrdinalIgnoreCase) ||
            userAgent.Contains("iPod", StringComparison.OrdinalIgnoreCase))
            return Domain.Enums.Platform.Ios;

        return Domain.Enums.Platform.Default;
    }
}
