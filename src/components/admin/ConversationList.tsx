import { formatDistanceToNow } from 'date-fns';
import styles from './ConversationList.module.css';

interface Conversation {
  id: string;
  visitor_id: string;
  status: 'new' | 'active' | 'closed';
  last_message_at: string;
  last_message?: {
    body: string;
    sender_type: string;
  } | null;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

function getStatusBadgeClass(status: Conversation['status']): string {
  switch (status) {
    case 'new':
      return styles.newBadge;
    case 'active':
      return styles.activeBadge;
    case 'closed':
      return styles.closedBadge;
    default:
      return '';
  }
}

function getStatusLabel(status: Conversation['status']): string {
  switch (status) {
    case 'new':
      return 'New';
    case 'active':
      return 'Active';
    case 'closed':
      return 'Closed';
    default:
      return status;
  }
}

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  isLoading,
  onRefresh,
}: ConversationListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Conversations</h2>
        <button
          onClick={onRefresh}
          className={styles.refreshButton}
          disabled={isLoading}
          aria-label="Refresh conversations"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={isLoading ? styles.spinning : ''}
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className={styles.emptyState}>
          {isLoading ? (
            <>
              <div className={styles.smallSpinner} />
              <p>Loading conversations...</p>
            </>
          ) : (
            <p>No conversations</p>
          )}
        </div>
      ) : (
        <div className={styles.conversationList}>
          {conversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId;
            const timeAgo = formatDistanceToNow(new Date(conversation.last_message_at), {
              addSuffix: true,
            });

            return (
              <div
                key={conversation.id}
                className={`${styles.conversationItem} ${isActive ? styles.active : ''}`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className={styles.conversationHeader}>
                  <div className={styles.visitorBadge}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Visitor {conversation.visitor_id.slice(0, 8)}</span>
                  </div>
                  <span className={styles.timestamp}>{timeAgo}</span>
                </div>

                {conversation.last_message && (
                  <div className={styles.lastMessage}>
                    <span className={styles.messageSender}>
                      {conversation.last_message.sender_type === 'visitor' ? 'Visitor' : 'Agent'}:
                    </span>
                    <span className={styles.messagePreview}>
                      {conversation.last_message.body}
                    </span>
                  </div>
                )}

                <span className={`${styles.statusBadge} ${getStatusBadgeClass(conversation.status)}`}>
                  {getStatusLabel(conversation.status)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
