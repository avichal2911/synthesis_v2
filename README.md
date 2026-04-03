# Synthesis - Research Intelligence Platform

A modern research intelligence web app built with Next.js, TypeScript, Tailwind CSS, and Supabase. Designed for management consultants to upload documents, ask questions, and get AI-powered insights.

## Features

- **User Authentication**: Secure email/password authentication with Supabase Auth
- **Project Management**: Create and organize multiple research projects
- **Document Upload**: Upload and manage PDF documents for analysis
- **Chat Interface**: Interactive chat to ask questions about your documents
- **Dark Professional Theme**: Sleek, consultant-grade dark UI
- **Real-time Database**: Supabase PostgreSQL with Row Level Security
- **Per-Project Organization**: Separate chat threads for each project

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4.2, shadcn/ui components
- **Backend**: Next.js API routes, Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for PDF files
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase project (free tier available at supabase.com)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo>
cd synthesis
pnpm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Enable necessary database tables (already included in migrations)

### 3. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Create Storage Bucket

In Supabase Dashboard:
1. Go to Storage
2. Create a new bucket named `documents`
3. Configure RLS policy to allow authenticated users

### 5. Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

## Project Structure

```
app/
├── (auth)/                 # Auth routes (login, signup)
├── (app)/                  # Protected app routes
│   ├── dashboard/          # Projects list
│   └── projects/[id]/      # Project detail with chat
├── api/                    # API routes
│   ├── chat/              # Chat messages
│   ├── documents/         # Document processing
│   └── projects/          # Projects management
└── page.tsx               # Root redirect

components/
├── app-layout.tsx         # Main layout wrapper
├── sidebar.tsx            # Projects sidebar
├── navbar.tsx             # Top navigation
├── chat.tsx               # Chat interface
└── document-upload.tsx    # PDF upload component

lib/
└── supabase.ts            # Supabase client & types
```

## Database Schema

### Tables

- **projects**: User research projects
- **documents**: Uploaded PDF files with metadata
- **embeddings**: Vector embeddings for semantic search
- **chat_messages**: Chat history per project

All tables include:
- Row Level Security (RLS) policies
- User isolation by `user_id`
- Automatic timestamps

## Key Features Explained

### Authentication Flow
1. User signs up with email/password
2. Supabase Auth creates user account
3. Session stored in Supabase
4. Protected routes check session before rendering

### Document Management
1. Upload PDF to project
2. File stored in Supabase Storage
3. Metadata saved to `documents` table
4. Content extracted for AI processing (optional)

### Chat Interface
1. Messages stored per project
2. User messages and AI responses tracked
3. Full conversation history available
4. Ready for AI provider integration

## AI Integration (Next Steps)

To add AI-powered responses:

1. **Choose AI Provider**:
   - Groq (recommended for speed)
   - OpenAI
   - Anthropic
   - Google Vertex

2. **Update Chat Route** (`app/api/chat/route.ts`):
   - Call AI API with user message and document context
   - Stream responses for better UX

3. **Add Embeddings** (`app/api/documents/process/route.ts`):
   - Extract and chunk PDF text
   - Generate embeddings with AI provider
   - Store in `embeddings` table for semantic search

## Color Scheme

**Professional Dark Theme**:
- Background: `#0f1419` (deep dark)
- Card: `#1a1f2e` (dark navy)
- Primary: Purple-blue accent
- Accent: Refined violet
- Borders: Subtle dark grays

Perfect for management consulting firms and enterprise users.

## Development Tips

- Use Supabase CLI for local development: `supabase start`
- Check RLS policies in Supabase Dashboard when debugging access
- All user data is isolated by RLS at the database level
- Add console.log for debugging (dev environment only)

## Deployment

### To Vercel

```bash
vercel
```

Add environment variables in Vercel dashboard.

### Custom Server

1. Build: `pnpm build`
2. Start: `pnpm start`
3. Set environment variables before running

## Security Considerations

✅ Implemented:
- Supabase Auth for secure authentication
- Row Level Security (RLS) on all tables
- Service role key never exposed to client
- User isolation enforced at database level
- File storage paths include user_id

⚠️ Add Before Production:
- Rate limiting on API routes
- Request validation middleware
- CORS configuration
- File upload size limits (50MB implemented)
- Content Security Policy headers

## License

MIT

## Support

For issues or questions:
1. Check Supabase docs: https://supabase.com/docs
2. Review Next.js guides: https://nextjs.org/docs
3. Explore shadcn/ui: https://ui.shadcn.com
