import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, BoardPosition, PositionAnalysis, HistoryItem } from '@/types';

interface AppState {
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Current analysis
  currentPosition: BoardPosition | null;
  currentAnalysis: PositionAnalysis | null;
  setCurrentPosition: (position: BoardPosition | null) => void;
  setCurrentAnalysis: (analysis: PositionAnalysis | null) => void;
  
  // History
  history: HistoryItem[];
  addToHistory: (item: HistoryItem) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  
  // Loading states
  isAnalyzing: boolean;
  isProcessingImage: boolean;
  setAnalyzing: (analyzing: boolean) => void;
  setProcessingImage: (processing: boolean) => void;
  
  // Persistence
  loadPersistedData: () => Promise<void>;
  persistData: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  darkMode: true,
  flashEnabled: false,
  autoCapture: false,
  soundEnabled: true,
  hapticFeedback: true,
};

export const useAppStore = create<AppState>((set, get) => ({
  // Settings
  settings: defaultSettings,
  updateSettings: (newSettings) =>
    set((state) => {
      const updatedSettings = { ...state.settings, ...newSettings };
      // Persist settings immediately
      AsyncStorage.setItem('app_settings', JSON.stringify(updatedSettings));
      return { settings: updatedSettings };
    }),
  
  // Current analysis
  currentPosition: null,
  currentAnalysis: null,
  setCurrentPosition: (position) => set({ currentPosition: position }),
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  
  // History
  history: [],
  addToHistory: (item) =>
    set((state) => {
      const newHistory = [item, ...state.history.filter(h => h.id !== item.id)];
      // Keep only last 100 items
      const trimmedHistory = newHistory.slice(0, 100);
      // Persist history
      AsyncStorage.setItem('position_history', JSON.stringify(trimmedHistory));
      return { history: trimmedHistory };
    }),
  removeFromHistory: (id) =>
    set((state) => {
      const newHistory = state.history.filter(h => h.id !== id);
      AsyncStorage.setItem('position_history', JSON.stringify(newHistory));
      return { history: newHistory };
    }),
  clearHistory: () => {
    AsyncStorage.removeItem('position_history');
    set({ history: [] });
  },
  
  // Loading states
  isAnalyzing: false,
  isProcessingImage: false,
  setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setProcessingImage: (processing) => set({ isProcessingImage: processing }),
  
  // Persistence
  loadPersistedData: async () => {
    try {
      const [settingsData, historyData] = await Promise.all([
        AsyncStorage.getItem('app_settings'),
        AsyncStorage.getItem('position_history'),
      ]);
      
      const settings = settingsData 
        ? { ...defaultSettings, ...JSON.parse(settingsData) }
        : defaultSettings;
      
      const history = historyData ? JSON.parse(historyData) : [];
      
      set({ settings, history });
    } catch (error) {
      console.error('Failed to load persisted data:', error);
    }
  },
  
  persistData: async () => {
    try {
      const { settings, history } = get();
      await Promise.all([
        AsyncStorage.setItem('app_settings', JSON.stringify(settings)),
        AsyncStorage.setItem('position_history', JSON.stringify(history)),
      ]);
    } catch (error) {
      console.error('Failed to persist data:', error);
    }
  },
}));

