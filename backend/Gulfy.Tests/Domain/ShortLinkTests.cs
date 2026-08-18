using Gulfy.Domain;
using Gulfy.Domain.Enums;
using Xunit;

namespace Gulfy.Tests.Domain;

public class ShortLinkTests
{
    private static readonly DateTimeOffset FixedNow = new(2026, 8, 18, 9, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Create_sets_expected_defaults_for_a_new_link()
    {
        var link = ShortLink.Create("HsQy5", "https://www.google.co.th", ShortCodeSource.Auto, FixedNow);

        Assert.NotEqual(Guid.Empty, link.Id);
        Assert.Equal("HsQy5", link.ShortCode);
        Assert.Equal("https://www.google.co.th", link.OriginalUrl);
        Assert.Equal(FixedNow, link.CreatedAt);
        Assert.Equal(0, link.ClickCount);
        Assert.Null(link.LastAccessedAt);
        Assert.False(link.IsDisabled);
        Assert.False(link.IsDeleted);
        Assert.True(link.IsActive);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_rejects_a_missing_short_code(string? shortCode)
    {
        Assert.Throws<DomainException>(() =>
            ShortLink.Create(shortCode!, "https://www.google.co.th", ShortCodeSource.Auto, FixedNow));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_rejects_a_missing_original_url(string? originalUrl)
    {
        Assert.Throws<DomainException>(() =>
            ShortLink.Create("HsQy5", originalUrl!, ShortCodeSource.Auto, FixedNow));
    }

    [Fact]
    public void GetDestination_falls_back_to_OriginalUrl_when_no_platform_override_is_set()
    {
        var link = ShortLink.Create("HsQy5", "https://www.google.co.th", ShortCodeSource.Auto, FixedNow);

        Assert.Equal("https://www.google.co.th", link.GetDestination(Platform.Ios));
        Assert.Equal("https://www.google.co.th", link.GetDestination(Platform.Android));
        Assert.Equal("https://www.google.co.th", link.GetDestination(Platform.Default));
    }

    [Fact]
    public void GetDestination_uses_the_platform_override_when_one_is_set()
    {
        var overrides = new Dictionary<Platform, string>
        {
            [Platform.Ios] = "https://download.gulf.co.th/iphone.ipa",
            [Platform.Android] = "https://download.gulf.co.th/android.apk",
        };
        var link = ShortLink.Create(
            "HsQy5", "https://www.google.co.th", ShortCodeSource.Auto, FixedNow, platformDestinations: overrides);

        Assert.Equal("https://download.gulf.co.th/iphone.ipa", link.GetDestination(Platform.Ios));
        Assert.Equal("https://download.gulf.co.th/android.apk", link.GetDestination(Platform.Android));
        // Default is never overridable — it always maps to OriginalUrl.
        Assert.Equal("https://www.google.co.th", link.GetDestination(Platform.Default));
    }

    [Fact]
    public void RegisterVisit_increments_click_count_and_stamps_last_accessed_at()
    {
        var link = ShortLink.Create("HsQy5", "https://www.google.co.th", ShortCodeSource.Auto, FixedNow);
        var firstVisit = FixedNow.AddMinutes(5);
        var secondVisit = FixedNow.AddMinutes(9);

        link.RegisterVisit(firstVisit);
        Assert.Equal(1, link.ClickCount);
        Assert.Equal(firstVisit, link.LastAccessedAt);

        link.RegisterVisit(secondVisit);
        Assert.Equal(2, link.ClickCount);
        Assert.Equal(secondVisit, link.LastAccessedAt);
    }

    [Fact]
    public void Disable_stops_the_link_from_being_active_but_keeps_its_history()
    {
        var link = ShortLink.Create("HsQy5", "https://www.google.co.th", ShortCodeSource.Auto, FixedNow);
        link.RegisterVisit(FixedNow.AddMinutes(1));

        link.Disable();

        Assert.True(link.IsDisabled);
        Assert.False(link.IsActive);
        Assert.False(link.IsDeleted);
        Assert.Equal(1, link.ClickCount); // history preserved, per the assignment's disable semantics
    }

    [Fact]
    public void Enable_reactivates_a_disabled_link()
    {
        var link = ShortLink.Create("HsQy5", "https://www.google.co.th", ShortCodeSource.Auto, FixedNow);
        link.Disable();

        link.Enable();

        Assert.False(link.IsDisabled);
        Assert.True(link.IsActive);
    }

    [Fact]
    public void MarkDeleted_is_permanent_and_Enable_cannot_undo_it()
    {
        var link = ShortLink.Create("HsQy5", "https://www.google.co.th", ShortCodeSource.Auto, FixedNow);

        link.MarkDeleted();
        Assert.True(link.IsDeleted);
        Assert.False(link.IsActive);

        link.Enable(); // must be a no-op once deleted
        Assert.True(link.IsDeleted);
        Assert.False(link.IsActive);
    }
}
