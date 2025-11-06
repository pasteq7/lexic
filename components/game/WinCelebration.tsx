// components/game/WinCelebration.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Language } from '@/lib/types/i18n';

interface WinCelebrationProps {
  isWon: boolean;
  streak: number;
  guesses: number;
  language: Language;
  onComplete?: () => void;
}

// Streak milestone messages
const getStreakMessage = (streak: number, language: Language): string | null => {
  const milestones: Record<number, { en: string; fr: string }> = {
    3: { en: "On Fire!", fr: "En feu!" },
    5: { en: "Unstoppable!", fr: "Inarrêtable!" },
    10: { en: "Legendary!", fr: "Légendaire!" },
    25: { en: "Master!", fr: "Maître!" },
    50: { en: "Champion!", fr: "Champion!" },
    100: { en: "Diamond Streak!", fr: "Série Diamant!" }
  };
  
  return milestones[streak]?.[language] || null;
};

// Performance messages based on guesses
const getPerformanceMessage = (guesses: number, language: Language): string => {
  const messages: Record<number, { en: string; fr: string }> = {
    1: { en: "Perfect!", fr: "Parfait!" },
    2: { en: "Amazing!", fr: "Incroyable!" },
    3: { en: "Great!", fr: "Excellent!" },
    4: { en: "Good job!", fr: "Bien joué!" },
    5: { en: "Nice!", fr: "Bien!" },
    6: { en: "Success!", fr: "Réussi!" }
  };
  
  return messages[guesses]?.[language] || messages[6][language];
};

export function WinCelebration({ 
  isWon, 
  streak, 
  guesses,
  language,
  onComplete 
}: WinCelebrationProps) {
  const [show, setShow] = useState(false);
  
  const performanceMessage = getPerformanceMessage(guesses, language);
  const streakMessage = getStreakMessage(streak, language);

  useEffect(() => {
    if (isWon) {
      setShow(true);
      
      // Haptic feedback on win
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 30, 100]);
      }
      
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 4000); // Celebration stays on screen for 4 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isWon, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.3, ease: 'easeOut' } }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <div className="bg-background/80 backdrop-blur-md border border-primary/20 rounded-xl px-6 py-4 shadow-xl text-center">
            <h3 className="text-2xl font-bold text-correct drop-shadow-lg">{performanceMessage}</h3>
            {streakMessage && (
              <motion.p 
                className="text-primary/90 mt-1 flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Flame className="w-5 h-5 text-orange-400" />
                {streakMessage}
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}