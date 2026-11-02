'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  targetDate: Date | string | number;
  onComplete?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const difference = targetDate.getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: false,
  };
}

const sizeClasses = {
  sm: {
    box: 'h-10 w-10 min-w-[2.5rem]',
    text: 'text-sm',
    label: 'text-[10px]',
    gap: 'gap-1.5',
    colon: 'text-sm',
  },
  md: {
    box: 'h-14 w-14 min-w-[3.5rem]',
    text: 'text-xl',
    label: 'text-xs',
    gap: 'gap-2.5',
    colon: 'text-xl',
  },
  lg: {
    box: 'h-20 w-20 min-w-[5rem]',
    text: 'text-3xl',
    label: 'text-sm',
    gap: 'gap-4',
    colon: 'text-3xl',
  },
};

interface TimeUnitProps {
  value: number;
  label: string;
  sizeClass: typeof sizeClasses[keyof typeof sizeClasses];
}

const TimeUnit: React.FC<TimeUnitProps> = ({ value, label, sizeClass }) => {
  const displayValue = String(value).padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          sizeClass.box,
          'flex items-center justify-center',
          'bg-[var(--color-darker)] rounded-lg',
          'border border-[var(--color-primary-gold)]/20'
        )}
      >
        <span
          className={cn(
            sizeClass.text,
            'font-display font-bold text-[var(--color-primary-gold)]'
          )}
        >
          {displayValue}
        </span>
      </div>
      {label && (
        <span className={cn(sizeClass.label, 'text-[var(--color-gold-dark)]/60 mt-1 uppercase tracking-wider font-medium')}>
          {label}
        </span>
      )}
    </div>
  );
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  onComplete,
  className,
  size = 'md',
  showLabels = true,
}) => {
  const target = new Date(targetDate);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(target));

  const tick = useCallback(() => {
    const updated = calculateTimeLeft(target);
    setTimeLeft(updated);
    if (updated.isExpired) {
      onComplete?.();
    }
  }, [target, onComplete]);

  useEffect(() => {
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [tick]);

  if (timeLeft.isExpired) {
    return (
      <div className={cn('text-center text-[var(--color-gold-dark)]/60', className)}>
        Sale ended
      </div>
    );
  }

  const s = sizeClasses[size];

  return (
    <div className={cn('flex items-center', s.gap, className)} role="timer" aria-label="Countdown timer">
      <TimeUnit value={timeLeft.days} label={showLabels ? 'Days' : ''} sizeClass={s} />

      <span className={cn(s.colon, 'font-display font-bold text-[var(--color-gold-dark)]/40 -mt-4')}>
        :
      </span>

      <TimeUnit value={timeLeft.hours} label={showLabels ? 'Hours' : ''} sizeClass={s} />

      <span className={cn(s.colon, 'font-display font-bold text-[var(--color-gold-dark)]/40 -mt-4')}>
        :
      </span>

      <TimeUnit value={timeLeft.minutes} label={showLabels ? 'Mins' : ''} sizeClass={s} />

      <span className={cn(s.colon, 'font-display font-bold text-[var(--color-gold-dark)]/40 -mt-4')}>
        :
      </span>

      <TimeUnit value={timeLeft.seconds} label={showLabels ? 'Secs' : ''} sizeClass={s} />
    </div>
  );
};

CountdownTimer.displayName = 'CountdownTimer';
