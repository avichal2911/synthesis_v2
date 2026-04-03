'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '@/components/app-layout';
import { Chat } from '@/components/chat';
import { DocumentUpload } from '@/components/document-upload';

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface Document {
  id: string;
  file_name: string;
  file_size: number | null;
  created_at: string;
}

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeProject = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        setUserEmail(session.user.email || '');

        // Fetch all projects for sidebar
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (projectsError) throw projectsError;
        setProjects(projectsData || []);

        // Fetch current project
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .eq('user_id', session.user.id)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);

        // Fetch documents for this project
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('id, file_name, file_size, created_at')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (documentsError) throw documentsError;
        setDocuments(documentsData || []);
      } catch (error) {
        console.error('Error initializing project:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    initializeProject();
  }, [projectId, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleNewProject = () => {
    router.push('/dashboard?new=true');
  };

  const handleDocumentsChange = (updatedDocuments: Document[]) => {
    setDocuments(updatedDocuments);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <AppLayout
      projects={projects}
      userEmail={userEmail}
      onNewProject={handleNewProject}
      onLogout={handleLogout}
    >
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="border-b border-border px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-2">{project.description}</p>
          )}
        </div>

        {/* Main content - split view */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat area - left side */}
          <div className="flex-1 flex flex-col border-r border-border">
            <Chat projectId={projectId} />
          </div>

          {/* Sidebar - right side with documents */}
          <div className="w-80 overflow-y-auto border-l border-border">
            <div className="p-6">
              <DocumentUpload
                projectId={projectId}
                documents={documents}
                onDocumentsChange={handleDocumentsChange}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
