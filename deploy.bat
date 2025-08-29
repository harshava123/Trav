@echo off
echo 🚀 Starting deployment process for Trav Logistics Application...

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Check if node is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!

REM Check git status
echo 📋 Checking git status...
git status --porcelain >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  You have uncommitted changes. Please commit them first:
    git status
    echo.
    set /p commit_changes="Do you want to commit all changes? (y/n): "
    if /i "%commit_changes%"=="y" (
        git add .
        git commit -m "Prepare for deployment - %date% %time%"
        echo ✅ Changes committed!
    ) else (
        echo ❌ Please commit your changes before deploying.
        pause
        exit /b 1
    )
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install
cd server
npm install
cd ..

REM Build frontend
echo 🔨 Building frontend...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Frontend built successfully!
) else (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo.
echo 🎉 Deployment preparation completed!
echo.
echo 📋 Next steps:
echo 1. Set up MongoDB Atlas database
echo 2. Deploy backend to Railway:
echo    - Go to https://railway.app
echo    - Connect your GitHub repo
echo    - Set root directory to 'server/'
echo    - Add environment variables (see DEPLOYMENT.md)
echo.
echo 3. Deploy frontend to Vercel:
echo    - Go to https://vercel.com
echo    - Connect your GitHub repo
echo    - Set build command: npm run build
echo    - Set output directory: dist
echo.
echo 📚 See DEPLOYMENT.md for detailed instructions
echo.
echo 🔗 Useful links:
echo - MongoDB Atlas: https://www.mongodb.com/atlas
echo - Railway: https://railway.app
echo - Vercel: https://vercel.com
echo.
pause
