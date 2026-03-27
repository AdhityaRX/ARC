import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return "Previous 7 Days";
  return "Earlier";
}

export function groupByDate<T extends { createdAt: Date | string }>(
  items: T[]
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const date = typeof item.createdAt === "string" ? new Date(item.createdAt) : item.createdAt;
    const label = formatRelativeDate(date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }
  return groups;
}
