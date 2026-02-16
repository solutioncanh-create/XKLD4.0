@echo off
echo ==========================================
echo       DEPLOYMENT SCRIPT - QUAN LY XKLD
echo ==========================================

echo [1/2] BUILD PRODUCTION...
call npm run build
if %errorlevel% neq 0 (
    echo Build that bai!
    pause
    exit /b %errorlevel%
)

echo [2/2] DEPLOY TO VERCEL...
call npx vercel --prod --yes
if %errorlevel% neq 0 (
    echo Deploy that bai hoac bi huy!
) else (
    echo Deploy thanh cong!
)
