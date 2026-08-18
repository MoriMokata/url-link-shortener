using Gulfy.Domain;

namespace Gulfy.Application.Abstractions;

/// <summary>
/// Storage port for <see cref="ShortLink"/>. The in-memory implementation
/// (Gulfy.Infrastructure) is the only one today; a future EF Core/DB-backed
/// implementation can satisfy this same interface without touching
/// Gulfy.Application or Gulfy.Domain (see ARCHITECTURE.md §2, §8).
/// </summary>
public interface IShortLinkRepository
{
    Task<ShortLink?> GetByCodeAsync(string code, CancellationToken ct = default);

    Task<IReadOnlyList<ShortLink>> GetAllAsync(CancellationToken ct = default);

    Task AddAsync(ShortLink link, CancellationToken ct = default);

    Task<bool> ExistsAsync(string code, CancellationToken ct = default);

    /// <summary>
    /// Atomically increments the click count and stamps <c>LastAccessedAt</c> on the
    /// link identified by <paramref name="code"/> (see ARCHITECTURE.md §4 redirect
    /// sequence). Split out from a plain fetch-mutate-save so concurrent redirects
    /// for the same code can never lose an increment. Returns the updated link, or
    /// <c>null</c> if no link exists for <paramref name="code"/>.
    /// </summary>
    Task<ShortLink?> RecordVisitAsync(string code, DateTimeOffset visitedAt, CancellationToken ct = default);

    /// <summary>
    /// No-op for the in-memory store (mutations on a fetched <see cref="ShortLink"/>
    /// are already visible to every reader since it's a shared reference). Kept on
    /// the interface so callers already write in a "fetch, mutate, save" style that
    /// keeps working unchanged once a real DB-backed repository lands.
    /// </summary>
    Task SaveChangesAsync(CancellationToken ct = default);
}
