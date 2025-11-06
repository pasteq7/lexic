import { GuessResult } from '@/lib/types/game';
import { KeyState } from '@/lib/types/keyboard';

export function getKeyboardState(
  guesses: GuessResult[]
): Record<string, KeyState> {
  const keyStates: Record<string, KeyState> = {};

  guesses.forEach((guess) => {
    guess.word.toLowerCase().split('').forEach((letter, letterIndex) => {
      const currentState = guess.letterStates[letterIndex];
      
      // Only update if the new state is "better"
      if (!keyStates[letter] || 
          (currentState === 'correct') ||
          (currentState === 'present' && keyStates[letter] === 'absent')) {
        keyStates[letter] = currentState;
      }
    });
  });

  return keyStates;
}


