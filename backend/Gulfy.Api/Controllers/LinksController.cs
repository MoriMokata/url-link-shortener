using Gulfy.Application.Abstractions;
using Gulfy.Application.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Gulfy.Api.Controllers;

/// <summary>Management API for short links — see DESIGN.md §7 for the full contract.</summary>
[ApiController]
[Route("api/links")]
public sealed class LinksController(IShortLinkService service) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ShortLinkDto>> Create([FromBody] CreateShortLinkRequest request, CancellationToken ct)
    {
        var dto = await service.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetByCode), new { code = dto.ShortCode }, dto);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ShortLinkDto>>> GetAll(CancellationToken ct) =>
        Ok(await service.GetAllAsync(ct));

    [HttpGet("{code}")]
    public async Task<ActionResult<ShortLinkDto>> GetByCode(string code, CancellationToken ct) =>
        Ok(await service.GetByCodeAsync(code, ct));
}
