import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          file_name: string;
          file_size: number | null;
          file_path: string;
          content_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          file_name: string;
          file_size?: number | null;
          file_path: string;
          content_text?: string | null;
          created_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at?: string;
        };
      };
    };
  };
};
