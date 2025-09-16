@echo off
echo 🚀 EvolvNFT Deployment Script
echo ==============================

REM Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed
    exit /b 1
)

echo ✅ Prerequisites met

REM Frontend deployment
echo.
echo 🌐 Preparing Frontend for Deployment...
cd living-art-forge

echo 📦 Installing frontend dependencies...
call npm install

echo 🔨 Building frontend...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Frontend build successful!
) else (
    echo ❌ Frontend build failed!
    exit /b 1
)

cd ..

REM Oracle service preparation
echo.
echo ⚡ Preparing Oracle Service...

echo 📦 Installing oracle dependencies...
call npm install

echo 🔨 Compiling smart contracts...
call npx hardhat compile

if %ERRORLEVEL% EQU 0 (
    echo ✅ Oracle service prepared!
) else (
    echo ❌ Oracle compilation failed!
    exit /b 1
)

REM Relayer service preparation
echo.
echo 🔧 Preparing Relayer Service...
cd evolvnft-relayer

echo 📦 Installing relayer dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo ✅ Relayer service prepared!
) else (
    echo ❌ Relayer preparation failed!
    exit /b 1
)

cd ..

echo.
echo 🎉 All services prepared for deployment!
echo.
echo 📝 Next Steps:
echo 1. Deploy Frontend to Vercel: cd living-art-forge ^&^& vercel --prod
echo 2. Deploy Oracle to Railway: railway up
echo 3. Deploy Relayer to Render: Connect GitHub repo to Render
echo.
echo 📚 See DEPLOYMENT.md for detailed instructions
