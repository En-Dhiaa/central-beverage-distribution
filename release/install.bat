@echo off
chcp 65001 >nul
echo ===================================================================
echo     نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية v1.1.0
echo     معالج التثبيت السريع للويندوز (Automated Windows Setup)
echo ===================================================================
echo.

set "TARGET_DIR=%LOCALAPPDATA%\CentralBeverageDistribution"
echo [1/4] تحديد مسار التثبيت: %TARGET_DIR%
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
if not exist "%TARGET_DIR%\storage" mkdir "%TARGET_DIR%\storage"
if not exist "%TARGET_DIR%\storage\invoices" mkdir "%TARGET_DIR%\storage\invoices"
if not exist "%TARGET_DIR%\storage\reports" mkdir "%TARGET_DIR%\storage\reports"
if not exist "%TARGET_DIR%\storage\attachments" mkdir "%TARGET_DIR%\storage\attachments"

echo.
echo [2/4] جاري نسخ ملفات النظام والتطبيق المكتبي...
xcopy /E /I /Y /Q "%~dp0payload\*" "%TARGET_DIR%\" >nul

echo.
echo [3/4] إنشاء اختصار على سطح المكتب...
powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([System.IO.Path]::Combine([System.Environment]::GetFolderPath('Desktop'), 'نظام ثلاجة المياه المركزية.lnk')); $s.TargetPath = [System.IO.Path]::Combine($env:LOCALAPPDATA, 'CentralBeverageDistribution', 'CentralBeverageDistribution.exe'); $s.WorkingDirectory = [System.IO.Path]::Combine($env:LOCALAPPDATA, 'CentralBeverageDistribution'); $s.Description = 'نظام إدارة ثلاجة المياه المركزية'; $s.Save()"

echo.
echo [4/4] إنشاء دليل التشغيل السريع...
(
echo =====================================================
echo نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية v1.1.0
echo =====================================================
echo.
echo بيانات تسجيل الدخول الافتراضية:
echo اسم المستخدم: admin
echo كلمة المرور: Admin@123456
echo.
echo لتشغيل النظام: انقر نقرًا مزدوجًا على CentralBeverageDistribution.exe
echo أو من خلال اختصار سطح المكتب.
) > "%TARGET_DIR%\START_GUIDE.txt"

echo.
echo ===================================================================
echo     تهانينا! اكتمل تثبيت النظام بنجاح وجاهز للتشغيل الفعلي.
echo ===================================================================
echo.
echo بيانات الدخول: admin / Admin@123456
echo.
set /p LAUNCH="هل تريد تشغيل النظام الآن؟ (Y/N): "
if /i "%LAUNCH%"=="Y" (
    start "" "%TARGET_DIR%\CentralBeverageDistribution.exe"
)
pause

