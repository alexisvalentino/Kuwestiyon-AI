# Test script for DuckDuckGo API via RapidAPI

# Get API credentials from .env file
$envContent = Get-Content .env
$RAPIDAPI_HOST = ($envContent | Where-Object { $_ -match "RAPIDAPI_HOST" }).Split('=')[1].Trim()
$RAPIDAPI_KEY = ($envContent | Where-Object { $_ -match "RAPIDAPI_KEY" }).Split('=')[1].Trim()

# Default search query
$searchQuery = "Kuwestiyon AI"

# Allow command line argument to override the default search query
if ($args.Count -gt 0) {
    $searchQuery = $args[0]
}

Write-Host "Testing DuckDuckGo API via RapidAPI..."
Write-Host "Search query: $searchQuery"
Write-Host "API Host: $RAPIDAPI_HOST"
Write-Host "Using API Key: $($RAPIDAPI_KEY.Substring(0, 5))..." -NoNewline
Write-Host "$('*' * ($RAPIDAPI_KEY.Length - 5))"

# Construct the request URL with the search query
$encodedQuery = [System.Web.HttpUtility]::UrlEncode($searchQuery)
$url = "https://$RAPIDAPI_HOST/?q=$encodedQuery"

# Set up the headers for the API request
$headers = @{
    "x-rapidapi-host" = $RAPIDAPI_HOST
    "x-rapidapi-key" = $RAPIDAPI_KEY
}

try {
    # Make the API request
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method GET

    # Display the response in a readable format
    Write-Host "`nAPI Response Summary:" -ForegroundColor Green
    
    # Display organic results
    if ($response.organic_results -and $response.organic_results.Count -gt 0) {
        Write-Host "`nOrganic Results:" -ForegroundColor Cyan
        foreach ($result in $response.organic_results) {
            Write-Host "  Title: $($result.title)" -ForegroundColor Yellow
            Write-Host "  URL: $($result.url)"
            Write-Host "  Description: $($result.description)"
            Write-Host "  ----------------------"
        }
        Write-Host "Total organic results: $($response.organic_results.Count)"
    } else {
        Write-Host "`nNo organic results found." -ForegroundColor Yellow
    }
    
    # Display knowledge graph if available
    if ($response.knowledge_graph) {
        Write-Host "`nKnowledge Graph:" -ForegroundColor Cyan
        Write-Host "  Title: $($response.knowledge_graph.title)" -ForegroundColor Yellow
        Write-Host "  Type: $($response.knowledge_graph.type)"
        Write-Host "  Description: $($response.knowledge_graph.description)"
        
        if ($response.knowledge_graph.attributes) {
            Write-Host "  Attributes:"
            foreach ($attr in $response.knowledge_graph.attributes.PSObject.Properties) {
                Write-Host "    $($attr.Name): $($attr.Value)"
            }
        }
    }
    
    # Display related searches if available
    if ($response.related_searches -and $response.related_searches.Count -gt 0) {
        Write-Host "`nRelated Searches:" -ForegroundColor Cyan
        foreach ($related in $response.related_searches) {
            Write-Host "  • $($related.query)"
        }
    }
    
    # Display any additional information
    Write-Host "`nSearch Metadata:" -ForegroundColor Cyan
    Write-Host "  Query: $($response.search_parameters.q)"
    if ($response.search_information) {
        Write-Host "  Total results: $($response.search_information.total_results)"
        Write-Host "  Time taken: $($response.search_information.time_taken_displayed) seconds"
    }
    
    Write-Host "`nTest completed successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "`nError testing DuckDuckGo API:" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "StatusDescription: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        try {
            $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "Error details: $($errorResponse.message)" -ForegroundColor Red
        } catch {
            Write-Host "Error details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "Exception: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`nTroubleshooting tips:" -ForegroundColor Yellow
    Write-Host "1. Verify your RapidAPI key is correct and active"
    Write-Host "2. Check that you're subscribed to the DuckDuckGo API on RapidAPI"
    Write-Host "3. Ensure your API plan has sufficient credits/requests available"
    Write-Host "4. Try a different search query"
}

