import { useState, useEffect, useCallback } from 'react';
import { GameStats, GameResult, GameMode } from '@/lib/types/game';
import { Language } from '@/lib/types/i18n';
import { statsManager } from '@/lib/stats/statsManager';

interface UseGameStatsProps {
  gameMode: GameMode;
  language: Language;
}

interface UseGameStatsReturn {
  stats: GameStats;
  updateGameResult: (result: GameResult) => Promise<void>;
}

export function useGameStats({ gameMode, language }: UseGameStatsProps): UseGameStatsReturn {
  const [stats, setStats] = useState<GameStats>(statsManager.getStats(gameMode, language));

  useEffect(() => {
    const initialStats = statsManager.getStats(gameMode, language);
    setStats(initialStats);
  }, [gameMode, language]);

  useEffect(() => {
    const handleStatsChange = (newStats: GameStats, updatedGameMode: GameMode, updatedLanguage: Language) => {
      if (gameMode === updatedGameMode && language === updatedLanguage) {
        setStats(newStats);
      }
    };
    const unsubscribe = statsManager.addListener(handleStatsChange);
    return unsubscribe;
  }, [gameMode, language]);

  const updateGameResult = useCallback(async (result: GameResult) => {
    statsManager.updateGameResult(result, gameMode, language);
  }, [gameMode, language]);

  return {
    stats,
    updateGameResult,
  };
}