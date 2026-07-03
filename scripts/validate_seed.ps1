<#
Validate seed data by running simple queries and printing counts.
Requires psql in PATH and DATABASE_URL env var.

Usage:
  $env:DATABASE_URL = "postgres://user:pass@host:5432/dbname"
  ./scripts/validate_seed.ps1
#>

if (-not $env:DATABASE_URL) {
  Write-Host "ERROR: DATABASE_URL environment variable not set." -ForegroundColor Red
  exit 1
}

$db = $env:DATABASE_URL

function RunQuery($q) {
  Write-Host "\n$q" -ForegroundColor Cyan
  & psql $db -c $q
}

RunQuery "SELECT count(*) FROM departments;"
RunQuery "SELECT count(*) FROM workshops;"
RunQuery "SELECT count(*) FROM audit_templates;"
RunQuery "SELECT count(*) FROM profiles;"
RunQuery "SELECT id, full_name, role FROM profiles LIMIT 10;"
RunQuery "SELECT count(*) FROM ccp_monitoring;"
RunQuery "SELECT id, title, severity, status FROM non_conformities LIMIT 10;"
RunQuery "SELECT count(*) FROM user_telegram;"

Write-Host "\nValidation complete." -ForegroundColor Green
