# ========================================================================
# Central Beverage Distribution - Automated Distribution & Packaging Script
# ========================================================================
param (
    [switch]$SkipFrontend = $false
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "    نظام إدارة وتشغيل ثلاجة المياه والعصائر المركزية" -ForegroundColor Yellow
Write-Host "    أداة البناء والحزم والنشر التلقائي (Automated Release Packager)" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Build Frontend
if (-not $SkipFrontend) {
    Write-Host "`n[1/5] بناء حزمة الواجهة الأمامية React + TypeScript..." -ForegroundColor Green
    Push-Location "$root\frontend"
    cmd.exe /c "npm run build"
    if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }
    Pop-Location

    Write-Host "`n[2/5] نسخ مخرجات الواجهة إلى Beverage.Api/wwwroot..." -ForegroundColor Green
    $wwwroot = "$root\backend\src\Beverage.Api\wwwroot"
    if (!(Test-Path $wwwroot)) { New-Item -ItemType Directory -Path $wwwroot -Force | Out-Null }
    Copy-Item -Path "$root\frontend\dist\*" -Destination $wwwroot -Recurse -Force
}

# 2. Publish Desktop Host Self-Contained
Write-Host "`n[3/5] نشر التطبيق المكتبي الذاتي CentralBeverageDistribution.exe..." -ForegroundColor Green
$payloadDir = "$root\release\payload"
if (Test-Path $payloadDir) { Remove-Item -Recurse -Force $payloadDir }
New-Item -ItemType Directory -Path $payloadDir -Force | Out-Null

$env:PATH = "C:\Users\USER\.dotnet;" + $env:PATH
dotnet publish "$root\desktop\src\Beverage.Desktop\Beverage.Desktop.csproj" -c Release -r win-x64 --self-contained true -o $payloadDir
if ($LASTEXITCODE -ne 0) { throw "Desktop publish failed" }

# Copy wwwroot and icons into payload
$payloadWwwroot = "$payloadDir\wwwroot"
New-Item -ItemType Directory -Path $payloadWwwroot -Force | Out-Null
Copy-Item -Path "$root\backend\src\Beverage.Api\wwwroot\*" -Destination $payloadWwwroot -Recurse -Force
Copy-Item -Path "$root\desktop\src\Beverage.Desktop\app.ico" -Destination $payloadDir -Force
Copy-Item -Path "$root\desktop\src\Beverage.Desktop\app.png" -Destination $payloadDir -Force

# 3. Create Payload.zip for the Installer
Write-Host "`n[4/5] ضغط الحزمة المدمجة لتجهيز مثبت الويندوز..." -ForegroundColor Green
$installerZip = "$root\desktop\installer\Beverage.Installer\Payload.zip"
Compress-Archive -Path "$payloadDir\*" -DestinationPath $installerZip -Force

# 4. Build Setup Executable
Write-Host "`n[5/5] تجميع وبناء ملف التثبيت المستقل CentralBeverageDistribution-Setup.exe..." -ForegroundColor Green
$installerOut = "$root\release\installer_out"
dotnet publish "$root\desktop\installer\Beverage.Installer\Beverage.Installer.csproj" -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o $installerOut
if ($LASTEXITCODE -ne 0) { throw "Installer build failed" }

Copy-Item -Path "$installerOut\CentralBeverageDistribution-Setup.exe" -Destination "$root\release\CentralBeverageDistribution-Setup.exe" -Force

Write-Host "`n=================================================================" -ForegroundColor Green
Write-Host "    تم بناء الحزمة وتجهيز نسخة التثبيت بنجاح تام!" -ForegroundColor Yellow
Write-Host "    مسار ملف التثبيت: $root\release\CentralBeverageDistribution-Setup.exe" -ForegroundColor Cyan
Write-Host "    مسار الحزمة المحمولة: $root\release\payload\" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Green
