import type { GameStats, GameResult, GameMode } from '@/lib/types/game';
import { MAX_RECENT_GAMES } from '@/lib/game/constants';

const createInitialStats = (): GameStats => ({
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastPlayed: Date.now(),
  lastCompleted: 0,
  guessDistribution: {},
  recentGames: []
});

type AllGameStats = Record<GameMode, GameStats>;

export class StatsManager {
  private readonly STORAGE_KEY = 'lexic-stats';
  private stats: AllGameStats;
  private readonly listeners: Set<(stats: GameStats, gameMode: GameMode) => void>;

  constructor() {
    this.stats = this.loadStats();
    this.listeners = new Set();
  }

  private loadStats(): AllGameStats {
    const defaultStats: AllGameStats = {
      infinite: createInitialStats(),
      wordOfTheDay: createInitialStats(),
      todaysSet: createInitialStats(),
    };

    if (typeof window === 'undefined') return defaultStats;

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) return defaultStats;

      const parsed = JSON.parse(saved);
      
      return {
        infinite: this.validateStats(parsed.infinite || {}),
        wordOfTheDay: this.validateStats(parsed.wordOfTheDay || {}),
        todaysSet: this.validateStats(parsed.todaysSet || {}),
      };
    } catch (error) {
      console.error('Failed to load stats:', error);
      return defaultStats;
    }
  }

  private validateStats(stats: Partial<GameStats>): GameStats {
    const now = Date.now();
    return {
      gamesPlayed: Math.max(0, Number(stats.gamesPlayed) || 0),
      gamesWon: Math.max(0, Number(stats.gamesWon) || 0),
      currentStreak: Math.max(0, Number(stats.currentStreak) || 0),
      maxStreak: Math.max(0, Number(stats.maxStreak) || 0),
      lastPlayed: Number(stats.lastPlayed) || now,
      lastCompleted: Number(stats.lastCompleted) || now,
      guessDistribution: { ...stats.guessDistribution },
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

  private notifyListeners(gameMode: GameMode): void {
    this.listeners.forEach(listener => listener(this.getStats(gameMode), gameMode));
  }

  public addListener(listener: (stats: GameStats, gameMode: GameMode) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getStats(gameMode: GameMode): GameStats {
    return { ...(this.stats[gameMode] || createInitialStats()) };
  }

  public updateGameResult(result: GameResult, gameMode: GameMode): GameStats {
    const now = Date.now();
    const currentStats = this.getStats(gameMode);
    
    // Streak logic depends on the game mode. Daily modes should check against the previous day.
    const isDailyMode = gameMode === 'wordOfTheDay' || gameMode === 'todaysSet';
    const lastCompletionDate = new Date(currentStats.lastCompleted);
    const today = new Date(now);
    const yesterday = new Date(now);
    yesterday.setDate(today.getDate() - 1);

    const isSameDayCompletion = lastCompletionDate.toDateString() === today.toDateString();
    // For daily modes, don't update streak if another game was won today
    if (isDailyMode && result.won && isSameDayCompletion) {
       return currentStats;
    }

    const isContinuedStreak = lastCompletionDate.toDateString() === yesterday.toDateString();
    
    let newCurrentStreak = currentStats.currentStreak;
    if (result.won) {
        if (isDailyMode) {
            newCurrentStreak = isContinuedStreak ? newCurrentStreak + 1 : 1;
        } else { // infinite mode
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

    this.stats[gameMode] = newStats;
    this.saveStats();
    this.notifyListeners(gameMode);
    return this.getStats(gameMode);
  }

  public resetStats(gameMode: GameMode): GameStats {
    this.stats[gameMode] = createInitialStats();
    this.saveStats();
    this.notifyListeners(gameMode);
    return this.getStats(gameMode);
  }
  
  public clearAllGameData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.stats = this.loadStats(); // Reloads defaults
      // Optionally notify listeners for all modes that stats have been cleared
    } catch (error) {
      console.error('Failed to clear game data:', error);
      throw new Error('Failed to clear game data');
    }
  }
}

// Export singleton instance
export const statsManager = new StatsManager();