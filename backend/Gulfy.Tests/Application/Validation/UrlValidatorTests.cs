using Gulfy.Application.Validation;

namespace Gulfy.Tests.Application.Validation;

public class UrlValidatorTests
{
    [Theory]
    [InlineData("https://example.com")]
    [InlineData("http://example.com")]
    [InlineData("https://example.com/path?query=1#frag")]
    [InlineData("https://sub.example.co.th:8080/path")]
    public void IsValid_accepts_well_formed_http_and_https_urls(string url)
    {
        Assert.True(UrlValidator.IsValid(url));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("not a url")]
    [InlineData("ftp://example.com")]
    [InlineData("javascript:alert(1)")]
    [InlineData("example.com")]
    [InlineData("//example.com")]
    public void IsValid_rejects_malformed_or_non_http_urls(string? url)
    {
        Assert.False(UrlValidator.IsValid(url));
    }
}
