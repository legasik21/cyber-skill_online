'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useChat } from '@/hooks/useChat';
import { Message } from '@/lib/db';
import styles from './ChatWidget.module.css';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

// Google Ads SECONDARY conversion — "Chat started" (a public client-side value).
const CHAT_STARTED_CONVERSION = 'AW-17868439825/VkOICPD4xcIcEJGCq8hC';
const CHAT_STARTED_FLAG = 'cs-chat-started-fired';
// Backstop guard so the conversion fires at most once per page load even when
// sessionStorage is unavailable (e.g. private mode).
let chatStartedFiredThisLoad = false;

// Fire the "Chat started" secondary conversion exactly once per browsing session,
// on the visitor's first sent message. sessionStorage makes it survive refreshes
// and new conversation ids; window.gtag is loaded in the root layout. No PII is sent.
function fireChatStartedConversion() {
  if (typeof window === 'undefined') return;
  if (chatStartedFiredThisLoad) return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag !== 'function') return;
  try {
    if (sessionStorage.getItem(CHAT_STARTED_FLAG)) {
      chatStartedFiredThisLoad = true;
      return;
    }
    sessionStorage.setItem(CHAT_STARTED_FLAG, '1');
  } catch {
    // sessionStorage blocked — rely on the in-memory guard for this page load.
  }
  chatStartedFiredThisLoad = true;
  w.gtag('event', 'conversion', { send_to: CHAT_STARTED_CONVERSION });
}

