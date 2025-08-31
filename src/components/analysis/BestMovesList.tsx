import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/utils/theme';
import type { Move } from '@/types';

interface BestMovesListProps {
  moves: Move[];
  onMoveSelect?: (move: Move) => void;
}

const BestMovesList: React.FC<BestMovesListProps> = ({ moves, onMoveSelect }) => {
  const formatEvaluation = (evaluation: number) => {
    const sign = evaluation > 0 ? '+' : '';
    return `${sign}${evaluation.toFixed(3)}`;
  };

  const getEvaluationColor = (evaluation: number) => {
    if (evaluation > 0.5) return colors.accent;
    if (evaluation > 0) return colors.secondary;
    if (evaluation > -0.5) return colors.warning;
    return colors.error;
  };

  const renderMove = (move: Move, index: number) => {
    const isRecommended = index === 0;
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.moveItem,
          isRecommended && styles.recommendedMove,
        ]}
        onPress={() => onMoveSelect?.(move)}
        activeOpacity={0.7}
      >
        <View style={styles.moveContent}>
          <View style={styles.moveHeader}>
            <View style={styles.moveRank}>
              <Text style={[styles.rankText, isRecommended && styles.recommendedRankText]}>
                {index + 1}
              </Text>
              {isRecommended && (
                <Ionicons name="star" size={12} color={colors.secondary} style={styles.starIcon} />
              )}
            </View>
            
            <View style={styles.moveDetails}>
              <Text style={[styles.moveNotation, isRecommended && styles.recommendedText]}>
                {move.notation}
              </Text>
              <View style={styles.moveStats}>
                <Text style={styles.winRateText}>
                  Win: {move.winRate.toFixed(1)}%
                </Text>
                <Text style={[styles.evaluationText, { color: getEvaluationColor(move.evaluation) }]}>
                  {formatEvaluation(move.evaluation)}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Evaluation bar */}
          <View style={styles.evaluationBar}>
            <View style={styles.evaluationBackground}>
              <View
                style={[
                  styles.evaluationFill,
                  {
                    width: `${Math.min(Math.max((move.evaluation + 2) / 4 * 100, 0), 100)}%`,
                    backgroundColor: getEvaluationColor(move.evaluation),
                  },
                ]}
              />
            </View>
          </View>
        </View>
        
        {onMoveSelect && (
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
    );
  };

  if (moves.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No moves available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {moves.slice(0, 5).map(renderMove)}
      
      {moves.length > 5 && (
        <TouchableOpacity style={styles.showMoreButton}>
          <Text style={styles.showMoreText}>
            Show {moves.length - 5} more moves
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  moveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recommendedMove: {
    backgroundColor: colors.highlight,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  moveContent: {
    flex: 1,
  },
  moveHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  moveRank: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    minWidth: 30,
  },
  rankText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textSecondary,
  },
  recommendedRankText: {
    color: colors.secondary,
  },
  starIcon: {
    marginLeft: spacing.xs / 2,
  },
  moveDetails: {
    flex: 1,
  },
  moveNotation: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.mono,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  recommendedText: {
    color: colors.white,
    fontFamily: typography.fontFamily.bold,
  },
  moveStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  winRateText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.medium,
  },
  evaluationText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.mono,
    fontWeight: 'bold',
  },
  evaluationBar: {
    marginTop: spacing.xs,
  },
  evaluationBackground: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  evaluationFill: {
    height: '100%',
    borderRadius: 2,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.highlight,
  },
  showMoreText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  emptyContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default BestMovesList;
