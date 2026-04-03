'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Project {
  id: string;
  name: string;
}

interface SidebarProps {
  projects: Project[];
  onNewProject: () => void;
}

export function Sidebar({ projects, onNewProject }: SidebarProps) {
  const pathname = usePathname();

  const isProjectActive = (projectId: string) => pathname === `/projects/${projectId}`;

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">Synthesis</h1>
        <p className="text-xs text-muted-foreground mt-1">Research Intelligence</p>
      </div>

      {/* New Project Button */}
      <div className="p-4 border-b border-sidebar-border">
        <Button
          onClick={onNewProject}
          className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-4">
            Your Projects
          </div>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground p-2">No projects yet</p>
          ) : (
            <nav className="space-y-1">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isProjectActive(project.id)
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{project.name}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border text-xs text-muted-foreground">
        <p>v1.0</p>
      </div>
    </aside>
  );
}
