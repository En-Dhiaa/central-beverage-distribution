using System;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using Microsoft.Web.WebView2.WinForms;

namespace Beverage.Desktop;

static class Program
{
    [STAThread]
    static void Main()
    {
        ApplicationConfiguration.Initialize();

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

            // Connect to frontend dist or development URL
            var distIndex = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "frontend", "dist", "index.html"));
            if (File.Exists(distIndex))
            {
                webView.Source = new Uri(distIndex);
            }
            else
            {
                webView.Source = new Uri("http://localhost:5173");
            }
        };

        Application.Run(form);
    }
}
