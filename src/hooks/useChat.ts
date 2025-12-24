import { useState, useEffect, useCallback, useRef } from 'react';
import * as Ably from 'ably';
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
  sendMessage: (body: string) => Promise<void>;
  createConversation: () => Promise<string>;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { conversationId, isAdmin = false, adminId } = options;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const ablyClientRef = useRef<Ably.Realtime | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  // Initialize Ably connection
  const initializeAbly = useCallback(async (convId: string) => {
    try {
      // Get Ably token from server
      const response = await fetch('/api/chat/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: convId,
          is_admin: isAdmin,
          admin_id: adminId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get Ably token');
      }

      const { token } = await response.json();

      // Create Ably client
      const client = new Ably.Realtime({
        token,
        autoConnect: true,
        disconnectedRetryTimeout: 3000,
      });

      ablyClientRef.current = client;

      // Handle connection state
      client.connection.on('connected', () => {
        setIsConnected(true);
        setError(null);
      });

      client.connection.on('disconnected', () => {
        setIsConnected(false);
      });

      client.connection.on('failed', () => {
        setIsConnected(false);
        setError('Connection failed');
      });

      // Subscribe to conversation channel
      const channel = client.channels.get(`chat:${convId}`);
      channelRef.current = channel;

      channel.subscribe('message', (message: Ably.InboundMessage) => {
        const newMessage = message.data as Message;
        setMessages(prev => {
          // Avoid duplicates
          const exists = prev.some(m => m.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      });

    } catch (err) {
      console.error('Error initializing Ably:', err);
      setError(err instanceof Error ? err.message : 'Connection error');
    }
  }, [isAdmin, adminId]);

  // Load existing messages
  const loadMessages = useCallback(async (convId: string) => {
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
      const msgs = isAdmin ? data.messages : data.messages;
      
      setMessages(msgs || []);
      setError(null);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  // Create new conversation
  const createConversation = useCallback(async (): Promise<string> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/chat/conversation', {
        method: 'POST',
      });

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

  // Send message
  const sendMessage = useCallback(async (body: string) => {
    if (!conversationId) {
      setError('No active conversation');
      return;
    }

    try {
      const endpoint = isAdmin
        ? '/api/admin/chat/send'
        : '/api/chat/send';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          body: body.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }

      // Message will be received via Ably subscription
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  }, [conversationId, isAdmin]);

  // Initialize when conversation ID is available
  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
      initializeAbly(conversationId);
    }

    return () => {
      // Cleanup
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      if (ablyClientRef.current) {
        ablyClientRef.current.close();
      }
    };
  }, [conversationId, loadMessages, initializeAbly]);

  return {
    messages,
    isConnected,
    isLoading,
    error,
    sendMessage,
    createConversation,
  };
}
