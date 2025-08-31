import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

import { colors } from '@/utils/theme';

interface BoardOverlayProps {
  detected: boolean;
  corners?: { x: number; y: number }[];
  confidence?: number;
}

const { width, height } = Dimensions.get('window');

const BoardOverlay: React.FC<BoardOverlayProps> = ({
  detected,
  corners,
  confidence = 0.8,
}) => {
  // Default corners for demo purposes
  const defaultCorners = [
    { x: width * 0.1, y: height * 0.25 },
    { x: width * 0.9, y: height * 0.25 },
    { x: width * 0.9, y: height * 0.75 },
    { x: width * 0.1, y: height * 0.75 },
  ];

  const actualCorners = corners || defaultCorners;

  // Animation values
  const borderOpacity = useSharedValue(detected ? 1 : 0);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    borderOpacity.value = withTiming(detected ? 1 : 0, { duration: 300 });
    
    if (detected) {
      pulseScale.value = withRepeat(
        withTiming(1.02, { duration: 1000 }),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [detected]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  if (!detected && !corners) {
    return (
      <View style={styles.container}>
        {/* Guide overlay for positioning */}
        <View style={styles.guideContainer}>
          <View style={styles.guideBorder} />
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
        </View>
      </View>
    );
  }

  const polygonPoints = actualCorners
    .map(corner => `${corner.x},${corner.y}`)
    .join(' ');

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Svg width={width} height={height} style={styles.svg}>
        {/* Board outline */}
        <Polygon
          points={polygonPoints}
          fill="none"
          stroke={detected ? colors.accent : colors.warning}
          strokeWidth="3"
          strokeDasharray={detected ? "0" : "10,5"}
        />
        
        {/* Corner indicators */}
        {actualCorners.map((corner, index) => (
          <Circle
            key={index}
            cx={corner.x}
            cy={corner.y}
            r="6"
            fill={detected ? colors.accent : colors.warning}
          />
        ))}
        
        {/* Confidence indicator */}
        {detected && confidence && (
          <Circle
            cx={width / 2}
            cy={height * 0.15}
            r="20"
            fill={colors.accent}
            opacity="0.8"
          />
        )}
      </Svg>
      
      {/* Grid lines for board positioning */}
      {detected && (
        <View style={styles.gridContainer}>
          <View style={[styles.gridLine, styles.horizontalLine, { top: '40%' }]} />
          <View style={[styles.gridLine, styles.horizontalLine, { top: '60%' }]} />
          <View style={[styles.gridLine, styles.verticalLine, { left: '25%' }]} />
          <View style={[styles.gridLine, styles.verticalLine, { left: '50%' }]} />
          <View style={[styles.gridLine, styles.verticalLine, { left: '75%' }]} />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  guideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideBorder: {
    width: width * 0.8,
    height: height * 0.5,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  cornerTL: {
    position: 'absolute',
    top: height * 0.25 - 10,
    left: width * 0.1 - 10,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.textSecondary,
  },
  cornerTR: {
    position: 'absolute',
    top: height * 0.25 - 10,
    right: width * 0.1 - 10,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.textSecondary,
  },
  cornerBL: {
    position: 'absolute',
    bottom: height * 0.25 - 10,
    left: width * 0.1 - 10,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.textSecondary,
  },
  cornerBR: {
    position: 'absolute',
    bottom: height * 0.25 - 10,
    right: width * 0.1 - 10,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.textSecondary,
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: colors.accent,
    opacity: 0.3,
  },
  horizontalLine: {
    left: '10%',
    right: '10%',
    height: 1,
  },
  verticalLine: {
    top: '25%',
    bottom: '25%',
    width: 1,
  },
});

export default BoardOverlay;

