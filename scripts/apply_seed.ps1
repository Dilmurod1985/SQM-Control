<#
Apply seed to local/dev database.
Requires psql in PATH and environment variable DATABASE_URL (Postgres connection string)

Usage:
  $env:DATABASE_URL = "postgres://user:pass@host:5432/dbname"
  ./scripts/apply_seed.ps1

This script will run db/seed_full_with_replica.sql which disables FK checks for development.
Do NOT use in production.
#>

if (-not $env:DATABASE_URL) {
  Write-Host "ERROR: DATABASE_URL environment variable not set." -ForegroundColor Red
  exit 1
}

$db = $env:DATABASE_URL

Write-Host "Applying seed (dev mode) to $db"

$psql = "psql"
try {
  & $psql $db -f "db/seed_full_with_replica.sql"
  if ($LASTEXITCODE -ne 0) { throw "psql returned exit code $LASTEXITCODE" }
  Write-Host "Seed applied successfully." -ForegroundColor Green
} catch {
  Write-Host "Failed to apply seed: $_" -ForegroundColor Red
  exit 1
}
