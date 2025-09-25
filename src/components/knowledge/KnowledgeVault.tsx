'use client';

import { useState } from 'react';
import type { KnowledgeEntry } from '@/lib/types';
import Header from '@/components/layout/Header';
import KnowledgeList from './KnowledgeList';
import EntryDialog from './EntryDialog';

export default function KnowledgeVault() {
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<KnowledgeEntry[] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSearch = (results: KnowledgeEntry[] | null) => {
    setSearchResults(results);
  };

  const handleDataChange = () => {
    // This will force a re-fetch in the KnowledgeList component
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <EntryDialog
        isOpen={isEntryDialogOpen}
        setIsOpen={setIsEntryDialogOpen}
        onSuccess={handleDataChange}
      />
      <div className="flex min-h-screen flex-col">
        <Header 
          onNewEntry={() => setIsEntryDialogOpen(true)}
          onSearch={handleSearch}
        />
        <main className="flex-1">
          <div className="container mx-auto max-w-7xl px-4 py-8">
            <KnowledgeList 
              searchResults={searchResults}
              onDataChange={handleDataChange}
              refreshKey={refreshKey}
            />
          </div>
        </main>
      </div>
    </>
  );
}
