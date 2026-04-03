import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// ✅ Safe runtime initialization
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Example: GET projects
export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('projects')
      .select('*');

    if (error) throw error;

    return NextResponse.json({ projects: data });

  } catch (error) {
    console.error('Projects API error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// Example: CREATE project
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    const body = await request.json();
    const { name, userId } = body;

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name,
          user_id: userId,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ project: data?.[0] });

  } catch (error) {
    console.error('Create project error:', error);

    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
