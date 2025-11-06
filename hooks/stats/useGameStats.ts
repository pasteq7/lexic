import { useState, useEffect, useCallback } from 'react';
import { GameStats, GameResult, GameMode } from '@/lib/types/game';
import { statsManager } from '@/lib/stats/statsManager';

interface UseGameStatsProps {
  gameMode: GameMode;
}

interface UseGameStatsReturn {
  stats: GameStats;
  isUpdating: boolean;
  isLoading: boolean;
  error: Error | null;
  updateGameResult: (result: GameResult) => Promise<void>;
  resetStats: () => void;
}

export function useGameStats({ gameMode }: UseGameStatsProps): UseGameStatsReturn {
  const [stats, setStats] = useState<GameStats>(statsManager.getStats(gameMode));
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    try {
      const initialStats = statsManager.getStats(gameMode);
      setStats(initialStats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load stats'));
    } finally {
      setIsLoading(false);
    }
  }, [gameMode]);

  useEffect(() => {
    const handleStatsChange = (newStats: GameStats, updatedGameMode: GameMode) => {
      if (gameMode === updatedGameMode) {
        setStats(newStats);
      }
    };
    const unsubscribe = statsManager.addListener(handleStatsChange);
    return unsubscribe;
  }, [gameMode]);

  const updateGameResult = useCallback(async (result: GameResult) => {
    setIsUpdating(true);
    try {
      statsManager.updateGameResult(result, gameMode);
    } catch (error) {
      console.error('Error updating game result:', error);
      setError(error instanceof Error ? error : new Error('Failed to update stats'));
    } finally {
      setIsUpdating(false);
    }
  }, [gameMode]);

  const resetStats = useCallback(() => {
    try {
      statsManager.resetStats(gameMode);
    } catch (error) {
      console.error('Error resetting stats:', error);
      setError(error instanceof Error ? error : new Error('Failed to reset stats'));
    }
  }, [gameMode]);

  return {
    stats,
    isUpdating,
    isLoading,
    error,
    updateGameResult,
    resetStats
  };
}