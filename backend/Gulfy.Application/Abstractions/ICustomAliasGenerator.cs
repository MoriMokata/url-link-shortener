namespace Gulfy.Application.Abstractions;

/// <summary>
/// Turns a user-supplied alias into a short code: validates its format and checks
/// it isn't already taken. Kept as a separate interface from
/// <see cref="IShortCodeGenerator"/> rather than overloading it, since a
/// user-supplied alias needs a different contract (input string, format
/// validation, conflict-is-an-error) than an auto strategy (no input, retry-on-clash).
/// </summary>
public interface ICustomAliasGenerator
{
    /// <exception cref="Exceptions.ApplicationValidationException">Alias fails format rules.</exception>
    /// <exception cref="Exceptions.ShortCodeConflictException">Alias is already in use.</exception>
    Task<string> GenerateAsync(string requestedAlias, CancellationToken ct = default);
}
