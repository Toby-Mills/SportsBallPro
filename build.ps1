# Build the Angular application
ng build --configuration production

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful. Moving files from docs/browser to docs..." -ForegroundColor Green
    node move-build.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Files moved successfully!" -ForegroundColor Green
    } else {
        Write-Host "Error moving files." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}
