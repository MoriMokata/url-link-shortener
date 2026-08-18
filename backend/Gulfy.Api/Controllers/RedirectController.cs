using Gulfy.Application.Abstractions;
using Microsoft.AspNetCore.Mvc;

namespace Gulfy.Api.Controllers;

/// <summary>
/// The actual short-link redirect, at root level (not under /api) — see
/// ARCHITECTURE.md §4. A missing, disabled, or deleted code surfaces as 404 via
/// <see cref="ExceptionHandling.ApplicationExceptionHandler"/>, since
/// <see cref="IShortLinkService.ResolveAsync"/> throws
/// <see cref="Application.Exceptions.ShortLinkNotFoundException"/> for all three cases.
/// </summary>
[ApiController]
public sealed class RedirectController(IShortLinkService service) : ControllerBase
{
    [HttpGet("/{code}")]
    public async Task<IActionResult> RedirectToDestination(string code, CancellationToken ct)
    {
        var destination = await service.ResolveAsync(code, Request.Headers.UserAgent.ToString(), ct);
        return Redirect(destination);
    }
}
