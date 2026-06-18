'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import ConversationList from '@/components/admin/ConversationList';
import ChatPanel from '@/components/admin/ChatPanel';
import styles from './chat.module.css';

interface Conversation {
  id: string;
  visitor_id: string;
  status: 'new' | 'active' | 'closed';
  assigned_agent_id: string | null;
  created_at: string;
  last_message_at: string;
  last_message?: {
    body: string;
    sender_type: string;
    created_at: string;
  } | null;
}

export default function AdminChatPage() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      // Admin API is authenticated by the NextAuth session cookie.
      const response = await fetch('/api/admin/chat/conversations');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to load conversations:', response.status, errorData);
        throw new Error(errorData.error || `Failed to load conversations (${response.status})`);
      }
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Middleware already guards /admin/*; this is a belt-and-suspenders redirect.
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/admin/login';
    }
  }, [status]);

  // Load conversations once authenticated, then poll every 30s.
  useEffect(() => {
    if (status !== 'authenticated') return;
    loadConversations();
    const interval = setInterval(loadConversations, 30000);
    return () => clearInterval(interval);
  }, [status, loadConversations]);

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
  };

  const handleCloseConversation = async (conversationId: string) => {
    try {
      const response = await fetch('/api/admin/chat/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to close conversation');
      }

      await loadConversations();
      if (activeConversation === conversationId) {
        setActiveConversation(null);
      }
    } catch (error) {
      console.error('Error closing conversation:', error);
      alert('Failed to close conversation');
    }
  };

  if (status === 'loading' || !session?.user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading...</p>
      </div>
    );
  }

  const user = session.user;

  return (
    <div className={styles.adminContainer}>
      <header className={styles.header}>
        <h1>Live Chat Dashboard</h1>
        <div className={styles.userInfo}>
          <span>{user.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </header>

      <div className={styles.mainContent}>
        <aside className={`${styles.sidebar} ${activeConversation ? styles.sidebarHidden : ''}`}>
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversation}
            onSelectConversation={handleSelectConversation}
            isLoading={isLoading}
            onRefresh={loadConversations}
          />
        </aside>

        <main className={styles.chatArea}>
          {activeConversation ? (
            <ChatPanel
              conversationId={activeConversation}
              adminId={user.id}
              onClose={() => setActiveConversation(null)}
              onCloseConversation={handleCloseConversation}
            />
          ) : (
            <div className={styles.emptyState}>
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <h2>No Conversation Selected</h2>
              <p>Select a conversation from the list to start chatting</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
