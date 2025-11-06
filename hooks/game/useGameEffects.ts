import { useEffect, useRef } from 'react';
import { useGameStats } from '../stats/useGameStats';
import { GuessResult, GameMode } from '@/lib/types/game';
import { saveGameState, clearDailyGameState } from '@/lib/utils/storage';

interface UseGameEffectsProps {
  gameOver: boolean;
  guesses: GuessResult[];
  revealedAnswer: string | null;
  onShowStats: (show: boolean) => void;
  gameMode: GameMode;
}

export function useGameEffects({
  gameOver,
  guesses,
  revealedAnswer,
  onShowStats,
  gameMode
}: UseGameEffectsProps) {
  const { updateGameResult } = useGameStats({ gameMode });
  const hasUpdatedStats = useRef(false);

  // Handle game completion
  useEffect(() => {
    if (gameOver && revealedAnswer && !hasUpdatedStats.current) {
      const isWon = guesses.length > 0 && guesses[guesses.length - 1].isCorrect;
      
      // Update game statistics only once
      hasUpdatedStats.current = true;
      updateGameResult({
        won: isWon,
        numGuesses: guesses.length,
        word: revealedAnswer,
        timestamp: Date.now()
      });

      // Clear the in-progress game state upon completion for daily modes
      if (gameMode === 'wordOfTheDay' || gameMode === 'todaysSet') {
        clearDailyGameState(gameMode);
      }

      // Show stats card with delay
      setTimeout(() => {
        onShowStats(true);
      }, 1500);
    }

    // Reset the flag when the game is not over
    if (!gameOver) {
      hasUpdatedStats.current = false;
    }
  }, [gameOver, guesses, revealedAnswer, updateGameResult, onShowStats, gameMode]);

  // Save current game state
  useEffect(() => {
    if (guesses.length > 0) {
      saveGameState('currentGame', {
        guesses: guesses.map(g => ({
          word: g.word,
          isCorrect: g.isCorrect
        })), // Store minimal guess info
        answer: revealedAnswer,
        timestamp: Date.now()
      });
    }
  }, [guesses, revealedAnswer]);
}