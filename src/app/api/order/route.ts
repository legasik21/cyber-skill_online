import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ORDERS_CHAT_ID = process.env.TELEGRAM_ORDERS_CHAT_ID;

interface OrderData {
  email: string;
  discordTag: string;
  service: string;
  message?: string;
  page?: string;
  orderDetails?: Record<string, any>;
}

/**
 * Send order to Telegram and respond with redirect URL
 */
export async function POST(request: NextRequest) {
  try {
    const body: OrderData = await request.json();

    // Validate required fields
    if (!body.email || !body.discordTag || !body.service) {
      return NextResponse.json(
        { success: false, redirect: '/order/error?reason=validation' },
        { status: 400 }
      );
    }

    // Format Telegram message
    const serviceName = getServiceName(body.service);
    const timestamp = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' });
    
    let text = `🛒 *НОВЕ ЗАМОВЛЕННЯ!*\n\n`;
    text += `📧 Email: \`${body.email}\`\n`;
    text += `💬 Discord: \`${body.discordTag}\`\n`;
    text += `🎮 Сервіс: *${serviceName}*\n`;
    
    if (body.page) {
      text += `📍 Сторінка: ${body.page}\n`;
    }
    
    if (body.message) {
      text += `📝 Повідомлення:\n${escapeMarkdown(body.message)}\n`;
    }
    
    // Add order details if present (price, options, etc.)
    if (body.orderDetails && Object.keys(body.orderDetails).length > 0) {
      text += `\n📋 *Деталі замовлення:*\n`;
      for (const [key, value] of Object.entries(body.orderDetails)) {
        if (value !== undefined && value !== null && value !== '') {
          text += `• ${formatKey(key)}: ${value}\n`;
        }
      }
    }
    
    text += `\n⏰ Час: ${timestamp}`;

    // Send to Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_ORDERS_CHAT_ID) {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_ORDERS_CHAT_ID,
            text,
            parse_mode: 'Markdown',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Telegram API error:', errorData);
        return NextResponse.json(
          { success: false, redirect: '/order/error?reason=telegram' },
          { status: 500 }
        );
      }
    } else {
      console.warn('Telegram orders credentials not configured');
      // Still return success for development
    }

    return NextResponse.json({
      success: true,
      redirect: '/order/success',
    });
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json(
      { success: false, redirect: '/order/error?reason=server' },
      { status: 500 }
    );
  }
}

function getServiceName(serviceCode: string): string {
  const services: Record<string, string> = {
    'wn8': 'WN8, Winrate, High Damage',
    'credits': 'Credit and Bonds Farming',
    'campaign': 'Campaign Missions',
    'moe': 'Mark of Excellence',
    'tier-leveling': 'Tier Leveling',
    'exp-farm': 'Exp Farm',
    'onslaught': 'Onslaught',
    'ace-tanker': 'Ace Tanker',
    'battle-pass': 'Battle Pass',
    'referral': 'Referral Program',
    'frontline': 'Frontline',
    'holiday-ops': 'Holiday Ops',
  };
  return services[serviceCode] || serviceCode;
}

function escapeMarkdown(text: string): string {
  return text
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/`/g, '\\`')
    .replace(/\[/g, '\\[');
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ');
}
