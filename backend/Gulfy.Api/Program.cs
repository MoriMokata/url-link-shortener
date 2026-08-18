using Gulfy.Api.ExceptionHandling;
using Gulfy.Application.Abstractions;
using Gulfy.Application.Configuration;
using Gulfy.Application.Services;
using Gulfy.Infrastructure.Persistence;
using Gulfy.Infrastructure.Platform;
using Gulfy.Infrastructure.ShortCodes;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddExceptionHandler<ApplicationExceptionHandler>();
builder.Services.AddProblemDetails();

// Singleton: the in-memory store must be shared across requests within the process
// (see DESIGN.md §6/ARCHITECTURE.md §7 — data lives only as long as the process).
builder.Services.AddSingleton<IShortLinkRepository, InMemoryShortLinkRepository>();
builder.Services.AddSingleton<IShortCodeGenerator, RandomBase62ShortCodeGenerator>();
builder.Services.AddSingleton<ICustomAliasGenerator, CustomAliasShortCodeGenerator>();
builder.Services.AddSingleton<IPlatformResolver, UserAgentPlatformResolver>();
builder.Services.AddSingleton<IShortLinkService, ShortLinkService>();
builder.Services.AddSingleton(
    builder.Configuration.GetSection(ShortUrlOptions.SectionName).Get<ShortUrlOptions>() ?? new ShortUrlOptions());

const string FrontendCorsPolicy = "FrontendDevServer";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(cors => cors.AddPolicy(FrontendCorsPolicy, policy =>
    policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));

// TODO (BE-12): re-add Swagger/OpenAPI (Swashbuckle.AspNetCore)

var app = builder.Build();

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseCors(FrontendCorsPolicy);

app.MapControllers();

app.Run();
