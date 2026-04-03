'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        setUserEmail(session.user.email || '');

        // Fetch projects
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [router]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setCreatingProject(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            user_id: session.user.id,
            name: newProjectName,
            description: newProjectDescription || null,
          },
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setProjects([data[0], ...projects]);
        setNewProjectName('');
        setNewProjectDescription('');
        setShowNewProjectDialog(false);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setCreatingProject(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleNewProject = () => {
    setShowNewProjectDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Loading...</p>
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
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Projects</h2>
          <p className="text-muted-foreground">Manage your research projects and documents</p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No projects yet. Create one to get started.</p>
            <Button onClick={handleNewProject} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary cursor-pointer transition-colors"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Project Name
              </label>
              <Input
                placeholder="My Research Project"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                disabled={creatingProject}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description (Optional)
              </label>
              <Input
                placeholder="Brief description of your project"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                disabled={creatingProject}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={creatingProject || !newProjectName.trim()}>
              {creatingProject ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
