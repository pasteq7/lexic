'use client';

import { motion } from 'framer-motion';
import { KeyboardLayout, KEYBOARD_LAYOUTS, KeyState } from '@/lib/types/keyboard';
import { KEYBOARD_ANIMATIONS } from '@/lib/utils/animations';

interface KeyboardProps {
  keyStates: Record<string, KeyState>;
  onKey: (key: string) => void;
  keyboardLayout: KeyboardLayout;
  isSubmitting: boolean;
  isUppercase?: boolean;
}

export default function Keyboard({
  keyStates,
  onKey,
  keyboardLayout,
  isSubmitting,
  isUppercase = true
}: KeyboardProps) {
  const stateStyles = {
    correct: 'bg-correct/100 hover:bg-correct/80 text-white ',
    present: 'bg-present/100 hover:bg-present/80 text-white',
    absent: 'bg-primary/10 hover:bg-primary/30 text-primary/60',
    unused: 'bg-primary/5 hover:bg-primary/30 text-white border border-white/50'
  } as const;

  return (
    <div className="w-full max-w-[500px] mx-auto px-2">
      {KEYBOARD_LAYOUTS[keyboardLayout].map((row, i) => (
        <div key={i} className="flex justify-center gap-1 my-1">
          {row.map((keyObj) => {
            const keyLabel = isUppercase ? keyObj.key.toUpperCase() : keyObj.key.toLowerCase();
            const state = (keyStates[keyObj.key.toLowerCase()] || 'unused') as keyof typeof stateStyles;
            const isSpecialKey = keyObj.key === 'Enter' || keyObj.key === 'Backspace';

            return (
              <motion.button
                key={keyObj.key}
                onClick={() => onKey(keyObj.key)}
                whileTap={KEYBOARD_ANIMATIONS.PRESS}
                className={`
                  rounded-lg
                  font-bold 
                  select-none
                  transition-all
                  shadow-sm
                  ${stateStyles[state]}
                  ${isSpecialKey ? 'px-2 text-sm' : 'w-[2.2rem] sm:w-10'} 
                  h-11 sm:h-14 
                `}
                disabled={isSubmitting}
              >
                {keyObj.key === 'Backspace' ? '←' : keyLabel}
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
