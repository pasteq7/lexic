// components/stats/DetailedStats.tsx
import React from 'react';
import { GameStats, GameMode } from '@/lib/types/game';
import { Language } from '@/lib/types/i18n';
import { t } from '@/lib/i18n/translations';
import { TRIES } from '@/lib/game/constants';
import { cn } from '@/lib/utils'; // Added missing import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DetailedStatsProps {
  allStats: Record<GameMode, GameStats>;
  language: Language;
}

interface StatItemProps {
  label: string;
  value: number | string;
}

const StatItem = ({ label, value }: StatItemProps) => (
  <div className="flex flex-col items-center justify-center p-2">
    <div className="text-2xl font-bold text-primary">{value}</div>
    <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
  </div>
);

const GuessDistributionBar = ({ count, total, isHighest }: { count: number; total: number; isHighest: boolean }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="flex items-center w-full group">
      <div 
        className={cn(
          "h-6 rounded-sm flex items-center justify-end pr-2 transition-all duration-500",
          isHighest ? 'bg-primary/90' : 'bg-muted/50 group-hover:bg-muted/80'
        )}
        style={{ width: `${Math.max(percentage, 5)}%` }}
      >
        <span className="text-sm font-medium text-background">{count}</span>
      </div>
    </div>
  );
};

const SingleModeStats = ({ stats, language }: { stats: GameStats; language: Language }) => {
  if (stats.gamesPlayed === 0) {
    return <p className="text-center text-muted-foreground py-8">{t('noActiveGame', language)}</p>;
  }

  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  const guessDistribution = stats.guessDistribution || {};
  const maxCount = Math.max(0, ...Object.values(guessDistribution));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatItem label={t('gamesPlayed', language)} value={stats.gamesPlayed} />
        <StatItem label={t('winRate', language)} value={`${winRate}%`} />
        <StatItem label={t('currentStreak', language)} value={stats.currentStreak} />
        <StatItem label={t('maxStreak', language)} value={stats.maxStreak} />
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center uppercase tracking-widest">
          {t('guessDistribution', language)}
        </h3>
        <div className="space-y-1.5">
          {Array.from({ length: TRIES }, (_, i) => i + 1).map(guess => (
            <div key={guess} className="flex items-center gap-3">
              <div className="w-4 text-sm font-bold text-muted-foreground">{guess}</div>
              <GuessDistributionBar 
                count={guessDistribution[guess] || 0} 
                total={stats.gamesWon} 
                isHighest={(guessDistribution[guess] || 0) === maxCount && maxCount > 0} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export function DetailedStats({ allStats, language }: DetailedStatsProps) {
  return (
    <Tabs defaultValue="infinite" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="infinite">{t('infinite', language)}</TabsTrigger>
        <TabsTrigger value="wordOfTheDay">{t('wordOfTheDay', language)}</TabsTrigger>
        <TabsTrigger value="todaysSet">{t('todaysSet', language)}</TabsTrigger>
      </TabsList>
      <TabsContent value="infinite" className="pt-4">
        <SingleModeStats stats={allStats.infinite} language={language} />
      </TabsContent>
      <TabsContent value="wordOfTheDay" className="pt-4">
        <SingleModeStats stats={allStats.wordOfTheDay} language={language} />
      </TabsContent>
      <TabsContent value="todaysSet" className="pt-4">
        <SingleModeStats stats={allStats.todaysSet} language={language} />
      </TabsContent>
    </Tabs>
  );
}