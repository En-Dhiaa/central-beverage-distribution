using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.IO.Compression;
using System.Reflection;
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
    private CheckBox chkDesktopShortcut = null!;
    private CheckBox chkStartMenuShortcut = null!;
    private CheckBox chkCreateDataVault = null!;

    // Step 3 controls
    private ProgressBar progressBar = null!;
    private Label lblStatus = null!;
    private Label lblPercent = null!;

    // Step 4 controls
    private CheckBox chkLaunchNow = null!;

    private string defaultInstallPath;

    public InstallerForm()
    {
        // Default: C:\CentralBeverageDistribution or LocalAppData
        var systemDrive = Path.GetPathRoot(Environment.SystemDirectory) ?? "C:\\";
        defaultInstallPath = Path.Combine(systemDrive, "CentralBeverageDistribution");

        InitUI();
        ShowStep(1);
    }

    private void InitUI()
    {
        Text = "مثبت نظام إدارة ثلاجة المياه والعصائر المركزية | Offline Enterprise Setup v1.2.0";
        Size = new Size(740, 530);
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        RightToLeft = RightToLeft.Yes;
        RightToLeftLayout = true;
        Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
        BackColor = Color.FromArgb(248, 250, 252);

        // Header Panel (Midnight Slate with Gradient Accent)
        headerPanel = new Panel
        {
            Dock = DockStyle.Top,
            Height = 90,
            BackColor = Color.FromArgb(15, 23, 42)
        };

        var lblBrand = new Label
        {
            Text = "نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية",
            ForeColor = Color.White,
            Font = new Font("Segoe UI", 13f, FontStyle.Bold),
            Location = new Point(25, 18),
            AutoSize = true
        };

        var lblSub = new Label
        {
            Text = "حزمة التثبيت الذاتي الشاملة — يعمل محلياً 100% دون إنترنت (Offline Standalone Engine)",
            ForeColor = Color.FromArgb(148, 163, 184),
            Font = new Font("Segoe UI", 9f, FontStyle.Regular),
            Location = new Point(25, 50),
            AutoSize = true
        };

        headerPanel.Controls.Add(lblBrand);
        headerPanel.Controls.Add(lblSub);

        // Footer Panel
        footerPanel = new Panel
        {
            Dock = DockStyle.Bottom,
            Height = 70,
            BackColor = Color.FromArgb(241, 245, 249)
        };

        btnCancel = new Button
        {
            Text = "إلغاء",
            Size = new Size(100, 36),
            Location = new Point(25, 16),
            BackColor = Color.White,
            FlatStyle = FlatStyle.System
        };
        btnCancel.Click += (s, e) => Close();

        btnNext = new Button
        {
            Text = "التالي >",
            Size = new Size(125, 36),
            Location = new Point(570, 16),
            BackColor = Color.FromArgb(37, 99, 235),
            ForeColor = Color.White,
            FlatStyle = FlatStyle.System,
            Font = new Font("Segoe UI", 9.5f, FontStyle.Bold)
        };
        btnNext.Click += BtnNext_Click;

        btnBack = new Button
        {
            Text = "< السابق",
            Size = new Size(100, 36),
            Location = new Point(460, 16),
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
            Padding = new Padding(30, 20, 30, 20)
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
            Text = "مرحبًا بك في مثبت النظام الشامل والمستقل محلياً",
            Font = new Font("Segoe UI", 12f, FontStyle.Bold),
            ForeColor = Color.FromArgb(15, 23, 42),
            Location = new Point(25, 15),
            AutoSize = true
        };

        var pnlFeatures = new Panel
        {
            Location = new Point(25, 55),
            Size = new Size(650, 260),
            BackColor = Color.White,
            BorderStyle = BorderStyle.FixedSingle
        };

        var lblPoints = new Label
        {
            Text = "يقوم هذا البرنامج بتثبيت النظام كاملاً في ملف واحد مدمج ليعمل بصورة مستقلة:\n\n" +
                   "✔ تشغيل محلي بالكامل (Offline): يعمل بكفاءة 100% دون الحاجة إلى أي اتصال بالإنترنت.\n\n" +
                   "✔ حفظ محلي آمن (Local Data Vault): إنشاء مجلد منظم لقاعدة البيانات والفواتير والتقارير.\n\n" +
                   "✔ تكامل عمودي حقيقي: محرك قواعد بيانات، خادم ويب محلي، وواجهة سطح مكتب فائقة السرعة.\n\n" +
                   "✔ ضبط محاسبي صارم: القيد المزدوج، إدارة عهد الموزعين، تسويات الجرد، وإقفال اليومية.\n\n" +
                   "✔ جاهزية تامة وفورية: خالٍ من البيانات الوهمية ومعد للبدء المباشر لإدخال بيانات منشأتك.\n\n" +
                   "انقر فوق [التالي] لتحديد مسار التثبيت والبدء.",
            Font = new Font("Segoe UI", 9.5f),
            ForeColor = Color.FromArgb(30, 41, 59),
            Location = new Point(20, 15),
            Size = new Size(610, 230)
        };
        pnlFeatures.Controls.Add(lblPoints);

        contentPanel.Controls.Add(lblWelcome);
        contentPanel.Controls.Add(pnlFeatures);
    }

    private void RenderStep2()
    {
        btnNext.Text = "تثبيت الآن";

        var lblTitle = new Label
        {
            Text = "تحديد مسار التثبيت ومجلد حفظ البيانات:",
            Font = new Font("Segoe UI", 11f, FontStyle.Bold),
            ForeColor = Color.FromArgb(15, 23, 42),
            Location = new Point(25, 15),
            AutoSize = true
        };

        var lblSub = new Label
        {
            Text = "سيتم تثبيت النظام وإنشاء مجلد البيانات المحلي (قاعدة البيانات والمستندات) في المسار التالي:",
            Font = new Font("Segoe UI", 9.5f),
            ForeColor = Color.FromArgb(71, 85, 105),
            Location = new Point(25, 48),
            AutoSize = true
        };

        txtInstallPath = new TextBox
        {
            Text = defaultInstallPath,
            Location = new Point(25, 85),
            Size = new Size(505, 30),
            Font = new Font("Segoe UI", 9.5f)
        };

        btnBrowse = new Button
        {
            Text = "استعراض...",
            Location = new Point(540, 83),
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

        var pnlOptions = new GroupBox
        {
            Text = "خيارات الإعداد المحلي",
            Location = new Point(25, 135),
            Size = new Size(625, 160),
            Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
            ForeColor = Color.FromArgb(15, 23, 42)
        };

        chkDesktopShortcut = new CheckBox
        {
            Text = "إنشاء اختصار على سطح المكتب (Desktop Shortcut)",
            Checked = true,
            Location = new Point(20, 35),
            AutoSize = true,
            Font = new Font("Segoe UI", 9.5f, FontStyle.Regular),
            ForeColor = Color.FromArgb(30, 41, 59)
        };

        chkStartMenuShortcut = new CheckBox
        {
            Text = "إضافة اختصار إلى قائمة ابدأ (Start Menu)",
            Checked = true,
            Location = new Point(20, 70),
            AutoSize = true,
            Font = new Font("Segoe UI", 9.5f, FontStyle.Regular),
            ForeColor = Color.FromArgb(30, 41, 59)
        };

        chkCreateDataVault = new CheckBox
        {
            Text = "إنشاء وهيكلة مجلد البيانات المحلي (Data Vault: فواتير، تقارير، نسخ احتياطية)",
            Checked = true,
            Location = new Point(20, 105),
            AutoSize = true,
            Font = new Font("Segoe UI", 9.5f, FontStyle.Regular),
            ForeColor = Color.FromArgb(30, 41, 59)
        };

        pnlOptions.Controls.Add(chkDesktopShortcut);
        pnlOptions.Controls.Add(chkStartMenuShortcut);
        pnlOptions.Controls.Add(chkCreateDataVault);

        contentPanel.Controls.Add(lblTitle);
        contentPanel.Controls.Add(lblSub);
        contentPanel.Controls.Add(txtInstallPath);
        contentPanel.Controls.Add(btnBrowse);
        contentPanel.Controls.Add(pnlOptions);
    }

    private void RenderStep3()
    {
        btnNext.Enabled = false;
        btnBack.Enabled = false;
        btnCancel.Enabled = false;

        var lblTitle = new Label
        {
            Text = "جاري استخراج وتثبيت النظام محلياً...",
            Font = new Font("Segoe UI", 12f, FontStyle.Bold),
            ForeColor = Color.FromArgb(15, 23, 42),
            Location = new Point(25, 20),
            AutoSize = true
        };

        lblStatus = new Label
        {
            Text = "جاري تهيئة الحزمة وفك الضغط التلقائي...",
            Font = new Font("Segoe UI", 9.5f),
            ForeColor = Color.FromArgb(71, 85, 105),
            Location = new Point(25, 75),
            Size = new Size(540, 25)
        };

        lblPercent = new Label
        {
            Text = "0%",
            Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
            ForeColor = Color.FromArgb(37, 99, 235),
            Location = new Point(580, 75),
            Size = new Size(60, 25),
            TextAlign = ContentAlignment.TopLeft
        };

        progressBar = new ProgressBar
        {
            Location = new Point(25, 110),
            Size = new Size(625, 30),
            Style = ProgressBarStyle.Continuous,
            Value = 5
        };

        var pnlDetails = new Panel
        {
            Location = new Point(25, 160),
            Size = new Size(625, 130),
            BackColor = Color.White,
            BorderStyle = BorderStyle.FixedSingle
        };

        var lblInfo = new Label
        {
            Text = "معلومات التثبيت الحالية:\n" +
                   "• يتم نسخ كافة المكونات المدمجة داخل ملف التثبيت إلى المسار المحلي المختار.\n" +
                   "• يتم إعداد خادم ومحرك قواعد البيانات SQLite المحلي ليعمل ذاتياً.\n" +
                   "• لن يحتاج النظام لأي اتصال بالإنترنت أثناء أو بعد التثبيت إطلاقاً.",
            Font = new Font("Segoe UI", 9f),
            ForeColor = Color.FromArgb(100, 116, 139),
            Location = new Point(15, 15),
            Size = new Size(590, 100)
        };
        pnlDetails.Controls.Add(lblInfo);

        contentPanel.Controls.Add(lblTitle);
        contentPanel.Controls.Add(lblStatus);
        contentPanel.Controls.Add(lblPercent);
        contentPanel.Controls.Add(progressBar);
        contentPanel.Controls.Add(pnlDetails);

        Task.Run(ExecuteInstallation);
    }

    private void RenderStep4()
    {
        btnNext.Text = "إنهاء والبدء";
        btnNext.Enabled = true;
        btnBack.Enabled = false;
        btnCancel.Enabled = false;

        var lblSuccess = new Label
        {
            Text = "تم تثبيت النظام وإعداد قاعدة البيانات بنجاح!",
            Font = new Font("Segoe UI", 13f, FontStyle.Bold),
            ForeColor = Color.FromArgb(22, 101, 52), // Forest Green
            Location = new Point(25, 15),
            AutoSize = true
        };

        var pnlSummary = new Panel
        {
            Location = new Point(25, 55),
            Size = new Size(635, 185),
            BackColor = Color.White,
            BorderStyle = BorderStyle.FixedSingle
        };

        var lblSummaryText = new Label
        {
            Text = "النظام مثبت وجاهز للتشغيل المحلي الفعلي على هذا الجهاز.\n\n" +
                   $"• مسار النظام: {txtInstallPath.Text}\n" +
                   $"• مجلد البيانات وقاعدة البيانات: {Path.Combine(txtInstallPath.Text, "Data")}\n\n" +
                   "بيانات الدخول المعتمدة كمسؤول عام للنظام:\n" +
                   "  - اسم المستخدم: admin\n" +
                   "  - كلمة المرور: Admin@123456\n\n" +
                   "يمكنك إدارة المستخدمين والأصناف والموزعين فور الدخول مباشرة.",
            Font = new Font("Segoe UI", 9.5f),
            ForeColor = Color.FromArgb(30, 41, 59),
            Location = new Point(15, 15),
            Size = new Size(600, 155)
        };
        pnlSummary.Controls.Add(lblSummaryText);

        chkLaunchNow = new CheckBox
        {
            Text = "تشغيل نظام ثلاجة المياه والعصائر المركزية الآن",
            Checked = true,
            Location = new Point(25, 255),
            AutoSize = true,
            Font = new Font("Segoe UI", 10.5f, FontStyle.Bold),
            ForeColor = Color.FromArgb(37, 99, 235)
        };

        contentPanel.Controls.Add(lblSuccess);
        contentPanel.Controls.Add(pnlSummary);
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

            UpdateProgress(10, "إنشاء مجلدات النظام والبيانات المحلية...");
            Directory.CreateDirectory(targetDir);

            var dataDir = Path.Combine(targetDir, "Data");
            Directory.CreateDirectory(dataDir);
            Directory.CreateDirectory(Path.Combine(dataDir, "invoices"));
            Directory.CreateDirectory(Path.Combine(dataDir, "reports"));
            Directory.CreateDirectory(Path.Combine(dataDir, "attachments"));
            Directory.CreateDirectory(Path.Combine(dataDir, "backups"));

            // 1. Locate Embedded Zip or fallback local file
            UpdateProgress(20, "استخراج ملفات النظام المدمجة في المثبت...");
            var assembly = Assembly.GetExecutingAssembly();
            Stream? zipStream = null;

            foreach (var resName in assembly.GetManifestResourceNames())
            {
                if (resName.EndsWith("Payload.zip", StringComparison.OrdinalIgnoreCase))
                {
                    zipStream = assembly.GetManifestResourceStream(resName);
                    break;
                }
            }

            if (zipStream == null)
            {
                // Fallback: Check local Payload.zip or payload directory
                var baseDir = AppDomain.CurrentDomain.BaseDirectory;
                var localZip = Path.Combine(baseDir, "Payload.zip");
                if (File.Exists(localZip))
                {
                    zipStream = File.OpenRead(localZip);
                }
                else
                {
                    var payloadDir = Path.Combine(baseDir, "payload");
                    if (Directory.Exists(payloadDir))
                    {
                        CopyDirectory(payloadDir, targetDir);
                    }
                    else
                    {
                        throw new FileNotFoundException("لم يتم العثور على حزمة ملفات النظام المدمجة داخل المثبت.");
                    }
                }
            }

            if (zipStream != null)
            {
                using (zipStream)
                using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Read))
                {
                    int totalEntries = archive.Entries.Count;
                    int extracted = 0;

                    foreach (var entry in archive.Entries)
                    {
                        if (string.IsNullOrEmpty(entry.Name))
                        {
                            Directory.CreateDirectory(Path.Combine(targetDir, entry.FullName));
                            continue;
                        }

                        var destPath = Path.Combine(targetDir, entry.FullName);
                        var parent = Path.GetDirectoryName(destPath);
                        if (!string.IsNullOrEmpty(parent))
                        {
                            Directory.CreateDirectory(parent);
                        }

                        entry.ExtractToFile(destPath, overwrite: true);
                        extracted++;

                        int progress = 20 + (int)((float)extracted / totalEntries * 65);
                        UpdateProgress(progress, $"جاري استخراج: {entry.Name} ({extracted}/{totalEntries})");
                    }
                }
            }

            // 2. Create Desktop Shortcut
            if (chkDesktopShortcut != null && chkDesktopShortcut.Checked)
            {
                UpdateProgress(88, "إنشاء اختصار سطح المكتب...");
                var desktopLnk = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), "نظام ثلاجة المياه المركزية.lnk");
                CreateShortcut(desktopLnk, Path.Combine(targetDir, "CentralBeverageDistribution.exe"), targetDir);
            }

            // 3. Create Start Menu Shortcut
            if (chkStartMenuShortcut != null && chkStartMenuShortcut.Checked)
            {
                UpdateProgress(94, "إضافة اختصار إلى قائمة ابدأ...");
                var startMenuDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs", "CentralBeverageDistribution");
                Directory.CreateDirectory(startMenuDir);
                CreateShortcut(Path.Combine(startMenuDir, "نظام ثلاجة المياه المركزية.lnk"), Path.Combine(targetDir, "CentralBeverageDistribution.exe"), targetDir);
            }

            // 4. Create Start Guide & Uninstaller script
            var guideFile = Path.Combine(targetDir, "START_GUIDE.txt");
            var guideText = "========================================================================\r\n" +
                            "نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية (Offline Enterprise v1.2.0)\r\n" +
                            "========================================================================\r\n\r\n" +
                            "النظام يعمل محلياً 100% دون أي حاجة للإنترنت.\r\n\r\n" +
                            "بيانات الدخول الافتراضية:\r\n" +
                            "• اسم المستخدم: admin\r\n" +
                            "• كلمة المرور: Admin@123456\r\n\r\n" +
                            "مجلد حفظ البيانات والمستندات:\r\n" +
                            $"{dataDir}\r\n\r\n" +
                            "لتشغيل النظام: استخدم اختصار سطح المكتب أو شغل CentralBeverageDistribution.exe\r\n";
            File.WriteAllText(guideFile, guideText, System.Text.Encoding.UTF8);

            var uninstallBat = Path.Combine(targetDir, "uninstall.bat");
            var uninstText = "@echo off\r\nchcp 65001 >nul\r\necho جاري حذف اختصارات النظام...\r\n" +
                             "del \"%USERPROFILE%\\Desktop\\نظام ثلاجة المياه المركزية.lnk\" 2>nul\r\n" +
                             "echo تم حذف الاختصارات بنجاح. يمكنك حذف المجلد يدوياً متى شئت.\r\npause\r\n";
            File.WriteAllText(uninstallBat, uninstText, System.Text.Encoding.UTF8);

            UpdateProgress(100, "اكتمل التثبيت بنجاح تام!");
            await Task.Delay(400);

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

        var clamped = Math.Clamp(value, 0, 100);
        progressBar.Value = clamped;
        lblStatus.Text = status;
        lblPercent.Text = $"{clamped}%";
    }

    private void CopyDirectory(string sourceDir, string destinationDir)
    {
        foreach (var file in Directory.GetFiles(sourceDir))
        {
            var fileName = Path.GetFileName(file);
            if (fileName.Contains("Setup", StringComparison.OrdinalIgnoreCase)) continue;

            var destFile = Path.Combine(destinationDir, fileName);
            File.Copy(file, destFile, true);
        }

        foreach (var subDir in Directory.GetDirectories(sourceDir))
        {
            var dirName = Path.GetFileName(subDir);
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
            // Silently continue if WScript is unavailable
        }
    }
}
