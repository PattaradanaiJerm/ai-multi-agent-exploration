'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('theme');
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  const isDark = theme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? t('light') : t('dark')}
      className="relative w-8 h-8 flex items-center justify-center rounded-lg
        text-[var(--text-secondary)] hover:text-[var(--accent)]
        hover:bg-[var(--accent-light)] transition-all duration-200"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
