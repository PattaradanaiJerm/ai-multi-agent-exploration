'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'th', label: 'ภาษาไทย', flag: '🇹🇭' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const switchTo = (code: string) => {
    setOpen(false);
    if (code === locale) return;
    const segments = pathname.split('/');
    segments[1] = code;
    router.push(segments.join('/'));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
          text-[var(--text-secondary)] hover:text-[var(--text-primary)]
          hover:bg-[var(--bg-secondary)] border border-[var(--border)]
          transition-all duration-200 select-none"
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span className="font-semibold tracking-wide">{current.code.toUpperCase()}</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-44 rounded-xl overflow-hidden
            border border-[var(--border)] bg-[var(--bg-card)] shadow-xl z-50 animate-fade-in"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.22)' }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchTo(lang.code)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left
                hover:bg-[var(--accent-light)] transition-colors duration-150"
            >
              <span className="text-base leading-none">{lang.flag}</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-[var(--text-primary)]">{lang.label}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{lang.code.toUpperCase()}</p>
              </div>
              {locale === lang.code && (
                <Check size={12} className="text-[var(--accent)] flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
