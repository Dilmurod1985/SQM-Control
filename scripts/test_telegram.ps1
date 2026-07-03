<#
Test Telegram notification via Edge Function (direct call).
Requires environment variables: PROJECT_REF, SERVICE_ROLE_KEY

Usage:
  $env:PROJECT_REF = '<project-ref>'
  $env:SERVICE_ROLE_KEY = '<service-role-key>'
  ./scripts/test_telegram.ps1
#>

if (-not $env:PROJECT_REF) { Write-Host 'PROJECT_REF not set' -ForegroundColor Red; exit 1 }
if (-not $env:SERVICE_ROLE_KEY) { Write-Host 'SERVICE_ROLE_KEY not set' -ForegroundColor Red; exit 1 }

$edgeUrl = "https://$($env:PROJECT_REF).functions.supabase.co/telegramNotify"

$body = @{ type='nc'; ncId='test-nc-123'; department_id=''; title='Тест NC'; message='Тестовое уведомление от dev' } | ConvertTo-Json

Write-Host "POST $edgeUrl"

$res = Invoke-RestMethod -Uri $edgeUrl -Method Post -Headers @{ Authorization = "Bearer $($env:SERVICE_ROLE_KEY)" } -Body $body -ContentType 'application/json'
Write-Host (ConvertTo-Json $res -Depth 4)
