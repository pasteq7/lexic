'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Keyboard, Trash2, AlertCircle } from 'lucide-react';
import { KeyboardLayout } from '@/lib/utils';
import { useState } from 'react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Language, t } from '@/lib/translations';

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

  const handleClearClick = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    onClearStorage();
    setShowConfirm(false);
  };

  const handleCancelClear = () => {
    setShowConfirm(false);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-6 h-6 text-primary" />
            Settings
          </DialogTitle>
          <DialogDescription>
            {t('configureKeyboard', language)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Keyboard Layout</label>
            <p className="text-sm text-primary/50">
              Choose your preferred keyboard layout for typing.
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
            <AnimatePresence initial={false} mode="wait">
              {showConfirm ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: -300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ type: "spring", bounce: 0.2 }}
                  className="absolute w-full flex gap-2"
                >
                  <Button
                    onClick={handleClearClick}
                    variant="destructive"
                    className="flex-1"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Yes?
                  </Button>
                  <Button
                    onClick={handleCancelClear}
                    variant="secondary"
                    className="flex-1"
                  >
                    No
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="clear"
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 300 }}
                  transition={{ type: "spring", bounce: 0.2 }}
                  className="absolute w-full"
                >
                  <Button
                    onClick={handleClearClick}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Game Data
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