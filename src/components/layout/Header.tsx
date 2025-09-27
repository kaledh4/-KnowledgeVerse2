'use client';

import Logo from './Logo';
import { Button } from '../ui/button';
import { PlusCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { KnowledgeEntry } from '@/lib/types';
import Search from '../knowledge/Search';

type HeaderProps = {
  onNewEntry: () => void;
  onSearch: (results: KnowledgeEntry[] | null) => void;
};

export default function Header({ onNewEntry, onSearch }: HeaderProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Logo />
        <div className="flex flex-1 items-center justify-center px-4 sm:px-8 md:px-16">
          <div className="w-full max-w-lg">
            <Search onSearch={onSearch} />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {user?.user_metadata?.name || user?.email}
          </span>
          <Button size="sm" onClick={onNewEntry}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Entry
          </Button>
          <Button size="sm" variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
