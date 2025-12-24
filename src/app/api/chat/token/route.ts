import { NextRequest, NextResponse } from 'next/server';
import { generateAblyToken } from '@/lib/ably';

/**
 * Generate Ably token for chat clients
 * Visitors get access to their specific conversation channel
 * Admins get access to all conversation channels
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversation_id, is_admin = false } = body;

    // Get visitor ID from cookie
    const visitorId = request.cookies.get('visitor_id')?.value;

    if (!visitorId && !is_admin) {
      return NextResponse.json(
        { error: 'Visitor ID not found' },
        { status: 401 }
      );
    }

    // Define channel capabilities
    let capability: Record<string, string[]>;
    let clientId: string;

    if (is_admin) {
      // Admin can access all chat channels
      // TODO: Verify admin authentication here
      const adminId = body.admin_id;
      
      if (!adminId) {
        return NextResponse.json(
          { error: 'Admin ID required' },
          { status: 401 }
        );
      }

      clientId = `admin:${adminId}`;
      capability = {
        'chat:*': ['publish', 'subscribe', 'presence'],
      };
    } else {
      // Visitor can only access their conversation channel
      if (!conversation_id) {
        return NextResponse.json(
          { error: 'Conversation ID required' },
          { status: 400 }
        );
      }

      clientId = `visitor:${visitorId}`;
      capability = {
        [`chat:${conversation_id}`]: ['publish', 'subscribe'],
      };
    }

    // Generate token
    const token = await generateAblyToken(clientId, capability);

    return NextResponse.json({ token, clientId });
  } catch (error) {
    console.error('Error generating Ably token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
