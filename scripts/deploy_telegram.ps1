<#
PowerShell wrapper для деплоя Edge Function telegramNotify и установки секретов.
Требует Supabase CLI в PATH и переменных окружения PROJECT_REF и TELEGRAM_BOT_TOKEN и SUPABASE_SERVICE_ROLE_KEY.

Usage:
  $env:PROJECT_REF = '<project-ref>'
  $env:TELEGRAM_BOT_TOKEN = '<bot-token>'
  $env:SUPABASE_SERVICE_ROLE_KEY = '<service-role-key>'
  ./scripts/deploy_telegram.ps1
#>

if (-not $env:PROJECT_REF) { Write-Host 'PROJECT_REF not set' -ForegroundColor Red; exit 1 }
if (-not $env:TELEGRAM_BOT_TOKEN) { Write-Host 'TELEGRAM_BOT_TOKEN not set' -ForegroundColor Red; exit 1 }
if (-not $env:SUPABASE_SERVICE_ROLE_KEY) { Write-Host 'SUPABASE_SERVICE_ROLE_KEY not set' -ForegroundColor Red; exit 1 }

$proj = $env:PROJECT_REF

Write-Host "Setting secrets for project $proj"
supabase secrets set TELEGRAM_BOT_TOKEN="$env:TELEGRAM_BOT_TOKEN" SUPABASE_SERVICE_ROLE_KEY="$env:SUPABASE_SERVICE_ROLE_KEY" --project-ref $proj

Write-Host "Deploying function telegramNotify"
supabase functions deploy telegramNotify --project-ref $proj

Write-Host "Done. Check logs with: supabase functions logs telegramNotify --project-ref $proj"
