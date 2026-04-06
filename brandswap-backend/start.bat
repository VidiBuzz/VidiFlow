@echo off
echo ===================================
echo BrandSwap Local Server Startup
echo ===================================
echo.

REM Start Python Backend
echo Starting Python Backend...
start "BrandSwap Backend" cmd /k python server.py

REM Wait for backend to start
timeout /t 5 /nobreak > nul

REM Start Cloudflare Tunnel
echo Starting Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /k cloudflared tunnel --url http://localhost:8080

echo.
echo ===================================
echo IMPORTANT:
echo.
echo 1. Copy the tunnel URL from the Cloudflare window
echo    (looks like: https://something-random.trycloudflare.com)
echo.
echo 2. Update .env.production with the new URL:
echo    NEXT_PUBLIC_BRANDSWAP_API=https://your-new-url.trycloudflare.com
echo.
echo 3. Deploy frontend to Vercel:
echo    cd vidiflow/frontend
echo    vercel --prod
echo.
echo ===================================
pause
