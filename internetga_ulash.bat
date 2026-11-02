@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo ========================================================
echo   "Sinab ko'r" - Butun internet uchun havola yaratish
echo ========================================================
echo.
echo Eslatma: Dastur (main.py) ishga tushirilgan bo'lishi kerak!
echo.
echo Internet orqali kirish havolasi tayyorlanmoqda...
echo.

if not exist "cloudflared.exe" (
    echo Xatolik: cloudflared.exe topilmadi.
    pause
    exit /b
)

cloudflared.exe tunnel --url http://localhost:3005
pause
