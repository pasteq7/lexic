'use client';

import { motion } from 'framer-motion';
import { KeyboardLayout, MENU_ANIMATIONS } from '@/lib/utils';
import { Language } from '@/lib/translations';
import { Book, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LanguageFlag } from '@/components/ui/LanguageFlag';
import { Button } from "@/components/ui/button";
import { SettingsDialog } from '@/components/ui/SettingsDialog';
import { Title } from '@/components/ui/Title';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { t } from '@/lib/translations';

interface MainMenuProps {
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onStartGame: () => void;
  keyboardLayout: KeyboardLayout;
  onKeyboardLayoutChange: (layout: KeyboardLayout) => void;
}

export function MainMenu({ 
  selectedLanguage: initialLanguage, 
  onLanguageChange, 
  onStartGame, 
  keyboardLayout, 
  onKeyboardLayoutChange 
}: MainMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (initialLanguage !== language) {
      setLanguage(initialLanguage);
    }
    setMounted(true);
  }, [initialLanguage, language]);

  // Skip rendering language-dependent content until after hydration
  if (!mounted) {
    return (
      <motion.div
        {...MENU_ANIMATIONS.CONTAINER}
        className="fixed inset-0 bg-background flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative p-8 max-w-md w-full m-4 bg-background flex flex-col gap-12"
        >
          <Title />
          <div className="space-y-6">
            <motion.div {...MENU_ANIMATIONS.BUTTON}>
              <Button 
                variant="default" 
                size="lg"
                className="w-full py-8 text-xl hover:bg-accent hover:text-accent-foreground"
                disabled
              >
                Loading...
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'fr' : 'en';
    setLanguage(newLang);
    onLanguageChange(newLang);
  };

  const handleStartGame = () => {
    setLanguage(language);
    onStartGame();
  };

  const handleClearStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      setIsSettingsOpen(false);
      window.location.reload();
    }
  };

  return (
    <motion.div
      {...MENU_ANIMATIONS.CONTAINER}
      className="fixed inset-0 flex items-center justify-center z-30"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="px-4 sm:px-8 py-8 max-w-md w-full mx-auto flex flex-col gap-8 justify-center"
      >
        <Title />
        
        <motion.div {...MENU_ANIMATIONS.BUTTON}>
          <Button 
            variant="default" 
            size="lg"
            className="w-full py-6 sm:py-8 text-xl"
            onClick={handleStartGame}
          >
            {t('startGame', language)}
          </Button>
        </motion.div>

        <div className="flex justify-center gap-3 sm:gap-4">
          {mounted && (
            <motion.div {...MENU_ANIMATIONS.LANGUAGE_BUTTON}>
              <Button
                variant="default"
                size="icon"
                className="h-14 w-14 sm:h-16 sm:w-16 p-2"
                onClick={toggleLanguage}
                aria-label={`Switch to ${language === 'en' ? 'French' : 'English'}`}
              >
                <LanguageFlag language={language} />
              </Button>
            </motion.div>
          )}

          <motion.div {...MENU_ANIMATIONS.LANGUAGE_BUTTON}>
            <Button
              variant="default"
              size="icon"
              className="h-14 w-14 sm:h-16 sm:w-16 p-2"
              onClick={() => setShowHelp(true)}
            >
              <Book size={24} />
            </Button>
          </motion.div>

          <motion.div {...MENU_ANIMATIONS.LANGUAGE_BUTTON}>
            <Button
              variant="default"
              size="icon"
              className="h-14 w-14 sm:h-16 sm:w-16 p-2"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings size={24} />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <Dialog open={showHelp} onOpenChange={() => setShowHelp(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl mb-4">{t('howToPlay', language)}</DialogTitle>
            <DialogDescription className="space-y-4 text-primary leading-relaxed">
              {t('gameRules', language).split('\n').map((rule, index) => (
                <p key={index} className="flex items-start gap-2">
                  {rule.startsWith('🟩') || rule.startsWith('🟨') || rule.startsWith('⬜') ? (
                    <span className="whitespace-pre-wrap">{rule}</span>
                  ) : (
                    <span>{rule}</span>
                  )}
                </p>
              ))}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearStorage={handleClearStorage}
        keyboardLayout={keyboardLayout}
        onKeyboardLayoutChange={onKeyboardLayoutChange}
        language={language}
      />
    </motion.div>
  );
} 