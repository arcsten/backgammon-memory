import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/utils/theme';
import type { HistoryItem } from '@/types';

interface PositionCardProps {
  item: HistoryItem;
  onPress: () => void;
  onSelect?: () => void;
  selected?: boolean;
}

const PositionCard: React.FC<PositionCardProps> = ({
  item,
  onPress,
  onSelect,
  selected = false,
}) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatEvaluation = (evaluation?: number) => {
    if (evaluation === undefined) return 'N/A';
    const sign = evaluation > 0 ? '+' : '';
    return `${sign}${evaluation.toFixed(2)}`;
  };

  const getEvaluationColor = (evaluation?: number) => {
    if (evaluation === undefined) return colors.textSecondary;
    if (evaluation > 0.5) return colors.accent;
    if (evaluation > 0) return colors.secondary;
    if (evaluation > -0.5) return colors.warning;
    return colors.error;
  };

  const getPositionIcon = () => {
    if (!item.analysis) return 'help-circle-outline';
    
    const winRate = item.analysis.winningChances.win;
    if (winRate >= 70) return 'trending-up';
    if (winRate >= 50) return 'remove';
    return 'trending-down';
  };

  const handlePress = () => {
    if (onSelect && selected !== undefined) {
      // If we're in selection mode, toggle selection
      onSelect();
    } else {
      // Otherwise, navigate to the position
      onPress();
    }
  };

  const handleLongPress = () => {
    // Long press starts selection mode
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selectedContainer,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      {/* Selection indicator */}
      {selected && (
        <View style={styles.selectionIndicator}>
          <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
        </View>
      )}

      {/* Main content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getPositionIcon()}
              size={24}
              color={getEvaluationColor(item.analysis?.evaluation)}
            />
          </View>
          
          <View style={styles.headerContent}>
            <Text style={styles.title}>Position #{item.id.slice(-6)}</Text>
            <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
          </View>
          
          <View style={styles.statsContainer}>
            {item.analysis && (
              <>
                <Text style={styles.winRate}>
                  {item.analysis.winningChances.win.toFixed(1)}%
                </Text>
                <Text style={[styles.evaluation, { color: getEvaluationColor(item.analysis.evaluation) }]}>
                  {formatEvaluation(item.analysis.evaluation)}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Details */}
        <View style={styles.details}>
          {item.analysis ? (
            <View style={styles.analysisPreview}>
              <Text style={styles.detailLabel}>Best Move:</Text>
              <Text style={styles.bestMove}>
                {item.analysis.bestMoves[0]?.notation || 'N/A'}
              </Text>
            </View>
          ) : (
            <Text style={styles.noAnalysis}>No analysis available</Text>
          )}
          
          {item.toMove && (
            <View style={styles.playerToMove}>
              <Text style={styles.detailLabel}>To move:</Text>
              <View style={[
                styles.playerIndicator,
                { backgroundColor: item.toMove === 'white' ? colors.pieceWhite : colors.pieceRed }
              ]}>
                <Text style={[
                  styles.playerText,
                  { color: item.toMove === 'white' ? colors.black : colors.white }
                ]}>
                  {item.toMove.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Quick stats bar */}
        {item.analysis && (
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Win</Text>
              <View style={styles.statBar}>
                <View
                  style={[
                    styles.statFill,
                    {
                      width: `${item.analysis.winningChances.win}%`,
                      backgroundColor: colors.accent,
                    },
                  ]}
                />
              </View>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Gammon</Text>
              <View style={styles.statBar}>
                <View
                  style={[
                    styles.statFill,
                    {
                      width: `${item.analysis.winningChances.gammon}%`,
                      backgroundColor: colors.secondary,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Arrow indicator */}
      {!selected && (
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedContainer: {
    borderColor: colors.accent,
    backgroundColor: colors.highlight,
  },
  selectionIndicator: {
    marginRight: spacing.sm,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  timestamp: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  winRate: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  evaluation: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.mono,
    fontWeight: 'bold',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  analysisPreview: {
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  bestMove: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.mono,
    color: colors.text,
  },
  noAnalysis: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  playerToMove: {
    alignItems: 'center',
  },
  playerIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  statBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    borderRadius: 2,
  },
  arrowContainer: {
    alignSelf: 'center',
    marginLeft: spacing.sm,
  },
});

export default PositionCard;

