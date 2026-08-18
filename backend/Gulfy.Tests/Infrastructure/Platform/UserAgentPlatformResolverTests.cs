using Gulfy.Domain.Enums;
using Gulfy.Infrastructure.Platform;

namespace Gulfy.Tests.Infrastructure.Platform;

public class UserAgentPlatformResolverTests
{
    private readonly UserAgentPlatformResolver _resolver = new();

    [Theory]
    [InlineData("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15")]
    [InlineData("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15")]
    [InlineData("Mozilla/5.0 (iPod touch; CPU iPhone OS 17_0 like Mac OS X)")]
    public void Detect_recognizes_ios_user_agents(string userAgent)
    {
        Assert.Equal(Gulfy.Domain.Enums.Platform.Ios, _resolver.Detect(userAgent));
    }

    [Theory]
    [InlineData("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36")]
    [InlineData("Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36")]
    public void Detect_recognizes_android_user_agents(string userAgent)
    {
        Assert.Equal(Gulfy.Domain.Enums.Platform.Android, _resolver.Detect(userAgent));
    }

    [Theory]
    [InlineData("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")]
    [InlineData("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15")]
    [InlineData("curl/8.4.0")]
    public void Detect_falls_back_to_default_for_unrecognized_user_agents(string userAgent)
    {
        Assert.Equal(Gulfy.Domain.Enums.Platform.Default, _resolver.Detect(userAgent));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Detect_falls_back_to_default_for_missing_user_agent(string? userAgent)
    {
        Assert.Equal(Gulfy.Domain.Enums.Platform.Default, _resolver.Detect(userAgent));
    }
}
