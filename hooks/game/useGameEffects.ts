import { useEffect, useRef } from 'react';
import { useGameStats } from '../stats/useGameStats';
import { GuessResult, GameMode } from '@/lib/types/game';
import { Language } from '@/lib/types/i18n';
import { t } from '@/lib/i18n/translations';
import { clearDailyGameState } from '@/lib/utils/storage';
import { type Toast } from '@/hooks/use-toast';

interface UseGameEffectsProps {
  gameOver: boolean;
  guesses: GuessResult[];
  revealedAnswer: string | null;
  onShowStats: (show: boolean) => void;
  gameMode: GameMode;
  language: Language;
  toast: ({ ...props }: Toast) => void;
}

export function useGameEffects({
  gameOver,
  guesses,
  revealedAnswer,
  onShowStats,
  gameMode,
  language,
  toast
}: UseGameEffectsProps) {
  const { updateGameResult } = useGameStats({ gameMode, language });
  const hasUpdatedStats = useRef(false);

  useEffect(() => {
    if (gameOver && revealedAnswer && !hasUpdatedStats.current) {
      const isWon = guesses.length > 0 && guesses[guesses.length - 1].isCorrect;
      
      hasUpdatedStats.current = true;
      updateGameResult({
        won: isWon,
        numGuesses: guesses.length,
        word: revealedAnswer,
        timestamp: Date.now()
      });

      if (isWon) {
        toast({
            title: t('youWon', language),
            variant: 'success',
            duration: 4000,
        });
      } else {
        toast({
            title: t('gameOver', language),
            description: t('answer', language, { word: revealedAnswer }),
            variant: 'destructive',
            duration: 5000,
        });
      }

      if (gameMode === 'wordOfTheDay' || gameMode === 'todaysSet') {
        clearDailyGameState(gameMode, language);
      }

      setTimeout(() => {
        onShowStats(true);
      }, 1500);
    }

    if (!gameOver) {
      hasUpdatedStats.current = false;
    }
  }, [gameOver, guesses, revealedAnswer, updateGameResult, onShowStats, gameMode, language, toast]);
}