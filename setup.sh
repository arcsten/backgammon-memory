#!/bin/bash

# Backgammon Memory - Setup Script
# This script sets up the development environment for the React Native app

set -e

echo "🎯 Setting up Backgammon Memory..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 18+ first."
    exit 1
fi

# No Python/Poetry required

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install Expo CLI if not present
if ! command -v expo &> /dev/null; then
    echo "📱 Installing Expo CLI..."
    npm install -g @expo/cli
fi

# Create assets directory with placeholder files
echo "🎨 Creating asset placeholders..."
mkdir -p assets

# Create simple icon placeholder (base64 encoded 1x1 transparent PNG)
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" | base64 -d > assets/icon.png
cp assets/icon.png assets/splash.png
cp assets/icon.png assets/adaptive-icon.png
cp assets/icon.png assets/favicon.png

echo "✅ Setup complete!"
echo ""
echo "🚀 To start developing:"
echo "   npm start          # Start Expo development server"
echo "   npm run ios        # Run on iOS simulator"
echo "   npm run android    # Run on Android emulator"
echo ""
echo "📱 Make sure to have iOS Simulator or Android Emulator running!"
echo ""
echo "🎯 Features implemented:"
echo "   ✅ Camera screen with real-time board detection"
echo "   ✅ Analysis screen with winning chances and best moves"
echo "   ✅ History screen with position management"
echo "   ✅ Settings screen with app preferences"
echo "   ✅ Dark theme design system"
echo "   ✅ OpenCV processing pipeline (placeholder)"
echo "   ✅ State management with Zustand"
echo "   ✅ Navigation with React Navigation"
echo ""
echo "⚠️  Note: OpenCV integration requires platform-specific setup."
echo "   Refer to react-native-opencv-tutorial documentation for details."
