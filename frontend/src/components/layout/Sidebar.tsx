'use client';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Plus, MessageSquare, Trash2, ChevronRight, Loader2, History } from 'lucide-react';
import { useChatStore } from '@/store/chat.store';
import { AgentStatusPanel } from '@/components/ui/AgentStatusPanel';

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function Sidebar() {
  const t = useTranslations('nav');
  const router = useRouter();
  const locale = useLocale();
  const { sessions, currentSessionId, isLoadingSessions, loadSessions, startNewSession, removeSession } =
    useChatStore();

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const handleNewSession = () => {
    startNewSession(() => router.push(`/${locale}`));
  };

  const handleSelectSession = (id: string) => {
    router.push(`/${locale}/session/${id}`);
  };

  const handleRemoveSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await removeSession(id, () => router.push(`/${locale}`));
  };

  return (
    <aside className="flex flex-col w-64 h-full bg-[var(--bg-sidebar)]
      border-r border-[var(--border)] flex-shrink-0 overflow-hidden">
      {/* New exploration button */}
      <div className="p-3 flex-shrink-0">
        <button
          onClick={handleNewSession}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
            bg-gradient-to-r from-[var(--accent)] to-indigo-600
            text-white text-sm font-semibold
            hover:opacity-90 active:scale-[0.98]
            shadow-[0_0_20px_rgba(99,102,241,0.35)]
            transition-all duration-200"
        >
          <Plus size={16} />
          <span>{t('newChat')}</span>
        </button>
      </div>

      {/* Agent Status Panel */}
      <AgentStatusPanel />

      {/* Session history label */}
      <div className="px-3 pb-2 flex items-center gap-1.5 flex-shrink-0">
        <History size={10} className="text-[var(--text-muted)]" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          {t('sessions')}
        </p>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {isLoadingSessions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="text-[var(--text-muted)] animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare size={24} className="mx-auto text-[var(--text-muted)] mb-2 opacity-50" />
            <p className="text-xs text-[var(--text-muted)]">{t('noSessions')}</p>
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === currentSessionId;
            return (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`group relative flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer
                  transition-all duration-150
                  ${isActive
                    ? 'bg-[var(--accent-light)] border border-[var(--accent)]/30'
                    : 'hover:bg-[var(--bg-card)] border border-transparent'
                  }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-[var(--accent)]" />
                )}

                <MessageSquare
                  size={14}
                  className={`mt-0.5 flex-shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}
                />

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate leading-tight
                    ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {session.title || session.explorations?.[0]?.query || 'New Exploration'}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {timeAgo(session.updatedAt)}
                    {session._count && session._count.explorations > 0 &&
                      ` · ${session._count.explorations} report${session._count.explorations > 1 ? 's' : ''}`}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleRemoveSession(e, session.id)}
                  className="flex-shrink-0 p-1 rounded-md opacity-0 group-hover:opacity-100
                    text-[var(--text-muted)] hover:text-[var(--error)]
                    hover:bg-red-500/10 transition-all duration-150"
                >
                  <Trash2 size={12} />
                </button>

                {isActive && <ChevronRight size={12} className="flex-shrink-0 text-[var(--accent)] mt-0.5" />}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
