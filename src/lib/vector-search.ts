import { chromaService } from '@/lib/chromadb';
import { prisma } from '@/lib/prisma';
import { KnowledgeEntry } from '@/generated/prisma';
import { Tag } from '@/lib/types';

export interface SearchResult {
  entry: KnowledgeEntry & { tags: Tag[] };
  similarity?: number;
  source: 'vector' | 'text';
}

export class VectorSearchService {
  async hybridSearch(
    query: string,
    limit: number = 10,
    userId?: string
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    // 1. Vector search using ChromaDB
    try {
      const vectorResults = await chromaService.searchSimilar(query, Math.ceil(limit / 2));
      
      for (const result of vectorResults) {
        const entry = await prisma.knowledgeEntry.findUnique({
          where: { 
            id: result.id,
            ...(userId && { userId })
          },
        });

        if (entry) {
          results.push({
            entry: {
              ...entry,
              tags: JSON.parse(entry.tags) as Tag[],
            },
            similarity: result.distance ? 1 - result.distance : undefined,
            source: 'vector',
          });
        }
      }
    } catch (error) {
      console.warn('Vector search failed, falling back to text search:', error);
    }

    // 2. Traditional text search for remaining slots
    const remainingLimit = limit - results.length;
    if (remainingLimit > 0) {
      const textResults = await prisma.knowledgeEntry.findMany({
        where: {
          ...(userId && { userId }),
          OR: [
            { title: { contains: query } },
            { textForEmbedding: { contains: query } },
            { tags: { contains: query } },
          ],
          // Exclude entries already found by vector search
          id: {
            notIn: results.map(r => r.entry.id),
          },
        },
        take: remainingLimit,
        orderBy: { createdAt: 'desc' },
      });

      for (const entry of textResults) {
        results.push({
          entry: {
            ...entry,
            tags: JSON.parse(entry.tags) as Tag[],
          },
          source: 'text',
        });
      }
    }

    // Sort by similarity (vector results first, then by creation date)
    return results.sort((a, b) => {
      if (a.source === 'vector' && b.source === 'text') return -1;
      if (a.source === 'text' && b.source === 'vector') return 1;
      if (a.similarity && b.similarity) return b.similarity - a.similarity;
      return new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime();
    });
  }

  async vectorSearch(query: string, limit: number = 10, userId?: string): Promise<SearchResult[]> {
    try {
      const vectorResults = await chromaService.searchSimilar(query, limit);
      const results: SearchResult[] = [];

      for (const result of vectorResults) {
        const entry = await prisma.knowledgeEntry.findUnique({
          where: { 
            id: result.id,
            ...(userId && { userId })
          },
        });

        if (entry) {
          results.push({
            entry: {
              ...entry,
              tags: JSON.parse(entry.tags) as Tag[],
            },
            similarity: result.distance ? 1 - result.distance : undefined,
            source: 'vector',
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Vector search failed:', error);
      return [];
    }
  }
}

export const vectorSearchService = new VectorSearchService();