'use client';

import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  userEmail?: string;
  onLogout: () => void;
}

export function Navbar({ userEmail = 'user@example.com', onLogout }: NavbarProps) {
  return (
    <nav className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
      {/* Left side - could add breadcrumbs here */}
      <div>
        {/* Breadcrumbs or page title will go here */}
      </div>

      {/* Right side - User menu */}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{userEmail}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onLogout} className="text-red-400">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
