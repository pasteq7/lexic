// lib/stats/statsManager.ts
import type { GameStats, GameResult, GameMode } from '@/lib/types/game';
import { Language } from '@/lib/types/i18n';
import { MAX_RECENT_GAMES } from '@/lib/game/constants';

const createInitialStats = (): GameStats => ({
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastPlayed: 0,
  lastCompleted: 0,
  guessDistribution: {},
  recentGames: []
});

type AllGameStats = Record<GameMode, GameStats>;
type LanguageStats = Record<Language, AllGameStats>;

// Helper to get the number of days since the Unix epoch, in UTC.
// This is a reliable way to compare dates across timezones.
const getUTCDayNumber = (timestamp: number): number => {
  const date = new Date(timestamp);
  return Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
};

export class StatsManager {
  private readonly STORAGE_KEY = 'lexic-stats-v2';
  private stats: LanguageStats;
  private readonly listeners: Set<(stats: GameStats, gameMode: GameMode, language: Language) => void>;

  constructor() {
    this.stats = this.loadStats();
    this.listeners = new Set();
  }

  private loadStats(): LanguageStats {
    const defaultStats: LanguageStats = {
      en: {
        infinite: createInitialStats(),
        wordOfTheDay: createInitialStats(),
        todaysSet: createInitialStats(),
      },
      fr: {
        infinite: createInitialStats(),
        wordOfTheDay: createInitialStats(),
        todaysSet: createInitialStats(),
      }
    };

    if (typeof window === 'undefined') return defaultStats;

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) return defaultStats;

      const parsed = JSON.parse(saved);
      
      return {
        en: {
          infinite: this.validateStats(parsed.en?.infinite || {}),
          wordOfTheDay: this.validateStats(parsed.en?.wordOfTheDay || {}),
          todaysSet: this.validateStats(parsed.en?.todaysSet || {}),
        },
        fr: {
          infinite: this.validateStats(parsed.fr?.infinite || {}),
          wordOfTheDay: this.validateStats(parsed.fr?.wordOfTheDay || {}),
          todaysSet: this.validateStats(parsed.fr?.todaysSet || {}),
        }
      };
    } catch (error) {
      console.error('Failed to load stats:', error);
      return defaultStats;
    }
  }

  private validateStats(stats: Partial<GameStats>): GameStats {
    return {
      gamesPlayed: Math.max(0, Number(stats.gamesPlayed) || 0),
      gamesWon: Math.max(0, Number(stats.gamesWon) || 0),
      currentStreak: Math.max(0, Number(stats.currentStreak) || 0),
      maxStreak: Math.max(0, Number(stats.maxStreak) || 0),
      lastPlayed: Number(stats.lastPlayed) || 0,
      lastCompleted: Number(stats.lastCompleted) || 0,
      guessDistribution: stats.guessDistribution && typeof stats.guessDistribution === 'object' ? stats.guessDistribution : {},
      recentGames: Array.isArray(stats.recentGames) 
        ? stats.recentGames.slice(0, MAX_RECENT_GAMES)
        : []
    };
  }

  private saveStats(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stats));
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }

  private notifyListeners(gameMode: GameMode, language: Language): void {
    this.listeners.forEach(listener => listener(this.getStats(gameMode, language), gameMode, language));
  }

  public addListener(listener: (stats: GameStats, gameMode: GameMode, language: Language) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getStats(gameMode: GameMode, language: Language): GameStats {
    return { ...(this.stats[language]?.[gameMode] || createInitialStats()) };
  }

  public updateGameResult(result: GameResult, gameMode: GameMode, language: Language): GameStats {
    const now = Date.now();
    const currentStats = this.getStats(gameMode, language);
    
    const isDailyMode = gameMode === 'wordOfTheDay' || gameMode === 'todaysSet';
    
    // For daily modes, prevent re-submission of stats for the same day.
    if (isDailyMode && getUTCDayNumber(currentStats.lastCompleted) === getUTCDayNumber(now)) {
      return currentStats;
    }

    let newCurrentStreak = currentStats.currentStreak;
    if (result.won) {
        // Check if the last completion was yesterday for a continued streak
        const yesterday = getUTCDayNumber(now) - 1;
        const lastCompletionDay = getUTCDayNumber(currentStats.lastCompleted);

        if (isDailyMode) {
             newCurrentStreak = (lastCompletionDay === yesterday) ? newCurrentStreak + 1 : 1;
        } else {
            newCurrentStreak += 1;
        }
    } else {
        newCurrentStreak = 0;
    }

    const newStats: GameStats = {
      ...currentStats,
      gamesPlayed: currentStats.gamesPlayed + 1,
      gamesWon: result.won ? currentStats.gamesWon + 1 : currentStats.gamesWon,
      currentStreak: newCurrentStreak,
      lastPlayed: now,
      // For daily modes, only update lastCompleted on a win.
      lastCompleted: result.won ? now : currentStats.lastCompleted,
      guessDistribution: result.won ? {
        ...currentStats.guessDistribution,
        [result.numGuesses]: (currentStats.guessDistribution[result.numGuesses] || 0) + 1
      } : currentStats.guessDistribution,
      recentGames: [
        {
          word: result.word,
          guesses: result.numGuesses,
          won: result.won,
          timestamp: result.timestamp
        },
        ...currentStats.recentGames
      ].slice(0, MAX_RECENT_GAMES)
    };

    newStats.maxStreak = Math.max(currentStats.maxStreak, newStats.currentStreak);

    this.stats[language][gameMode] = newStats;
    this.saveStats();
    this.notifyListeners(gameMode, language);
    return this.getStats(gameMode, language);
  }

  public resetStats(gameMode: GameMode, language: Language): GameStats {
    this.stats[language][gameMode] = createInitialStats();
    this.saveStats();
    this.notifyListeners(gameMode, language);
    return this.getStats(gameMode, language);
  }
  
  public clearAllGameData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.stats = this.loadStats();
      // Notify all listeners that stats have been reset
      (Object.keys(this.stats) as Language[]).forEach(lang => {
        (Object.keys(this.stats[lang]) as GameMode[]).forEach(mode => {
          this.notifyListeners(mode, lang);
        });
      });
    } catch (error) {
      console.error('Failed to clear game data:', error);
      throw new Error('Failed to clear game data');
    }
  }
}

export const statsManager = new StatsManager();