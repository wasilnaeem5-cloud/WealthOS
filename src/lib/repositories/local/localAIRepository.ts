import { AIChatMessage, AIConversation } from '../../../types';
import { IAIRepository } from '../types';
import { initialDemoConversations, initialDemoMessages } from './initialData';

const CONV_KEY = 'wealthos_ai_conversations';
const MSG_KEY = 'wealthos_ai_messages';

export class LocalAIRepository implements IAIRepository {
  async getConversations(userId: string): Promise<AIConversation[]> {
    if (typeof window === 'undefined') return initialDemoConversations;
    try {
      const item = localStorage.getItem(`${CONV_KEY}_${userId}`);
      if (!item) {
        localStorage.setItem(`${CONV_KEY}_${userId}`, JSON.stringify(initialDemoConversations));
        return initialDemoConversations;
      }
      return JSON.parse(item);
    } catch {
      return initialDemoConversations;
    }
  }

  async getMessages(conversationId: string): Promise<AIChatMessage[]> {
    if (typeof window === 'undefined') return initialDemoMessages;
    try {
      const item = localStorage.getItem(`${MSG_KEY}_${conversationId}`);
      if (!item) {
        if (conversationId === 'conv-1') {
          localStorage.setItem(`${MSG_KEY}_conv-1`, JSON.stringify(initialDemoMessages));
          return initialDemoMessages;
        }
        return [];
      }
      return JSON.parse(item);
    } catch {
      return conversationId === 'conv-1' ? initialDemoMessages : [];
    }
  }

  async saveMessage(message: AIChatMessage): Promise<AIChatMessage> {
    const messages = await this.getMessages(message.conversationId);
    const newMessage: AIChatMessage = {
      ...message,
      id: message.id || `msg-${Date.now()}`,
      createdAt: message.createdAt || new Date().toISOString(),
    };
    messages.push(newMessage);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${MSG_KEY}_${message.conversationId}`, JSON.stringify(messages));
    }
    return newMessage;
  }

  async createConversation(userId: string, title: string): Promise<AIConversation> {
    const conversations = await this.getConversations(userId);
    const newConv: AIConversation = {
      id: `conv-${Date.now()}`,
      userId,
      title,
      createdAt: new Date().toISOString(),
    };
    conversations.unshift(newConv);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${CONV_KEY}_${userId}`, JSON.stringify(conversations));
    }
    return newConv;
  }
}
