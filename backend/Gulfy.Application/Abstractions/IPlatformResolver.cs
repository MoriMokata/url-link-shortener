using Gulfy.Domain.Enums;

namespace Gulfy.Application.Abstractions;

/// <summary>
/// Decides which <see cref="Platform"/> a visitor is on, decided at redirect time
/// from the request's User-Agent header (see DESIGN.md §5 — this is a server-side
/// decision so it can be trusted without relying on client-side JS).
/// </summary>
public interface IPlatformResolver
{
    Platform Detect(string? userAgent);
}
