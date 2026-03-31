@echo off
echo Pushing PayFast integration to Git...
echo.

git add .
git commit -m "feat: Replace Stitch with PayFast payment gateway - Complete integration with PayFast (Merchant ID: 34249465) - Remove all Stitch payment code - Add PayFast library, API routes, and webhook handler - Update checkout to use PayFast - Configure environment variables for production - Add Hostinger deployment guides"
git push

echo.
echo Done! Changes pushed to GitHub.
pause
