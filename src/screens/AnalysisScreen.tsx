import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { colors, spacing, typography, borderRadius } from '@/utils/theme';
import { useAppStore } from '@/store/useAppStore';
import Button from '@/components/ui/Button';
import BoardDiagram from '@/components/board/BoardDiagram';
import WinningChancesCard from '@/components/analysis/WinningChancesCard';
import BestMovesList from '@/components/analysis/BestMovesList';
import EvaluationMeter from '@/components/analysis/EvaluationMeter';

const AnalysisScreen: React.FC = () => {
  const { currentPosition, currentAnalysis } = useAppStore();

  // Mock data for demonstration
  const mockAnalysis = {
    positionId: '4HPwATDgc/ABMA',
    winningChances: {
      win: 67.3,
      gammon: 12.1,
      backgammon: 2.4,
    },
    evaluation: 0.847,
    bestMoves: [
      { notation: '24/23 13/11', from: 24, to: 23, evaluation: 0.847, winRate: 67.3 },
      { notation: '13/11 6/4', from: 13, to: 11, evaluation: 0.832, winRate: 66.8 },
      { notation: '24/22 13/11', from: 24, to: 22, evaluation: 0.821, winRate: 66.2 },
    ],
    confidence: 0.95,
  };

  const analysis = currentAnalysis || mockAnalysis;

  const copyPositionId = async () => {
    await Clipboard.setStringAsync(analysis.positionId);
    Alert.alert('Copied', 'Position ID copied to clipboard');
  };

  const shareAnalysis = async () => {
    try {
      const message = `Backgammon Position Analysis\n\nPosition ID: ${analysis.positionId}\nWin Rate: ${analysis.winningChances.win}%\nEvaluation: ${analysis.evaluation > 0 ? '+' : ''}${analysis.evaluation}\n\nBest Move: ${analysis.bestMoves[0]?.notation}`;
      
      await Share.share({
        message,
        title: 'Backgammon Analysis',
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const retryAnalysis = () => {
    Alert.alert(
      'Retry Analysis',
      'Would you like to capture a new position?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => {
          // Navigate back to camera
          console.log('Navigate to camera');
        }},
      ]
    );
  };

  if (!currentPosition && !analysis) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="analytics-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>No Analysis Available</Text>
        <Text style={styles.emptyText}>
          Capture a backgammon board position to see detailed analysis here.
        </Text>
        <Button
          title="Go to Camera"
          onPress={() => {
            // Navigate to camera
            console.log('Navigate to camera');
          }}
          style={styles.emptyButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Board Visualization */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Board Position</Text>
        <BoardDiagram position={currentPosition} style={styles.boardContainer} />
      </View>

      {/* Position ID */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Position ID</Text>
        <TouchableOpacity
          style={styles.positionIdContainer}
          onPress={copyPositionId}
        >
          <Text style={styles.positionId}>{analysis.positionId}</Text>
          <Ionicons name="copy-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Winning Chances */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Winning Chances</Text>
        <WinningChancesCard chances={analysis.winningChances} />
      </View>

      {/* Evaluation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Position Evaluation</Text>
        <EvaluationMeter
          value={analysis.evaluation}
          confidence={analysis.confidence}
        />
      </View>

      {/* Best Moves */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎲 Best Moves</Text>
        <BestMovesList moves={analysis.bestMoves} />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          title="Save"
          variant="outline"
          onPress={() => {
            Alert.alert('Saved', 'Position saved to history');
          }}
          style={styles.actionButton}
        />
        <Button
          title="Share"
          variant="secondary"
          onPress={shareAnalysis}
          style={styles.actionButton}
        />
        <Button
          title="Retry"
          variant="primary"
          onPress={retryAnalysis}
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  boardContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  positionIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  positionId: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.mono,
    color: colors.text,
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
    marginBottom: spacing.xl,
  },
  emptyButton: {
    minWidth: 200,
  },
});

export default AnalysisScreen;
