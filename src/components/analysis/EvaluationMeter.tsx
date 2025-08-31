import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius } from '@/utils/theme';

interface EvaluationMeterProps {
  value: number; // -2.0 to +2.0 range
  confidence?: number; // 0.0 to 1.0
  showConfidence?: boolean;
}

const EvaluationMeter: React.FC<EvaluationMeterProps> = ({
  value,
  confidence = 1.0,
  showConfidence = true,
}) => {
  const animatedValue = useSharedValue(0);

  React.useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [value]);

  const formatValue = (val: number) => {
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(3)}`;
  };

  const getEvaluationColor = (val: number) => {
    if (val > 1.0) return colors.accent;
    if (val > 0.5) return '#4ade80'; // light green
    if (val > 0) return colors.secondary;
    if (val > -0.5) return colors.warning;
    if (val > -1.0) return '#f87171'; // light red
    return colors.error;
  };

  const getEvaluationLabel = (val: number) => {
    if (val > 1.5) return 'Winning';
    if (val > 1.0) return 'Very Good';
    if (val > 0.5) return 'Good';
    if (val > 0.2) return 'Slightly Better';
    if (val > -0.2) return 'Even';
    if (val > -0.5) return 'Slightly Worse';
    if (val > -1.0) return 'Bad';
    if (val > -1.5) return 'Very Bad';
    return 'Losing';
  };

  // Convert value (-2 to +2) to percentage (0 to 100)
  const percentage = Math.min(Math.max(((value + 2) / 4) * 100, 0), 100);

  const animatedStyle = useAnimatedStyle(() => {
    const animatedPercentage = Math.min(Math.max(((animatedValue.value + 2) / 4) * 100, 0), 100);
    return {
      width: `${animatedPercentage}%`,
    };
  });

  return (
    <View style={styles.container}>
      {/* Value and Label */}
      <View style={styles.header}>
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: getEvaluationColor(value) }]}>
            {formatValue(value)}
          </Text>
          <Text style={styles.label}>{getEvaluationLabel(value)}</Text>
        </View>
        
        {showConfidence && (
          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence</Text>
            <Text style={styles.confidenceValue}>
              {(confidence * 100).toFixed(0)}%
            </Text>
          </View>
        )}
      </View>

      {/* Meter */}
      <View style={styles.meterContainer}>
        <View style={styles.meterBackground}>
          <Animated.View
            style={[
              styles.meterFill,
              animatedStyle,
              { backgroundColor: getEvaluationColor(value) },
            ]}
          />
        </View>
        
        {/* Center line */}
        <View style={styles.centerLine} />
        
        {/* Scale markers */}
        <View style={styles.scaleContainer}>
          <Text style={styles.scaleLabel}>-2.0</Text>
          <Text style={styles.scaleLabel}>0</Text>
          <Text style={styles.scaleLabel}>+2.0</Text>
        </View>
      </View>

      {/* Confidence meter */}
      {showConfidence && (
        <View style={styles.confidenceMeter}>
          <Text style={styles.confidenceMeterLabel}>Analysis Confidence</Text>
          <View style={styles.confidenceBar}>
            <View
              style={[
                styles.confidenceFill,
                { width: `${confidence * 100}%` },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  valueContainer: {
    flex: 1,
  },
  value: {
    fontSize: typography.fontSize.xxxl,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.xs / 2,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  confidenceContainer: {
    alignItems: 'flex-end',
  },
  confidenceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  confidenceValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  meterContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  meterBackground: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 6,
  },
  centerLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.text,
    marginLeft: -1,
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  scaleLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.mono,
  },
  confidenceMeter: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confidenceMeterLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: colors.info,
    borderRadius: 3,
  },
});

export default EvaluationMeter;

