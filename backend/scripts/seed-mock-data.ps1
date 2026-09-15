param(
    [string]$ApiBaseUrl = "http://localhost:3001/api",
    [string]$PsqlPath = "D:\Program Files\postgresql\bin\psql.exe"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$localEnvPath = Join-Path $projectRoot ".env.local"
$seedPath = Join-Path $projectRoot "resources\seed_mock_data.sql"
$demoPassword = "Demo@123456"
$demoUsers = @("demo_zhang", "demo_li", "demo_wang", "demo_zhao", "demo_chen", "demo_liu", "demo_teacher", "demo_caregiver")

foreach ($username in $demoUsers) {
    $body = @{ username = $username; password = $demoPassword } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "$ApiBaseUrl/register" -Method Post -ContentType "application/json" -Body $body | Out-Null
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -ne 409) { throw }
    }
}

$settings = @{}
Get-Content -LiteralPath $localEnvPath | ForEach-Object {
    if ($_ -and -not $_.StartsWith("#")) {
        $name, $value = $_.Split("=", 2)
        $settings[$name] = $value
    }
}

$previousPassword = $env:PGPASSWORD
$previousClientEncoding = $env:PGCLIENTENCODING
try {
    $env:PGPASSWORD = $settings["DB_PASSWORD"]
    $env:PGCLIENTENCODING = "UTF8"
    & $PsqlPath -h 127.0.0.1 -p 5432 -U $settings["DB_USERNAME"] -d tang_course_platform -v ON_ERROR_STOP=1 -f $seedPath
    if ($LASTEXITCODE -ne 0) { throw "Failed to seed mock data." }
} finally {
    $env:PGPASSWORD = $previousPassword
    $env:PGCLIENTENCODING = $previousClientEncoding
}

Write-Host "Mock data is ready: 6 elders, 1 teacher, 1 caregiver, 10 courses, care records, and activities."
Write-Host "Demo account pattern: demo_zhang / $demoPassword"
