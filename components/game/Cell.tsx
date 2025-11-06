import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ANIMATIONS } from '@/lib/utils/animations';
import { LetterState } from '@/lib/types/game';

interface CellProps {
  letter: string;
  state: LetterState;
  isActive?: boolean;
  delay?: number;
  size?: 'normal' | 'large';
}

const cellStateStyles = {
  correct: 'bg-correct text-foreground border-primary',
  present: 'bg-present text-foreground border-primary',
  absent: 'bg-transparent text-foreground border-primary',
  empty: 'bg-transparent border-primary/30'
} as const;

export function Cell({ 
  letter, 
  state, 
  isActive = false,
  delay = 0,
  size = 'normal'
}: CellProps) {
  const baseStyles = cn(
    "flex items-center justify-center",
    "font-bold",
    "border-2 rounded-md",
    "select-none",
    "transition-colors duration-300",
    "text-foreground",
    size === 'normal' ? "w-14 h-14 text-2xl" : "w-20 h-20 text-4xl",
    state === 'empty' && isActive && letter 
      ? 'border-primary shadow-sm' 
      : 'border-primary/30',
    cellStateStyles[state]
  );

  return (
    <motion.div 
      className={baseStyles}
      animate={{
        scale: letter ? 1 : 0.95,
        rotateX: state !== 'empty' ? ANIMATIONS.FLIP.rotateX : 0
      }}
      transition={{
        duration: ANIMATIONS.FLIP.duration,
        delay: state !== 'empty' ? delay * 0.1 : 0,
        ease: "easeInOut"
      }}
    >
      {letter.toUpperCase()}
    </motion.div>
  );
} 