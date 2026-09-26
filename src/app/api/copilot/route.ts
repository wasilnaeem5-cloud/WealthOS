import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT } from '../../../lib/ai/prompts';

export async function POST(request: Request) {
  try {
    // 1. Verify Authentication
    const supabase = await createSupabaseServerClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Request Body
    const body = await request.json();
    const { userQuery, context } = body;

    if (!userQuery || !context) {
      return NextResponse.json({ error: 'Missing userQuery or context' }, { status: 400 });
    }

    // 3. Verify API Key Setup
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[Copilot API] GEMINI_API_KEY is missing from environment variables.');
      return NextResponse.json(
        { error: 'AI integration is not configured correctly on the server.' },
        { status: 500 }
      );
    }

    // 4. Initialize Gemini
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // 5. Build Prompt
    const fullPrompt = `${SYSTEM_PROMPT}

CURRENT FINANCIAL CONTEXT (JSON):
${JSON.stringify(context, null, 2)}

USER QUESTION:
${userQuery}
`;

    // 6. Generate Response
    const response = await ai.models.generateContent({
      model,
      contents: fullPrompt,
    });

    if (!response || !response.text) {
      throw new Error('Empty response from Gemini API');
    }

    // 7. Return generated text to the client service
    return NextResponse.json({
      text: response.text,
    });

  } catch (err: any) {
    console.error('[Copilot API] Failed to generate AI response:', err);
    return NextResponse.json(
      { error: err.message || 'An error occurred while generating the response.' },
      { status: 500 }
    );
  }
}
