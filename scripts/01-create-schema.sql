-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_path TEXT NOT NULL,
  content_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create embeddings table for vector search
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  text_chunk TEXT NOT NULL,
  embedding VECTOR(1536),
  chunk_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Projects RLS policies
CREATE POLICY "Users can view their own projects" 
  ON projects FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects" 
  ON projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
  ON projects FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
  ON projects FOR DELETE 
  USING (auth.uid() = user_id);

-- Documents RLS policies
CREATE POLICY "Users can view their own documents" 
  ON documents FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload documents" 
  ON documents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
  ON documents FOR DELETE 
  USING (auth.uid() = user_id);

-- Embeddings RLS policies
CREATE POLICY "Users can view embeddings from their documents" 
  ON embeddings FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = embeddings.document_id 
      AND documents.user_id = auth.uid()
    )
  );

-- Chat messages RLS policies
CREATE POLICY "Users can view their own messages" 
  ON chat_messages FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can send messages" 
  ON chat_messages FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS documents_project_id_idx ON documents(project_id);
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents(user_id);
CREATE INDEX IF NOT EXISTS embeddings_document_id_idx ON embeddings(document_id);
CREATE INDEX IF NOT EXISTS chat_messages_project_id_idx ON chat_messages(project_id);
CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx ON chat_messages(user_id);
