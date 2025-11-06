import { GuessResult } from '@/lib/types/game';
import { KeyState } from '@/lib/types/keyboard';

export function getKeyboardState(
  guesses: GuessResult[]
): Record<string, KeyState> {
  const keyStates: Record<string, KeyState> = {};
  const statePriority = { correct: 3, present: 2, absent: 1, empty: 0 };

  guesses.forEach((guess) => {
    guess.word.toLowerCase().split('').forEach((letter, letterIndex) => {
      const currentState = guess.letterStates[letterIndex];
      const currentPriority = statePriority[currentState as KeyState] || 0;
      const existingPriority = keyStates[letter] ? statePriority[keyStates[letter]] : 0;

      if (currentPriority > existingPriority) {
        keyStates[letter] = currentState;
      }
    });
  });

  return keyStates;
}