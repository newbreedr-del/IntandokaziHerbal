@echo off
echo ========================================
echo Cleaning up and pushing to new repository
echo ========================================
echo.

REM Delete Stitch payment folders
echo [1/8] Deleting Stitch payment folders...
if exist "src\app\api\payments\stitch" rmdir /s /q "src\app\api\payments\stitch"
if exist "src\app\api\payments\stitch-express" rmdir /s /q "src\app\api\payments\stitch-express"
if exist "src\app\api\payments\stitch-mock" rmdir /s /q "src\app\api\payments\stitch-mock"

REM Delete Stitch library files
echo [2/8] Deleting Stitch library files...
if exist "src\lib\stitch-express.ts" del /f /q "src\lib\stitch-express.ts"
if exist "src\hooks\useStitchPayment.ts" del /f /q "src\hooks\useStitchPayment.ts"

REM Delete old documentation files
echo [3/8] Deleting old documentation...
if exist "INTEGRATION_GUIDE.md" del /f /q "INTEGRATION_GUIDE.md"
if exist "DEPLOYMENT_READY.md" del /f /q "DEPLOYMENT_READY.md"
if exist "copy-images.ps1" del /f /q "copy-images.ps1"
if exist "DEPLOYMENT_SUMMARY.md" del /f /q "DEPLOYMENT_SUMMARY.md"
if exist ".env.local.new" del /f /q ".env.local.new"

REM Delete debug API
echo [4/8] Deleting debug endpoints...
if exist "src\app\api\debug" rmdir /s /q "src\app\api\debug"

REM Delete favicon routes
echo [5/8] Deleting favicon routes...
if exist "src\app\favicon.ico" rmdir /s /q "src\app\favicon.ico"

REM Delete old batch files
echo [6/8] Cleaning up batch files...
if exist "push-to-git.bat" del /f /q "push-to-git.bat"

REM Change Git remote to new repository
echo [7/8] Changing Git remote to new repository...
git remote remove origin 2>nul
git remote add origin https://github.com/newbreedr-del/IntandokaziHerbal.git

REM Stage, commit and push
echo [8/8] Pushing to new repository...
git add -A
git commit -m "feat: Clean PayFast-only setup for Hostinger deployment"
git push -u origin main --force

echo.
echo ========================================
echo SUCCESS! Clean setup pushed to new repo
echo ========================================
echo Repository: https://github.com/newbreedr-del/IntandokaziHerbal.git
echo.
echo Next steps:
echo 1. Deploy on Hostinger
echo 2. Set PayFast webhook in PayFast dashboard
echo 3. Test payment flow
echo.
pause
