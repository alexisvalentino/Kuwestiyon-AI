# Get API key from .env.local file
$API_KEY = (Get-Content .env.local | Where-Object { $_ -match "GEMINI_API_KEY" }).Split('=')[1].Trim()

Write-Host "API Key found: $($API_KEY.Substring(0,10))..." -ForegroundColor Green

$headers = @{
    "Content-Type" = "application/json"
    "X-goog-api-key" = $API_KEY
}

$body = @{
    contents = @(
        @{
            role = "user"
            parts = @(
                @{
                    text = "Kumusta ka? Please respond in Taglish."
                }
            )
        }
    )
    generationConfig = @{
        temperature = 0.7
        topK = 40
        topP = 0.95
        maxOutputTokens = 8192
    }
} | ConvertTo-Json -Depth 10

Write-Host "Testing Gemini API..." -ForegroundColor Yellow
Write-Host "URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent" -ForegroundColor Cyan
Write-Host "Headers: $($headers | ConvertTo-Json)" -ForegroundColor Cyan
Write-Host "Body: $body" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Method Post -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent" -Headers $headers -Body $body -ErrorAction Stop
    
    Write-Host "Response received successfully!" -ForegroundColor Green
    Write-Host "Full response: $($response | ConvertTo-Json -Depth 10)" -ForegroundColor Green
    
    if ($response.candidates -and $response.candidates.Count -gt 0) {
        Write-Host "Response content:" -ForegroundColor Yellow
        Write-Host $response.candidates[0].content.parts[0].text -ForegroundColor White
    } else {
        Write-Host "No candidates in response" -ForegroundColor Red
        Write-Host "Response structure: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error calling Gemini API:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}
