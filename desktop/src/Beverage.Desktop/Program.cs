using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.WinForms;

namespace Beverage.Desktop;

static class Program
{
    private static Process? _backendProcess;

    [STAThread]
    static void Main()
    {
        ApplicationConfiguration.Initialize();

        // 1. Ensure Local Backend API is running
        StartBackendService();

        var form = new Form
        {
            Text = "نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية | Central Beverage Distribution",
            Width = 1366,
            Height = 850,
            MinimumSize = new Size(1024, 680),
            StartPosition = FormStartPosition.CenterScreen,
            WindowState = FormWindowState.Normal
        };

        var webView = new WebView2
        {
            Dock = DockStyle.Fill
        };

        form.Controls.Add(webView);

        form.Load += async (s, e) =>
        {
            var userDataFolder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "CentralBeverageDistribution", "WebView2");
            var env = await Microsoft.Web.WebView2.Core.CoreWebView2Environment.CreateAsync(null, userDataFolder);
            await webView.EnsureCoreWebView2Async(env);

            // Wait for backend health check on local loopback (instant offline)
            await WaitForBackendReadyAsync("http://127.0.0.1:5000", TimeSpan.FromSeconds(10));

            webView.Source = new Uri("http://127.0.0.1:5000");
        };

        form.FormClosing += (s, e) =>
        {
            StopBackendService();
        };

        Application.Run(form);
    }

    private static void StartBackendService()
    {
        try
        {
            using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(1) };
            var res = client.GetAsync("http://127.0.0.1:5000/api/v1/auth/me").GetAwaiter().GetResult();
            // Backend already running on port 5000
            return;
        }
        catch
        {
            // Needs to be launched
        }

        var baseDir = AppDomain.CurrentDomain.BaseDirectory;
        string? exeToRun = null;
        string? args = null;
        string workingDir = baseDir;

        // Candidate paths for backend API
        var candidate1 = Path.Combine(baseDir, "api", "Beverage.Api.exe");
        var candidate2 = Path.Combine(baseDir, "api", "Beverage.Api.dll");
        var candidate3 = Path.Combine(baseDir, "Beverage.Api.dll");
        var candidate4 = Path.GetFullPath(Path.Combine(baseDir, "..", "..", "..", "..", "backend", "src", "Beverage.Api", "bin", "Debug", "net8.0", "Beverage.Api.dll"));

        if (File.Exists(candidate1))
        {
            exeToRun = candidate1;
            workingDir = Path.GetDirectoryName(candidate1)!;
        }
        else if (File.Exists(candidate2))
        {
            exeToRun = "dotnet";
            args = $"\"{candidate2}\"";
            workingDir = Path.GetDirectoryName(candidate2)!;
        }
        else if (File.Exists(candidate3))
        {
            exeToRun = "dotnet";
            args = $"\"{candidate3}\"";
            workingDir = baseDir;
        }
        else if (File.Exists(candidate4))
        {
            exeToRun = "dotnet";
            args = $"\"{candidate4}\"";
            workingDir = Path.GetDirectoryName(candidate4)!;
        }

        if (!string.IsNullOrEmpty(exeToRun))
        {
            var psi = new ProcessStartInfo
            {
                FileName = exeToRun,
                Arguments = args ?? "",
                WorkingDirectory = workingDir,
                UseShellExecute = false,
                CreateNoWindow = true
            };
            psi.Environment["ASPNETCORE_URLS"] = "http://127.0.0.1:5000;http://localhost:5000";
            _backendProcess = Process.Start(psi);
        }
    }

    private static async Task WaitForBackendReadyAsync(string url, TimeSpan timeout)
    {
        var start = DateTime.UtcNow;
        using var client = new HttpClient { Timeout = TimeSpan.FromMilliseconds(500) };

        while (DateTime.UtcNow - start < timeout)
        {
            try
            {
                var response = await client.GetAsync(url);
                if (response.IsSuccessStatusCode || response.StatusCode == System.Net.HttpStatusCode.NotFound || response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                {
                    return;
                }
            }
            catch
            {
                await Task.Delay(300);
            }
        }
    }

    private static void StopBackendService()
    {
        if (_backendProcess != null && !_backendProcess.HasExited)
        {
            try
            {
                _backendProcess.Kill(true);
            }
            catch { }
        }
    }
}
