'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useScrollAnimation } from './useScrollAnimation';

interface CountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  delay?: number;
  autoStart?: boolean;
}

interface CountUpResult {
  count: string;
  isAnimating: boolean;
  startAnimation: () => void;
  resetAnimation: () => void;
  ref: React.RefObject<HTMLElement | null>;
}

export function useCountUp(options: CountUpOptions): CountUpResult {
  const {
    start = 0,
    end,
    duration = 2000,
    decimals = 0,
    prefix = '',
    suffix = '',
    separator = ',',
    delay = 0,
    autoStart = true,
  } = options;

  const [count, setCount] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3, triggerOnce: true });

  const formatNumber = useCallback(
    (value: number): string => {
      const parts = value.toFixed(decimals).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
      return `${prefix}${parts.join(decimals > 0 ? '.' : '')}${suffix}`;
    },
    [decimals, prefix, suffix, separator]
  );

  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  const animate = useCallback(() => {
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }

    const elapsed = performance.now() - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);
    const currentValue = start + (end - start) * easedProgress;

    setCount(currentValue);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setCount(end);
      setIsAnimating(false);
    }
  }, [start, end, duration]);

  const startAnimation = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);
  }, [animate, isAnimating]);

  const resetAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setCount(start);
    setIsAnimating(false);
    startTimeRef.current = null;
  }, [start]);

  useEffect(() => {
    if (autoStart && isVisible) {
      if (delay > 0) {
        delayTimerRef.current = setTimeout(startAnimation, delay);
      } else {
        startAnimation();
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
    };
  }, [isVisible, autoStart, startAnimation, delay]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    count: formatNumber(count),
    isAnimating,
    startAnimation,
    resetAnimation,
    ref,
  };
}
