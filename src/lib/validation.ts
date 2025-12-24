import { z } from 'zod';

// Message validation
export const messageSchema = z.object({
  body: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 characters)')
    .trim(),
  conversation_id: z.string().uuid('Invalid conversation ID'),
});

// Conversation creation validation
export const createConversationSchema = z.object({
  visitor_id: z.string().uuid('Invalid visitor ID'),
});

// Admin message validation
export const adminMessageSchema = z.object({
  body: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 characters)')
    .trim(),
  conversation_id: z.string().uuid('Invalid conversation ID'),
});

// Admin assign validation
export const assignConversationSchema = z.object({
  conversation_id: z.string().uuid('Invalid conversation ID'),
  agent_id: z.string().uuid('Invalid agent ID'),
});

// Admin close validation
export const closeConversationSchema = z.object({
  conversation_id: z.string().uuid('Invalid conversation ID'),
});

export type MessageInput = z.infer<typeof messageSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type AdminMessageInput = z.infer<typeof adminMessageSchema>;
export type AssignConversationInput = z.infer<typeof assignConversationSchema>;
export type CloseConversationInput = z.infer<typeof closeConversationSchema>;
