import { useEffect, useCallback } from 'react';
import { KeyboardLayout } from '../utils';

interface UseKeyboardControlsProps {
  isPlaying: boolean;
  gameOver: boolean;
  currentGuess: string;
  wordLength: number;
  onSubmit: () => void;
  onUpdateGuess: (guess: string) => void;
  keyboardLayout: KeyboardLayout;
}

export function useKeyboardControls({
  isPlaying,
  gameOver,
  currentGuess,
  wordLength,
  onSubmit,
  onUpdateGuess,
  keyboardLayout
}: UseKeyboardControlsProps) {
  const handleKeyPress = useCallback((key: string) => {
    if (gameOver) return;

    const normalizedKey = key.toLowerCase();

    if (key === 'Enter') {
      onSubmit();
    } else if (key === 'Backspace') {
      onUpdateGuess(currentGuess.slice(0, -1));
    } else if (
      /^[a-zA-Z]$/.test(key) && 
      currentGuess.length < wordLength
    ) {
      onUpdateGuess(currentGuess + normalizedKey);
    }

    if (keyboardLayout === 'azerty') {
      // Handle AZERTY-specific mappings if needed
    }
  }, [gameOver, currentGuess, wordLength, onSubmit, onUpdateGuess, keyboardLayout]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      handleKeyPress(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleKeyPress]);

  return { handleKeyPress };
} 