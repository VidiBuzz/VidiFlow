$body = @{
  email = 'admin@vidismart.com'
  password = 'VidiSmart2026!'
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri 'https://directus-cms-production-1bce.up.railway.app/auth/login' -Method Post -Body $body -ContentType 'application/json'
$response.data.access_token
