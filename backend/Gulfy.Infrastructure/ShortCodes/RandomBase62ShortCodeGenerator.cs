using System.Security.Cryptography;
using Gulfy.Application.Abstractions;

namespace Gulfy.Infrastructure.ShortCodes;

/// <summary>
/// Auto strategy: a random base62 string, retried against the repository on the
/// (very unlikely) chance of a collision. See DESIGN.md §4.
/// </summary>
public sealed class RandomBase62ShortCodeGenerator(IShortLinkRepository repository) : IShortCodeGenerator
{
    private const string Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private const int CodeLength = 7;
    private const int MaxAttempts = 10;

    public async Task<string> GenerateAsync(CancellationToken ct = default)
    {
        for (var attempt = 0; attempt < MaxAttempts; attempt++)
        {
            var candidate = NextCandidate();
            if (!await repository.ExistsAsync(candidate, ct))
                return candidate;
        }

        throw new InvalidOperationException(
            $"Could not generate a unique short code after {MaxAttempts} attempts.");
    }

    private static string NextCandidate()
    {
        Span<char> chars = stackalloc char[CodeLength];
        for (var i = 0; i < CodeLength; i++)
            chars[i] = Alphabet[RandomNumberGenerator.GetInt32(Alphabet.Length)];

        return new string(chars);
    }
}
