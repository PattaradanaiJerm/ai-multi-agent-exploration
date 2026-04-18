'use client';
import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useChatStore } from '@/store/chat.store';
import { useModelStore } from '@/store/model.store';
import { Send, Loader2, Mic, MicOff, Cpu, Check, ChevronDown } from 'lucide-react';

const MODELS = [
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Fast · Cost-efficient', color: '#34d399' },
  { id: 'gpt-4o',      label: 'GPT-4o',      desc: 'Most capable OpenAI',  color: '#22d3ee' },
];

export function ChatInput() {
  const [value, setValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const { submitQuery, isStreaming } = useChatStore();
  const { selectedModel, setModel } = useModelStore();
  const t = useTranslations('chat');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const router = useRouter();
  const locale = useLocale();

  const currentModel = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) setShowModel(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = async () => {
    const q = value.trim();
    if (!q || isStreaming) return;
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await submitQuery(q, (sessionId) => {
      router.push(`/${locale}/session/${sessionId}`);
    });
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('voiceNotSupported'));
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = locale === 'th' ? 'th-TH' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setValue((prev) => prev ? prev + ' ' + transcript : transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <div className="flex-shrink-0 sticky bottom-0 px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-primary)] z-10">
      <div className="max-w-3xl mx-auto">
        {/* Main input box */}
        <div className={`flex items-end gap-2 px-3 py-2.5 rounded-2xl border
          bg-[var(--bg-card)] transition-all duration-200
          ${isStreaming
            ? 'border-[var(--accent)]/50 shadow-glow-sm'
            : 'border-[var(--border)] hover:border-[var(--accent)]/30'
          }`}>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            onInput={handleInput}
            placeholder={isListening ? t('voiceListening') : t('placeholder')}
            disabled={isStreaming}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-[var(--text-primary)]
              placeholder:text-[var(--text-muted)] outline-none leading-relaxed
              disabled:opacity-60"
            style={{ minHeight: '24px', maxHeight: '160px' }}
          />

          {/* Mic button */}
          <button
            onClick={toggleVoice}
            disabled={isStreaming}
            className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
              transition-all duration-150 disabled:opacity-40
              ${isListening
                ? 'bg-red-500/20 text-red-400 animate-pulse'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
            title={t('voiceInput')}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || isStreaming}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
              bg-gradient-to-br from-[var(--accent)] to-indigo-700
              text-white shadow-glow-sm
              hover:opacity-90 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
              transition-all duration-200"
          >
            {isStreaming
              ? <Loader2 size={16} className="animate-spin" />
              : <Send size={15} />}
          </button>
        </div>

        {/* Bottom toolbar: Model selector + hint */}
        <div className="flex items-center justify-between mt-1.5 px-1">
          {/* Inline model selector */}
          <div ref={modelRef} className="relative">
            <button
              onClick={() => setShowModel((o) => !o)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                bg-[var(--bg-secondary)] border border-[var(--border)]
                hover:border-[var(--accent)]/50 hover:bg-[var(--bg-card)]
                transition-all duration-150"
            >
              <Cpu size={11} style={{ color: currentModel.color }} />
              <span className="text-[11px] font-semibold text-[var(--text-secondary)]">{currentModel.label}</span>
              <ChevronDown size={10} className={`text-[var(--text-muted)] transition-transform duration-200 ${showModel ? 'rotate-180' : ''}`} />
            </button>

            {showModel && (
              <div className="absolute bottom-9 left-0 z-50 w-52 rounded-xl
                border border-[var(--border)] bg-[var(--bg-card)]
                shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden">
                <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    {t('model')}
                  </p>
                </div>
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setModel(m.id); setShowModel(false); }}
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

          {/* Keyboard hint */}
          <p className="text-[10px] text-[var(--text-muted)]">
            <kbd className="px-1 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border)] font-mono text-[9px]">Enter</kbd>
            {' '}to explore ·{' '}
            <kbd className="px-1 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border)] font-mono text-[9px]">Shift+Enter</kbd>
            {' '}new line
          </p>
        </div>
      </div>
    </div>
  );
}
