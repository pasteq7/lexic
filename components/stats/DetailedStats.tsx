import { motion } from 'framer-motion';
import { GameStats } from '@/lib/types/game';
import { Language } from '@/lib/types/i18n';
import { t } from '@/lib/i18n/translations';
import { STATS_ANIMATIONS } from '@/lib/utils/animations';
import { TRIES } from '@/lib/game/constants';

interface DetailedStatsProps {
  stats: GameStats;
  language: Language;
}

interface StatItemProps {
  label: string;
  value: number | string;
  highlight?: boolean;
}

interface GuessDistribution {
  [key: string]: number;
  total: number;
}

const StatItem = ({ label, value, highlight = false }: StatItemProps) => (
  <motion.div 
    className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg"
    initial={STATS_ANIMATIONS.COUNT.initial}
    animate={STATS_ANIMATIONS.COUNT.animate}
    transition={STATS_ANIMATIONS.COUNT.transition}
  >
    <div className={`text-2xl font-bold ${highlight ? 'text-primary' : 'text-primary/80'}`}>
      {value}
    </div>
    <div className="text-sm text-muted-foreground mt-1">{label}</div>
  </motion.div>
);

const GuessDistributionBar = ({ count, total, isHighest }: { count: number; total: number; isHighest: boolean }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="flex items-center w-full">
      <div 
        className={`h-8 rounded flex items-center transition-all duration-500 ${
          isHighest ? 'bg-muted hover:bg-secondary' : 'bg-muted hover:bg-muted/20'
        }`}
        style={{ width: `${Math.max(percentage, count > 0 ? 10 : 5)}%` }}
      >
        <span className="px-2 text-sm font-medium">{count}</span>
      </div>
    </div>
  );
};

const GuessDistributionChart = ({ distribution, language }: { distribution: GuessDistribution; language: Language }) => {
  const maxCount = Math.max(...Object.values(distribution).filter(val => typeof val === 'number'));
  const maxAttempts = TRIES;
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        {t('guessDistribution', language)}
      </h3>
      {Array.from({ length: maxAttempts }, (_, i) => i + 1).map(guess => (
        <div key={guess} className="flex items-center gap-2">
          <div className="w-4 text-sm text-muted-foreground">{guess}</div>
          <GuessDistributionBar 
            count={distribution[guess] || 0} 
            total={distribution.total} 
            isHighest={(distribution[guess] || 0) === maxCount && maxCount > 0} 
          />
        </div>
      ))}
    </div>
  );
};

export function DetailedStats({ stats, language }: DetailedStatsProps) {
  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  const totalGuesses = Object.entries(stats.guessDistribution)
    .reduce((sum, [guesses, count]) => sum + (Number(guesses) * count), 0);
  const averageGuesses = stats.gamesWon > 0 ? (totalGuesses / stats.gamesWon).toFixed(1) : '0';

  const distribution: GuessDistribution = {
    total: stats.gamesWon,
    ...stats.guessDistribution
  };

  for (let i = 1; i <= 6; i++) {
    const key = i.toString();
    if (!(key in distribution)) {
      distribution[key] = 0;
    }
  }

  const lastPlayedDate = new Date(stats.lastPlayed).toLocaleDateString(
    language === 'fr' ? 'fr-FR' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  return (
    <div className="space-y-6 ">
      <div className="grid grid-cols-2 gap-4 ">
        <StatItem 
          label={t('gamesPlayed', language)} 
          value={stats.gamesPlayed} 
        />
        <StatItem 
          label={t('winRate', language)} 
          value={`${winRate}%`}
          highlight={winRate > 50}
        />
        <StatItem 
          label={t('currentStreak', language)} 
          value={stats.currentStreak}
          highlight={stats.currentStreak > 0}
        />
        <StatItem 
          label={t('maxStreak', language)} 
          value={stats.maxStreak}
          highlight={stats.maxStreak > 0}
        />
      </div>

      {stats.gamesPlayed > 0 && (
        <>
          <GuessDistributionChart distribution={distribution} language={language} />
          
          <div className="text-sm text-muted-foreground text-center">
            <p>{t('lastPlayed', language)}: {lastPlayedDate}</p>
            <p className="mt-1">
              {t('avgGuesses', language)}: {averageGuesses}
            </p>
          </div>
        </>
      )}
    </div>
  );
}