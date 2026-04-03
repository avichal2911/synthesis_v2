'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';

interface Project {
  id: string;
  name: string;
}

interface AppLayoutProps {
  children: ReactNode;
  projects: Project[];
  userEmail?: string;
  onNewProject: () => void;
  onLogout: () => void;
}

export function AppLayout({
  children,
  projects,
  userEmail,
  onNewProject,
  onLogout,
}: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar projects={projects} onNewProject={onNewProject} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar userEmail={userEmail} onLogout={onLogout} />

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
