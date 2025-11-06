import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Keep this for shadcn/ui components
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}