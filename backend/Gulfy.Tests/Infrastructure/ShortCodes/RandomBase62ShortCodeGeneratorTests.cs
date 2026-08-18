using Gulfy.Domain;
using Gulfy.Domain.Enums;
using Gulfy.Infrastructure.Persistence;
using Gulfy.Infrastructure.ShortCodes;

namespace Gulfy.Tests.Infrastructure.ShortCodes;

public class RandomBase62ShortCodeGeneratorTests
{
    [Fact]
    public async Task GenerateAsync_returns_a_7_character_base62_code()
    {
        var generator = new RandomBase62ShortCodeGenerator(new InMemoryShortLinkRepository());

        var code = await generator.GenerateAsync();

        Assert.Equal(7, code.Length);
        Assert.Matches("^[A-Za-z0-9]+$", code);
    }

    [Fact]
    public async Task GenerateAsync_does_not_return_a_code_that_already_exists()
    {
        var repo = new InMemoryShortLinkRepository();
        var generator = new RandomBase62ShortCodeGenerator(repo);

        var taken = await generator.GenerateAsync();
        await repo.AddAsync(ShortLink.Create(taken, "https://example.com", ShortCodeSource.Auto, DateTimeOffset.UtcNow));

        for (var i = 0; i < 50; i++)
        {
            var next = await generator.GenerateAsync();
            Assert.NotEqual(taken, next);
        }
    }

    [Fact]
    public async Task GenerateAsync_produces_distinct_codes_across_many_calls()
    {
        var generator = new RandomBase62ShortCodeGenerator(new InMemoryShortLinkRepository());

        var codes = new HashSet<string>();
        for (var i = 0; i < 100; i++)
            codes.Add(await generator.GenerateAsync());

        Assert.Equal(100, codes.Count);
    }
}
