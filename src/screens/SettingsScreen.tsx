import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '@/utils/theme';
import { useAppStore } from '@/store/useAppStore';
import Button from '@/components/ui/Button';

const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, clearHistory } = useAppStore();

  const settingsItems = [
    {
      id: 'camera',
      title: 'Camera Settings',
      items: [
        {
          key: 'flashEnabled',
          title: 'Flash Enabled',
          subtitle: 'Enable camera flash by default',
          type: 'switch' as const,
          value: settings.flashEnabled,
        },
        {
          key: 'autoCapture',
          title: 'Auto Capture',
          subtitle: 'Automatically capture when board is detected',
          type: 'switch' as const,
          value: settings.autoCapture,
        },
      ],
    },
    {
      id: 'feedback',
      title: 'Feedback Settings',
      items: [
        {
          key: 'soundEnabled',
          title: 'Sound Effects',
          subtitle: 'Play sound effects for actions',
          type: 'switch' as const,
          value: settings.soundEnabled,
        },
        {
          key: 'hapticFeedback',
          title: 'Haptic Feedback',
          subtitle: 'Vibrate on button presses and captures',
          type: 'switch' as const,
          value: settings.hapticFeedback,
        },
      ],
    },
    {
      id: 'data',
      title: 'Data Management',
      items: [
        {
          key: 'clearHistory',
          title: 'Clear All History',
          subtitle: 'Remove all saved positions and analysis',
          type: 'button' as const,
          onPress: () => {
            Alert.alert(
              'Clear All History',
              'This will permanently delete all your saved positions and analysis. This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear All',
                  style: 'destructive',
                  onPress: () => {
                    clearHistory();
                    Alert.alert('Success', 'All history has been cleared.');
                  },
                },
              ]
            );
          },
        },
      ],
    },
    {
      id: 'about',
      title: 'About',
      items: [
        {
          key: 'version',
          title: 'Version',
          subtitle: '1.0.0',
          type: 'info' as const,
        },
        {
          key: 'help',
          title: 'Help & Tutorial',
          subtitle: 'Learn how to use the app',
          type: 'button' as const,
          onPress: () => {
            Alert.alert(
              'Help & Tutorial',
              'Position your backgammon board clearly in the camera frame and tap the capture button. The app will analyze the position and provide winning chances and best moves.',
            );
          },
        },
        {
          key: 'feedback',
          title: 'Send Feedback',
          subtitle: 'Report bugs or suggest improvements',
          type: 'button' as const,
          onPress: () => {
            Alert.alert('Feedback', 'Feature not implemented yet');
          },
        },
      ],
    },
  ];

  const handleSwitchToggle = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const renderSettingItem = (item: any) => {
    switch (item.type) {
      case 'switch':
        return (
          <View key={item.key} style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={() => handleSwitchToggle(item.key)}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={item.value ? colors.white : colors.textSecondary}
            />
          </View>
        );
      
      case 'button':
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.settingItem}
            onPress={item.onPress}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        );
      
      case 'info':
        return (
          <View key={item.key} style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {settingsItems.map((section) => (
        <View key={section.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>
            {section.items.map(renderSettingItem)}
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Backgammon Memory - Board Position Analysis
        </Text>
        <Text style={styles.footerSubtext}>
          Powered by Computer Vision & OpenCV
        </Text>
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
    marginLeft: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  settingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  footerSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default SettingsScreen;