export default function ChatWidget() {
  const t = useTranslations('chatWidget');
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [inputValue, setInputValue] = useState('');
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const welcomeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Don't render on admin pages
  const isAdminPage = pathname?.startsWith('/admin');

  const {
    messages,
    isConnected,
    isLoading,
    error,
    isClosed,
    isManagerTyping,
    aiState,
    sendMessage,
    createConversation,
    resetConversation,
  } = useChat({ conversationId });

  // A manager has taken over (AI paused with reason 'human'): show a small system
  // note. The visitor's input stays fully enabled — they can keep chatting.
  const managerTookOver = aiState.paused && aiState.reason === 'human';

  // Auto-scroll to bottom when new messages arrive or typing indicator shows
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isManagerTyping]);

  // Initialize conversation when widget opens
  useEffect(() => {
    if (isOpen && !conversationId) {
      handleInitialize();
    }
  }, [isOpen, conversationId]);

  // Listen for external open commands
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-chat-widget', handleOpenChat);
    return () => window.removeEventListener('open-chat-widget', handleOpenChat);
  }, []);

  // Don't render on admin pages
  if (isAdminPage) {
    return null;
  }

  const handleInitialize = async () => {
    try {
      const convId = await createConversation();
      setConversationId(convId);

      // Show automated welcome message after 2 seconds (only once per session)
      if (!hasShownWelcome) {
        welcomeTimeoutRef.current = setTimeout(() => {
          setHasShownWelcome(true);
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to initialize chat:', err);
    }
  };

  // Cleanup welcome timeout on unmount
  useEffect(() => {
    return () => {
      if (welcomeTimeoutRef.current) {
        clearTimeout(welcomeTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const text = inputValue.trim();
    if (!text || !conversationId) return;

    // Clear the input IMMEDIATELY (optimistic) so the textarea empties on send,
    // not when the AI reply eventually arrives. Restore the text if the send fails.
    setInputValue('');
    try {
      await sendMessage(text);
      // Visitor sent a chat message → fire the "Chat started" secondary
      // conversion (guarded to once per session / page load).
      fireChatStartedConversion();
    } catch (err) {
      setInputValue(text);
    }
  };

  const handleNewConversation = async () => {
    resetConversation();
    setConversationId(undefined);
    // Wait a moment then create new conversation
    setTimeout(async () => {
      try {
        const convId = await createConversation();
        setConversationId(convId);
      } catch (err) {
        console.error('Failed to create new conversation:', err);
      }
    }, 100);
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
          aria-label={t('open')}
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
          <span className={styles.badge}>{t('badge')}</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerTitle}>
              <h3>{t('liveSupport')}</h3>
              <div className={styles.statusIndicator}>
                <span
                  className={`${styles.statusDot} ${
                    isClosed ? styles.closed : isConnected ? styles.connected : styles.disconnected
                  }`}
                />
                <span className={styles.statusText}>
                  {isClosed ? t('statusClosed') : isConnected ? t('statusOnline') : t('statusConnecting')}
                </span>
              </div>
            </div>
            <button
              className={styles.closeButton}
              onClick={toggleChat}
              aria-label={t('close')}
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

          {/* Manager takeover system note — never disables the visitor input */}
          {managerTookOver && !isClosed && (
            <div
              style={{
                padding: '8px 14px',
                background: 'rgba(56, 189, 248, 0.12)',
                borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
                color: '#7dd3fc',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span aria-hidden>👤</span>
              <span>{t('managerTookOver')}</span>
            </div>
          )}

          {/* Messages */}
          <div className={styles.messagesContainer}>
            {isLoading && messages.length === 0 ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p>{t('loading')}</p>
              </div>
            ) : messages.length === 0 && !hasShownWelcome ? (
              <div className={styles.emptyState}>
                <p>{t('emptyWelcome')}</p>
              </div>
            ) : (
              <>
                {/* Automated Welcome Message */}
                {hasShownWelcome && messages.length === 0 && (
                  <div className={`${styles.messageBubble} ${styles.agentMessage} ${styles.welcomeMessage}`}>
                    <div className={styles.messageHeader}>
                      <span className={styles.messageSender}>{t('sender.support')}</span>
                      <span className={styles.messageTime}>{t('time.justNow')}</span>
                    </div>
                    <div className={styles.messageBody}>
                      {t('welcomeMessage')}
                    </div>
                  </div>
                )}
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}

                {/* Manager Typing Indicator */}
                {isManagerTyping && (
                  <div className={`${styles.messageBubble} ${styles.agentMessage}`}>
                    <div className={styles.messageHeader}>
                      <span className={styles.messageSender}>{t('sender.support')}</span>
                    </div>
                    <div className={`${styles.messageBody} ${styles.typingIndicator}`}>
                      <span className={styles.typingDot}></span>
                      <span className={styles.typingDot}></span>
                      <span className={styles.typingDot}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}

            {error && (
              <div className={styles.errorMessage}>
                <span>⚠️ {error}</span>
              </div>
            )}

            {!isConnected && !isClosed && messages.length > 0 && (
              <div className={styles.offlineNotice}>
                <span>{t('reconnecting')}</span>
              </div>
            )}

            {/* Conversation Closed Message */}
            {isClosed && (
              <div className={styles.closedMessage}>
                <div className={styles.closedIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h4>{t('conversationClosed.title')}</h4>
                <p>{t('conversationClosed.body')}</p>
                <button
                  className={styles.newConversationButton}
                  onClick={handleNewConversation}
                >
                  {t('newConversation')}
                </button>
              </div>
            )}
          </div>

          {/* Input - hidden when closed */}
          {!isClosed && (
            <form className={styles.inputContainer} onSubmit={handleSendMessage}>
              <input
                type="text"
                className={styles.messageInput}
                placeholder={t('inputPlaceholder')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={!isConnected || !conversationId}
              />
              <button
                type="submit"
                className={styles.sendButton}
                disabled={!inputValue.trim() || !isConnected || !conversationId}
                aria-label={t('send')}
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
          )}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const t = useTranslations('chatWidget');
  const locale = useLocale();
  const isVisitor = message.sender_type === 'visitor';
  const timeAgo = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
    locale: locale === 'de' ? de : undefined,
  });

  return (
    <div
      className={`${styles.messageBubble} ${
        isVisitor ? styles.visitorMessage : styles.agentMessage
      }`}
    >
      <div className={styles.messageHeader}>
        <span className={styles.messageSender}>
          {isVisitor ? t('sender.you') : t('sender.support')}
        </span>
        <span className={styles.messageTime}>{timeAgo}</span>
      </div>
      <div className={styles.messageBody}>{message.body}</div>
    </div>
  );
}
