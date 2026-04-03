import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, message, userId } = body;

    if (!projectId || !message || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store user message
    const { data: userMessage, error: userMessageError } = await supabase
      .from('chat_messages')
      .insert([
        {
          project_id: projectId,
          user_id: userId,
          role: 'user',
          content: message,
        },
      ])
      .select();

    if (userMessageError) throw userMessageError;

    // TODO: Integrate with AI provider (Groq, OpenAI, etc.)
    // For now, return a placeholder response
    const assistantResponse = `Processing your message: "${message}". AI integration coming soon.`;

    const { data: assistantMessage, error: assistantMessageError } = await supabase
      .from('chat_messages')
      .insert([
        {
          project_id: projectId,
          user_id: userId,
          role: 'assistant',
          content: assistantResponse,
        },
      ])
      .select();

    if (assistantMessageError) throw assistantMessageError;

    return NextResponse.json({
      userMessage: userMessage?.[0],
      assistantMessage: assistantMessage?.[0],
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
