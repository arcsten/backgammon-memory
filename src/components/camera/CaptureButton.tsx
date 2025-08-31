import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, spacing } from '@/utils/theme';

interface CaptureButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const CaptureButton: React.FC<CaptureButtonProps> = ({
  onPress,
  loading = false,
  disabled = false,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    'worklet';
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      // Flash animation
      opacity.value = withTiming(0.7, { duration: 100 }, () => {
        opacity.value = withTiming(1, { duration: 100 });
      });
      onPress();
    }
  };

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.container,
        animatedStyle,
        (disabled || loading) && styles.disabled,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      <View style={styles.outerRing}>
        <View style={styles.innerButton}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.white} />
          ) : (
            <Ionicons
              name="camera"
              size={32}
              color={colors.white}
            />
          )}
        </View>
      </View>
    </AnimatedTouchableOpacity>
  );
};

const BUTTON_SIZE = 80;
const RING_SIZE = 100;

const styles = StyleSheet.create({
  container: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  innerButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default CaptureButton;
