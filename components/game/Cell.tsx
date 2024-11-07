import { motion } from 'framer-motion';
import { getLetterStateClass, type LetterState } from '@/lib/words';
import { cn } from '@/lib/utils';

interface CellProps {
  letter: string;
  state: LetterState;
  isActive?: boolean;
  delay?: number;
  size?: 'normal' | 'large';
}

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
    getLetterStateClass(state)
  );

  return (
    <motion.div 
      className={baseStyles}
      animate={{
        scale: letter ? 1 : 0.95,
        rotateX: state !== 'empty' ? [0, 90, 0] : 0
      }}
      transition={{
        duration: 0.3,
        delay: state !== 'empty' ? delay * 0.1 : 0,
        ease: "easeInOut"
      }}
    >
      {letter.toUpperCase()}
    </motion.div>
  );
} 