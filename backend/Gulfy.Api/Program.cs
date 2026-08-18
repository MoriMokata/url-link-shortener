var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// TODO (BE-10): register application/infrastructure services (DI) once they exist
// TODO (BE-10): configure CORS for the React dev server
// TODO (BE-12): re-add Swagger/OpenAPI (Swashbuckle.AspNetCore)

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseHttpsRedirection();

app.MapControllers();

app.Run();
