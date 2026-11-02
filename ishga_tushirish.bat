@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo ========================================================
echo   "Sinab ko'r" - 3 kunlik kasb qutisi (Career Box MVP)
echo ========================================================
echo.
echo Loyiha manzili: %CD%
echo.

:: 1. Loyihaning venv muhitidagi Python orqali ishga tushirish
if exist "venv\Scripts\python.exe" (
    echo [Python venv] orqali ishga tushirilmoqda...
    "venv\Scripts\python.exe" main.py
    pause
    exit /b
)

:: 2. Tizimdagi Python orqali ishga tushirish
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    echo [Python 3.12] orqali ishga tushirilmoqda...
    "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" main.py
    pause
    exit /b
)
if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    echo [Python 3.11] orqali ishga tushirilmoqda...
    "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" main.py
    pause
    exit /b
)
if exist "%LOCALAPPDATA%\Programs\Python\Python310\python.exe" (
    echo [Python 3.10] orqali ishga tushirilmoqda...
    "%LOCALAPPDATA%\Programs\Python\Python310\python.exe" main.py
    pause
    exit /b
)
if exist "%LOCALAPPDATA%\Programs\Python\Python39\python.exe" (
    echo [Python 3.9] orqali ishga tushirilmoqda...
    "%LOCALAPPDATA%\Programs\Python\Python39\python.exe" main.py
    pause
    exit /b
)

:: 3. Standart python orqali ishga tushirish
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo [Python] orqali ishga tushirilmoqda...
    python main.py
    pause
    exit /b
)

echo.
echo XATOLIK: Python topilmadi!
pause
