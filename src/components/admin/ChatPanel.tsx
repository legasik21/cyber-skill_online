'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { Message } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import styles from './ChatPanel.module.css';

interface ChatPanelProps {
  conversationId: string;
  adminId: string;
  onClose: () => void;
  onCloseConversation: (conversationId: string) => void;
  onToggleAi: (conversationId: string, paused: boolean) => void;
}

export default function ChatPanel({
  conversationId,
  adminId,
  onClose,
  onCloseConversation,
  onToggleAi,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isConnected,
    isLoading,
    error,
    aiState,
    sendMessage,
  } = useChat({
    conversationId,
    isAdmin: true,
    adminId,
  });

  // Live AI-paused state: initialized from the conversation on load and kept current
  // by the `ai_state` SSE event (admin takeover/resume, off-topic cutoff, answer cap),
  // so the button reflects autonomous pauses and other admins' actions in real time.
  const aiPaused = aiState.paused;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    try {
      await sendMessage(inputValue);
      setInputValue('');
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleClose = () => {
    if (confirm('Are you sure you want to close this conversation?')) {
      onCloseConversation(conversationId);
    }
  };

  return (
    <div className={styles.chatPanel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <button onClick={onClose} className={styles.backButton} aria-label="Back to conversations">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h3>Conversation</h3>
          <div className={styles.statusIndicator}>
            <span className={`${styles.statusDot} ${isConnected ? styles.connected : ''}`} />
            <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={() => onToggleAi(conversationId, !aiPaused)}
            className={styles.closeConvButton}
            style={{
              background: aiPaused ? 'rgba(34, 197, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)',
              color: aiPaused ? '#4ade80' : '#7dd3fc',
              borderColor: aiPaused ? 'rgba(34, 197, 94, 0.4)' : 'rgba(56, 189, 248, 0.4)',
            }}
            title={
              aiPaused
                ? 'Resume the AI assistant for this conversation'
                : 'Stop the AI and take over this conversation manually'
            }
          >
            {aiPaused ? 'Resume AI' : 'Stop AI / Take over'}
          </button>
          <button onClick={handleClose} className={styles.closeConvButton}>
            Close Conversation
          </button>
          <button onClick={onClose} className={styles.minimizeButton} aria-label="Minimize">
            <span>Hide</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messagesContainer}>
        {isLoading && messages.length === 0 ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}

        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️ {error}</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form className={styles.inputContainer} onSubmit={handleSendMessage}>
        <input
          type="text"
          className={styles.messageInput}
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={!isConnected}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={!inputValue.trim() || !isConnected}
        >
          Send
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isAgent = message.sender_type === 'agent';
  const timeAgo = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
  });

  return (
    <div className={`${styles.messageBubble} ${isAgent ? styles.agentMessage : styles.visitorMessage}`}>
      <div className={styles.messageHeader}>
        <span className={styles.messageSender}>
          {isAgent ? 'You (Agent)' : 'Visitor'}
        </span>
        <span className={styles.messageTime}>{timeAgo}</span>
      </div>
      <div className={styles.messageBody}>{message.body}</div>
    </div>
  );
}
