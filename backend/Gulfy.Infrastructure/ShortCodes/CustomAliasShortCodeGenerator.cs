using System.Text.RegularExpressions;
using Gulfy.Application.Abstractions;
using Gulfy.Application.Exceptions;

namespace Gulfy.Infrastructure.ShortCodes;

/// <summary>Custom-alias strategy: validate format, then reject if already taken. See DESIGN.md §4.</summary>
public sealed partial class CustomAliasShortCodeGenerator(IShortLinkRepository repository) : ICustomAliasGenerator
{
    private const int MinLength = 3;
    private const int MaxLength = 32;

    public async Task<string> GenerateAsync(string requestedAlias, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(requestedAlias) ||
            requestedAlias.Length < MinLength ||
            requestedAlias.Length > MaxLength ||
            !AliasFormat().IsMatch(requestedAlias))
        {
            throw new ApplicationValidationException(
                $"Custom alias must be {MinLength}-{MaxLength} characters and contain only letters, digits, hyphens, or underscores.");
        }

        if (await repository.ExistsAsync(requestedAlias, ct))
            throw new ShortCodeConflictException(requestedAlias);

        return requestedAlias;
    }

    [GeneratedRegex("^[a-zA-Z0-9_-]+$")]
    private static partial Regex AliasFormat();
}
