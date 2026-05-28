@echo off
setlocal enabledelayedexpansion

echo ========================================
echo DOWNLOADING CARIBBEAN CONSULTANTS IMAGES
echo ========================================
echo.

REM Check for curl
where curl >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: curl is not installed or not in PATH.
    echo Please install curl to run this script.
    pause
    exit /b 1
)

REM Create directory if it doesn't exist
if not exist "assets\images" mkdir "assets\images"

echo Step 1: Downloading homepage slider images...
echo.

REM Homepage Slider Images (1920x1080 minimum)
echo Downloading L'Ermitage Beverly Hills hero...
curl -L "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop" -o "assets\images\project-1-lermitage-hero.jpg"

echo Downloading Hyatt Regency Kauai hero...
curl -L "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop" -o "assets\images\project-2-hyatt-kauai-hero.jpg"

echo Downloading St. Regis Fort Lauderdale hero...
curl -L "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop" -o "assets\images\project-3-stregis-hero.jpg"

echo Downloading Ritz-Carlton Reserve Dorado Beach hero...
curl -L "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2080&auto=format&fit=crop" -o "assets\images\project-4-dorado-hero.jpg"

echo Downloading Plaza Lotus (St. Petersburg) hero...
curl -L "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2074&auto=format&fit=crop" -o "assets\images\project-5-plaza-lotus-hero.jpg"

echo Downloading Caribbean Plantation hero...
curl -L "https://images.unsplash.com/photo-1559352193-19063c16a455?q=80&w=2070&auto=format&fit=crop" -o "assets\images\project-6-caribbean-hero.jpg"

echo.
echo Step 2: Downloading Douglas Welles portrait...
echo.

REM Douglas Welles Portrait
curl -L "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2069&auto=format&fit=crop" -o "assets\images\doug-welles-portrait-hero.jpg"
curl -L "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2069&auto=format&fit=crop" -o "assets\images\doug-welles-portrait.jpg"

echo.
echo Step 3: Downloading team/construction images...
echo.

REM Team & Construction Images
curl -L "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2069&auto=format&fit=crop" -o "assets\images\doug-on-site.jpg"
curl -L "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" -o "assets\images\team-meeting.jpg"

echo.
echo Step 4: Downloading about page images...
echo.

curl -L "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1965&auto=format&fit=crop" -o "assets\images\about-company.jpg"
curl -L "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1965&auto=format&fit=crop" -o "assets\images\about-team.jpg"

echo.
echo Step 5: Downloading services page images...
echo.

curl -L "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2069&auto=format&fit=crop" -o "assets\images\service-owners-rep.jpg"
curl -L "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" -o "assets\images\service-development.jpg"
curl -L "https://images.unsplash.com/photo-1559352193-19063c16a455?q=80&w=2070&auto=format&fit=crop" -o "assets\images\service-caribbean.jpg"

echo.
echo Step 6: Downloading video page images...
echo.

curl -L "https://images.unsplash.com/photo-157710040-0b93528c311a?q=80&w=2070&auto=format&fit=crop" -o "assets\images\video-hero-bg.jpg"
curl -L "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop" -o "assets\images\video-thumbnail.jpg"

echo.
echo Step 7: Downloading video gallery images (8 images)...
echo.

curl -L "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2069&auto=format&fit=crop" -o "assets\images\gallery-1.jpg"
curl -L "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2036&auto=format&fit=crop" -o "assets\images\gallery-3.jpg"
curl -L "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop" -o "assets\images\gallery-4.jpg"
curl -L "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop" -o "assets\images\gallery-5.jpg"
curl -L "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop" -o "assets\images\gallery-6.jpg"
curl -L "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop" -o "assets\images\gallery-7.jpg"
curl -L "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" -o "assets\images\gallery-8.jpg"

echo.
echo Step 8: Downloading contact page image...
echo.

curl -L "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" -o "assets\images\contact-hero.jpg"

echo.
echo ========================================
echo DOWNLOADING PROJECT THUMBNAILS (9 images)
echo ========================================
echo.

curl -L "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop" -o "assets\images\project-1-lermitage-thumb.jpg"
curl -L "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop" -o "assets\images\project-2-hyatt-kauai-thumb.jpg"
curl -L "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop" -o "assets\images\project-3-stregis-thumb.jpg"
curl -L "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2080&auto=format&fit=crop" -o "assets\images\project-4-dorado-thumb.jpg"
curl -L "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2074&auto=format&fit=crop" -o "assets\images\project-5-plaza-lotus-thumb.jpg"
curl -L "https://images.unsplash.com/photo-1559352193-19063c16a455?q=80&w=2070&auto=format&fit=crop" -o "assets\images\project-6-caribbean-thumb.jpg"
curl -L "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop" -o "assets\images\project-7-thumb.jpg"
curl -L "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop" -o "assets\images\project-8-thumb.jpg"
curl -L "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2069&auto=format&fit=crop" -o "assets\images\project-9-thumb.jpg"

echo.
echo Step 9: Downloading additional project thumbnails...
echo.

curl -L "https://images.unsplash.com/photo-1577007171564-1b1e1c49e8d8?q=80&w=2069&auto=format&fit=crop" -o "assets\images\project-10-thumb.jpg"
curl -L "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2074&auto=format&fit=crop" -o "assets\images\project-11-thumb.jpg"
curl -L "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?q=80&w=2070&auto=format&fit=crop" -o "assets\images\project-12-belmond-thumb.jpg"
curl -L "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop" -o "assets\images\project-13-thumb.jpg"
curl -L "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop" -o "assets\images\project-14-thumb.jpg"
curl -L "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2069&auto=format&fit=crop" -o "assets\images\project-15-thumb.jpg"

echo.
echo ========================================
echo DONE
echo ========================================
echo.
pause
