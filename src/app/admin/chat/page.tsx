'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/db';
import ConversationList from '@/components/admin/ConversationList';
import ChatPanel from '@/components/admin/ChatPanel';
import styles from './chat.module.css';

interface Conversation {
  id: string;
  visitor_id: string;
  status: 'active' | 'closed';
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
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    const supabase = createSupabaseClient();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        // Redirect to login
        window.location.href = '/admin/login';
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load conversations
  useEffect(() => {
    if (!user) return;

    loadConversations();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadConversations, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/chat/conversations');
      
      if (!response.ok) {
        throw new Error('Failed to load conversations');
      }

      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

      // Refresh conversations
      await loadConversations();
      
      // Close panel if this conversation was active
      if (activeConversation === conversationId) {
        setActiveConversation(null);
      }
    } catch (error) {
      console.error('Error closing conversation:', error);
      alert('Failed to close conversation');
    }
  };

  if (!user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <header className={styles.header}>
        <h1>Live Chat Dashboard</h1>
        <div className={styles.userInfo}>
          <span>{user.email}</span>
          <button
            onClick={async () => {
              const supabase = createSupabaseClient();
              await supabase.auth.signOut();
              window.location.href = '/admin/login';
            }}
            className={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </header>

      <div className={styles.mainContent}>
        <aside className={styles.sidebar}>
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
