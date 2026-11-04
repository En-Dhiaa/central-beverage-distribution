@echo off
chcp 65001 >nul
echo ===================================================================
echo     نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية v1.3.0
echo     معالج التثبيت السريع للويندوز (Automated Windows Setup)
echo ===================================================================
echo.

set "TARGET_DIR=%LOCALAPPDATA%\CentralBeverageDistribution"
echo [1/4] تحديد مسار التثبيت: %TARGET_DIR%
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
if not exist "%TARGET_DIR%\Data" mkdir "%TARGET_DIR%\Data"
if not exist "%TARGET_DIR%\Data\invoices" mkdir "%TARGET_DIR%\Data\invoices"
if not exist "%TARGET_DIR%\Data\reports" mkdir "%TARGET_DIR%\Data\reports"
if not exist "%TARGET_DIR%\Data\attachments" mkdir "%TARGET_DIR%\Data\attachments"
if not exist "%TARGET_DIR%\Data\backups" mkdir "%TARGET_DIR%\Data\backups"

echo.
echo [2/4] جاري نسخ وتثبيت ملفات النظام والتطبيق المكتبي...
xcopy /E /I /Y /Q "%~dp0payload\*" "%TARGET_DIR%\" >nul

echo.
echo [3/4] إنشاء اختصارات سطح المكتب وقائمة ابدأ بأيقونة النظام...
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $target = [System.IO.Path]::Combine($env:LOCALAPPDATA, 'CentralBeverageDistribution', 'CentralBeverageDistribution.exe'); $work = [System.IO.Path]::Combine($env:LOCALAPPDATA, 'CentralBeverageDistribution'); $s = $ws.CreateShortcut([System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'نظام ثلاجة المياه المركزية.lnk')); $s.TargetPath = $target; $s.WorkingDirectory = $work; $s.Description = 'نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية والتوزيع'; $s.IconLocation = $target + ',0'; $s.Save(); $startDir = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('StartMenu'), 'Programs', 'CentralBeverageDistribution'); if (!(Test-Path $startDir)) { New-Item -ItemType Directory -Path $startDir -Force | Out-Null }; $s2 = $ws.CreateShortcut([System.IO.Path]::Combine($startDir, 'نظام ثلاجة المياه المركزية.lnk')); $s2.TargetPath = $target; $s2.WorkingDirectory = $work; $s2.Description = 'نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية والتوزيع'; $s2.IconLocation = $target + ',0'; $s2.Save();"

echo.
echo [4/4] إنشاء دليل التشغيل السريع وتوثيق الإعدادات...
(
echo ========================================================================
echo نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية (Offline Enterprise v1.3.0)
echo ========================================================================
echo.
echo بيانات تسجيل الدخول الافتراضية:
echo • اسم المستخدم: admin
echo • كلمة المرور: Admin@123456
echo.
echo لتشغيل النظام:
echo 1. انقر على اختصار "نظام ثلاجة المياه المركزية" على سطح المكتب.
echo 2. أو شغل مباشرة: %TARGET_DIR%\CentralBeverageDistribution.exe
echo 3. الواجهة المحلية تعمل ذاتياً على: http://localhost:5000
) > "%TARGET_DIR%\START_GUIDE.txt"

echo.
echo ===================================================================
echo     تهانينا! اكتمل تثبيت النظام بنجاح وجاهز للتشغيل والعمل الفعلي.
echo ===================================================================
echo.
echo بيانات الدخول: admin / Admin@123456
echo.
set /p LAUNCH="هل تريد تشغيل النظام الآن؟ (Y/N): "
if /i "%LAUNCH%"=="Y" (
    start "" "%TARGET_DIR%\CentralBeverageDistribution.exe"
)
