"use client";

import { PartyPopper, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FireworksBackground } from "@/components/animate-ui/components/backgrounds/fireworks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SuccessCelebrationProps {
  jobTitle: string;
  company: string;
  onClose: () => void;
  autoCloseDelay?: number;
}

export function SuccessCelebration({
  jobTitle,
  company,
  onClose,
  autoCloseDelay = 33_000,
}: SuccessCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Auto-close after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [autoCloseDelay, handleClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-100 flex items-center justify-center transition-opacity duration-300",
        isVisible && !isClosing ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Fireworks Background */}
      <FireworksBackground
        className="absolute inset-0"
        color={[
          "#ff6b6b",
          "#ffd93d",
          "#6bcb77",
          "#4d96ff",
          "#c56cf0",
          "#ff9ff3",
          "#00d2d3",
        ]}
        fireworkSize={{ min: 3, max: 6 }}
        particleSize={{ min: 2, max: 5 }}
        population={3}
      />

      {/* Clickable backdrop overlay for closing */}
      <button
        aria-label="Close celebration"
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
        type="button"
      />

      {/* Close button */}
      <Button
        className="absolute top-4 right-4 z-20 text-white hover:bg-white/20"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        size="icon"
        variant="ghost"
      >
        <X className="size-5" />
        <span className="sr-only">Close celebration</span>
      </Button>

      {/* Content Card */}
      <div
        aria-describedby="celebration-description"
        aria-labelledby="celebration-title"
        className={cn(
          "relative z-10 mx-4 max-w-md transform rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-2xl backdrop-blur-sm transition-all duration-500 dark:border-neutral-800 dark:bg-neutral-950",
          isVisible && !isClosing
            ? "translate-y-0 scale-100"
            : "translate-y-8 scale-95"
        )}
        role="dialog"
      >
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <PartyPopper className="size-16 text-neutral-900 dark:text-white" />
        </div>

        {/* Title */}
        <h2
          className="mb-2 font-bold text-3xl text-neutral-900 dark:text-white"
          id="celebration-title"
        >
          Congratulations!
        </h2>

        {/* Description */}
        <p
          className="mb-4 text-neutral-600 dark:text-neutral-400"
          id="celebration-description"
        >
          Your application has been submitted successfully
        </p>

        {/* Job Info */}
        <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="font-semibold text-lg text-neutral-900 dark:text-white">
            {jobTitle}
          </p>
          <p className="text-neutral-500 text-sm dark:text-neutral-400">
            {company}
          </p>
        </div>

        {/* Encouraging message */}
        <p className="text-neutral-500 text-sm dark:text-neutral-400">
          We wish you the best of luck! The hiring team will review your
          application soon.
        </p>

        {/* Progress bar for auto-close */}
        <div className="mt-6 h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-neutral-900 dark:bg-white"
            style={{
              animation: `shrink ${autoCloseDelay}ms linear forwards`,
            }}
          />
        </div>

        <style jsx>{`
          @keyframes shrink {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
