import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractInviteCode(url: string) {
  const regex = /\/invite\/([a-f0-9-]{36})/i;
  const match = url.match(regex);
  return match ? match[1] : url;
}
