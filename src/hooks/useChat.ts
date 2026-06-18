import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@/lib/db';

interface UseChatOptions {
  conversationId?: string;
  isAdmin?: boolean;
  adminId?: string;
}

interface UseChatReturn {
  messages: Message[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  isClosed: boolean;
  isManagerTyping: boolean;
  sendMessage: (body: string) => Promise<void>;
  createConversation: () => Promise<string>;
  resetConversation: () => void;
}

/**
 * Chat hook. Realtime is delivered over Server-Sent Events (self-hosted SSE +
 * Postgres LISTEN/NOTIFY); admin requests are authenticated by the NextAuth
 * session cookie (no Authorization header needed).
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { conversationId, isAdmin = false } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosed, setIsClosed] = useState(false);
  const [isManagerTyping, setIsManagerTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Open the SSE stream for a conversation.
  const initializeStream = useCallback(
    (convId: string) => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      const endpoint = isAdmin
        ? `/api/admin/chat/stream?conversation_id=${encodeURIComponent(convId)}`
        : `/api/chat/stream?conversation_id=${encodeURIComponent(convId)}`;

      const es = new EventSource(endpoint, { withCredentials: true });
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      es.onerror = () => {
        // EventSource auto-reconnects; reflect the transient disconnect.
        setIsConnected(false);
      };

      es.addEventListener('message', (e) => {
        try {
          const newMessage = JSON.parse(e.data) as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage],
          );
        } catch {
          // ignore malformed event
        }
      });

      es.addEventListener('conversation_closed', () => {
        setIsClosed(true);
      });

      es.addEventListener('manager_typing', (event) => {
        const e = event as MessageEvent;
        let isTyping = false;
        try {
          isTyping = Boolean(JSON.parse(e.data)?.isTyping);
        } catch {
          isTyping = false;
        }
        setIsManagerTyping(isTyping);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (isTyping) {
          typingTimeoutRef.current = setTimeout(() => setIsManagerTyping(false), 5000);
        }
      });
    },
    [isAdmin],
  );

  const loadMessages = useCallback(
    async (convId: string) => {
      try {
        setIsLoading(true);
        const endpoint = isAdmin
          ? `/api/admin/chat/messages/${convId}`
          : `/api/chat/conversation?id=${convId}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Failed to load messages');
        }
        const data = await response.json();
        setMessages(data.messages || []);
        setError(null);
      } catch (err) {
        console.error('Error loading messages:', err);
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    },
    [isAdmin],
  );

  const createConversation = useCallback(async (): Promise<string> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/chat/conversation', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
      const data = await response.json();
      return data.conversation_id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (body: string) => {
      if (!conversationId) {
        setError('No active conversation');
        return;
      }
      try {
        const endpoint = isAdmin ? '/api/admin/chat/send' : '/api/chat/send';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversation_id: conversationId, body: body.trim() }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to send message');
        }
        // The new message is echoed back via the SSE stream.
      } catch (err) {
        console.error('Error sending message:', err);
        setError(err instanceof Error ? err.message : 'Failed to send message');
        throw err;
      }
    },
    [conversationId, isAdmin],
  );

  // Initialize when conversation ID is available.
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
      initializeStream(conversationId);
    }
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, loadMessages, initializeStream]);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setIsClosed(false);
    setIsManagerTyping(false);
    setError(null);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, []);

  return {
    messages,
    isConnected,
    isLoading,
    error,
    isClosed,
    isManagerTyping,
    sendMessage,
    createConversation,
    resetConversation,
  };
}
