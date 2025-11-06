'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Cell } from '@/components/game/Cell'; // Ensure Cell component is imported
import { LetterState } from '@/lib/types/game'; // Import LetterState type

export function Title() {
  const [isRevealed, setIsRevealed] = useState(false);
  const letters = "LEXIC".split("");
  
  // A predefined pattern of states to create a visually appealing mosaic.
  const letterStates: LetterState[] = ['correct', 'absent', 'absent', 'absent', 'absent'];

  // Trigger the reveal animation shortly after the component mounts.
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, 300); // A slightly shorter delay feels snappier.
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        // This creates the beautiful cascading reveal effect.
        staggerChildren: 0.15, 
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 12,
      },
    },
  };

  return (
    <div className="relative h-32 flex items-center justify-center">
      <motion.div
        className="relative flex items-center gap-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {letters.map((letter, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ scale: 1.08, y: -6 }} // Enhanced hover effect
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Cell
              letter={letter} // Letter is always visible for the flip
              // The state will animate from 'empty' to its designated state in the array.
              state={isRevealed ? letterStates[i] : 'empty'}
              size="large"
              // The individual cell's flip animation is delayed by its position
              delay={i * 0.1} 
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}