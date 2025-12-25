/**
 * Telegram notification utility for chat messages
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

interface TelegramMessage {
  visitorId: string;
  messageBody: string;
  conversationId: string;
  isNewConversation?: boolean;
}

/**
 * Send a notification to Telegram group when visitor sends a message
 */
export async function sendTelegramNotification(data: TelegramMessage): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram credentials not configured, skipping notification');
    return false;
  }

  try {
    const visitorShort = data.visitorId.slice(0, 8);
    const convShort = data.conversationId.slice(0, 8);
    
    // Format the message
    let text = '';
    
    if (data.isNewConversation) {
      text = `🆕 *New Chat Started!*\n\n`;
    } else {
      text = `💬 *New Message*\n\n`;
    }
    
    text += `👤 Visitor: \`${visitorShort}\`\n`;
    text += `📝 Message:\n${escapeMarkdown(data.messageBody)}\n\n`;
    text += `🔗 [Open Admin Panel](${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'}/admin/chat)`;

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

/**
 * Escape special Markdown characters for Telegram
 */
function escapeMarkdown(text: string): string {
  return text
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/`/g, '\\`')
    .replace(/\[/g, '\\[');
}

/**
 * Send notification when conversation is closed
 */
export async function sendConversationClosedNotification(
  conversationId: string,
  adminEmail?: string
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return false;
  }

  try {
    const convShort = conversationId.slice(0, 8);
    const text = `✅ *Conversation Closed*\n\nConversation \`${convShort}\` was closed${adminEmail ? ` by ${adminEmail}` : ''}.`;

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'Markdown',
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}
