import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date for display with full month name
 * Example: "January 29, 2026"
 */
export function formatDate(date: Date | number | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date with time for display
 * Example: "January 29, 2026 at 3:40 PM"
 */
export function formatDateTime(date: Date | number | string): string {
  const d = new Date(date);
  const dateStr = d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateStr} at ${timeStr}`;
}

/**
 * Format a date as relative time with fallback to full date
 * Examples: "Today at 3:40 PM", "Yesterday at 10:00 AM", "January 25, 2026"
 */
export function formatRelativeDate(date: Date | number | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Check if same calendar day
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Today at ${timeStr}`;
  }

  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Yesterday at ${timeStr}`;
  }

  // Within the last week, show day name
  if (diffInDays < 7 && diffInDays > 0) {
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    return `${dayName} at ${timeStr}`;
  }

  // Otherwise show full date
  return formatDate(d);
}
