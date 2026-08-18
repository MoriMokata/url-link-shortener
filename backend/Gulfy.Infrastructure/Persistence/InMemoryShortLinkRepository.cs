using System.Collections.Concurrent;
using Gulfy.Application.Abstractions;
using Gulfy.Domain;

namespace Gulfy.Infrastructure.Persistence;

/// <summary>
/// In-process store keyed by short code. Chosen per DESIGN.md §6/ARCHITECTURE.md §8:
/// fast to build for the assignment's scope, data does not survive a restart, and a
/// DB-backed <see cref="IShortLinkRepository"/> can replace it later without any
/// change to Gulfy.Application or Gulfy.Domain.
/// </summary>
public sealed class InMemoryShortLinkRepository : IShortLinkRepository
{
    private readonly ConcurrentDictionary<string, ShortLink> _links = new();

    public Task<ShortLink?> GetByCodeAsync(string code, CancellationToken ct = default) =>
        Task.FromResult(_links.GetValueOrDefault(code));

    public Task<IReadOnlyList<ShortLink>> GetAllAsync(CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<ShortLink>>(_links.Values.ToList());

    public Task AddAsync(ShortLink link, CancellationToken ct = default)
    {
        if (!_links.TryAdd(link.ShortCode, link))
            throw new InvalidOperationException($"A short link with code '{link.ShortCode}' already exists.");

        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(string code, CancellationToken ct = default) =>
        Task.FromResult(_links.ContainsKey(code));

    public Task<ShortLink?> RecordVisitAsync(string code, DateTimeOffset visitedAt, CancellationToken ct = default)
    {
        if (!_links.TryGetValue(code, out var link))
            return Task.FromResult<ShortLink?>(null);

        // ConcurrentDictionary hands every caller the same ShortLink reference for a
        // given key, so locking on that instance serializes concurrent visits to the
        // same code without needing a separate lock table.
        lock (link)
        {
            link.RegisterVisit(visitedAt);
        }

        return Task.FromResult<ShortLink?>(link);
    }

    public Task SaveChangesAsync(CancellationToken ct = default) => Task.CompletedTask;
}
