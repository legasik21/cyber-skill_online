'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { Message } from '@/lib/db';
import styles from './ChatWidget.module.css';
import { formatDistanceToNow } from 'date-fns';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isConnected,
    isLoading,
    error,
    sendMessage,
    createConversation,
  } = useChat({ conversationId });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation when widget opens
  useEffect(() => {
    if (isOpen && !conversationId) {
      handleInitialize();
    }
  }, [isOpen, conversationId]);

  const handleInitialize = async () => {
    try {
      const convId = await createConversation();
      setConversationId(convId);
    } catch (err) {
      console.error('Failed to initialize chat:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !conversationId) return;

    try {
      await sendMessage(inputValue);
      setInputValue('');
    } catch (err) {
      // Error already handled in hook
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.chatWidget}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          className={styles.toggleButton}
          onClick={toggleChat}
          aria-label="Open chat"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className={styles.badge}>Chat</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerTitle}>
              <h3>Live Support</h3>
              <div className={styles.statusIndicator}>
                <span
                  className={`${styles.statusDot} ${
                    isConnected ? styles.connected : styles.disconnected
                  }`}
                />
                <span className={styles.statusText}>
                  {isConnected ? 'Online' : 'Connecting...'}
                </span>
              </div>
            </div>
            <button
              className={styles.closeButton}
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className={styles.messagesContainer}>
            {isLoading && messages.length === 0 ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p>Loading chat...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className={styles.emptyState}>
                <p>👋 Welcome! How can we help you today?</p>
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

            {!isConnected && messages.length > 0 && (
              <div className={styles.offlineNotice}>
                <span>Reconnecting...</span>
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
              disabled={!isConnected || !conversationId}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!inputValue.trim() || !isConnected || !conversationId}
              aria-label="Send message"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isVisitor = message.sender_type === 'visitor';
  const timeAgo = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
  });

  return (
    <div
      className={`${styles.messageBubble} ${
        isVisitor ? styles.visitorMessage : styles.agentMessage
      }`}
    >
      <div className={styles.messageHeader}>
        <span className={styles.messageSender}>
          {isVisitor ? 'You' : 'Support'}
        </span>
        <span className={styles.messageTime}>{timeAgo}</span>
      </div>
      <div className={styles.messageBody}>{message.body}</div>
    </div>
  );
}
