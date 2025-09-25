'use client';

import { useState, useEffect, useCallback } from 'react';
import { KnowledgeEntry } from '@/lib/types';
import { ApiClient } from '@/lib/api-client';
import KnowledgeCard from './KnowledgeCard';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { Inbox } from 'lucide-react';

type KnowledgeListProps = {
  searchResults: KnowledgeEntry[] | null;
  onDataChange: () => void;
  refreshKey: number;
};

const PAGE_SIZE = 9;

interface UseInfiniteScrollEntriesResult {
  entries: KnowledgeEntry[];
  isLoading: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => void;
}

function useInfiniteScrollEntries(refreshKey: number): UseInfiniteScrollEntriesResult {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadEntries = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      const currentCursor = reset ? undefined : cursor;
      const result = await ApiClient.getKnowledgeEntries(currentCursor, PAGE_SIZE);
      
      if (reset) {
        setEntries(result.entries);
      } else {
        setEntries(prev => [...prev, ...result.entries]);
      }
      
      setCursor(result.nextCursor);
      setHasMore(!!result.nextCursor);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [cursor]);

  useEffect(() => {
    loadEntries(true);
  }, [refreshKey]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    loadEntries(false);
  }, [hasMore, isLoading, loadEntries]);
  
  return { entries, isLoading, hasMore, error, loadMore };
}

export default function KnowledgeList({ searchResults, onDataChange, refreshKey }: KnowledgeListProps) {
  const { entries, isLoading, hasMore, error, loadMore } = useInfiniteScrollEntries(refreshKey);

  if (isLoading && entries.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  if (error && entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-destructive/50 py-20 text-center">
        <h2 className="mt-4 font-headline text-2xl font-semibold text-destructive">Error Loading Entries</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  const entriesToShow = searchResults ?? entries;

  if (entriesToShow.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-20 text-center">
        <Inbox className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="mt-4 font-headline text-2xl font-semibold">Your Vault is Empty</h2>
        <p className="mt-2 text-muted-foreground">
          {searchResults === null ? "Add your first piece of knowledge to get started." : "No results found for your search."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {entriesToShow.map(entry => (
          <KnowledgeCard key={entry.id} entry={entry} onUpdate={onDataChange} onDelete={onDataChange} />
        ))}
      </div>

      {hasMore && searchResults === null && (
        <div className="mt-8 flex justify-center">
          <Button onClick={loadMore} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
