'use client';

import { Button } from "@/components/ui/button"
import { Home } from 'lucide-react';

interface HomeButtonProps {
  onClick: () => void;
}

export function HomeButton({ onClick }: HomeButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="mb-6"
    >
      <Home className="mr-2 h-4 w-4" />
      Home
    </Button>
  );
} 