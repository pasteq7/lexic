// lib/utils/storage.ts - ROBUST STORAGE WITH PROPER DATE HANDLING
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Language } from '@/lib/types/i18n';
import type { GuessResult, GameMode } from '@/lib/types/game';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// GENERIC STORAGE HELPERS
// ============================================================================

export function saveGameState<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Storage error (save ${key}):`, error);
  }
}

export function loadGameState<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) return defaultValue;
    return JSON.parse(saved) as T;
  } catch (error) {
    console.error(`Storage error (load ${key}):`, error);
    return defaultValue;
  }
}

export function removeGameState(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Storage error (remove ${key}):`, error);
  }
}

// ============================================================================
// DATE UTILITIES (UTC-based for consistency)
// ============================================================================

/**
 * Get current date in YYYY-MM-DD format (UTC)
 * This ensures all users worldwide see the same daily challenge
 */
function getUTCDateKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date string matches today's UTC date
 */
function isToday(dateString: string): boolean {
  return dateString === getUTCDateKey();
}

// ============================================================================
// DAILY GAME STATE MANAGEMENT
// ============================================================================

export interface DailyGameState {
  date: string;
  guesses: GuessResult[];
  revealedAnswer: string | null;
  completed: boolean;
}

/**
 * Get storage key for daily game mode
 */
function getDailyGameKey(gameMode: GameMode, language: Language): string {
  return `lexic-daily-${gameMode}-${language}`;
}

/**
 * Save daily game progress
 * Only works for wordOfTheDay and todaysSet modes
 */
export function saveDailyGameState(
  gameMode: GameMode, 
  language: Language, 
  state: Omit<DailyGameState, 'date' | 'completed'>
): void {
  if (typeof window === 'undefined') return;
  if (gameMode === 'infinite') return; // Infinite mode doesn't use daily storage
  
  const key = getDailyGameKey(gameMode, language);
  const isCompleted = !!state.revealedAnswer;
  
  const dataToSave: DailyGameState = {
    ...state,
    date: getUTCDateKey(),
    completed: isCompleted,
  };
  
  try {
    window.localStorage.setItem(key, JSON.stringify(dataToSave));
  } catch (error) {
    console.error(`Failed to save daily game (${gameMode}, ${language}):`, error);
  }
}

/**
 * Load daily game progress
 * Returns null if:
 * - No saved data exists
 * - Saved data is from a different day
 * - Game mode is 'infinite'
 */
export function loadDailyGameState(
  gameMode: GameMode, 
  language: Language
): DailyGameState | null {
  if (typeof window === 'undefined') return null;
  if (gameMode === 'infinite') return null;
  
  const key = getDailyGameKey(gameMode, language);
  
  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) return null;

    const parsed = JSON.parse(saved) as DailyGameState;
    
    // Validate structure
    if (!parsed.date || !Array.isArray(parsed.guesses)) {
      removeGameState(key);
      return null;
    }
    
    // Check if data is from today
    if (!isToday(parsed.date)) {
      removeGameState(key);
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error(`Failed to load daily game (${gameMode}, ${language}):`, error);
    removeGameState(key);
    return null;
  }
}

/**
 * Clear daily game progress
 */
export function clearDailyGameState(gameMode: GameMode, language: Language): void {
  if (typeof window === 'undefined') return;
  if (gameMode === 'infinite') return;
  
  const key = getDailyGameKey(gameMode, language);
  removeGameState(key);
}

/**
 * Check if daily game is completed today
 */
export function isDailyGameCompleted(gameMode: GameMode, language: Language): boolean {
  const state = loadDailyGameState(gameMode, language);
  return state?.completed ?? false;
}

// ============================================================================
// LANGUAGE PREFERENCE
// ============================================================================

const LANGUAGE_KEY = 'lexic-language-preference';

export function saveLanguagePreference(language: Language): void {
  saveGameState(LANGUAGE_KEY, language);
}

export function loadLanguagePreference(): Language {
  const saved = loadGameState<Language | null>(LANGUAGE_KEY, null);
  
  // Validate
  if (saved === 'en' || saved === 'fr') return saved;
  
  // Default to browser language if available
  if (typeof window !== 'undefined') {
    const browserLang = window.navigator.language.toLowerCase();
    if (browserLang.startsWith('fr')) return 'fr';
  }
  
  return 'en';
}

// ============================================================================
// COMPLETE DATA WIPE
// ============================================================================

/**
 * Clear ALL game data while preserving user preferences
 */
export function clearAllGameData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Save preferences before clearing
    const language = loadLanguagePreference();
    const keyboardLayout = loadGameState<string | null>('keyboardLayout', null);
    
    // Clear everything
    localStorage.clear();
    
    // Restore preferences
    saveLanguagePreference(language);
    if (keyboardLayout) {
      saveGameState('keyboardLayout', keyboardLayout);
    }
    
    // Notify other tabs/windows
    window.dispatchEvent(new Event('storage'));
    
    console.log('Game data cleared successfully');
  } catch (error) {
    console.error('Failed to clear game data:', error);
    throw new Error('Failed to clear game data');
  }
}

// ============================================================================
// MIGRATION & CLEANUP
// ============================================================================

/**
 * Clean up old daily game data (run on app startup)
 */
export function cleanupOldDailyGames(): void {
  if (typeof window === 'undefined') return;
  
  const gameModes: GameMode[] = ['wordOfTheDay', 'todaysSet'];
  const languages: Language[] = ['en', 'fr'];
  
  gameModes.forEach(mode => {
    languages.forEach(lang => {
      const state = loadDailyGameState(mode, lang);
      if (state && !isToday(state.date)) {
        clearDailyGameState(mode, lang);
      }
    });
  });
}

// ============================================================================
// EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================================================

export { getUTCDateKey, isToday };