@echo off
title Fortuna Mill Estate Image Downloader
echo ========================================
echo Downloading Fortuna Mill Estate Images
echo ========================================
set DOWNLOAD_DIR=%~dp0assets\fortuna-mill
mkdir 
%DOWNLOAD_DIR% 2>nul

set IMAGE_DIR=%DOWNLOAD_DIR%\spark_platform_fullres
mkdir %IMAGE_DIR% 2>nul

echo Ready to download images at: %IMAGE_DIR%
pause

