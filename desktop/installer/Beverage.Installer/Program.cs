using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Beverage.Installer;

static class Program
{
    [STAThread]
    static void Main()
    {
        ApplicationConfiguration.Initialize();
        Application.Run(new InstallerForm());
    }
}

public class InstallerForm : Form
{
    private Panel headerPanel = null!;
    private Panel contentPanel = null!;
    private Panel footerPanel = null!;

    private Button btnNext = null!;
    private Button btnBack = null!;
    private Button btnCancel = null!;

    private int currentStep = 1;

    // Step 2 controls
    private TextBox txtInstallPath = null!;
    private Button btnBrowse = null!;

    // Step 3 controls
    private ProgressBar progressBar = null!;
    private Label lblStatus = null!;

    // Step 4 controls
    private CheckBox chkLaunchNow = null!;
    private CheckBox chkDesktopShortcut = null!;

    private string defaultInstallPath;

    public InstallerForm()
    {
        defaultInstallPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "CentralBeverageDistribution"
        );

        InitUI();
        ShowStep(1);
    }

    private void InitUI()
    {
        Text = "برنامج تثبيت نظام إدارة ثلاجة المياه والعصائر المركزية v1.1.0";
        Size = new Size(680, 480);
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        RightToLeft = RightToLeft.Yes;
        RightToLeftLayout = true;
        Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
        BackColor = Color.FromArgb(248, 250, 252);

        // Header Panel
        headerPanel = new Panel
        {
            Dock = DockStyle.Top,
            Height = 85,
            BackColor = Color.FromArgb(15, 23, 42) // Dark Slate Blue
        };

        var lblHeaderTitle = new Label
        {
            Text = "نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية",
            ForeColor = Color.White,
            Font = new Font("Segoe UI", 12f, FontStyle.Bold),
            Location = new Point(25, 18),
            AutoSize = true
        };

        var lblHeaderSub = new Label
        {
            Text = "معالج التثبيت والإعداد التلقائي لنظام سطح المكتب وقاعدة البيانات",
            ForeColor = Color.FromArgb(148, 163, 184),
            Font = new Font("Segoe UI", 9f, FontStyle.Regular),
            Location = new Point(25, 48),
            AutoSize = true
        };

        headerPanel.Controls.Add(lblHeaderTitle);
        headerPanel.Controls.Add(lblHeaderSub);

        // Footer Panel
        footerPanel = new Panel
        {
            Dock = DockStyle.Bottom,
            Height = 65,
            BackColor = Color.FromArgb(241, 245, 249)
        };

        btnCancel = new Button
        {
            Text = "إلغاء الأمر",
            Size = new Size(95, 34),
            Location = new Point(25, 15),
            BackColor = Color.White,
            FlatStyle = FlatStyle.System
        };
        btnCancel.Click += (s, e) => Close();

        btnNext = new Button
        {
            Text = "التالي >",
            Size = new Size(110, 34),
            Location = new Point(530, 15),
            BackColor = Color.FromArgb(37, 99, 235),
            ForeColor = Color.White,
            FlatStyle = FlatStyle.System,
            Font = new Font("Segoe UI", 9.5f, FontStyle.Bold)
        };
        btnNext.Click += BtnNext_Click;

        btnBack = new Button
        {
            Text = "< السابق",
            Size = new Size(95, 34),
            Location = new Point(425, 15),
            BackColor = Color.White,
            FlatStyle = FlatStyle.System,
            Enabled = false
        };
        btnBack.Click += (s, e) => ShowStep(currentStep - 1);

        footerPanel.Controls.Add(btnCancel);
        footerPanel.Controls.Add(btnBack);
        footerPanel.Controls.Add(btnNext);

        // Content Panel
        contentPanel = new Panel
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(30, 25, 30, 25)
        };

        Controls.Add(contentPanel);
        Controls.Add(footerPanel);
        Controls.Add(headerPanel);
    }

    private void ShowStep(int step)
    {
        currentStep = step;
        contentPanel.Controls.Clear();
        btnBack.Enabled = (step > 1 && step < 3);

        switch (step)
        {
            case 1:
                RenderStep1();
                break;
            case 2:
                RenderStep2();
                break;
            case 3:
                RenderStep3();
                break;
            case 4:
                RenderStep4();
                break;
        }
    }

    private void RenderStep1()
    {
        btnNext.Text = "التالي >";

        var lblWelcome = new Label
        {
            Text = "مرحبًا بك في مثبت نظام إدارة ثلاجة المياه والعصائر المركزية",
            Font = new Font("Segoe UI", 11.5f, FontStyle.Bold),
            ForeColor = Color.FromArgb(15, 23, 42),
            Location = new Point(25, 20),
            AutoSize = true
        };

        var lblDesc = new Label
        {
            Text = "يقوم هذا المعالج بتثبيت جميع مكونات النظام كاملة على جهازك بما في ذلك:\n\n" +
                   "• خادم ومحرك قواعد البيانات والعمليات المحاسبية المزدوجة (ASP.NET Core Web API 8).\n" +
                   "• واجهة المستخدم التفاعلية المتطورة الداعمة للغة العربية (React 18 + Tailwind RTL).\n" +
                   "• تطبيق سطح المكتب المستقل مع دعم التنبيهات اللحظية (SignalR Real-Time).\n" +
                   "• تهيئة بيئة التخزين وإعداد قاعدة البيانات التشغيلية النظيفة الجاهزة للعمل الفعلي.\n\n" +
                   "انقر فوق [التالي] للمتابعة واختيار مسار التثبيت.",
            Font = new Font("Segoe UI", 9.5f),
            ForeColor = Color.FromArgb(51, 65, 85),
            Location = new Point(25, 60),
            Size = new Size(590, 180)
        };

        contentPanel.Controls.Add(lblWelcome);
        contentPanel.Controls.Add(lblDesc);
    }

    private void RenderStep2()
    {
        btnNext.Text = "تثبيت الآن";

        var lblTitle = new Label
        {
            Text = "حدد مجلد التثبيت:",
            Font = new Font("Segoe UI", 11f, FontStyle.Bold),
            ForeColor = Color.FromArgb(15, 23, 42),
            Location = new Point(25, 20),
            AutoSize = true
        };

        var lblSub = new Label
        {
            Text = "سيتم تثبيت النظام في المجلد التالي. للمتابعة انقر [تثبيت الآن] أو اختر مجلدًا آخر:",
            Font = new Font("Segoe UI", 9.5f),
            ForeColor = Color.FromArgb(71, 85, 105),
            Location = new Point(25, 55),
            AutoSize = true
        };

        txtInstallPath = new TextBox
        {
            Text = defaultInstallPath,
            Location = new Point(25, 95),
            Size = new Size(470, 30),
            Font = new Font("Segoe UI", 9.5f)
        };

        btnBrowse = new Button
        {
            Text = "استعراض...",
            Location = new Point(505, 93),
            Size = new Size(110, 32),
            FlatStyle = FlatStyle.System
        };
        btnBrowse.Click += (s, e) =>
        {
            using var fbd = new FolderBrowserDialog();
            fbd.SelectedPath = txtInstallPath.Text;
            if (fbd.ShowDialog() == DialogResult.OK)
            {
                txtInstallPath.Text = fbd.SelectedPath;
            }
        };

        chkDesktopShortcut = new CheckBox
        {
            Text = "إنشاء اختصار على سطح المكتب (Desktop Shortcut)",
            Checked = true,
            Location = new Point(25, 150),
            AutoSize = true,
            Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
            ForeColor = Color.FromArgb(30, 41, 59)
        };

        contentPanel.Controls.Add(lblTitle);
        contentPanel.Controls.Add(lblSub);
        contentPanel.Controls.Add(txtInstallPath);
        contentPanel.Controls.Add(btnBrowse);
        contentPanel.Controls.Add(chkDesktopShortcut);
    }

    private void RenderStep3()
    {
        btnNext.Enabled = false;
        btnBack.Enabled = false;
        btnCancel.Enabled = false;

        var lblTitle = new Label
        {
            Text = "جاري تثبيت ملفات النظام...",
            Font = new Font("Segoe UI", 11f, FontStyle.Bold),
            ForeColor = Color.FromArgb(15, 23, 42),
            Location = new Point(25, 25),
            AutoSize = true
        };

        lblStatus = new Label
        {
            Text = "جاري نسخ الملفات والمكتبات التشغيلية...",
            Font = new Font("Segoe UI", 9f),
            ForeColor = Color.FromArgb(100, 116, 139),
            Location = new Point(25, 75),
            Size = new Size(590, 25)
        };

        progressBar = new ProgressBar
        {
            Location = new Point(25, 110),
            Size = new Size(590, 28),
            Style = ProgressBarStyle.Continuous,
            Value = 10
        };

        contentPanel.Controls.Add(lblTitle);
        contentPanel.Controls.Add(lblStatus);
        contentPanel.Controls.Add(progressBar);

        // Execute background installation
        Task.Run(ExecuteInstallation);
    }

    private void RenderStep4()
    {
        btnNext.Text = "إنهاء";
        btnNext.Enabled = true;
        btnBack.Enabled = false;
        btnCancel.Enabled = false;

        var lblSuccess = new Label
        {
            Text = "تهانينا! اكتمل تثبيت النظام بنجاح",
            Font = new Font("Segoe UI", 12f, FontStyle.Bold),
            ForeColor = Color.FromArgb(22, 101, 52), // Forest Green
            Location = new Point(25, 20),
            AutoSize = true
        };

        var lblSummary = new Label
        {
            Text = "تم تثبيت وتهيئة النظام بنجاح وهو الآن جاهز للاستخدام التجاري الفعلي.\n\n" +
                   "بيانات الدخول الافتراضية كمسؤول عام:\n" +
                   "• اسم المستخدم: admin\n" +
                   "• كلمة المرور: Admin@123456\n\n" +
                   "ملاحظة: يمكنك تغيير كلمة المرور وإدارة المستخدمين من شاشة الإعدادات داخل النظام.",
            Font = new Font("Segoe UI", 9.5f),
            ForeColor = Color.FromArgb(51, 65, 85),
            Location = new Point(25, 65),
            Size = new Size(590, 120)
        };

        chkLaunchNow = new CheckBox
        {
            Text = "تشغيل نظام ثلاجة المياه المركزية الآن",
            Checked = true,
            Location = new Point(25, 200),
            AutoSize = true,
            Font = new Font("Segoe UI", 10f, FontStyle.Bold),
            ForeColor = Color.FromArgb(37, 99, 235)
        };

        contentPanel.Controls.Add(lblSuccess);
        contentPanel.Controls.Add(lblSummary);
        contentPanel.Controls.Add(chkLaunchNow);
    }

    private void BtnNext_Click(object? sender, EventArgs e)
    {
        if (currentStep == 1)
        {
            ShowStep(2);
        }
        else if (currentStep == 2)
        {
            ShowStep(3);
        }
        else if (currentStep == 4)
        {
            if (chkLaunchNow != null && chkLaunchNow.Checked)
            {
                var targetExe = Path.Combine(txtInstallPath.Text, "CentralBeverageDistribution.exe");
                if (File.Exists(targetExe))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = targetExe,
                        WorkingDirectory = txtInstallPath.Text,
                        UseShellExecute = true
                    });
                }
            }
            Close();
        }
    }

    private async Task ExecuteInstallation()
    {
        try
        {
            var targetDir = txtInstallPath.Text.Trim();
            if (string.IsNullOrEmpty(targetDir)) targetDir = defaultInstallPath;

            UpdateProgress(15, "إنشاء المجلدات والمسارات...");
            Directory.CreateDirectory(targetDir);
            Directory.CreateDirectory(Path.Combine(targetDir, "storage"));
            Directory.CreateDirectory(Path.Combine(targetDir, "storage", "invoices"));
            Directory.CreateDirectory(Path.Combine(targetDir, "storage", "reports"));
            Directory.CreateDirectory(Path.Combine(targetDir, "storage", "attachments"));

            // Source payload directory
            var baseDir = AppDomain.CurrentDomain.BaseDirectory;
            var payloadDir = Path.Combine(baseDir, "payload");
            if (!Directory.Exists(payloadDir))
            {
                // Fallback to baseDir if payload files are adjacent
                payloadDir = baseDir;
            }

            UpdateProgress(35, "نسخ ملفات المحرك وتطبيق سطح المكتب...");
            CopyDirectory(payloadDir, targetDir);

            UpdateProgress(70, "تهيئة إعدادات النظام ومسارات البيانات...");

            // Create desktop shortcut if selected
            if (chkDesktopShortcut != null && chkDesktopShortcut.Checked)
            {
                UpdateProgress(85, "إنشاء اختصار سطح المكتب...");
                CreateShortcut(
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), "نظام ثلاجة المياه المركزية.lnk"),
                    Path.Combine(targetDir, "CentralBeverageDistribution.exe"),
                    targetDir
                );
            }

            // Create Start Menu shortcut
            var startMenuDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs", "CentralBeverageDistribution");
            Directory.CreateDirectory(startMenuDir);
            CreateShortcut(
                Path.Combine(startMenuDir, "نظام ثلاجة المياه المركزية.lnk"),
                Path.Combine(targetDir, "CentralBeverageDistribution.exe"),
                targetDir
            );

            // Write Start Guide & Info
            var readmePath = Path.Combine(targetDir, "START_GUIDE.txt");
            var readmeContent = "=====================================================\r\n" +
                                "نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية v1.1.0\r\n" +
                                "=====================================================\r\n\r\n" +
                                "بيانات تسجيل الدخول الافتراضية:\r\n" +
                                "اسم المستخدم: admin\r\n" +
                                "كلمة المرور: Admin@123456\r\n\r\n" +
                                "لتشغيل النظام: انقر نقرًا مزدوجًا على CentralBeverageDistribution.exe\r\n" +
                                "أو من خلال اختصار سطح المكتب.\r\n";
            File.WriteAllText(readmePath, readmeContent, System.Text.Encoding.UTF8);

            UpdateProgress(100, "اكتمل التثبيت بنجاح!");
            await Task.Delay(500);

            Invoke(new Action(() => ShowStep(4)));
        }
        catch (Exception ex)
        {
            Invoke(new Action(() =>
            {
                MessageBox.Show($"حدث خطأ أثناء التثبيت: {ex.Message}", "خطأ في التثبيت", MessageBoxButtons.OK, MessageBoxIcon.Error);
                btnCancel.Enabled = true;
            }));
        }
    }

    private void UpdateProgress(int value, string status)
    {
        if (InvokeRequired)
        {
            Invoke(new Action(() => UpdateProgress(value, status)));
            return;
        }

        progressBar.Value = Math.Clamp(value, 0, 100);
        lblStatus.Text = status;
    }

    private void CopyDirectory(string sourceDir, string destinationDir)
    {
        foreach (var file in Directory.GetFiles(sourceDir))
        {
            var fileName = Path.GetFileName(file);
            // Avoid copying the installer itself if running in the same directory
            if (fileName.Contains("Setup", StringComparison.OrdinalIgnoreCase)) continue;

            var destFile = Path.Combine(destinationDir, fileName);
            File.Copy(file, destFile, true);
        }

        foreach (var subDir in Directory.GetDirectories(sourceDir))
        {
            var dirName = Path.GetFileName(subDir);
            if (dirName.Equals("storage", StringComparison.OrdinalIgnoreCase)) continue;

            var destSubDir = Path.Combine(destinationDir, dirName);
            Directory.CreateDirectory(destSubDir);
            CopyDirectory(subDir, destSubDir);
        }
    }

    private void CreateShortcut(string shortcutPath, string targetPath, string workingDir)
    {
        try
        {
            Type? shellType = Type.GetTypeFromProgID("WScript.Shell");
            if (shellType != null)
            {
                dynamic shell = Activator.CreateInstance(shellType)!;
                dynamic shortcut = shell.CreateShortcut(shortcutPath);
                shortcut.TargetPath = targetPath;
                shortcut.WorkingDirectory = workingDir;
                shortcut.Description = "نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية";
                shortcut.Save();
            }
        }
        catch
        {
            // Silently continue if COM shortcut creation is restricted
        }
    }
}
