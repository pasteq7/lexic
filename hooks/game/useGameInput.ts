import { useCallback, useEffect } from 'react';
import { KeyboardLayout } from '@/lib/types/keyboard';

interface UseGameInputProps {
  isPlaying: boolean;
  gameOver: boolean;
  currentGuess: string;
  wordLength: number;
  onSubmit: () => void;
  onUpdateGuess: (guess: string) => void;
  keyboardLayout: KeyboardLayout;
  isSubmitting: boolean;
}

export function useGameInput({
  isPlaying,
  gameOver,
  currentGuess,
  wordLength,
  onSubmit,
  onUpdateGuess,
  keyboardLayout,
  isSubmitting
}: UseGameInputProps) {
  const handleKeyPress = useCallback((key: string) => {
    if (!isPlaying) return;
    
    if (gameOver && key.toLowerCase() === 'enter') {
      onSubmit();
      return;
    }

    if (gameOver || isSubmitting) return;

    switch (key.toLowerCase()) {
      case 'enter':
        if (currentGuess.length === wordLength) {
          onSubmit();
        }
        break;
      case 'backspace':
        onUpdateGuess(currentGuess.slice(0, -1));
        break;
      default:
        // Updated regex to support French characters
        if (
          key.length === 1 && 
          /^[a-zàâäéèêëîïôöùûüÿçæœ]$/i.test(key) && 
          currentGuess.length < wordLength
        ) {
          onUpdateGuess(currentGuess + key.toLowerCase());
        }
        break;
    }
  }, [
    isPlaying,
    gameOver,
    currentGuess,
    wordLength,
    onSubmit,
    onUpdateGuess,
    isSubmitting
  ]);

  // Physical keyboard handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;

      const key = event.key;
      if (key === 'Enter' || key === 'Backspace' || /^[a-zA-Z]$/.test(key)) {
        event.preventDefault();
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver, handleKeyPress]);

  return { handleKeyPress };
}
