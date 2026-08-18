namespace Gulfy.Application.Validation;

/// <summary>Pure format check for URLs accepted as a link destination — no I/O, easy to unit test.</summary>
public static class UrlValidator
{
    public static bool IsValid(string? url) =>
        !string.IsNullOrWhiteSpace(url) &&
        Uri.TryCreate(url, UriKind.Absolute, out var uri) &&
        (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
}
