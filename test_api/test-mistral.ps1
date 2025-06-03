# Get API key from .env file
$API_KEY = (Get-Content .env | Where-Object { $_ -match "MISTRAL_API_KEY" }).Split('=')[1].Trim()

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $API_KEY"
}

$body = @{
    model = "mistral-tiny"
    messages = @(
        @{
            role = "system"
            content = "You are a helpful assistant that speaks in Taglish."
        }
        @{
            role = "user"
            content = "Kumusta ka?"
        }
    )
} | ConvertTo-Json

Write-Host "Testing Mistral API..."
$response = Invoke-RestMethod -Method Post -Uri "https://api.mistral.ai/v1/chat/completions" -Headers $headers -Body $body
Write-Host "Response content:"
Write-Host $response.choices[0].message.content

