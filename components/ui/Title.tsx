'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type LetterState } from '@/lib/types/game';
import { getLetterStateClass } from '@/lib/game/words';

interface TitleCellProps {
  letter: string;
  state: LetterState;
  isActive?: boolean;
  delay?: number;
  size?: 'normal' | 'large';
}

function TitleCell({ 
  letter, 
  state, 
  isActive = false,
  delay = 0,
  size = 'large'
}: TitleCellProps) {
  const baseStyles = cn(
    "flex items-center justify-center",
    "border-2 rounded-none",
    "select-none",
    "transition-colors duration-300",
    "text-foreground",
    size === 'normal' 
      ? "w-14 h-14 text-2xl" 
      : "aspect-square w-16 sm:w-20 text-4xl sm:text-5xl",
    state === 'empty' && isActive && letter 
      ? 'border-primary shadow-sm' 
      : 'border-primary/30',
    getLetterStateClass(state as LetterState)
  );

  return (
    <motion.div 
      className={baseStyles}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: letter ? 1 : 0.95,
        opacity: 1,
        rotateX: state !== 'empty' ? [0, 90, 0] : 0,
      }}
      whileInView={{
        transform: "translateY(0px)",
      }}
      transition={{ 
        scale: {
          duration: 0.4,
          ease: "backOut"
        }
      }}
      style={{
        willChange: "transform",
        animation: `bounce 1.8s infinite ${delay * 0.2}s ease-in-out`
      }}
    >
      {letter.toUpperCase()}
    </motion.div>
  );
}

export function Title() {
  const letters = "LEXIC".split("");
  
  return (
    <>
      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
      
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut",
          delay: 0.2 
        }}
      >
        <div className="flex justify-center items-center gap-1.5 sm:gap-2 md:gap-3">
          {letters.map((letter, i) => (
            <TitleCell
              key={i}
              letter={letter}
              state="empty"
              isActive={true}
              delay={i}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
} 