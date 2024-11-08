import { GameStats } from '@/lib/types/game';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Language } from '@/lib/types/i18n';
import { MAX_RECENT_GAMES } from '@/lib/game/constants';

// Utility for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generic localStorage helpers
export function saveGameState<T>(key: string, value: T): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save game state for key ${key}:`, error);
    }
  }
}

export function loadGameState<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Failed to load game state for key ${key}:`, error);
    return defaultValue;
  }
}

// Add to lib/utils/storage.ts
export function clearAllGameData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear all localStorage data
    localStorage.clear();
    
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Failed to clear game data:', error);
    throw new Error('Failed to clear game data');
  }
}

const STORAGE_KEYS = {
  STATS: 'lexic-stats',
  CURRENT_GAME: 'lexic-current-game',
  KEYBOARD: 'keyboard-layout',
  LANGUAGE: 'language-preference'
} as const;

export function saveLanguagePreference(language: Language): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
      // Remove old key if it exists
      localStorage.removeItem('language');
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }
}

export function loadLanguagePreference(): Language {
  if (typeof window === 'undefined') return 'en';
  
  try {
    // Try to get from new key first
    let saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    
    // If not found, check old key and migrate
    if (!saved) {
      const oldSaved = localStorage.getItem('language');
      if (oldSaved) {
        saved = oldSaved;
        // Migrate to new key
        localStorage.setItem(STORAGE_KEYS.LANGUAGE, oldSaved);
        localStorage.removeItem('language');
      }
    }
    
    return (saved === 'fr' || saved === 'en') ? saved : 'en';
  } catch (error) {
    console.error('Failed to load language preference:', error);
    return 'en';
  }
}

// Add data migration helper
export function migrateGameData(): void {
  if (typeof window === 'undefined') return;

  try {
    const oldStats = localStorage.getItem(STORAGE_KEYS.STATS);
    if (oldStats) {
      const parsed = JSON.parse(oldStats);
      
      // Migrate old format to new format if needed
      if (Array.isArray(parsed.guessHistory)) {
        const guessDistribution: Record<string, number> = {};
        const recentGames = parsed.guessHistory
          .slice(-MAX_RECENT_GAMES)
          .map((game: { word: string; letterStates: any[]; isCorrect: boolean }) => ({
            word: game.word,
            guesses: game.letterStates?.length || 0,
            won: game.isCorrect,
            timestamp: parsed.lastPlayed
          }));

        // Calculate distribution from history
        parsed.guessHistory.forEach((game: { letterStates: any[]; isCorrect: boolean }) => {
          if (game.isCorrect) {
            const guesses = game.letterStates?.length || 0;
            guessDistribution[guesses] = (guessDistribution[guesses] || 0) + 1;
          }
        });

        // Save migrated data
        const migratedStats = {
          ...parsed,
          guessDistribution,
          recentGames,
          guessHistory: undefined // Remove old format
        };

        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(migratedStats));
      }
    }
  } catch (error) {
    console.error('Failed to migrate game data:', error);
  }
}

