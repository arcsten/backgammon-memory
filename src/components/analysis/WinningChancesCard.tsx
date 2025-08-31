import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/utils/theme';

interface WinningChancesProps {
  chances: {
    win: number;
    gammon: number;
    backgammon: number;
  };
}

const WinningChancesCard: React.FC<WinningChancesProps> = ({ chances }) => {
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getColorForPercentage = (percentage: number) => {
    if (percentage >= 70) return colors.accent;
    if (percentage >= 50) return colors.secondary;
    if (percentage >= 30) return colors.warning;
    return colors.error;
  };

  const ProgressBar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            { width: `${value}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Win */}
      <View style={styles.chanceItem}>
        <View style={styles.chanceHeader}>
          <Text style={styles.chanceLabel}>Win</Text>
          <Text style={[styles.chanceValue, { color: getColorForPercentage(chances.win) }]}>
            {formatPercentage(chances.win)}
          </Text>
        </View>
        <ProgressBar value={chances.win} color={getColorForPercentage(chances.win)} />
      </View>

      {/* Gammon */}
      <View style={styles.chanceItem}>
        <View style={styles.chanceHeader}>
          <Text style={styles.chanceLabel}>Gammon</Text>
          <Text style={[styles.chanceValue, { color: getColorForPercentage(chances.gammon) }]}>
            {formatPercentage(chances.gammon)}
          </Text>
        </View>
        <ProgressBar value={chances.gammon} color={getColorForPercentage(chances.gammon)} />
      </View>

      {/* Backgammon */}
      <View style={styles.chanceItem}>
        <View style={styles.chanceHeader}>
          <Text style={styles.chanceLabel}>Backgammon</Text>
          <Text style={[styles.chanceValue, { color: getColorForPercentage(chances.backgammon) }]}>
            {formatPercentage(chances.backgammon)}
          </Text>
        </View>
        <ProgressBar value={chances.backgammon} color={getColorForPercentage(chances.backgammon)} />
      </View>

      {/* Overall Assessment */}
      <View style={styles.assessmentContainer}>
        <Text style={styles.assessmentLabel}>Overall Position:</Text>
        <Text style={[styles.assessmentValue, { color: getColorForPercentage(chances.win) }]}>
          {chances.win >= 70 ? 'Excellent' :
           chances.win >= 55 ? 'Good' :
           chances.win >= 45 ? 'Even' :
           chances.win >= 30 ? 'Difficult' : 'Very Difficult'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  chanceItem: {
    marginBottom: spacing.md,
  },
  chanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  chanceLabel: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
  },
  chanceValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  progressContainer: {
    width: '100%',
  },
  progressBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  assessmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  assessmentLabel: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  assessmentValue: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
  },
});

export default WinningChancesCard;

