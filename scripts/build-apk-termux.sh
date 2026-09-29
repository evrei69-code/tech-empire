#!/data/data/com.termux/files/usr/bin/bash
set -e

echo '=== TECH EMPIRE Android build ==='

echo '1/4 Installing Java, Node.js and Android tools (if missing)...'
pkg update -y
pkg install -y nodejs-lts openjdk-17 wget unzip

echo '2/4 Installing project dependencies...'
npm install
npm install @capacitor/core@7 @capacitor/cli@7 @capacitor/android@7

echo '3/4 Building web app and Android project...'
npm run build
if [ ! -d android ]; then
  npx cap add android
fi
npx cap sync android

echo '4/4 Building APK...'
cd android
chmod +x gradlew
./gradlew assembleDebug

echo ''
echo 'APK created:'
echo "$PWD/app/build/outputs/apk/debug/app-debug.apk"
