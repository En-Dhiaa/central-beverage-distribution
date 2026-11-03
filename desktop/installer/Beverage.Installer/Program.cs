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

    // Step 2 controls (Paths)
    private TextBox txtInstallPath = null!;
    private Button btnBrowseInstall = null!;
    private TextBox txtDataVaultPath = null!;
    private Button btnBrowseDataVault = null!;
    private TextBox txtBackupVaultPath = null!;
    private Button btnBrowseBackup = null!;
    private CheckBox chkDesktopShortcut = null!;
    private CheckBox chkStartMenuShortcut = null!;

    // Step 3 controls (Identity)
    private TextBox txtCompanyName = null!;
    private TextBox txtPhone = null!;
    private TextBox txtAddress = null!;
    private TextBox txtCrNumber = null!;

    // Step 4 controls (Progress)
    private ProgressBar progressBar = null!;
    private Label lblStatus = null!;
    private Label lblPercent = null!;

    // Step 5 controls (Finish)
    private CheckBox chkLaunchNow = null!;

    private string defaultInstallPath;
    private string defaultDataPath;
    private string defaultBackupPath;

    public InstallerForm()
    {
        var systemDrive = Path.GetPathRoot(Environment.SystemDirectory) ?? "C:\\";
        defaultInstallPath = Path.Combine(systemDrive, "CentralBeverageDistribution");
        defaultDataPath = Path.Combine(defaultInstallPath, "Data");
        defaultBackupPath = Path.Combine(defaultDataPath, "backups");

        InitUI();
        ShowStep(1);
    }

    private void InitUI()
    {
        Text = "مثبت نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية | Enterprise Offline Setup v1.3.0";
        Size = new Size(820, 600);
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        RightToLeft = RightToLeft.Yes;
        RightToLeftLayout = true;
        Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
        BackColor = Color.FromArgb(248, 250, 252);

        // Load embedded application icon
        try
        {
            var assembly = Assembly.GetExecutingAssembly();
            using var iconStream = assembly.GetManifestResourceStream("Beverage.Installer.app.ico");
            if (iconStream != null)
            {
                Icon = new Icon(iconStream);
            }
        }
        catch {}

        // Header Panel (Dark Navy Slate with Brand Emblem)
        headerPanel = new Panel
        {
            Dock = DockStyle.Top,
            Height = 100,
            BackColor = Color.FromArgb(15, 23, 42)
        };

        // Brand Icon Emblem (Circular badge)
        var pnlLogoBadge = new Panel
        {
            Size = new Size(64, 64),
            Location = new Point(25, 18),
            BackColor = Color.FromArgb(2, 132, 199)
        };
        pnlLogoBadge.Paint += (s, e) =>
        {
            e.Graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
            using var pen = new Pen(Color.FromArgb(186, 230, 253), 2.5f);
            e.Graphics.DrawEllipse(pen, 2, 2, 60, 60);
            using var font = new Font("Segoe UI", 20f, FontStyle.Bold);
            using var brush = new SolidBrush(Color.White);
            e.Graphics.DrawString("❄", font, brush, 13, 8);
        };

        var lblBrand = new Label
        {
            Text = "نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية والتوزيع",
            ForeColor = Color.White,
            Font = new Font("Segoe UI", 13.5f, FontStyle.Bold),
            Location = new Point(105, 20),
            AutoSize = true
        };

        var lblSub = new Label
        {
            Text = "حزمة التثبيت والتهيئة الذاتية الشاملة — محلي 100% دون أي اتصال بالإنترنت (Offline Standalone Engine)",
            ForeColor = Color.FromArgb(148, 163, 184),
            Font = new Font("Segoe UI", 9.5f, FontStyle.Regular),
            Location = new Point(105, 56),
            AutoSize = true
        };

        headerPanel.Controls.Add(pnlLogoBadge);
        headerPanel.Controls.Add(lblBrand);
        headerPanel.Controls.Add(lblSub);

        // Footer Panel
        footerPanel = new Panel
        {
            Dock = DockStyle.Bottom,
            Height = 72,
            BackColor = Color.FromArgb(241, 245, 249)
        };

        btnCancel = new Button
        {
            Text = "إلغاء التثبيت",
            Size = new Size(110, 40),
            Location = new Point(25, 16),
            BackColor = Color.White,
            FlatStyle = FlatStyle.System
        };
        btnCancel.Click += (s, e) => Close();

        btnNext = new Button
        {
            Text = "التالي >",
            Size = new Size(130, 40),
            Location = new Point(645, 16),
            BackColor = Color.FromArgb(37, 99, 235),
            ForeColor = Color.White,
            FlatStyle = FlatStyle.System,
            Font = new Font("Segoe UI", 9.5f, FontStyle.Bold)
        };
        btnNext.Click += BtnNext_Click;

        btnBack = new Button
        {
            Text = "< السابق",
            Size = new Size(100, 40),
            Location = new Point(535, 16),
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
        btnBack.Enabled = (step > 1 && step < 4);

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
            case 5:
                RenderStep5();
                break;
        }
    }

    // Step 1: Welcome
    private void RenderStep1()
    {
        btnNext.Text = "التالي >";

        var lblWelcome = new Label
        {
            Text = "مرحبًا بك في مثبت النظام الشامل والمستقل محلياً",
            Font = new Font("Segoe UI", 12.5f, FontStyle.Bold),
            ForeColor = Color.FromArgb(15, 23, 42),
            Location = new Point(25, 15),
            AutoSize = true
        };

        var pnlFeatures = new Panel
        {
            Location = new Point(25, 52),
            Size = new Size(745, 320),
            BackColor = Color.White,
            BorderStyle = BorderStyle.FixedSingle
        };

        var lblPoints = new Label
        {
            Text = "يقوم هذا البرنامج بتثبيت وإعداد النظام كاملاً في ملف واحد ليعمل محلياً دون أي خوادم خارجية:\n\n" +
                   "✔ بيئة تشغيل مستقلة 100% (Offline Architecture): لا يتطلب اتصالاً بالإنترنت أثناء أو بعد التثبيت.\n\n" +
                   "✔ تخصيص مستودع البيانات المحلي (Local Data Vault): تحديد مسار قاعدة بيانات SQLite ومجلدات النسخ الاحتياطية.\n\n" +
                   "✔ تهيئة الهوية الرسمية والشعار: إدخال اسم المؤسسة، العنوان، أرقام التواصل، والرقم الضريبي من أول تشغيل.\n\n" +
                   "✔ محرك فواتير وعروض أسعار متقدم: دعم البيع السريع (POS)، عروض الأسعار (Quotations)، ومردودات المبيعات.\n\n" +
                   "✔ قيود محاسبية ومطابقة العهد: نظام القيد المزدوج، متابعة شاحنات وموزعي الثلاجة، وإغلاق اليومية المحاسبي.\n\n" +
                   "انقر فوق [التالي] لتحديد مسارات التثبيت والبيانات.",
            Font = new Font("Segoe UI", 10f),
            ForeColor = Color.FromArgb(30, 41, 59),
            Location = new Point(20, 15),
            Size = new Size(705, 285)
        };
        pnlFeatures.Controls.Add(lblPoints);

        contentPanel.Controls.Add(lblWelcome);
        contentPanel.Controls.Add(pnlFeatures);
    }

    // Step 2: Paths Selection (Program, Data Vault, Backup Vault)
    private void RenderStep2()
    {
        btnNext.Text = "التالي >";

        var lblTitle = new Label
        {
            Text = "تحديد مسارات التثبيت ومستودع حفظ البيانات والنسخ الاحتياطية:",
            Font = new Font("Segoe UI", 12f, FontStyle.Bold),
            ForeColor = Color.FromArgb(15, 23, 42),
            Location = new Point(25, 10),
            AutoSize = true
        };

        // 1. Program Files Path
        var lblInstall = new Label
        {
            Text = "1. مسار تثبيت ملفات البرنامج:",
            Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
            ForeColor = Color.FromArgb(51, 65, 85),
            Location = new Point(25, 45),
            AutoSize = true
        };
        txtInstallPath = new TextBox
        {
            Text = defaultInstallPath,
            Location = new Point(25, 70),
            Size = new Size(595, 28),
            Font = new Font("Segoe UI", 9.5f)
        };
        btnBrowseInstall = new Button
        {
            Text = "استعراض...",
            Location = new Point(630, 68),
            Size = new Size(100, 32),
            FlatStyle = FlatStyle.System
        };
        btnBrowseInstall.Click += (s, e) =>
        {
            using var fbd = new FolderBrowserDialog { SelectedPath = txtInstallPath.Text };
            if (fbd.ShowDialog() == DialogResult.OK) txtInstallPath.Text = fbd.SelectedPath;
        };

        // 2. Data Vault Path
        var lblDataVault = new Label
        {
            Text = "2. مسار مستودع البيانات المحلي (مكان حفظ قاعدة البيانات SQLite والملفات):",
            Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
            ForeColor = Color.FromArgb(51, 65, 85),
            Location = new Point(25, 115),
            AutoSize = true
        };
        txtDataVaultPath = new TextBox
        {
            Text = defaultDataPath,
            Location = new Point(25, 140),
            Size = new Size(595, 28),
            Font = new Font("Segoe UI", 9.5f)
        };
        btnBrowseDataVault = new Button
        {
            Text = "استعراض...",
            Location = new Point(630, 138),
            Size = new Size(100, 32),
            FlatStyle = FlatStyle.System
        };
        btnBrowseDataVault.Click += (s, e) =>
        {
            using var fbd = new FolderBrowserDialog { SelectedPath = txtDataVaultPath.Text };
            if (fbd.ShowDialog() == DialogResult.OK) txtDataVaultPath.Text = fbd.SelectedPath;
        };

        // 3. Backup Vault Path
        var lblBackup = new Label
        {
            Text = "3. مسار حفظ النسخ الاحتياطية التلقائية المشفرة (Backup Vault):",
            Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
            ForeColor = Color.FromArgb(51, 65, 85),
            Location = new Point(25, 185),
            AutoSize = true
        };
        txtBackupVaultPath = new TextBox
        {
            Text = defaultBackupPath,
            Location = new Point(25, 210),
            Size = new Size(595, 28),
            Font = new Font("Segoe UI", 9.5f)
        };
        btnBrowseBackup = new Button
        {
            Text = "استعراض...",
            Location = new Point(630, 208),
            Size = new Size(100, 32),
            FlatStyle = FlatStyle.System
        };
        btnBrowseBackup.Click += (s, e) =>
        {
            using var fbd = new FolderBrowserDialog { SelectedPath = txtBackupVaultPath.Text };
            if (fbd.ShowDialog() == DialogResult.OK) txtBackupVaultPath.Text = fbd.SelectedPath;
        };

        // Shortcuts
        var pnlOptions = new GroupBox
        {
            Text = "خيارات الاختصارات",
            Location = new Point(25, 255),
            Size = new Size(705, 95),
            Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
            ForeColor = Color.FromArgb(15, 23, 42)
        };

        chkDesktopShortcut = new CheckBox
        {
            Text = "إنشاء اختصار مباشر على سطح المكتب (Desktop Shortcut)",
            Checked = true,
            Location = new Point(20, 28),
            AutoSize = true,
            Font = new Font("Segoe UI", 9.5f, FontStyle.Regular),
            ForeColor = Color.FromArgb(30, 41, 59)
        };

        chkStartMenuShortcut = new CheckBox
        {
            Text = "إضافة اختصار إلى قائمة ابدأ (Start Menu)",
            Checked = true,
            Location = new Point(20, 60),
            AutoSize = true,
            Font = new Font("Segoe UI", 9.5f, FontStyle.Regular),
            ForeColor = Color.FromArgb(30, 41, 59)
        };

        pnlOptions.Controls.Add(chkDesktopShortcut);
        pnlOptions.Controls.Add(chkStartMenuShortcut);

        contentPanel.Controls.Add(lblTitle);
        contentPanel.Controls.Add(lblInstall);
        contentPanel.Controls.Add(txtInstallPath);
        contentPanel.Controls.Add(btnBrowseInstall);
        contentPanel.Controls.Add(lblDataVault);
        contentPanel.Controls.Add(txtDataVaultPath);
        contentPanel.Controls.Add(btnBrowseDataVault);
        contentPanel.Controls.Add(lblBackup);
        contentPanel.Controls.Add(txtBackupVaultPath);
        contentPanel.Controls.Add(btnBrowseBackup);
        contentPanel.Controls.Add(pnlOptions);
    }

    // Step 3: Enterprise Identity & Branding Setup
    private void RenderStep3()
    {
        btnNext.Text = "بدء التثبيت الآن";

        var lblTitle = new Label
        {
            Text = "التهيئة الأولية لهوية المنشأة وأرقام التواصل:",
            Font = new Font("Segoe UI", 12f, FontStyle.Bold),
            ForeColor = Color.FromArgb(15, 23, 42),
            Location = new Point(25, 10),
            AutoSize = true
        };

        var lblSub = new Label
        {
            Text = "سيتم اعتماد هذه البيانات كترويسة رسمية على الفواتير وعروض الأسعار (يمكنك تعديلها لاحقاً من الإعدادات):",
            Font = new Font("Segoe UI", 9.5f),
            ForeColor = Color.FromArgb(71, 85, 105),
            Location = new Point(25, 40),
            AutoSize = true
        };

        var pnlForm = new Panel
        {
            Location = new Point(25, 75),
            Size = new Size(705, 275),
            BackColor = Color.White,
            BorderStyle = BorderStyle.FixedSingle,
            Padding = new Padding(20)
        };

        // Company Name
        var lblCompany = new Label { Text = "اسم المؤسسة / المنشأة التجارية:", Location = new Point(20, 18), AutoSize = true, Font = new Font("Segoe UI", 9.5f, FontStyle.Bold) };
        txtCompanyName = new TextBox { Text = "مؤسسة توزيع المياه والعصائر المركزية", Location = new Point(20, 42), Size = new Size(660, 28), Font = new Font("Segoe UI", 9.5f, FontStyle.Bold) };

        // Phone & WhatsApp
        var lblPhone = new Label { Text = "هاتف الإدارة / رقم الواتساب الرسمي:", Location = new Point(20, 85), AutoSize = true, Font = new Font("Segoe UI", 9.5f, FontStyle.Bold) };
        txtPhone = new TextBox { Text = "777000111", Location = new Point(20, 110), Size = new Size(315, 28), Font = new Font("Segoe UI", 9.5f) };

        // CR / Tax
        var lblCr = new Label { Text = "رقم السجل التجاري / الرقم الضريبي:", Location = new Point(365, 85), AutoSize = true, Font = new Font("Segoe UI", 9.5f, FontStyle.Bold) };
        txtCrNumber = new TextBox { Text = "1010-998877", Location = new Point(365, 110), Size = new Size(315, 28), Font = new Font("Segoe UI", 9.5f) };

        // Address
        var lblAddr = new Label { Text = "العنوان والموقع الجغرافي للمستودع / الثلاجة:", Location = new Point(20, 155), AutoSize = true, Font = new Font("Segoe UI", 9.5f, FontStyle.Bold) };
        txtAddress = new TextBox { Text = "صنعاء - شارع الستين الجنوبي - جوار جولة المصباحي", Location = new Point(20, 180), Size = new Size(660, 28), Font = new Font("Segoe UI", 9.5f) };

        var lblNote = new Label
        {
            Text = "ملاحظة: يمكنك رفع وتغيير صورة الشعار واختيار قوالب الفواتير الملونة في أي وقت من لوحة الإعدادات.",
            Location = new Point(20, 230),
            AutoSize = true,
            Font = new Font("Segoe UI", 9f),
            ForeColor = Color.FromArgb(100, 116, 139)
        };

        pnlForm.Controls.Add(lblCompany);
        pnlForm.Controls.Add(txtCompanyName);
        pnlForm.Controls.Add(lblPhone);
        pnlForm.Controls.Add(txtPhone);
        pnlForm.Controls.Add(lblCr);
        pnlForm.Controls.Add(txtCrNumber);
        pnlForm.Controls.Add(lblAddr);
        pnlForm.Controls.Add(txtAddress);
        pnlForm.Controls.Add(lblNote);

        contentPanel.Controls.Add(lblTitle);
        contentPanel.Controls.Add(lblSub);
        contentPanel.Controls.Add(pnlForm);
    }

    // Step 4: Progress
    private void RenderStep4()
    {
        btnNext.Enabled = false;
        btnBack.Enabled = false;
        btnCancel.Enabled = false;

        var lblTitle = new Label
        {
            Text = "جاري استخراج وتثبيت ملفات النظام وإعداد مستودع البيانات...",
            Font = new Font("Segoe UI", 12.5f, FontStyle.Bold),
            ForeColor = Color.FromArgb(15, 23, 42),
            Location = new Point(25, 20),
            AutoSize = true
        };

        lblStatus = new Label
        {
            Text = "جاري تهيئة الحزمة الذاتية وفك الضغط...",
            Font = new Font("Segoe UI", 9.5f),
            ForeColor = Color.FromArgb(71, 85, 105),
            Location = new Point(25, 75),
            Size = new Size(620, 25)
        };

        lblPercent = new Label
        {
            Text = "0%",
            Font = new Font("Segoe UI", 10.5f, FontStyle.Bold),
            ForeColor = Color.FromArgb(37, 99, 235),
            Location = new Point(660, 75),
            Size = new Size(65, 25),
            TextAlign = ContentAlignment.TopLeft
        };

        progressBar = new ProgressBar
        {
            Location = new Point(25, 110),
            Size = new Size(705, 30),
            Style = ProgressBarStyle.Continuous,
            Value = 5
        };

        var pnlDetails = new Panel
        {
            Location = new Point(25, 160),
            Size = new Size(705, 180),
            BackColor = Color.White,
            BorderStyle = BorderStyle.FixedSingle,
            Padding = new Padding(15)
        };

        var lblInfo = new Label
        {
            Text = "حالة إعداد البيئة المحلية:\n\n" +
                   "• يتم نسخ ملفات المحرك التنفيذي (.NET 8 Runtime Self-Contained) محلياً دون الحاجة لتثبيت أي برامج خارجية.\n" +
                   "• يتم تهيئة مستودع البيانات المحلي (Data Vault) ومسار النسخ الاحتياطية المحددة.\n" +
                   "• يتم تثبيت واجهة الويب التفاعلية (React SPA Production Assets) للعمل دون خوادم سحابية.\n" +
                   "• يتم إنشاء ملف التكوين التأسيسي وتثبيت اختصارات سطح المكتب لتشغيل سريع ومستقر.",
            Font = new Font("Segoe UI", 9.5f),
            ForeColor = Color.FromArgb(100, 116, 139),
            Location = new Point(15, 15),
            Size = new Size(675, 150)
        };
        pnlDetails.Controls.Add(lblInfo);

        contentPanel.Controls.Add(lblTitle);
        contentPanel.Controls.Add(lblStatus);
        contentPanel.Controls.Add(lblPercent);
        contentPanel.Controls.Add(progressBar);
        contentPanel.Controls.Add(pnlDetails);

        Task.Run(ExecuteInstallation);
    }

    // Step 5: Finish
    private void RenderStep5()
    {
        btnNext.Text = "إنهاء وبدء التشغيل";
        btnNext.Enabled = true;
        btnBack.Enabled = false;
        btnCancel.Enabled = false;

        var lblSuccess = new Label
        {
            Text = "تم تثبيت النظام وإعداد الهوية ومستودع البيانات بنجاح!",
            Font = new Font("Segoe UI", 13.5f, FontStyle.Bold),
            ForeColor = Color.FromArgb(22, 101, 52),
            Location = new Point(25, 15),
            AutoSize = true
        };

        var pnlSummary = new Panel
        {
            Location = new Point(25, 55),
            Size = new Size(705, 235),
            BackColor = Color.White,
            BorderStyle = BorderStyle.FixedSingle,
            Padding = new Padding(15)
        };

        var lblSummaryText = new Label
        {
            Text = "النظام مثبت وجاهز للتشغيل المحلي الفعلي على هذا الجهاز بالكامل:\n\n" +
                   $"• مسار تثبيت البرنامج: {txtInstallPath.Text}\n" +
                   $"• مسار مستودع البيانات المحلي (قاعدة البيانات): {txtDataVaultPath.Text}\n" +
                   $"• مسار النسخ الاحتياطية التلقائية: {txtBackupVaultPath.Text}\n" +
                   $"• اسم المنشأة المعتمد: {txtCompanyName.Text}\n\n" +
                   "بيانات الدخول الافتراضية كمسؤول عام للنظام:\n" +
                   "  - اسم المستخدم: admin\n" +
                   "  - كلمة المرور: Admin@123456\n\n" +
                   "يمكنك فور الدخول إدارة المنتجات والأسعار والموزعين وعمال الثلاجة وإصدار الفواتير وعروض الأسعار.",
            Font = new Font("Segoe UI", 9.5f),
            ForeColor = Color.FromArgb(30, 41, 59),
            Location = new Point(15, 15),
            Size = new Size(675, 205)
        };
        pnlSummary.Controls.Add(lblSummaryText);

        chkLaunchNow = new CheckBox
        {
            Text = "تشغيل نظام ثلاجة المياه والعصائر المركزية الآن",
            Checked = true,
            Location = new Point(25, 310),
            AutoSize = true,
            Font = new Font("Segoe UI", 11f, FontStyle.Bold),
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
        else if (currentStep == 3)
        {
            ShowStep(4);
        }
        else if (currentStep == 5)
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

            var dataVaultDir = txtDataVaultPath.Text.Trim();
            if (string.IsNullOrEmpty(dataVaultDir)) dataVaultDir = Path.Combine(targetDir, "Data");

            var backupVaultDir = txtBackupVaultPath.Text.Trim();
            if (string.IsNullOrEmpty(backupVaultDir)) backupVaultDir = Path.Combine(dataVaultDir, "backups");

            UpdateProgress(10, "إنشاء مجلدات النظام ومستودع البيانات المحلي...");
            Directory.CreateDirectory(targetDir);
            Directory.CreateDirectory(dataVaultDir);
            Directory.CreateDirectory(Path.Combine(dataVaultDir, "invoices"));
            Directory.CreateDirectory(Path.Combine(dataVaultDir, "reports"));
            Directory.CreateDirectory(Path.Combine(dataVaultDir, "attachments"));
            Directory.CreateDirectory(backupVaultDir);

            // 1. Locate Embedded Zip or fallback local file
            UpdateProgress(20, "استخراج ملفات النظام المدمجة داخل المثبت...");
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

            // 2. Write init_config.json with Custom DataVault and Company Profile
            UpdateProgress(86, "تهيئة ملف التكوين التأسيسي وبيانات المنشأة...");
            var companyName = txtCompanyName.Text.Trim();
            var phone = txtPhone.Text.Trim();
            var address = txtAddress.Text.Trim();
            var cr = txtCrNumber.Text.Trim();

            var initJson = $"{{\r\n" +
                           $"  \"DataVaultPath\": \"{dataVaultDir.Replace("\\", "\\\\")}\",\r\n" +
                           $"  \"BackupVaultPath\": \"{backupVaultDir.Replace("\\", "\\\\")}\",\r\n" +
                           $"  \"CompanyName\": \"{companyName}\",\r\n" +
                           $"  \"Phone\": \"{phone}\",\r\n" +
                           $"  \"Address\": \"{address}\",\r\n" +
                           $"  \"CommercialRegistration\": \"{cr}\"\r\n" +
                           $"}}\r\n";
            File.WriteAllText(Path.Combine(targetDir, "init_config.json"), initJson, System.Text.Encoding.UTF8);

            // 3. Create Desktop Shortcut
            if (chkDesktopShortcut != null && chkDesktopShortcut.Checked)
            {
                UpdateProgress(90, "إنشاء اختصار سطح المكتب...");
                var desktopLnk = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), "نظام ثلاجة المياه المركزية.lnk");
                CreateShortcut(desktopLnk, Path.Combine(targetDir, "CentralBeverageDistribution.exe"), targetDir);
            }

            // 4. Create Start Menu Shortcut
            if (chkStartMenuShortcut != null && chkStartMenuShortcut.Checked)
            {
                UpdateProgress(95, "إضافة اختصار إلى قائمة ابدأ...");
                var startMenuDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs", "CentralBeverageDistribution");
                Directory.CreateDirectory(startMenuDir);
                CreateShortcut(Path.Combine(startMenuDir, "نظام ثلاجة المياه المركزية.lnk"), Path.Combine(targetDir, "CentralBeverageDistribution.exe"), targetDir);
            }

            // 5. Create Start Guide & Uninstaller script
            var guideFile = Path.Combine(targetDir, "START_GUIDE.txt");
            var guideText = "========================================================================\r\n" +
                            "نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية (Offline Enterprise v1.3.0)\r\n" +
                            "========================================================================\r\n\r\n" +
                            $"المنشأة: {companyName}\r\n" +
                            $"مستودع البيانات: {dataVaultDir}\r\n" +
                            $"مستودع النسخ الاحتياطية: {backupVaultDir}\r\n\r\n" +
                            "بيانات الدخول الافتراضية:\r\n" +
                            "• اسم المستخدم: admin\r\n" +
                            "• كلمة المرور: Admin@123456\r\n\r\n" +
                            "لتشغيل النظام: استخدم اختصار سطح المكتب أو شغل CentralBeverageDistribution.exe\r\n";
            File.WriteAllText(guideFile, guideText, System.Text.Encoding.UTF8);

            var uninstallBat = Path.Combine(targetDir, "uninstall.bat");
            var uninstText = "@echo off\r\nchcp 65001 >nul\r\necho جاري حذف اختصارات النظام...\r\n" +
                             "del \"%USERPROFILE%\\Desktop\\نظام ثلاجة المياه المركزية.lnk\" 2>nul\r\n" +
                             "echo تم حذف الاختصارات بنجاح.\r\npause\r\n";
            File.WriteAllText(uninstallBat, uninstText, System.Text.Encoding.UTF8);

            UpdateProgress(100, "اكتمل التثبيت والتهيئة بنجاح تام!");
            await Task.Delay(400);

            Invoke(new Action(() => ShowStep(5)));
        }
        catch (Exception ex)
        {
            Invoke(new Action(() =>
            {
                MessageBox.Show(
                    $"حدث خطأ أثناء التثبيت:\n{ex.Message}\n\nالتفاصيل: {ex.StackTrace}",
                    "خطأ في التثبيت",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                btnCancel.Enabled = true;
                btnBack.Enabled = true;
            }));
        }
    }

    private void UpdateProgress(int percent, string message)
    {
        if (InvokeRequired)
        {
            Invoke(new Action(() => UpdateProgress(percent, message)));
            return;
        }

        progressBar.Value = Math.Clamp(percent, 0, 100);
        lblPercent.Text = $"{progressBar.Value}%";
        lblStatus.Text = message;
    }

    private static void CopyDirectory(string sourceDir, string destinationDir)
    {
        var dir = new DirectoryInfo(sourceDir);
        if (!dir.Exists) return;

        Directory.CreateDirectory(destinationDir);

        foreach (var file in dir.GetFiles())
        {
            file.CopyTo(Path.Combine(destinationDir, file.Name), true);
        }

        foreach (var subDir in dir.GetDirectories())
        {
            CopyDirectory(subDir.FullName, Path.Combine(destinationDir, subDir.Name));
        }
    }

    private static void CreateShortcut(string shortcutPath, string targetPath, string workingDir)
    {
        try
        {
            var shellType = Type.GetTypeFromProgID("WScript.Shell");
            if (shellType == null) return;
            dynamic shell = Activator.CreateInstance(shellType)!;
            dynamic shortcut = shell.CreateShortcut(shortcutPath);
            shortcut.TargetPath = targetPath;
            shortcut.WorkingDirectory = workingDir;
            shortcut.Description = "نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية والتوزيع";
            shortcut.IconLocation = targetPath + ",0";
            shortcut.Save();
        }
        catch
        {
            // Fallback non-critical
        }
    }
}
