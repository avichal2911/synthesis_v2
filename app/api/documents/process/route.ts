import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// ✅ Safe: runs only at request time
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    const body = await request.json();
    const { projectId, documentContent, userId } = body;

    if (!projectId || !documentContent || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Example: Store document (you can extend later)
    const { data, error } = await supabase
      .from('documents')
      .insert([
        {
          project_id: projectId,
          user_id: userId,
          content: documentContent,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      document: data?.[0],
    });

  } catch (error) {
    console.error('Document processing error:', error);

    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}
