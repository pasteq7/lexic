// components/game/Cell.tsx - Enhanced version
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LetterState } from '@/lib/types/game';
import { Lock } from 'lucide-react';

interface CellProps {
  letter: string;
  state: LetterState;
  isActive?: boolean;
  delay?: number;
  size?: 'normal' | 'large';
  isLocked?: boolean; // NEW: For first letter protection
  isPulsing?: boolean; // NEW: For delete attempt feedback
}

const cellStateStyles = {
  correct: 'bg-correct text-foreground border-correct shadow-lg shadow-correct/20',
  present: 'bg-present text-foreground border-present shadow-lg shadow-present/20',
  absent: 'bg-transparent text-foreground border-primary',
  empty: 'bg-transparent border-primary/30'
} as const;

export function Cell({ 
  letter, 
  state, 
  isActive = false,
  delay = 0,
  size = 'normal',
  isLocked = false,
  isPulsing = false
}: CellProps) {
  const baseStyles = cn(
    "relative flex items-center justify-center",
    "font-bold",
    "border-2 rounded-md",
    "select-none",
    "transition-all duration-300",
    "text-foreground",
    size === 'normal' ? "w-14 h-14 text-2xl" : "w-20 h-20 text-4xl",
    state === 'empty' && isActive && letter 
      ? 'border-primary shadow-md scale-105' 
      : 'border-primary/30',
    cellStateStyles[state],
    isPulsing && 'animate-pulse'
  );

  // Bounce effect when letter is placed
  const placementAnimation = letter && state === 'empty' 
    ? { scale: [0.8, 1.1, 1], transition: { duration: 0.3, ease: 'easeOut' } }
    : {};

  // Flip animation for revealed states
  const revealAnimation = state !== 'empty' 
    ? {
        rotateX: [0, 90, 0],
        transition: {
          duration: 0.6,
          delay: delay * 0.1,
          ease: 'easeInOut'
        }
      }
    : {};

  return (
    <motion.div 
      className={baseStyles}
      animate={{
        ...placementAnimation,
        ...revealAnimation,
      }}
      whileHover={isActive ? { scale: 1.05 } : {}}
    >
      {/* Lock Icon for Protected First Letter */}
      {isLocked && (
        <motion.div
          className="absolute -top-1 -right-1 bg-primary/20 rounded-full p-0.5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
        >
          <Lock className="w-3 h-3 text-primary/60" />
        </motion.div>
      )}
      
      {/* Letter Display */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1 }}
      >
        {letter.toUpperCase()}
      </motion.span>

    </motion.div>
  );
}