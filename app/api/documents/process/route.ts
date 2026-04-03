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
    const { documentId, filePath } = body;

    if (!documentId || !filePath) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Download file from storage
    const { data, error: downloadError } = await supabase.storage
      .from('documents')
      .download(filePath);

    if (downloadError) throw downloadError;

    // Convert blob to text (placeholder - would need actual PDF parsing)
    let textContent = `[PDF Content from ${filePath}]`;

    try {
      // Attempt to read file as text (for demo purposes)
      textContent = await data.text();
    } catch {
      // If not readable as text, keep placeholder
      textContent = `[Binary PDF content - ${data.size} bytes]`;
    }

    // Update document with extracted content
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        content_text: textContent,
      })
      .eq('id', documentId);

    if (updateError) throw updateError;

    // TODO: Generate embeddings for the document chunks
    // This would require an embedding model API (e.g., OpenAI, Cohere, etc.)

    return NextResponse.json({
      success: true,
      documentId,
      contentLength: textContent.length,
    });
  } catch (error) {
    console.error('Document processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}
