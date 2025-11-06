// lib/utils/storage.ts
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

// NEW: Helper to get a consistent UTC date key (YYYY-MM-DD)
function getUtcDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface DailyGameState {
  date: string;
  guesses: GuessResult[];
  revealedAnswer: string | null;
}

export function saveDailyGameState(gameMode: GameMode, language: Language, state: Omit<DailyGameState, 'date'>): void {
  if (typeof window === 'undefined' || gameMode === 'infinite') return;
  
  const key = `lexic-daily-game-${gameMode}-${language}`;
  const dataToSave = { ...state, date: getUtcDateKey() };
  try {
    window.localStorage.setItem(key, JSON.stringify(dataToSave));
  } catch (error) {
    console.error(`Failed to save daily game state for ${gameMode} in ${language}:`, error);
  }
}

export function loadDailyGameState(gameMode: GameMode, language: Language): DailyGameState | null {
  if (typeof window === 'undefined' || gameMode === 'infinite') return null;
  
  const key = `lexic-daily-game-${gameMode}-${language}`;
  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) return null;

    const parsed = JSON.parse(saved) as DailyGameState;
    // CRITICAL: Check if the saved date is today's UTC date
    if (parsed.date === getUtcDateKey()) {
      return parsed;
    }
    // If not, the data is stale, so we clear it and return null
    clearDailyGameState(gameMode, language);
    return null;
  } catch (error)    {
    console.error(`Failed to load daily game state for ${gameMode} in ${language}:`, error);
    return null;
  }
}

export function clearDailyGameState(gameMode: GameMode, language: Language): void {
  if (typeof window === 'undefined' || gameMode === 'infinite') return;

  const key = `lexic-daily-game-${gameMode}-${language}`;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to clear daily game state for ${gameMode} in ${language}:`, error);
  }
}

export function clearAllGameData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const lang = loadLanguagePreference();
    const keyboardLayout = loadGameState('keyboardLayout', null);

    localStorage.clear();
    
    // Restore essential preferences
    saveLanguagePreference(lang);
    if (keyboardLayout) saveGameState('keyboardLayout', keyboardLayout);
    
    window.dispatchEvent(new Event('storage'));
  } catch (error) {
    console.error('Failed to clear game data:', error);
    throw new Error('Failed to clear game data');
  }
}

const STORAGE_KEYS = {
  LANGUAGE: 'language-preference'
} as const;

export function saveLanguagePreference(language: Language): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  }
}

export function loadLanguagePreference(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return (saved === 'fr' || saved === 'en') ? saved : 'en';
  } catch (error) {
    console.error('Failed to load language preference:', error);
    return 'en';
  }
}