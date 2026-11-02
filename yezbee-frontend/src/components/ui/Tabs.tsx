'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'underlined' | 'pills' | 'gold';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  tabClassName?: string;
  contentClassName?: string;
  renderContent?: (tabId: string) => React.ReactNode;
  children?: React.ReactNode;
}

const variantStyles = {
  underlined: {
    container: 'border-b border-[var(--color-champagne)]',
    tab: (isActive: boolean) =>
      cn(
        'pb-3 border-b-2 border-transparent -mb-px',
        'text-sm font-medium transition-colors duration-200',
        isActive
          ? 'border-[var(--color-primary-gold)] text-[var(--color-dark)]'
          : 'text-[var(--color-gold-dark)]/60 hover:text-[var(--color-dark)] hover:border-[var(--color-champagne)]'
      ),
    indicator: 'bg-[var(--color-primary-gold)]',
    content: 'pt-4',
  },
  pills: {
    container: 'bg-[var(--color-champagne)] p-1 rounded-xl gap-0',
    tab: (isActive: boolean) =>
      cn(
        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-[var(--color-warm-white)] text-[var(--color-dark)] shadow-sm'
          : 'text-[var(--color-gold-dark)]/60 hover:text-[var(--color-dark)]'
      ),
    indicator: 'bg-[var(--color-warm-white)]',
    content: 'pt-4',
  },
  gold: {
    container: 'border border-[var(--color-primary-gold)]/20 rounded-xl p-1 bg-gradient-to-r from-[var(--color-warm-white)] to-[var(--color-cream)]',
    tab: (isActive: boolean) =>
      cn(
        'px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
        isActive
          ? 'gold-gradient-bg text-[var(--color-darker)] shadow-[var(--shadow-luxury)]'
          : 'text-[var(--color-gold-dark)]/60 hover:text-[var(--color-dark)]'
      ),
    indicator: 'bg-[var(--color-primary-gold)]',
    content: 'pt-4',
  },
};

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab: externalActiveTab,
  onChange,
  variant = 'underlined',
  orientation = 'horizontal',
  className,
  tabClassName,
  contentClassName,
  renderContent,
  children,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id || '');
  const activeTabId = externalActiveTab ?? internalActiveTab;
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIdx = tabs.findIndex((t) => t.id === activeTabId);

  const handleTabClick = (tabId: string) => {
    if (!externalActiveTab) {
      setInternalActiveTab(tabId);
    }
    onChange?.(tabId);
  };

  useEffect(() => {
    const activeEl = tabsRef.current[activeIdx];
    if (activeEl && variant === 'underlined') {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeIdx, variant]);

  const styles = variantStyles[variant];

  return (
    <div className={cn(orientation === 'vertical' ? 'flex gap-4' : '', className)}>
      <div
        className={cn(
          'relative flex',
          orientation === 'vertical' ? 'flex-col' : '',
          styles.container
        )}
        role="tablist"
        aria-orientation={orientation}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => { tabsRef.current[index] = el; }}
            role="tab"
            aria-selected={activeTabId === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={activeTabId === tab.id ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && handleTabClick(tab.id)}
            className={cn(
              'flex items-center gap-2 whitespace-nowrap',
              tab.disabled && 'opacity-40 cursor-not-allowed',
              styles.tab(activeTabId === tab.id),
              tabClassName
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}

        {variant === 'underlined' && indicatorStyle.width > 0 && (
          <motion.div
            className={cn('absolute bottom-0 h-0.5', styles.indicator)}
            layoutId="tab-indicator"
            animate={indicatorStyle}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
      </div>

      <div
        id={`tabpanel-${activeTabId}`}
        role="tabpanel"
        aria-labelledby={activeTabId}
        className={cn(styles.content, contentClassName)}
      >
        {children || renderContent?.(activeTabId)}
      </div>
    </div>
  );
};

Tabs.displayName = 'Tabs';
