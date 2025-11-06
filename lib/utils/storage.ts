import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Language } from '@/lib/types/i18n';
import type { GuessResult, GameMode } from '@/lib/types/game';

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

export interface DailyGameState {
  date: string;
  guesses: GuessResult[];
  revealedAnswer: string | null;
}

export function saveDailyGameState(gameMode: GameMode, state: DailyGameState): void {
  if (typeof window !== 'undefined') {
    if (gameMode === 'infinite') return; // Don't save for infinite mode
    const key = `lexic-daily-game-${gameMode}`;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Failed to save daily game state for ${gameMode}:`, error);
    }
  }
}

export function loadDailyGameState(gameMode: GameMode): DailyGameState | null {
  if (typeof window === 'undefined' || gameMode === 'infinite') return null;
  
  const key = `lexic-daily-game-${gameMode}`;
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) as DailyGameState : null;
  } catch (error)    {
    console.error(`Failed to load daily game state for ${gameMode}:`, error);
    return null;
  }
}

export function clearDailyGameState(gameMode: GameMode): void {
  if (typeof window !== 'undefined') {
    if (gameMode === 'infinite') return;
    const key = `lexic-daily-game-${gameMode}`;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to clear daily game state for ${gameMode}:`, error);
    }
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