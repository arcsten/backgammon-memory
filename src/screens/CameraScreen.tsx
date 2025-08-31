import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
  useCameraPermission,
} from 'react-native-vision-camera';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, spacing, typography } from '@/utils/theme';
import { useAppStore } from '@/store/useAppStore';
import Button from '@/components/ui/Button';
import BoardOverlay from '@/components/camera/BoardOverlay';
import CaptureButton from '@/components/camera/CaptureButton';

const { width, height } = Dimensions.get('window');

const CameraScreen: React.FC = () => {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');

  const { hasPermission, requestPermission } = useCameraPermission();
  const [isActive, setIsActive] = useState(true);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [boardDetected, setBoardDetected] = useState(false);

  const {
    settings,
    isProcessingImage,
    setProcessingImage,
    setCurrentPosition,
    addToHistory,
  } = useAppStore();

  // Animation values
  const pulseAnimation = useSharedValue(1);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    // Start pulse animation
    pulseAnimation.value = withRepeat(
      withTiming(1.1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    // Update flash from settings
    setFlashEnabled(settings.flashEnabled);
  }, [settings.flashEnabled]);

  // Temporarily disable frame processor to avoid worklets-core error
  // const frameProcessor = useFrameProcessor((frame) => {
  //   'worklet';
  // }, []);

  const capturePhoto = useCallback(async () => {
    if (!camera.current || isProcessingImage) return;

    try {
      setProcessingImage(true);
      
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const photo = await camera.current.takePhoto({
        quality: 85,
        enableAutoRedEyeReduction: true,
        enableAutoStabilization: true,
        flash: flashEnabled ? 'on' : 'off',
      });

      // TODO: Process the photo with OpenCV pipeline
      // For now, simulate processing
      setTimeout(() => {
        // Simulate successful analysis
        const mockPosition = {
          id: Date.now().toString(),
          points: [], // TODO: Implement actual position parsing
          bar: { white: 0, red: 0 },
          bearOff: { white: 0, red: 0 },
          toMove: 'white' as const,
          timestamp: new Date(),
        };

        setCurrentPosition(mockPosition);
        addToHistory(mockPosition);
        setProcessingImage(false);

        // Navigate to analysis screen would happen here
        Alert.alert('Success', 'Board position captured and analyzed!');
      }, 2000);

    } catch (error) {
      console.error('Failed to capture photo:', error);
      setProcessingImage(false);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  }, [isProcessingImage, settings, flashEnabled]);

  const toggleFlash = useCallback(() => {
    setFlashEnabled(!flashEnabled);
  }, [flashEnabled]);

  const captureButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to analyze backgammon board positions.
          </Text>
          <Button
            title="Grant Permission"
            onPress={async () => {
              await requestPermission();
            }}
            style={styles.permissionButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission && !device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Initializing camera…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={isActive}
        photo={true}
        // frameProcessor={frameProcessor}
      />

      {/* Board Detection Overlay */}
      <BoardOverlay detected={boardDetected} />

      {/* Header Controls */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={toggleFlash}
        >
          <Ionicons
            name={flashEnabled ? 'flash' : 'flash-off'}
            size={24}
            color={flashEnabled ? colors.secondary : colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            // TODO: Show help modal
            Alert.alert('Help', 'Position the backgammon board clearly in the frame and tap capture.');
          }}
        >
          <Ionicons name="help-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <Text style={styles.statusText}>
          {boardDetected ? '✅ Board detected' : '🎯 Position board clearly'}
        </Text>
        
        <Animated.View style={captureButtonStyle}>
          <CaptureButton
            onPress={capturePhoto}
            loading={isProcessingImage}
            disabled={!boardDetected && !__DEV__} // Allow capture in dev mode
          />
        </Animated.View>
      </View>

      {/* Processing Overlay */}
      {isProcessingImage && (
        <Animated.View style={[styles.processingOverlay, overlayStyle]}>
          <Text style={styles.processingText}>Analyzing board position...</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  statusText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  permissionTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  permissionText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
    marginBottom: spacing.xl,
  },
  permissionButton: {
    minWidth: 200,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.error,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
  },
});

export default CameraScreen;

