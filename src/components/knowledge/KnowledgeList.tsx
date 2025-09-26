'use client';

import { useState, useEffect, useCallback } from 'react';
import { KnowledgeEntry } from '@/lib/types';
import { ApiClient } from '@/lib/api-client';
import KnowledgeCard from './KnowledgeCard';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { Inbox, ChevronLeft, ChevronRight } from 'lucide-react';

type KnowledgeListProps = {
  searchResults: KnowledgeEntry[] | null;
  onDataChange: () => void;
  refreshKey: number;
};

const PAGE_SIZE = 25;

interface UsePaginatedEntriesResult {
  entries: KnowledgeEntry[];
  isLoading: boolean;
  error: Error | null;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

function usePaginatedEntries(refreshKey: number): UsePaginatedEntriesResult {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [allEntries, setAllEntries] = useState<KnowledgeEntry[]>([]);

  const loadAllEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      const allEntriesData: KnowledgeEntry[] = [];
      let cursor: string | undefined = undefined;
      let hasMore = true;

      // Load all entries to enable proper pagination
      while (hasMore) {
        const result = await ApiClient.getKnowledgeEntries(cursor, 100); // Load in chunks of 100
        allEntriesData.push(...result.entries);
        cursor = result.nextCursor;
        hasMore = !!result.nextCursor;
      }

      setAllEntries(allEntriesData);
      setTotalPages(Math.ceil(allEntriesData.length / PAGE_SIZE));
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllEntries();
  }, [refreshKey, loadAllEntries]);

  useEffect(() => {
    // Update displayed entries when page changes
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    setEntries(allEntries.slice(startIndex, endIndex));
  }, [allEntries, currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    entries,
    isLoading,
    error,
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    goToPage,
    nextPage,
    prevPage,
  };
}

export default function KnowledgeList({ searchResults, onDataChange, refreshKey }: KnowledgeListProps) {
  const { 
    entries, 
    isLoading, 
    error, 
    currentPage, 
    totalPages, 
    hasNextPage, 
    hasPrevPage, 
    nextPage, 
    prevPage, 
    goToPage 
  } = usePaginatedEntries(refreshKey);

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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {entriesToShow.map(entry => (
          <KnowledgeCard key={entry.id} entry={entry} onUpdate={onDataChange} onDelete={onDataChange} />
        ))}
      </div>

      {/* Pagination Controls - only show for non-search results and when there are multiple pages */}
      {searchResults === null && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={!hasPrevPage}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map(pageNum => (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(pageNum)}
                className="min-w-[40px]"
              >
                {pageNum}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={!hasNextPage}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Show total count */}
      {searchResults === null && totalPages > 0 && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Showing {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, entries.length)} of {totalPages * PAGE_SIZE} entries
        </div>
      )}
    </div>
  );
}
