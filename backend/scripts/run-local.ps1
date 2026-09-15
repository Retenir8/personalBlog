param(
    [string]$JavaHome = $env:JAVA_HOME
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$localEnvPath = Join-Path $projectRoot ".env.local"

if (-not (Test-Path -LiteralPath $localEnvPath)) {
    throw "Missing .env.local. Run scripts\setup-database.ps1 first."
}

foreach ($line in Get-Content -LiteralPath $localEnvPath) {
    $trimmed = $line.Trim()
    if (-not $trimmed -or $trimmed.StartsWith("#")) { continue }
    $name, $value = $trimmed.Split("=", 2)
    [Environment]::SetEnvironmentVariable($name, $value, "Process")
}

$javaExecutable = if ($JavaHome) { Join-Path $JavaHome "bin\java.exe" } else { "" }
if (-not $javaExecutable -or -not (Test-Path -LiteralPath $javaExecutable)) {
    $bundledJdk = Get-ChildItem -Path "$env:USERPROFILE\.antigravity\extensions\redhat.java-*\jre\21*-win32-x86_64" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($bundledJdk) {
        $JavaHome = $bundledJdk.FullName
    } else {
        throw "A Java 21 JDK is required. Pass its directory with -JavaHome."
    }
}
$env:JAVA_HOME = $JavaHome

Push-Location $projectRoot
try {
    & .\mvnw.cmd spring-boot:run
} finally {
    Pop-Location
}
