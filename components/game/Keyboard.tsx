'use client';

import { motion } from 'framer-motion';
import {KEYBOARD_LAYOUTS, type KeyState, type KeyboardLayout } from '@/lib/utils';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  keyStates: Record<string, KeyState>;
  keyboardLayout: KeyboardLayout;
}

export function Keyboard({ onKeyPress, keyStates, keyboardLayout }: KeyboardProps) {
  const handleClick = (key: string) => {
    // Prevent default to avoid double triggers
    onKeyPress(key);
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-[var(--game-max-width)] mx-auto p-2">
        {KEYBOARD_LAYOUTS[keyboardLayout].map((row, i) => (
          <div key={i} className="flex justify-center gap-1 my-1">
            {row.map((key) => {
              const state = keyStates[key.toLowerCase()] || 'unused';
              const isSpecialKey = key === 'Enter' || key === 'Backspace';
              
              return (
                <motion.button
                  key={key}
                  onClick={() => handleClick(key)}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    ${isSpecialKey ? 'px-2 text-sm' : 'w-[2.2rem] sm:w-10'} 
                    h-11 sm:h-14 
                    rounded-lg
                    font-bold 
                    select-none
                    transition-all
                    shadow-sm
                    ${getKeyboardButtonStyle(state)}
                  `}
                >
                  {key === 'Backspace' ? '←' : key}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function getKeyboardButtonStyle(state: KeyState): string {
  switch (state) {
    case 'correct':
      return 'bg-[hsl(var(--correct))] text-white';
    case 'present':
      return 'bg-[hsl(var(--present))] text-white';
    case 'absent':
      return 'bg-primary/10 text-white';
    default:
      return 'bg-primary/30 hover:bg-primary/20 text-primary';
  }
} 