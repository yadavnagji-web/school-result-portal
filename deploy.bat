@echo off
chcp 65001 >nul
title School Result Portal - GitHub & Vercel Deployer
color 0b
cls
echo ======================================================================
echo    School Result Portal - 1-Click GitHub & Vercel Deployment Helper
echo ======================================================================
echo.
echo Is portal ki sabhi files commit ki ja chuki hain.
echo.
echo Kya aapne GitHub par empty repo bana li hai?
set /p OPEN_BROWSER="Nayi repo banane ke liye GitHub kholna hai? (Y/N, default Y): "
if /i "%OPEN_BROWSER%"=="" set OPEN_BROWSER=Y
if /i "%OPEN_BROWSER%"=="Y" (
    echo Browser me GitHub khul raha hai...
    start https://github.com/new
    echo Wahan sirf Repo ka naam likh kar 'Create repository' par click karein.
    echo.
)

echo.
set /p REPO_URL="Apne GitHub Repo ka URL (e.g. https://github.com/user/repo.git) paste karein: "

if "%REPO_URL%"=="" (
    echo.
    echo [ERROR] URL khali chhod diya gaya. Kripya dobara run karein.
    pause
    exit /b
)

echo.
echo [1/3] Git branch 'main' set ki ja rahi hai...
git branch -M main

echo [2/3] Remote origin configure kiya ja raha hai...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo [3/3] Code GitHub par push kiya ja raha hai...
echo (Agar browser window khule, to 'Authorize Git Credential Manager' par click karein)
echo.
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo    [SUCCESS] Code successfully GitHub par upload ho gaya hai!
    echo ======================================================================
    echo.
    echo Ab Vercel khola ja raha hai... Vercel par 'Import' aur 'Deploy' karein.
    timeout /t 3 >nul
    start https://vercel.com/new
) else (
    echo.
    echo ======================================================================
    echo    [NOTICE] Push poora karne ke liye GitHub login ki aavashyakta hai.
    echo ======================================================================
)

echo.
pause
