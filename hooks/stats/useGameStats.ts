import { useState, useEffect } from 'react';
import { GameStats, GameResult } from '@/lib/types/game';
import { statsManager } from '@/lib/stats/statsManager';

interface UseGameStatsReturn {
  stats: GameStats;
  isUpdating: boolean;
  isLoading: boolean;
  error: Error | null;
  updateGameResult: (result: GameResult) => Promise<void>;
  resetStats: () => void;
}

export function useGameStats(): UseGameStatsReturn {
  const [stats, setStats] = useState<GameStats>(statsManager.getStats());
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial stats
  useEffect(() => {
    try {
      const initialStats = statsManager.getStats();
      setStats(initialStats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load stats'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to stats changes
  useEffect(() => {
    const unsubscribe = statsManager.addListener((newStats) => {
      setStats(newStats);
    });
    return unsubscribe;
  }, []);

  const updateGameResult = async (result: GameResult) => {
    setIsUpdating(true);
    try {
      const newStats = statsManager.updateGameResult(result);
      setStats(newStats);
    } catch (error) {
      console.error('Error updating game result:', error);
      setError(error instanceof Error ? error : new Error('Failed to update stats'));
    } finally {
      setIsUpdating(false);
    }
  };

  const resetStats = () => {
    try {
      const newStats = statsManager.resetStats();
      setStats(newStats);
    } catch (error) {
      console.error('Error resetting stats:', error);
      setError(error instanceof Error ? error : new Error('Failed to reset stats'));
    }
  };

  return {
    stats,
    isUpdating,
    isLoading,
    error,
    updateGameResult,
    resetStats
  };
}