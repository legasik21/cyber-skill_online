import Ably from 'ably';

// Server-side Ably client - lazy initialized
let _ablyServer: Ably.Rest | null = null;

function getAblyServer(): Ably.Rest {
  if (!_ablyServer) {
    const ablyApiKey = process.env.ABLY_API_KEY;
    
    if (!ablyApiKey) {
      throw new Error('Missing ABLY_API_KEY environment variable');
    }
    
    _ablyServer = new Ably.Rest({ key: ablyApiKey });
  }
  return _ablyServer;
}

// Generate Ably token for clients
export async function generateAblyToken(
  clientId: string,
  capability: Record<string, string[]>
): Promise<string> {
  const ablyServer = getAblyServer();
  const tokenRequest = await ablyServer.auth.createTokenRequest({
    clientId,
    capability: capability as any, // Ably types are complex, using any for compatibility
    ttl: 3600000, // 1 hour
  });

  const tokenDetails = await ablyServer.auth.requestToken(tokenRequest);
  return tokenDetails.token;
}

// Publish message to Ably channel
export async function publishToChannel(
  channelName: string,
  eventName: string,
  data: any
): Promise<void> {
  const ablyServer = getAblyServer();
  const channel = ablyServer.channels.get(channelName);
  await channel.publish(eventName, data);
}
