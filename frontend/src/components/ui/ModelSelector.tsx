'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Cpu, Check } from 'lucide-react';
import { useModelStore } from '@/store/model.store';

const MODELS = [
  {
    id: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    desc: 'Fast · Cost-efficient',
    color: '#34d399',
  },
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    desc: 'Most capable OpenAI',
    color: '#22d3ee',
  },
];

export function ModelSelector() {
  const { selectedModel, setModel } = useModelStore();
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);

  const current = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.closest('[data-model-selector]')?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
        zIndex: 9999,
      });
    }
    setOpen((o) => !o);
  };

  return (
    <div data-model-selector="true">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
          bg-[var(--bg-secondary)] border border-[var(--border)]
          hover:border-[var(--accent)]/40 hover:bg-[var(--bg-card)]
          transition-all duration-150 text-xs font-medium text-[var(--text-secondary)]"
      >
        <Cpu size={11} style={{ color: current.color }} />
        <span>{current.label}</span>
        <ChevronDown
          size={11}
          className={`text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          style={dropdownStyle}
          className="w-56 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]
            shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              AI Model
            </p>
          </div>
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => { setModel(m.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5
                hover:bg-[var(--accent-light)] transition-colors duration-100 text-left"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: m.color, boxShadow: `0 0 6px ${m.color}60` }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--text-primary)]">{m.label}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{m.desc}</p>
              </div>
              {selectedModel === m.id && (
                <Check size={12} className="flex-shrink-0 text-[var(--accent)]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
