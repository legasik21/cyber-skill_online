import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, ORDER_RATE_LIMIT } from '@/lib/ratelimit';
import { verifyFormToken, formTokenConfigured } from '@/lib/formToken';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ORDERS_CHAT_ID = process.env.TELEGRAM_ORDERS_CHAT_ID;

interface OrderData {
  email: string;
  discordTag: string;
  service: string;
  message?: string;
  page?: string;
  orderDetails?: Record<string, any>;
  formToken?: string;
  company_url?: string; // honeypot — must be empty for real users
}

/**
 * Send order to Telegram and respond with redirect URL
 */
export async function POST(request: NextRequest) {
  try {
    const body: OrderData = await request.json();

    // ---- Anti-spam: all server-side, BEFORE any order / Telegram / success ----
    // Real client IP. Behind Traefik (a single trusted proxy) the genuine client
    // is the RIGHTMOST X-Forwarded-For entry — the one Traefik appends — so a bot
    // cannot spoof its rate-limit identity by prepending fake entries.
    const xff = request.headers.get('x-forwarded-for');
    const ip =
      (xff ? xff.split(',').map((s) => s.trim()).filter(Boolean).pop() : null) ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // 1) Honeypot — a hidden field real users never fill. If set -> bot.
    //    Reply with a fake 200 "success" so bots can't detect the block, but do
    //    NOT send Telegram, create the order, or (bots don't render the page)
    //    reach the conversion.
    if (typeof body.company_url === 'string' && body.company_url.trim() !== '') {
      console.warn(`[order] rejected: honeypot filled (ip=${ip})`);
      return NextResponse.json({ success: true, redirect: '/order/success' });
    }

    // 2) Signed form token — core defense against direct-API bots; also enforces
    //    a minimum think-time and single-use. Missing/invalid -> 400 (the client
    //    re-fetches a fresh token and retries). Fail OPEN only if misconfigured,
    //    so a missing secret can never block real customers.
    if (formTokenConfigured()) {
      const verdict = verifyFormToken(body.formToken);
      if (!verdict.ok) {
        console.warn(`[order] rejected: token ${verdict.reason} (ip=${ip})`);
        return NextResponse.json(
          {
            success: false,
            error: 'invalid_token',
            code: verdict.reason,
            redirect: '/order/error?reason=token',
          },
          { status: 400 }
        );
      }
    } else {
      console.error(
        '[order] FORM_TOKEN_SECRET not set — token check skipped (failing open)'
      );
    }

    // Validate required fields
    if (!body.email || !body.discordTag || !body.service) {
      return NextResponse.json(
        { success: false, redirect: '/order/error?reason=validation' },
        { status: 400 }
      );
    }

    // 3) Rate limit accepted orders per IP (+ visitor cookie if present).
    const visitorId = request.cookies.get('visitor_id')?.value || '';
    const rl = checkRateLimit(`order:${ip}:${visitorId}`, ORDER_RATE_LIMIT);
    if (!rl.allowed) {
      console.warn(`[order] rejected: rate limit (ip=${ip})`);
      return NextResponse.json(
        { success: false, error: 'rate_limited', redirect: '/order/error?reason=rate' },
        { status: 429 }
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
