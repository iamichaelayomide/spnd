param(
  [string]$Url = "http://127.0.0.1:3845/mcp",
  [int]$TimeoutSeconds = 20,
  [int]$IntervalSeconds = 2
)

$deadline = (Get-Date).AddSeconds($TimeoutSeconds)

Write-Host "Checking Figma MCP at $Url"

while ((Get-Date) -lt $deadline) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -Method Head -TimeoutSec 3
    Write-Host "Figma MCP is reachable. HTTP $($response.StatusCode)"
    exit 0
  } catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      Write-Host "Figma MCP is reachable. HTTP $([int]$_.Exception.Response.StatusCode)"
      exit 0
    }

    $message = $_.Exception.Message
    Write-Host "Waiting for Figma MCP... $message"
    Start-Sleep -Seconds $IntervalSeconds
  }
}

Write-Host "Figma MCP did not become reachable within $TimeoutSeconds seconds."
exit 1
