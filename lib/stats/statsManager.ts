import type { GameStats, GameResult, StatsError, StatsValidation } from '@/lib/types/game';
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

export class StatsManager {
  private readonly STORAGE_KEY = 'lexic-stats';
  private stats: GameStats;
  private readonly listeners: Set<(stats: GameStats) => void>;

  constructor() {
    this.stats = this.loadStats();
    this.listeners = new Set();
  }

  private loadStats(): GameStats {
    if (typeof window === 'undefined') return createInitialStats();

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) return createInitialStats();

      const parsed = JSON.parse(saved);
      return this.validateStats(parsed);
    } catch (error) {
      console.error('Failed to load stats:', error);
      return createInitialStats();
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
      recentGames: Array.isArray(stats.recentGames) ? stats.recentGames : []
    };
  }

  private saveStats(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stats));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getStats()));
  }

  public addListener(listener: (stats: GameStats) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getStats(): GameStats {
    return { ...this.stats };
  }

  public updateGameResult(result: GameResult): GameStats {
    const now = Date.now();
    const isNewStreak = this.calculateNewStreak(now);
    
    const newStats = {
      ...this.stats,
      gamesPlayed: this.stats.gamesPlayed + 1,
      gamesWon: result.won ? this.stats.gamesWon + 1 : this.stats.gamesWon,
      currentStreak: result.won 
        ? (isNewStreak ? this.stats.currentStreak + 1 : 1)
        : 0,
      lastPlayed: now,
      lastCompleted: now,
      guessDistribution: {
        ...this.stats.guessDistribution,
        [result.numGuesses]: (this.stats.guessDistribution[result.numGuesses] || 0) + 1
      },
      recentGames: [
        {
          word: result.word,
          guesses: result.numGuesses,
          won: result.won,
          timestamp: result.timestamp
        },
        ...this.stats.recentGames
      ].slice(0, MAX_RECENT_GAMES) // Keep only recent games
    };

    newStats.maxStreak = Math.max(this.stats.maxStreak, newStats.currentStreak);

    this.stats = newStats;
    this.saveStats();
    return this.getStats();
  }

  public resetStats(): GameStats {
    this.stats = createInitialStats();
    this.saveStats();
    return this.getStats();
  }
  
  private calculateNewStreak(now: number): boolean {
    return (now - this.stats.lastCompleted) < 24 * 60 * 60 * 1000;
  }

  // Helper methods for stats calculations
  public calculateWinRate(): number {
    return this.stats.gamesPlayed > 0 
      ? Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100)
      : 0;
  }

  public formatShareableStats(): string {
    const winRate = this.calculateWinRate();
    return `Lexic Stats:
🎮 ${this.stats.gamesPlayed} games
✨ ${winRate}% win rate
🔥 ${this.stats.currentStreak} current streak
⭐ ${this.stats.maxStreak} max streak`;
  }

  public clearStats(): void {
    this.stats = createInitialStats();
    this.saveStats();
    this.notifyListeners();
  }

  public calculateAverageGuesses(): string {
    if (this.stats.gamesWon === 0) return '0';
    
    const totalGuesses = Object.entries(this.stats.guessDistribution)
      .reduce((sum, [guesses, count]) => sum + (Number(guesses) * count), 0);
      
    return (totalGuesses / this.stats.gamesWon).toFixed(1);
  }

  // Move storage keys here
  private static readonly STORAGE_KEYS = {
    STATS: 'lexic-stats',
    KEYBOARD: 'keyboard-layout',
    LANGUAGE: 'language-preference'
  } as const;

  public clearAllGameData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      Object.values(StatsManager.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      localStorage.removeItem('language'); // Remove legacy key
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Failed to clear game data:', error);
      throw new Error('Failed to clear game data');
    }
  }
}

// Export singleton instance
export const statsManager = new StatsManager(); 