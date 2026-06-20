import { handlers } from '@/auth';

// bcrypt + pg are Node-only — pin this handler to the Node runtime.
export const runtime = 'nodejs';

export const { GET, POST } = handlers;
