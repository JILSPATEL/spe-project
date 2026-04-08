# Cleanup Script - Remove Old Angular Files
# Run this to remove all unnecessary Angular files

Write-Host "🧹 Cleaning up old Angular files..." -ForegroundColor Cyan

# Remove Angular configuration files
Remove-Item -Path "angular.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "karma.conf.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "tsconfig.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "tsconfig.app.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "tsconfig.spec.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".browserslistrc" -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".editorconfig" -Force -ErrorAction SilentlyContinue

# Remove old package files
Remove-Item -Path "package.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue

# Remove old JSON database
Remove-Item -Path "db.json" -Force -ErrorAction SilentlyContinue

# Remove entire Angular src directory
Remove-Item -Path "src" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Remaining structure:" -ForegroundColor Yellow
Write-Host "  📁 backend/          - Node.js API server" -ForegroundColor White
Write-Host "  📁 react-ecommerce/  - React frontend" -ForegroundColor White
Write-Host "  📁 database/         - MySQL schema & seed" -ForegroundColor White
Write-Host "  📄 README.md         - Full documentation" -ForegroundColor White
Write-Host "  📄 QUICKSTART.md     - Quick setup guide" -ForegroundColor White
Write-Host ""
