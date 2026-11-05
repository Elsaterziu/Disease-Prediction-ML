var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Flask ML API
builder.Services.AddHttpClient("Flask", client =>
{
    client.BaseAddress = new Uri("http://127.0.0.1:5000");
    client.Timeout = TimeSpan.FromSeconds(30);
});

// CORS per React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("ReactApp");

app.MapControllers();

app.Run();