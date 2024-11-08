'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Keyboard, Trash2, AlertCircle } from 'lucide-react';
import { KeyboardLayout } from '@/lib/types/keyboard';
import { useState } from 'react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Language } from '@/lib/types/i18n';
import { t } from '@/lib/i18n/translations';
import { clearAllGameData } from '@/lib/utils/storage';
import { useToast } from '@/hooks/use-toast';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onClearStorage: () => void;
  keyboardLayout: KeyboardLayout;
  onKeyboardLayoutChange: (layout: KeyboardLayout) => void;
  language: Language;
}

export function SettingsDialog({
  isOpen,
  onClose,
  onClearStorage,
  keyboardLayout,
  onKeyboardLayoutChange,
  language
}: SettingsDialogProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();

  const handleClearClick = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    
    try {
      clearAllGameData();
      onClearStorage();
      setShowConfirm(false);
      
      toast({
        title: t('clearData', language),
        description: t('dataCleared', language),
        variant: "default"
      });
    } catch {
      toast({
        title: t('error', language),
        description: t('failedToClear', language),
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-6 h-6 text-primary" />
            {t('settings', language)}
          </DialogTitle>
          <DialogDescription>
            {t('configureKeyboard', language)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t('keyboardLayout', language)}</label>
            <p className="text-sm text-primary/50">
              {t('chooseLayout', language)}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => onKeyboardLayoutChange('qwerty')}
                variant={keyboardLayout === 'qwerty' ? 'default' : 'outline'}
                className="flex-1"
              >
                <Keyboard className="w-4 h-4 mr-2" />
                QWERTY
              </Button>
              <Button
                onClick={() => onKeyboardLayoutChange('azerty')}
                variant={keyboardLayout === 'azerty' ? 'default' : 'outline'}
                className="flex-1"
              >
                <Keyboard className="w-4 h-4 mr-2" />
                AZERTY
              </Button>
            </div>
          </div>

          <div className="relative h-10">
            <AnimatePresence mode="wait">
              {showConfirm ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute w-full flex gap-2"
                >
                  <Button
                    onClick={handleClearClick}
                    variant="destructive"
                    className="flex-1"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {t('confirmDelete', language)}
                  </Button>
                  <Button
                    onClick={() => setShowConfirm(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    {t('cancel', language)}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="clear"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute w-full"
                >
                  <Button
                    onClick={handleClearClick}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('clearGameData', language)}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 