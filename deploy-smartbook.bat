@echo off
echo =======================================
echo VidiSmart Smart Book Deployment
echo =======================================
echo.

cd /d M:\code\vidismart

echo Step 1: Committing changes to git...
git add .gitignore upload-smartbook.js deploy-smartbook.bat smart-book/
git commit -m "Update smart-book files and fix deployment scripts"
echo.

echo Step 2: Pushing to GitHub...
git push origin fresh-start
echo.

echo Step 3: Uploading to SiteGround via SFTP...
node upload-smartbook.js
echo.

echo =======================================
echo Deployment Complete!
echo =======================================
echo Git: https://github.com/VidiBuzz/VidiFlow
echo Site: https://vidismart.com/smart-book/index.html
echo.
pause
