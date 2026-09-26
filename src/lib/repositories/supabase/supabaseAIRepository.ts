import { AIChatMessage, AIConversation } from '../../../types';
import { IAIRepository } from '../types';
import { supabaseClient } from '../../supabase/client';

export class SupabaseAIRepository implements IAIRepository {
  async getConversations(userId: string): Promise<AIConversation[]> {
    const { data, error } = await supabaseClient
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to load conversations: ${error.message}`);
    }

    if (!data) return [];

    return data.map((d) => ({
      id: d.id,
      userId: d.user_id,
      title: d.title,
      createdAt: d.created_at,
    }));
  }

  async getMessages(conversationId: string): Promise<AIChatMessage[]> {
    const { data, error } = await supabaseClient
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to load messages: ${error.message}`);
    }

    if (!data) return [];

    return data.map((d) => ({
      id: d.id,
      conversationId: d.conversation_id,
      role: d.role,
      content: d.content,
      contextJson: d.context_json,
      createdAt: d.created_at,
    }));
  }

  async saveMessage(message: AIChatMessage): Promise<AIChatMessage> {
    const { data, error } = await supabaseClient
      .from('ai_messages')
      .upsert(
        {
          id: message.id,
          conversation_id: message.conversationId,
          role: message.role,
          content: message.content,
          context_json: message.contextJson ?? null,
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) throw new Error(`Failed to save message: ${error.message}`);

    return {
      id: data.id,
      conversationId: data.conversation_id,
      role: data.role,
      content: data.content,
      contextJson: data.context_json,
      createdAt: data.created_at,
    };
  }

  async createConversation(userId: string, title: string): Promise<AIConversation> {
    const { data, error } = await supabaseClient
      .from('ai_conversations')
      .insert({
        user_id: userId,
        title,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create conversation: ${error.message}`);

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      createdAt: data.created_at,
    };
  }
}
