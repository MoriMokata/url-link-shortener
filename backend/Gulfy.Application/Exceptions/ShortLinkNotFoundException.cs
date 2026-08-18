namespace Gulfy.Application.Exceptions;

/// <summary>Thrown when a requested short code has no matching link. Maps to 404.</summary>
public sealed class ShortLinkNotFoundException(string code) : Exception($"No short link found for code '{code}'.");
