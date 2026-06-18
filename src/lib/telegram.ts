/**
 * Telegram notification utility for chat messages
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_ORDERS_CHAT_ID = process.env.TELEGRAM_ORDERS_CHAT_ID;

/** Low-level sender: POSTs a Markdown message to a specific chat. Returns ok. */
async function postToTelegram(chatId: string, text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('Telegram bot token not configured, skipping notification');
    return false;
  }
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        }),
      },
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Telegram API error:', errorData);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

export interface ChatOrder {
  service: string;
  summary: string;
  price: string;
  contactPlatform: string;
  contactHandle: string;
  conversationId: string;
}

/**
 * Feature 1 — post a structured in-chat order to the EXISTING site-orders Telegram
 * group (TELEGRAM_ORDERS_CHAT_ID), the same chat the storefront order form uses.
 */
export async function sendChatOrderNotification(order: ChatOrder): Promise<boolean> {
  if (!TELEGRAM_ORDERS_CHAT_ID) {
    console.warn('Telegram orders chat not configured, skipping order notification');
    return false;
  }
  const convShort = order.conversationId.slice(0, 8);
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cyberskill.online'}/admin/chat`;
  const timestamp = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' });

  let text = `🛒 *NEW IN-CHAT ORDER*\n\n`;
  text += `🎮 Service: *${escapeMarkdown(order.service)}*\n`;
  text += `📋 Details: ${escapeMarkdown(order.summary)}\n`;
  text += `💵 Quoted price: ${escapeMarkdown(order.price)}\n`;
  text += `📨 Contact: *${escapeMarkdown(order.contactPlatform)}* — \`${escapeMarkdown(order.contactHandle)}\`\n`;
  text += `🆔 Conversation: \`${convShort}\`\n`;
  text += `🔗 [Open Admin Panel](${adminUrl})\n`;
  text += `\n⏰ ${timestamp}`;

  return postToTelegram(TELEGRAM_ORDERS_CHAT_ID, text);
}

/**
 * Feature 5 — notify the EXISTING notifications group (TELEGRAM_CHAT_ID) that a
 * conversation hit the per-conversation AI answer cap and needs a human takeover.
 */
export async function sendHandoffNotification(
  conversationId: string,
  answerCount: number,
): Promise<boolean> {
  if (!TELEGRAM_CHAT_ID) return false;
  const convShort = conversationId.slice(0, 8);
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cyberskill.online'}/admin/chat`;
  const timestamp = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' });

  let text = `🙋 *Human takeover needed*\n\n`;
  text += `Conversation \`${convShort}\` reached the AI answer cap (${answerCount} answers).\n`;
  text += `The assistant has paused — please continue with this visitor.\n`;
  text += `🔗 [Open Admin Panel](${adminUrl})\n`;
  text += `\n⏰ ${timestamp}`;

  return postToTelegram(TELEGRAM_CHAT_ID, text);
}

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
      const errorData = await response.json().catch(() => ({}));
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
    const text = `✅ *Conversation Closed*\n\nConversation \`${convShort}\` was closed${adminEmail ? ` by ${escapeMarkdown(adminEmail)}` : ''}.`;

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
