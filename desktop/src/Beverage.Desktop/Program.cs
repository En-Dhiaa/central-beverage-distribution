using System;
using System.Drawing;
using System.IO;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.WinForms;

namespace Beverage.Desktop;

static class Program
{
    private static readonly string LogFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "desktop_startup.log");

    public static void Log(string message)
    {
        try
        {
            File.AppendAllText(LogFile, $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff}] {message}\r\n");
        }
        catch { }
    }

    [STAThread]
    static void Main()
    {
        try
        {
            Log("Application Starting...");
            ApplicationConfiguration.Initialize();
            Log("ApplicationConfiguration.Initialize() succeeded.");

            System.Windows.Forms.Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
            System.Windows.Forms.Application.ThreadException += (s, e) =>
            {
                Log($"System.Windows.Forms.Application.ThreadException: {e.Exception}");
            };

            AppDomain.CurrentDomain.UnhandledException += (s, e) =>
            {
                Log($"Unhandled AppDomain Exception: {e.ExceptionObject}");
            };

            AppDomain.CurrentDomain.ProcessExit += (s, e) =>
            {
                Log($"ProcessExit called! StackTrace:\r\n{Environment.StackTrace}");
            };

            Log("Creating Form...");
            var form = new Form
            {
                Text = "نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية | Central Beverage Distribution",
                Width = 1366,
                Height = 850,
                MinimumSize = new Size(1024, 680),
                StartPosition = FormStartPosition.CenterScreen,
                WindowState = FormWindowState.Maximized,
                Icon = File.Exists(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app.ico")) 
                    ? new Icon(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app.ico")) 
                    : (Icon.ExtractAssociatedIcon(System.Windows.Forms.Application.ExecutablePath) ?? SystemIcons.Application)
            };
            Log("Form created.");

            Log("Creating WebView2 control...");
            var webView = new WebView2
            {
                Dock = DockStyle.Fill
            };
            Log("WebView2 control created.");

            webView.NavigationCompleted += (s, e) =>
            {
                Log($"WebView2 NavigationCompleted: IsSuccess={e.IsSuccess}, WebErrorStatus={e.WebErrorStatus}");
            };

            webView.CoreWebView2InitializationCompleted += (s, e) =>
            {
                Log($"WebView2 CoreWebView2InitializationCompleted: IsSuccess={e.IsSuccess}, Exception={e.InitializationException}");
                if (e.IsSuccess)
                {
                    webView.CoreWebView2.ProcessFailed += (s2, e2) =>
                    {
                        Log($"WebView2 ProcessFailed: Reason={e2.ProcessFailedKind}, ExitCode={e2.ExitCode}");
                    };
                }
            };

            form.Controls.Add(webView);

            form.Load += async (s, e) =>
            {
                try
                {
                    Log("Form_Load: Starting In-Process LocalServer...");
                    var serverUrl = await LocalServer.StartAsync(5000);
                    Log($"Form_Load: LocalServer started successfully at {serverUrl}");

                    var userDataFolder = Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                        "CentralBeverageDistribution",
                        "WebView2"
                    );
                    Directory.CreateDirectory(userDataFolder);
                    Log($"Form_Load: WebView2 userDataFolder: {userDataFolder}");

                    Log("Form_Load: Initializing CoreWebView2Environment...");
                    var env = await Microsoft.Web.WebView2.Core.CoreWebView2Environment.CreateAsync(null, userDataFolder);
                    await webView.EnsureCoreWebView2Async(env);
                    Log("Form_Load: CoreWebView2 initialized.");

                    webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
                    webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = true;
                    webView.CoreWebView2.Settings.AreDevToolsEnabled = true;

                    Log($"Form_Load: Navigating WebView2 to {serverUrl}...");
                    webView.Source = new Uri(serverUrl);
                    Log("Form_Load: Navigation triggered.");
                }
                catch (Exception ex)
                {
                    Log($"Form_Load ERROR: {ex}");
                    MessageBox.Show(
                        $"حدث خطأ أثناء تشغيل النظام الداخلي:\n\n{ex.Message}\n\nراجع ملف السجل:\n{LogFile}",
                        "خطأ تشغيل النظام",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                }
            };

            form.FormClosing += async (s, e) =>
            {
                Log("Form_FormClosing: Stopping LocalServer...");
                await LocalServer.StopAsync();
                Log("Form_FormClosing: LocalServer stopped.");
            };

            Log("Entering Application.Run...");
            System.Windows.Forms.Application.Run(form);
            Log("Exited Application.Run.");
        }
        catch (Exception ex)
        {
            Log($"FATAL in Main: {ex}");
            MessageBox.Show($"خطأ غير متوقع في بدء التطبيق:\n\n{ex.Message}\n\n{ex.StackTrace}", "خطأ فادح", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}
