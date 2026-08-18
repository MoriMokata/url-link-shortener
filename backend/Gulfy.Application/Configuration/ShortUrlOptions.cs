namespace Gulfy.Application.Configuration;

/// <summary>Bound from the "ShortUrl" section of appsettings.json (see BE-10).</summary>
public sealed class ShortUrlOptions
{
    public const string SectionName = "ShortUrl";

    /// <summary>Origin used to build the <c>shortUrl</c> returned to clients, e.g. "http://localhost:5001".</summary>
    public string BaseUrl { get; set; } = "http://localhost:5001";
}
