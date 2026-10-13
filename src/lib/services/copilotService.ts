import { AIChatMessage, AIConversation, FinancialProfile, ScenarioCalculationResult, UserProfile } from '../../types';
import { RepositoryFactory } from '../repositories/factory';
import { buildMinimalAIContext } from '../ai/context';
import { validateAIResponse } from '../ai/guardrails';
import { generateId } from '../utils/id';

export class CopilotService {
  private aiRepo = RepositoryFactory.getAIRepository();

  async getConversations(userId: string): Promise<AIConversation[]> {
    return this.aiRepo.getConversations(userId);
  }

  async getOrCreateConversation(userId: string): Promise<AIConversation> {
    const convs = await this.aiRepo.getConversations(userId);
    if (convs.length > 0) {
      return convs[0];
    }
    return this.aiRepo.createConversation(userId, 'Main Conversation');
  }

  async getMessages(conversationId: string): Promise<AIChatMessage[]> {
    return this.aiRepo.getMessages(conversationId);
  }

  async processUserMessage(
    userId: string,
    conversationId: string,
    userQuery: string,
    userProfile: UserProfile,
    finProfile: FinancialProfile,
    calcResult: ScenarioCalculationResult
  ): Promise<AIChatMessage> {
    // 1. Save User Message
    const userMsg: AIChatMessage = {
      id: generateId(),
      conversationId,
      role: 'user',
      content: userQuery,
      createdAt: new Date().toISOString(),
    };
    await this.aiRepo.saveMessage(userMsg);

    // 2. Build minimal context JSON from deterministic engine
    const context = buildMinimalAIContext(userProfile, finProfile, calcResult);

    // 3. Call secure Next.js API route to generate educational explanation response
    let rawAiContent = '';
    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery,
          context,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate AI response from server.');
      }

      rawAiContent = data.text;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[CopilotService] AI generation error:', err);
      rawAiContent = `I'm sorry, I'm currently unable to connect to my AI engine. Please ensure that \`GEMINI_API_KEY\` is configured correctly on the server.\n\nError: ${message}`;
    }

    // 4. Run Guardrail Validation
    const validation = validateAIResponse(rawAiContent);

    // 5. Save Assistant Message
    const assistantMsg: AIChatMessage = {
      id: generateId(),
      conversationId,
      role: 'assistant',
      content: validation.sanitizedContent,
      contextJson: context as unknown as Record<string, unknown>,
      createdAt: new Date().toISOString(),
    };

    return this.aiRepo.saveMessage(assistantMsg);
  }
}
