import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '@/utils/theme';
import { useAppStore } from '@/store/useAppStore';
import type { HistoryItem } from '@/types';
import PositionCard from '@/components/history/PositionCard';
import Button from '@/components/ui/Button';

const HistoryScreen: React.FC = () => {
  const { history, removeFromHistory, clearHistory } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filteredHistory = history.filter(item => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      item.id.toLowerCase().includes(query) ||
      item.analysis?.positionId?.toLowerCase().includes(query) ||
      (item.timestamp instanceof Date
        ? item.timestamp.toLocaleDateString().toLowerCase().includes(query)
        : new Date(item.timestamp as unknown as string).toLocaleDateString().toLowerCase().includes(query))
    );
  });

  const groupedHistory = filteredHistory.reduce((groups, item) => {
    const ts = item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp as unknown as string);
    const date = ts.toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, HistoryItem[]>);

  const groupedData = Object.entries(groupedHistory).map(([date, items]) => ({
    date,
    items: items.sort((a, b) => {
      const ta = (a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp as unknown as string)).getTime();
      const tb = (b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp as unknown as string)).getTime();
      return tb - ta;
    }),
  }));

  const handleDeleteSelected = () => {
    Alert.alert(
      'Delete Positions',
      `Are you sure you want to delete ${selectedItems.length} position(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            selectedItems.forEach(id => removeFromHistory(id));
            setSelectedItems([]);
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all position history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearHistory,
        },
      ]
    );
  };

  const renderSectionHeader = (date: string) => {
    const isToday = new Date().toDateString() === date;
    const isYesterday = new Date(Date.now() - 86400000).toDateString() === date;
    
    let displayDate = date;
    if (isToday) displayDate = 'Today';
    else if (isYesterday) displayDate = 'Yesterday';
    else displayDate = new Date(date).toLocaleDateString();

    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{displayDate}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <PositionCard
      item={item}
      onPress={() => {
        // Navigate to analysis with this position
        console.log('Navigate to analysis:', item.id);
      }}
      onSelect={() => {
        setSelectedItems(prev =>
          prev.includes(item.id)
            ? prev.filter(id => id !== item.id)
            : [...prev, item.id]
        );
      }}
      selected={selectedItems.includes(item.id)}
    />
  );

  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>No History Yet</Text>
        <Text style={styles.emptyText}>
          Your analyzed board positions will appear here. Start by capturing your first position!
        </Text>
        <Button
          title="Capture Position"
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
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search positions..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Selection Actions */}
      {selectedItems.length > 0 && (
        <View style={styles.selectionActions}>
          <Text style={styles.selectionText}>
            {selectedItems.length} selected
          </Text>
          <View style={styles.selectionButtons}>
            <Button
              title="Delete"
              variant="outline"
              size="small"
              onPress={handleDeleteSelected}
              style={styles.selectionButton}
            />
            <Button
              title="Cancel"
              variant="ghost"
              size="small"
              onPress={() => setSelectedItems([])}
              style={styles.selectionButton}
            />
          </View>
        </View>
      )}

      {/* History List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {groupedData.map(section => (
          <View key={section.date}>
            {renderSectionHeader(section.date)}
            {section.items.map(historyItem => (
              <View key={historyItem.id}>{renderItem({ item: historyItem })}</View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Footer Actions */}
      {history.length > 0 && (
        <View style={styles.footerActions}>
          <Button
            title="Clear All"
            variant="outline"
            onPress={handleClearAll}
            style={styles.footerButton}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectionText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontFamily: typography.fontFamily.medium,
  },
  selectionButtons: {
    flexDirection: 'row',
  },
  selectionButton: {
    marginLeft: spacing.sm,
  },
  sectionHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeaderText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  footerActions: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: {
    alignSelf: 'center',
    minWidth: 120,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
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

export default HistoryScreen;

