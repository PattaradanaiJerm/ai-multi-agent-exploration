'use client';
import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useChatStore } from '@/store/chat.store';
import { ChatArea } from '@/components/chat/ChatArea';
import { ChatInput } from '@/components/chat/ChatInput';

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { selectSession, currentSessionId } = useChatStore();
  const loaded = useRef(false);

  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId && !loaded.current) {
      loaded.current = true;
      selectSession(sessionId);
    }
  }, [sessionId, currentSessionId, selectSession]);

  return (
    <>
      <ChatArea />
      <ChatInput />
    </>
  );
}
