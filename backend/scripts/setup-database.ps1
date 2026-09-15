param(
    [string]$AdminUser = "postgres",
    [string]$AdminHost = "127.0.0.1",
    [int]$AdminPort = 5432,
    [string]$MaintenanceDatabase = "postgres",
    [string]$PsqlPath = "D:\Program Files\postgresql\bin\psql.exe",
    [string]$CreatedbPath = "D:\Program Files\postgresql\bin\createdb.exe"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$schemaPath = Join-Path $projectRoot "resources\schema.sql"
$fileUploadsSchemaPath = Join-Path $projectRoot "resources\file_uploads_table.sql"
$localEnvPath = Join-Path $projectRoot ".env.local"
$databaseName = "tang_course_platform"
$applicationUser = "tang_course_app"

if (-not (Test-Path -LiteralPath $PsqlPath)) {
    throw "psql not found at $PsqlPath. Pass -PsqlPath with the installed PostgreSQL path."
}
if (-not (Test-Path -LiteralPath $CreatedbPath)) {
    throw "createdb not found at $CreatedbPath. Pass -CreatedbPath with the installed PostgreSQL path."
}

$secureAdminPassword = Read-Host "PostgreSQL administrator password for $AdminUser" -AsSecureString
$adminPassword = [System.Net.NetworkCredential]::new("", $secureAdminPassword).Password
$randomBytes = [byte[]]::new(32)
[System.Security.Cryptography.RandomNumberGenerator]::Fill($randomBytes)
$applicationPassword = [Convert]::ToBase64String($randomBytes).Replace("/", "_").Replace("+", "-").TrimEnd("=")

$previousPassword = $env:PGPASSWORD
$previousClientEncoding = $env:PGCLIENTENCODING
try {
    $env:PGPASSWORD = $adminPassword
    $env:PGCLIENTENCODING = "UTF8"

    $roleExists = (& $PsqlPath -h $AdminHost -p $AdminPort -U $AdminUser -d $MaintenanceDatabase -tAc "SELECT 1 FROM pg_roles WHERE rolname = '$applicationUser'") -join ""
    if ($LASTEXITCODE -ne 0) { throw "Unable to connect with the supplied administrator credentials." }

    $escapedPassword = $applicationPassword.Replace("'", "''")
    if ($roleExists.Trim() -eq "1") {
        & $PsqlPath -h $AdminHost -p $AdminPort -U $AdminUser -d $MaintenanceDatabase -v ON_ERROR_STOP=1 -c "ALTER ROLE $applicationUser WITH LOGIN PASSWORD '$escapedPassword' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;"
    } else {
        & $PsqlPath -h $AdminHost -p $AdminPort -U $AdminUser -d $MaintenanceDatabase -v ON_ERROR_STOP=1 -c "CREATE ROLE $applicationUser WITH LOGIN PASSWORD '$escapedPassword' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;"
    }
    if ($LASTEXITCODE -ne 0) { throw "Failed to create or update the application role." }

    $databaseExists = (& $PsqlPath -h $AdminHost -p $AdminPort -U $AdminUser -d $MaintenanceDatabase -tAc "SELECT 1 FROM pg_database WHERE datname = '$databaseName'") -join ""
    if ($databaseExists.Trim() -ne "1") {
        & $CreatedbPath -h $AdminHost -p $AdminPort -U $AdminUser -O $applicationUser $databaseName
        if ($LASTEXITCODE -ne 0) { throw "Failed to create the project database." }
    } else {
        & $PsqlPath -h $AdminHost -p $AdminPort -U $AdminUser -d $MaintenanceDatabase -v ON_ERROR_STOP=1 -c "ALTER DATABASE $databaseName OWNER TO $applicationUser;"
        if ($LASTEXITCODE -ne 0) { throw "Failed to set the project database owner." }
    }

    $env:PGPASSWORD = $applicationPassword
    & $PsqlPath -h $AdminHost -p $AdminPort -U $applicationUser -d $databaseName -v ON_ERROR_STOP=1 -f $schemaPath
    if ($LASTEXITCODE -ne 0) { throw "Failed to initialize the project schema." }
    & $PsqlPath -h $AdminHost -p $AdminPort -U $applicationUser -d $databaseName -v ON_ERROR_STOP=1 -f $fileUploadsSchemaPath
    if ($LASTEXITCODE -ne 0) { throw "Failed to initialize the file upload schema." }

    $environmentLines = @(
        "DB_URL=jdbc:postgresql://${AdminHost}:${AdminPort}/${databaseName}?stringtype=unspecified"
        "DB_USERNAME=$applicationUser"
        "DB_PASSWORD=$applicationPassword"
        "SERVER_PORT=3001"
        "JWT_SECRET_KEY=development-access-secret-change-before-production"
        "JWT_REFRESH_SECRET_KEY=development-refresh-secret-change-before-production"
        "R2_ACCESS_KEY=development-access-key"
        "R2_SECRET_KEY=development-secret-key"
        "R2_BUCKET_NAME=course-pics"
        "R2_ENDPOINT=http://localhost:9000"
        "R2_REGION=auto"
        "R2_PUBLIC_URL=http://localhost:9000/course-pics"
    )
    [System.IO.File]::WriteAllLines($localEnvPath, $environmentLines, [System.Text.UTF8Encoding]::new($false))

    Write-Host "Database '$databaseName' and role '$applicationUser' are ready."
    Write-Host "Local credentials were written to $localEnvPath (ignored by Git)."
} finally {
    $env:PGPASSWORD = $previousPassword
    $env:PGCLIENTENCODING = $previousClientEncoding
    $adminPassword = $null
}
