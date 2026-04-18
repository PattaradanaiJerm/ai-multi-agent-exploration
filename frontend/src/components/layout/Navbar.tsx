'use client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Sparkles } from 'lucide-react';

export function Navbar() {
  const t = useTranslations('app');
  return (
    <header className="flex items-center justify-between px-5 py-3
      border-b border-[var(--border)] bg-[var(--bg-primary)]/90
      backdrop-blur-xl z-20 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 flex-shrink-0">
          <Image
            src="/logo/logo.png"
            alt="logo"
            width={36}
            height={36}
            className="rounded-xl object-contain w-full h-full"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold gradient-text">AI Multi-Agent Market Exploration</span>
            <Sparkles size={11} className="text-[var(--accent)]" />
          </div>
          <p className="text-[10px] text-[var(--text-muted)] leading-none mt-0.5 hidden sm:block">
            {t('tagline')}
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
