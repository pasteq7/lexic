// components/game/WinCelebration.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Language } from '@/lib/types/i18n';
import { t } from '@/lib/i18n/translations';

interface WinCelebrationProps {
  isWon: boolean;
  streak: number;
  guesses: number;
  language: Language;
  onComplete?: () => void;
}

// Confetti particle component
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const randomX = Math.random() * 100 - 50;
  const randomRotation = Math.random() * 720 - 360;
  
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm"
      style={{ backgroundColor: color, top: '50%', left: '50%' }}
      initial={{ 
        opacity: 1, 
        scale: 0,
        x: 0,
        y: 0,
        rotate: 0
      }}
      animate={{
        opacity: [1, 1, 0],
        scale: [0, 1, 0.5],
        x: randomX * 10,
        y: [-100, -200, -300],
        rotate: randomRotation,
      }}
      transition={{
        duration: 2,
        delay: delay,
        ease: 'easeOut'
      }}
    />
  );
}

// Streak milestone messages
const getStreakMessage = (streak: number, language: Language): string | null => {
  const milestones: Record<number, { en: string; fr: string }> = {
    3: { en: "🔥 On Fire!", fr: "🔥 En feu!" },
    5: { en: "⚡ Unstoppable!", fr: "⚡ Inarrêtable!" },
    10: { en: "🌟 Legendary!", fr: "🌟 Légendaire!" },
    25: { en: "👑 Master!", fr: "👑 Maître!" },
    50: { en: "🏆 Champion!", fr: "🏆 Champion!" },
    100: { en: "💎 Diamond Streak!", fr: "💎 Série Diamant!" }
  };
  
  return milestones[streak]?.[language] || null;
};

// Performance messages based on guesses
const getPerformanceMessage = (guesses: number, language: Language): string => {
  const messages: Record<number, { en: string; fr: string }> = {
    1: { en: "🎯 Perfect! First try!", fr: "🎯 Parfait! Premier essai!" },
    2: { en: "🌟 Amazing!", fr: "🌟 Incroyable!" },
    3: { en: "⭐ Great!", fr: "⭐ Excellent!" },
    4: { en: "👍 Good job!", fr: "👍 Bien joué!" },
    5: { en: "✓ Nice!", fr: "✓ Bien!" },
    6: { en: "✓ Success!", fr: "✓ Réussi!" }
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
  const [showCelebration, setShowCelebration] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  
  const streakMessage = getStreakMessage(streak, language);
  const performanceMessage = getPerformanceMessage(guesses, language);
  const confettiColors = ['#22c55e', '#eab308', '#3b82f6', '#ec4899', '#8b5cf6'];

  useEffect(() => {
    if (isWon) {
      setShowCelebration(true);
      
      if (streakMessage) {
        setTimeout(() => setShowStreak(true), 1500);
      }
      
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
      
      const timer = setTimeout(() => {
        setShowCelebration(false);
        setShowStreak(false);
        onComplete?.();
      }, streakMessage ? 4000 : 2500);
      
      return () => clearTimeout(timer);
    }
  }, [isWon, streakMessage, onComplete]);

  return (
    <AnimatePresence>
      {showCelebration && (
        <>
          {/* Confetti Layer */}
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <ConfettiParticle
                key={i}
                delay={i * 0.05}
                color={confettiColors[i % confettiColors.length]}
              />
            ))}
          </div>

          {/* Performance Message */}
          <motion.div
            className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="bg-background/95 backdrop-blur-lg border-2 border-correct rounded-2xl px-8 py-6 shadow-2xl">
              <motion.div
                className="text-4xl font-bold text-correct text-center"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 0.5, 
                  repeat: 2,
                  repeatDelay: 0.3
                }}
              >
                {performanceMessage}
              </motion.div>
            </div>
          </motion.div>

          {/* Streak Milestone */}
          {showStreak && streakMessage && (
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ 
                scale: [0, 1.2, 1],
                opacity: 1,
                rotate: 0
              }}
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl px-12 py-8 shadow-2xl border-4 border-yellow-300">
                <motion.div
                  className="flex flex-col items-center gap-4"
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                >
                  <Flame className="w-16 h-16 drop-shadow-lg" />
                  <div className="text-5xl font-black text-center drop-shadow-lg">
                    {streakMessage}
                  </div>
                  <div className="text-2xl font-bold opacity-90">
                    {streak} {t('streak', language)}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}