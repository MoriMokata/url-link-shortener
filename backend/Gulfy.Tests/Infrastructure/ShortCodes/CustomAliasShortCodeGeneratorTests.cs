using Gulfy.Application.Exceptions;
using Gulfy.Domain;
using Gulfy.Domain.Enums;
using Gulfy.Infrastructure.Persistence;
using Gulfy.Infrastructure.ShortCodes;

namespace Gulfy.Tests.Infrastructure.ShortCodes;

public class CustomAliasShortCodeGeneratorTests
{
    [Theory]
    [InlineData("my-alias")]
    [InlineData("my_alias_2")]
    [InlineData("abc")]
    public async Task GenerateAsync_accepts_well_formed_aliases(string alias)
    {
        var generator = new CustomAliasShortCodeGenerator(new InMemoryShortLinkRepository());

        var result = await generator.GenerateAsync(alias);

        Assert.Equal(alias, result);
    }

    [Theory]
    [InlineData("ab")]                    // too short
    [InlineData("has space")]             // invalid character
    [InlineData("has/slash")]             // invalid character
    [InlineData("")]                      // empty
    public async Task GenerateAsync_rejects_malformed_aliases(string alias)
    {
        var generator = new CustomAliasShortCodeGenerator(new InMemoryShortLinkRepository());

        await Assert.ThrowsAsync<ApplicationValidationException>(() => generator.GenerateAsync(alias));
    }

    [Fact]
    public async Task GenerateAsync_rejects_alias_longer_than_32_characters()
    {
        var generator = new CustomAliasShortCodeGenerator(new InMemoryShortLinkRepository());
        var tooLong = new string('a', 33);

        await Assert.ThrowsAsync<ApplicationValidationException>(() => generator.GenerateAsync(tooLong));
    }

    [Fact]
    public async Task GenerateAsync_throws_conflict_when_alias_already_taken()
    {
        var repo = new InMemoryShortLinkRepository();
        await repo.AddAsync(ShortLink.Create("taken-alias", "https://example.com", ShortCodeSource.CustomAlias, DateTimeOffset.UtcNow));
        var generator = new CustomAliasShortCodeGenerator(repo);

        await Assert.ThrowsAsync<ShortCodeConflictException>(() => generator.GenerateAsync("taken-alias"));
    }
}
