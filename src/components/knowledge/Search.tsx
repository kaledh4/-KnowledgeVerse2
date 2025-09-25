'use client';

import { useState, useCallback } from 'react';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { KnowledgeEntry } from '@/lib/types';
import { ApiClient } from '@/lib/api-client';
import KnowledgeCard from './KnowledgeCard';
import { Spinner } from '../ui/spinner';
import { useToast } from '@/hooks/use-toast';

type SearchProps = {
  onSearch: (results: KnowledgeEntry[] | null) => void;
};

export default function Search({ onSearch }: SearchProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      onSearch(null);
      return;
    }

    setIsLoading(true);
    try {
      const results = await ApiClient.searchKnowledgeEntries(query);
      onSearch(results);
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        variant: 'destructive',
        title: 'Search Error',
        description: 'Could not perform search. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch(null);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search your knowledge vault..."
        className="w-full bg-background/50 pl-9 pr-9"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {isLoading ? (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : (
        query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )
      )}
    </form>
  );
}
