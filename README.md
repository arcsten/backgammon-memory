# Backgammon Memory - Board Position Analysis

A React Native app that uses computer vision to analyze backgammon board positions and provide winning chances and best moves.

## 🎯 Features

- **Real-time Board Detection**: Uses camera with OpenCV to detect backgammon boards
- **Position Analysis**: Calculates winning chances, gammon/backgammon probabilities
- **Move Suggestions**: Provides best moves ranked by evaluation
- **Position History**: Save and browse analyzed positions
- **Dark Theme**: Professional, camera-friendly interface

## 🚀 Tech Stack

- **Frontend**: React Native with Expo
- **Computer Vision**: OpenCV (react-native-opencv-tutorial)
- **Camera**: react-native-vision-camera
- **State Management**: Zustand
- **Navigation**: React Navigation v6
- **Animations**: React Native Reanimated
 

## 📱 Screens

1. **Camera Screen** - Primary capture interface with real-time board detection
2. **Analysis Screen** - Detailed position analysis with visual board diagram
3. **History Screen** - Browse past positions with search and filtering
4. **Settings Screen** - App preferences and configuration

## 🛠 Installation

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator / Android Emulator

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backgammon-memory
   ```

2. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## 🏗 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Generic UI components (Button, etc.)
│   ├── camera/        # Camera-specific components
│   ├── board/         # Board visualization components
│   ├── analysis/      # Analysis display components
│   └── history/       # History-related components
├── screens/           # Screen components
├── navigation/        # Navigation configuration
├── store/            # State management (Zustand)
├── utils/            # Utilities (theme, OpenCV, etc.)
├── types/            # TypeScript type definitions
└── hooks/            # Custom React hooks
```

## 🎨 Design System

### Colors
- **Primary**: Deep Blue (#1a365d)
- **Secondary**: Warm Gold (#d69e2e)
- **Background**: Dark Gray (#1a202c)
- **Surface**: Medium Gray (#2d3748)
- **Text**: Light Gray (#e2e8f0)
- **Accent**: Green (#38a169)

### Typography
- **Headers**: Inter Bold
- **Body**: Inter Regular
- **Monospace**: Fira Code (for Position IDs)

## 📊 OpenCV Pipeline

The computer vision pipeline processes board images through these steps:

1. **Image Preprocessing**
   - Gaussian blur to reduce noise
   - Edge detection (Canny) to find board outline
   - Perspective correction to straighten board

2. **Board Detection**
   - Contour detection to find rectangular board
   - Corner detection to identify 4 board corners
   - Homography transform to normalize perspective

3. **Point Segmentation**
   - Template matching to locate 24 triangular points
   - Grid mapping to create coordinate system
   - ROI extraction for each point area

4. **Piece Recognition**
   - HSV color space conversion for better color separation
   - Color thresholding to separate white/red pieces
   - Circle detection (HoughCircles) to count round pieces
   - Contour analysis to verify piece shapes

5. **Position Extraction**
   - Geometric mapping of pieces to board positions
   - Validation against legal backgammon rules
   - Position ID generation in standard format

## 🔧 Configuration

### Camera Settings
- Flash enabled/disabled
- Auto-capture when board detected
- Image quality settings

### Analysis Settings
- Confidence thresholds
- Color calibration
- Board detection sensitivity

### App Settings
- Sound effects
- Haptic feedback
- Dark/light theme

## 🚀 Future Enhancements

- [ ] GNU Backgammon integration for professional analysis
- [ ] Cloud sync for position history
- [ ] Social features (share positions)
- [ ] Advanced filtering and search
- [ ] Export to common backgammon formats
- [ ] Machine learning model training
- [ ] Offline analysis capabilities

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines and submit pull requests for any improvements.

## 📞 Support

For support, email support@backgammonmemory.com or create an issue in the GitHub repository.