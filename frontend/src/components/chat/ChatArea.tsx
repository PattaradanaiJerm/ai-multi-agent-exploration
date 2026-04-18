'use client';
import Image from 'next/image';
import { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useChatStore } from '@/store/chat.store';
import { WelcomeScreen } from './WelcomeScreen';
import { AgentTimeline } from './AgentTimeline';
import { ReportView } from '@/components/report/ReportView';
import { AlertCircle } from 'lucide-react';

export function ChatArea() {
  const { messages, currentSessionId } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('chat');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) return <WelcomeScreen />;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className="animate-slide-up">
            {msg.type === 'user' ? (
              /* User bubble */
              <div className="flex items-start gap-3 justify-end">
                <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm
                  bg-gradient-to-br from-[var(--accent)] to-indigo-700
                  text-white text-sm leading-relaxed shadow-glow-sm">
                  {msg.query}
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden
                  bg-[var(--bg-card)] border border-[var(--border)]">
                  <Image src="/circle-avatar/me.png" alt="me" width={32} height={32} className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
              /* Exploration card */
              <div className="flex items-start gap-3">
                {/* AI avatar */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden
                  shadow-[0_0_12px_rgba(99,102,241,0.4)]">
                  <Image src="/circle-avatar/ai.png" alt="AI" width={32} height={32} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  {/* Error state */}
                  {msg.error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl
                      bg-red-500/10 border border-red-500/20 text-[var(--error)] text-sm">
                      <AlertCircle size={16} />
                      <span>{msg.error}</span>
                    </div>
                  )}

                  {/* Agent timeline */}
                  {(msg.events && msg.events.length > 0) && (
                    <AgentTimeline events={msg.events} isStreaming={msg.isStreaming ?? false} />
                  )}

                  {/* Streaming label when no events yet */}
                  {msg.isStreaming && (!msg.events || msg.events.length === 0) && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl
                      bg-[var(--bg-card)] border border-[var(--border)]">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] typing-dot" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] typing-dot" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] typing-dot" />
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">{t('thinking')}</span>
                    </div>
                  )}

                  {/* Final report */}
                  {msg.result && !msg.isStreaming && (
                    <ReportView result={msg.result} />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
