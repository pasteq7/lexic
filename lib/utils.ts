import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { LetterState } from "./words";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ANIMATION_DURATION = 0.2;

export const FLIP_ANIMATION_DURATION = 500;
export const BOUNCE_ANIMATION_DURATION = 100;

export const getTileAnimationDelay = (index: number) => index * 0.1;

export const getTileAnimationConfig = (index: number) => ({
  flip: {
    duration: FLIP_ANIMATION_DURATION,
    delay: index * 100,
  },
  bounce: {
    duration: BOUNCE_ANIMATION_DURATION,
    type: "spring",
    stiffness: 200,
    damping: 15
  }
});

export type KeyboardKey = {
  key: string;
  state: LetterState | 'unused';
};

export type KeyState = 'correct' | 'present' | 'absent' | 'empty';

export function getKeyboardState(
  guesses: string[], 
  letterStates: Record<number, LetterState[]>
): Record<string, KeyState> {
  const keyStates: Record<string, KeyState> = {};
  
  // Process all guesses to build keyboard state
  guesses.forEach((guess, guessIndex) => {
    const states = letterStates[guessIndex] || [];
    [...guess.toLowerCase()].forEach((letter, index) => {
      const currentState = states[index];
      // Only update if the new state is "stronger" than existing
      if (
        !keyStates[letter] || // First occurrence
        currentState === 'correct' || // Always override with correct
        (currentState === 'present' && keyStates[letter] === 'absent') // Override absent with present
      ) {
        keyStates[letter] = currentState;
      }
    });
  });
  
  return keyStates;
}

// Add localStorage helpers
export function saveGameState(key: string, value: any) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

export function loadGameState<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const saved = window.localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
}

// Add toast message types
export type ToastType = 'error' | 'success' | 'info';

export interface Toast {
  message: string;
  type: ToastType;
  duration?: number;
}

// Enhanced animation configurations
export const ANIMATIONS = {
  FLIP: {
    duration: 0.6,
    scale: [1, 1.1, 1],
    rotateX: [0, 90, 0],
  },
  SHAKE: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  },
  POP: {
    scale: [1, 1.1, 1],
    transition: { duration: 0.15 },
  },
  BOUNCE: {
    y: [0, -20, 0],
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10
    }
  },
  REVEAL: {
    initial: { rotateX: 0 },
    animate: { rotateX: 180 },
    transition: { duration: 0.6, ease: "easeInOut" }
  },
  TOAST: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.2 }
  }
};

export const KEYBOARD_ANIMATIONS = {
  PRESS: {
    scale: [1, 0.9, 1],
    transition: { duration: 0.1 }
  },
  CORRECT: {
    backgroundColor: ["#4b5563", "#22c55e"],
    transition: { duration: 0.5 }
  },
  PRESENT: {
    backgroundColor: ["#4b5563", "#eab308"],
    transition: { duration: 0.5 }
  },
  ABSENT: {
    backgroundColor: ["#4b5563", "#6b7280"],
    transition: { duration: 0.5 }
  }
};


export const GAME_RULES = [
  'Guess the word.',
  'Each guess must be a valid word.',
  'After each guess, the color of the tiles will change:',
  '🟩 Green: Letter is correct and in right position',
  '🟨 Yellow: Letter is in the word but wrong position',
  '⬜ Empty: Letter is not in the word',
];

export const LANGUAGES = {
  en: 'English 🇬🇧',
  fr: 'Français 🇫🇷'
} as const;

// Add animations
export const MENU_ANIMATIONS = {
  CONTAINER: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  BUTTON: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  },
  LANGUAGE_BUTTON: {
    whileHover: { y: -2 },
    whileTap: { y: 0 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  }
};

// Add keyboard layout
export const KEYBOARD_LAYOUT = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace']
];

// Update keyboard layouts
export type KeyboardLayout = 'qwerty' | 'azerty';

export const KEYBOARD_LAYOUTS: Record<KeyboardLayout, string[][]> = {
  qwerty: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace']
  ],
  azerty: [
    ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
    ['Enter', 'w', 'x', 'c', 'v', 'b', 'n', 'Backspace']
  ]
};