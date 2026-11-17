param(
    [string]$IpAddress = "",
    [string]$KeyPath = ""
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Direct EC2 Deployment Tool (Zero GitHub Required)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Prompt for IP if not provided
if (-not $IpAddress -or $IpAddress.Trim() -eq "") {
    $defaultIp = "52.54.109.67"
    $inputIp = Read-Host "Enter your EC2 Public IPv4 address [Default: $defaultIp]"
    if ($inputIp -and $inputIp.Trim() -ne "") {
        $IpAddress = $inputIp.Trim()
    } else {
        $IpAddress = $defaultIp
    }
}
$IpAddress = $IpAddress.Trim().Trim('"').Trim("'")

# 2. Prompt for KeyPath if not provided
if (-not $KeyPath -or $KeyPath.Trim() -eq "") {
    $defaultKey = "C:\Users\ASUS\Downloads\visitor-key.pem"
    $inputKey = Read-Host "Enter path to your .pem key file [Default: $defaultKey]"
    if ($inputKey -and $inputKey.Trim() -ne "") {
        $KeyPath = $inputKey.Trim()
    } else {
        $KeyPath = $defaultKey
    }
}
$KeyPath = $KeyPath.Trim().Trim('"').Trim("'")

if (-not (Test-Path $KeyPath)) {
    Write-Error "Key file not found at: $KeyPath"
    exit 1
}

$bundleName = "project-bundle.tar.gz"
$workDir = $PSScriptRoot

Write-Host ""
Write-Host "[1/4] Packaging project files (excluding node_modules)..." -ForegroundColor Yellow
Set-Location $workDir

if (Test-Path $bundleName) {
    Remove-Item -Force $bundleName
}

# Create bundle using native Windows tar
tar.exe -czf $bundleName --exclude="node_modules" --exclude=".git" backend frontend deploy-ec2.sh README.md

if (-not (Test-Path $bundleName)) {
    Write-Error "Failed to create project bundle."
    exit 1
}

$bundleSize = (Get-Item $bundleName).Length / 1KB
Write-Host "Bundle created successfully: $([math]::Round($bundleSize, 1)) KB" -ForegroundColor Green

Write-Host ""
Write-Host "[2/4] Uploading project directly to EC2 via SCP..." -ForegroundColor Yellow
Write-Host "Connecting to: ubuntu@$IpAddress" -ForegroundColor Gray

scp.exe -i $KeyPath -o StrictHostKeyChecking=no $bundleName "ubuntu@${IpAddress}:~/"

if ($LASTEXITCODE -ne 0) {
    Write-Error "SCP upload failed. Please verify that your EC2 Security Group allows SSH (Port 22) and that your key is correct."
    exit 1
}
Write-Host "Upload completed successfully to EC2 server!" -ForegroundColor Green

# Remove local temporary bundle
Remove-Item -Force $bundleName

Write-Host ""
Write-Host "[3/4] Unpacking and executing automated server setup on EC2..." -ForegroundColor Yellow
Write-Host "Installing Node.js, Nginx, PM2, and building the project (takes ~1-2 minutes)..." -ForegroundColor Gray

$remoteCommand = "mkdir -p app && tar -xzf project-bundle.tar.gz -C app && cd app && chmod +x deploy-ec2.sh && ./deploy-ec2.sh"
ssh.exe -i $KeyPath -o StrictHostKeyChecking=no "ubuntu@$IpAddress" $remoteCommand

if ($LASTEXITCODE -eq 0) {
    # Attempt reverse DNS to find official amazonaws.com hostname
    $awsDns = ""
    try {
        $entry = [System.Net.Dns]::GetHostEntry($IpAddress)
        if ($entry.HostName -and $entry.HostName.EndsWith("amazonaws.com")) {
            $awsDns = $entry.HostName
        }
    } catch {}

    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " SUCCESS! Your 3D Smart Visitor Counter is now LIVE on AWS!" -ForegroundColor Green
    if ($awsDns) {
        Write-Host " Official AWS URL : http://$awsDns" -ForegroundColor Cyan
    }
    Write-Host " Public IP URL   : http://$IpAddress" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Warning "Setup finished with an exit code: $LASTEXITCODE. Please check the logs above."
}
