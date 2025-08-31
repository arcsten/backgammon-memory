import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/utils/theme';
import Button from '@/components/ui/Button';

const CameraScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Camera not available on Web</Text>
        <Text style={styles.subtitle}>
          Use the iOS Simulator or an Android emulator to capture and analyze
          backgammon boards. You can still browse Analysis, History, and Settings here.
        </Text>

        <View style={styles.actions}>
          <Button
            title="Go to Analysis"
            variant="primary"
            onPress={() => window.location.hash = '#Analysis'}
            style={styles.button}
          />
          <Button
            title="Open Settings"
            variant="outline"
            onPress={() => window.location.hash = '#Settings'}
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    maxWidth: 560,
  },
  title: {
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
    textAlign: 'center',
  },
  actions: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    marginHorizontal: spacing.sm,
    minWidth: 160,
  },
});

export default CameraScreen;


