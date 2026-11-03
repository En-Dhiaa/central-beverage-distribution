using System.Text;
using Beverage.Application.Interfaces;
using Beverage.Infrastructure.Data;
using Beverage.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Configuration (Dual Provider Support: PostgreSQL or SQLite)
var dbProvider = builder.Configuration["DATABASE_PROVIDER"] ?? builder.Configuration["DatabaseProvider"] ?? "Sqlite";
var connString = builder.Configuration["DATABASE_CONNECTION_STRING"] ?? builder.Configuration["ConnectionStrings:DefaultConnection"];

builder.Services.AddDbContext<BeverageDbContext>(options =>
{
    if (dbProvider.Equals("PostgreSQL", StringComparison.OrdinalIgnoreCase))
    {
        options.UseNpgsql(connString);
    }
    else
    {
        var sqlitePath = connString ?? "Data Source=storage/beverage_system.db";
        // Ensure storage directory exists
        var dir = Path.GetDirectoryName(sqlitePath.Replace("Data Source=", "").Trim());
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
        {
            Directory.CreateDirectory(dir);
        }
        options.UseSqlite(sqlitePath);
    }
});

// 2. Application Services DI
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IPurchasingService, PurchasingService>();
builder.Services.AddScoped<IDistributorService, DistributorService>();
builder.Services.AddScoped<ISalesService, SalesService>();
builder.Services.AddScoped<IFinanceService, FinanceService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// 3. JWT Authentication
var jwtSecret = builder.Configuration["JWT_SECRET"] ?? "super_secret_beverage_management_key_change_in_production_min_32_chars!";
var key = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

// 4. CORS & Real-time SignalR
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddSignalR();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Central Water & Beverage Distribution Management API",
        Version = "v1",
        Description = "نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 5. Seed Database on Startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BeverageDbContext>();
    await DbInitializer.SeedAsync(db);
}

// 6. Pipeline Configuration
if (app.Environment.IsDevelopment() || true) // Swagger enabled for API exploration
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Beverage Management API v1");
    });
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<Beverage.Api.Hubs.NotificationHub>("/hubs/notifications");

app.Run();

// Required for Integration Testing
public partial class Program { }
