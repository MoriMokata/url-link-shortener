namespace Gulfy.Application.Exceptions;

/// <summary>
/// Thrown when a request fails an application-level rule (malformed URL, invalid
/// alias format, etc). Gulfy.Api maps this to a 400 ProblemDetails response.
/// </summary>
public sealed class ApplicationValidationException(string message) : Exception(message);
