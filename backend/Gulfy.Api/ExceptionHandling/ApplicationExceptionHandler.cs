using Gulfy.Application.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Gulfy.Api.ExceptionHandling;

/// <summary>
/// Maps the Application layer's typed exceptions to RFC 7807 ProblemDetails
/// responses (see DESIGN.md §7's error convention), so controllers stay free of
/// try/catch. Unrecognized exceptions are left for the default developer/prod
/// exception page to handle.
/// </summary>
public sealed class ApplicationExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (statusCode, title) = exception switch
        {
            ApplicationValidationException => (StatusCodes.Status400BadRequest, "Validation failed"),
            ShortLinkNotFoundException => (StatusCodes.Status404NotFound, "Short link not found"),
            ShortCodeConflictException => (StatusCodes.Status409Conflict, "Short code conflict"),
            _ => (0, string.Empty),
        };

        if (statusCode == 0)
            return false;

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = exception.Message,
            Instance = httpContext.Request.Path,
        }, cancellationToken);

        return true;
    }
}
