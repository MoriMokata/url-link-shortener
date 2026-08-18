namespace Gulfy.Application.Abstractions;

/// <summary>
/// Produces a new, not-yet-used short code (Strategy pattern — see DESIGN.md §4).
/// Implementations own their own collision handling against
/// <see cref="IShortLinkRepository"/>, matching ARCHITECTURE.md §3's create-link
/// sequence where the generator, not the caller, retries on a clash.
///
/// Adding a new auto-generation strategy (e.g. dictionary words) means writing one
/// more class here — nothing in Gulfy.Application.Services or Gulfy.Api changes
/// (Open/Closed).
/// </summary>
public interface IShortCodeGenerator
{
    Task<string> GenerateAsync(CancellationToken ct = default);
}
