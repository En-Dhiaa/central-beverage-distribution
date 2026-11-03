using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using Beverage.Application.Interfaces;
using Beverage.Infrastructure.Data;
using Beverage.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;

namespace Beverage.Desktop;

public static class LocalServer
{
    private static WebApplication? _app;

    public static async Task<string> StartAsync(int preferredPort = 5000)
    {
        try
        {
            var baseDir = AppDomain.CurrentDomain.BaseDirectory;
            Program.Log($"LocalServer: baseDir is {baseDir}");

            // 1. Setup Persistent Dedicated Data Directory
            var dataDir = Path.Combine(baseDir, "Data");
            Directory.CreateDirectory(dataDir);
            Directory.CreateDirectory(Path.Combine(dataDir, "invoices"));
            Directory.CreateDirectory(Path.Combine(dataDir, "reports"));
            Directory.CreateDirectory(Path.Combine(dataDir, "attachments"));
            Directory.CreateDirectory(Path.Combine(dataDir, "backups"));

            var dbPath = Path.Combine(dataDir, "beverage_system.db");
            Program.Log($"LocalServer: dbPath is {dbPath}");

            // 2. Setup WebRoot for Frontend Assets
            var wwwrootDir = Path.Combine(baseDir, "wwwroot");
            if (!Directory.Exists(wwwrootDir) || !File.Exists(Path.Combine(wwwrootDir, "index.html")))
            {
                var devDist = Path.GetFullPath(Path.Combine(baseDir, "..", "..", "..", "..", "frontend", "dist"));
                if (Directory.Exists(devDist) && File.Exists(Path.Combine(devDist, "index.html")))
                {
                    wwwrootDir = devDist;
                }
                else
                {
                    Directory.CreateDirectory(wwwrootDir);
                }
            }
            Program.Log($"LocalServer: wwwrootDir is {wwwrootDir}");

            int activePort = GetAvailablePort(preferredPort);
            Program.Log($"LocalServer: activePort is {activePort}");

            var builder = WebApplication.CreateBuilder(new WebApplicationOptions
            {
                ContentRootPath = baseDir,
                WebRootPath = wwwrootDir,
                Args = Array.Empty<string>()
            });

            builder.WebHost.UseUrls($"http://127.0.0.1:{activePort}");

            // 3. Database Services
            builder.Services.AddDbContext<BeverageDbContext>(options =>
            {
                options.UseSqlite($"Data Source={dbPath}");
            });

            // 4. Domain Application Services
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IInventoryService, InventoryService>();
            builder.Services.AddScoped<IPurchasingService, PurchasingService>();
            builder.Services.AddScoped<IDistributorService, DistributorService>();
            builder.Services.AddScoped<ISalesService, SalesService>();
            builder.Services.AddScoped<IFinanceService, FinanceService>();
            builder.Services.AddScoped<IDashboardService, DashboardService>();

            // 5. JWT Authentication
            var jwtSecret = "super_secret_beverage_management_key_change_in_production_min_32_chars!";
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
            builder.Services.AddControllers()
                .AddApplicationPart(typeof(Beverage.Api.Controllers.AuthController).Assembly);

            Program.Log("LocalServer: Building WebApplication...");
            _app = builder.Build();
            Program.Log("LocalServer: WebApplication built.");

            // 6. Initialize & Seed Database
            Program.Log("LocalServer: Creating service scope for DbContext...");
            using (var scope = _app.Services.CreateScope())
            {
                Program.Log("LocalServer: Resolving BeverageDbContext...");
                var db = scope.ServiceProvider.GetRequiredService<BeverageDbContext>();
                Program.Log("LocalServer: BeverageDbContext resolved. Invoking DbInitializer.SeedAsync...");
                await DbInitializer.SeedAsync(db);
                Program.Log("LocalServer: Database initialized & seeded successfully.");
            }

            // 7. Configure Pipeline
            _app.UseDefaultFiles();
            _app.UseStaticFiles();

            _app.UseCors("AllowAll");
            _app.UseAuthentication();
            _app.UseAuthorization();

            _app.MapControllers();
            _app.MapHub<Beverage.Api.Hubs.NotificationHub>("/hubs/notifications");
            _app.MapFallbackToFile("index.html");

            Program.Log($"LocalServer: Starting Kestrel on port {activePort}...");
            await _app.StartAsync();
            Program.Log("LocalServer: Kestrel started successfully.");

            return $"http://127.0.0.1:{activePort}";
        }
        catch (Exception ex)
        {
            Program.Log($"LocalServer.StartAsync FATAL EXCEPTION: {ex}");
            throw;
        }
    }

    public static async Task StopAsync()
    {
        if (_app != null)
        {
            try
            {
                await _app.StopAsync(TimeSpan.FromSeconds(2));
                await _app.DisposeAsync();
            }
            catch { }
            finally
            {
                _app = null;
            }
        }
    }

    private static int GetAvailablePort(int defaultPort)
    {
        try
        {
            var listener = new TcpListener(IPAddress.Loopback, defaultPort);
            listener.Start();
            listener.Stop();
            return defaultPort;
        }
        catch
        {
            var listener = new TcpListener(IPAddress.Loopback, 0);
            listener.Start();
            int port = ((IPEndPoint)listener.LocalEndpoint).Port;
            listener.Stop();
            return port;
        }
    }
}
