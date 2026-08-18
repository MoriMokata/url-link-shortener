using Gulfy.Application.Dtos;

namespace Gulfy.Application.Abstractions;

/// <summary>
/// The application's single use-case entry point for links: create, list, inspect,
/// disable/enable/delete, and resolve-for-redirect. Controllers (Gulfy.Api) stay
/// thin and call only this — see ARCHITECTURE.md §2.
/// </summary>
public interface IShortLinkService
{
    Task<ShortLinkDto> CreateAsync(CreateShortLinkRequest request, CancellationToken ct = default);

    Task<IReadOnlyList<ShortLinkDto>> GetAllAsync(CancellationToken ct = default);

    /// <exception cref="Exceptions.ShortLinkNotFoundException" />
    Task<ShortLinkDto> GetByCodeAsync(string code, CancellationToken ct = default);

    /// <exception cref="Exceptions.ShortLinkNotFoundException" />
    Task DisableAsync(string code, CancellationToken ct = default);

    /// <exception cref="Exceptions.ShortLinkNotFoundException" />
    Task EnableAsync(string code, CancellationToken ct = default);

    /// <exception cref="Exceptions.ShortLinkNotFoundException" />
    Task DeleteAsync(string code, CancellationToken ct = default);

    /// <summary>
    /// Resolves the destination URL for a visitor and records the visit (click count
    /// + LastAccessedAt). Throws for a missing, disabled, or deleted link — the
    /// redirect controller (BE-09) maps that uniformly to 404.
    /// </summary>
    /// <exception cref="Exceptions.ShortLinkNotFoundException" />
    Task<string> ResolveAsync(string code, string? userAgent, CancellationToken ct = default);
}
