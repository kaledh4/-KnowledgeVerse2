import { prisma } from '@/lib/prisma';
import { KnowledgeEntry } from '@/generated/prisma';
import { extractContent } from '@/lib/content-extraction';
import { Tag } from '@/lib/types';
import { chromaService } from '@/lib/chromadb';
import { vectorSearchService } from '@/lib/vector-search';

export async function createKnowledgeEntry(data: {
  title: string;
  textForEmbedding: string;
  originalSource?: string;
  contentType: 'TEXT' | 'YOUTUBE_LINK' | 'X_POST_LINK';
  tags?: string[];
  userId: string;
}): Promise<KnowledgeEntry & { tags: Tag[] }> {
  let finalData = { ...data };

  // If originalSource is provided and looks like a URL, extract content
  if (data.originalSource && (
    data.originalSource.includes('youtube.com') || 
    data.originalSource.includes('youtu.be') ||
    data.originalSource.includes('x.com') ||
    data.originalSource.includes('twitter.com')
  )) {
    try {
      const extractedContent = await extractContent({ url: data.originalSource });
      finalData = {
        ...data,
        title: extractedContent.title,
        textForEmbedding: extractedContent.text_for_embedding,
        contentType: extractedContent.content_type,
      };
    } catch (error) {
      console.error('Failed to extract content from URL:', error);
      // Continue with original data if extraction fails
    }
  }

  const entry = await prisma.knowledgeEntry.create({
    data: {
      title: finalData.title,
      textForEmbedding: finalData.textForEmbedding,
      originalSource: finalData.originalSource || '',
      contentType: finalData.contentType,
      tags: JSON.stringify(finalData.tags || []),
      userId: finalData.userId,
    },
  });

  // Add to ChromaDB for vector search
  try {
    const chromaId = await chromaService.addEntry(
      entry.id,
      finalData.textForEmbedding,
      {
        title: finalData.title,
        contentType: finalData.contentType,
        originalSource: finalData.originalSource || '',
        tags: finalData.tags || [],
        userId: finalData.userId,
      }
    );

    // Update the entry with ChromaDB ID
    await prisma.knowledgeEntry.update({
      where: { id: entry.id },
      data: { chromaId },
    });
  } catch (error) {
    console.warn('Failed to add entry to ChromaDB:', error);
    // Continue without ChromaDB if it fails
  }

  return {
    ...entry,
    tags: JSON.parse(entry.tags) as Tag[],
  };
}

export async function getKnowledgeEntries(
  limit: number = 20,
  cursor?: string,
  userId?: string
): Promise<{ entries: (KnowledgeEntry & { tags: Tag[] })[]; nextCursor?: string }> {
  const entries = await prisma.knowledgeEntry.findMany({
    where: userId ? { userId } : undefined,
    take: limit + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    orderBy: { createdAt: 'desc' },
  });

  const hasMore = entries.length > limit;
  const results = hasMore ? entries.slice(0, -1) : entries;
  const nextCursor = hasMore ? entries[entries.length - 1].id : undefined;

  return {
    entries: results.map(entry => ({
      ...entry,
      tags: JSON.parse(entry.tags) as Tag[],
    })),
    nextCursor,
  };
}

export async function updateKnowledgeEntry(
  id: string,
  data: Partial<{
    title: string;
    contentType: 'TEXT' | 'YOUTUBE_LINK' | 'X_POST_LINK';
    originalSource: string;
    textForEmbedding: string;
    tags: Tag[];
    chromaId: string;
  }>,
  userId: string
): Promise<KnowledgeEntry & { tags: Tag[] }> {
  const updateData = { ...data };
  if (data.tags) {
    (updateData as any).tags = JSON.stringify(data.tags);
  }

  const entry = await prisma.knowledgeEntry.update({
    where: { 
      id,
      userId, // Ensure user can only update their own entries
    },
    data: updateData,
  });

  return {
    ...entry,
    tags: JSON.parse(entry.tags) as Tag[],
  };
}

export async function deleteKnowledgeEntry(id: string, userId: string): Promise<void> {
  // Get the entry to find its ChromaDB ID and verify ownership
  const entry = await prisma.knowledgeEntry.findUnique({
    where: { 
      id,
      userId, // Ensure user can only delete their own entries
    },
  });

  if (!entry) {
    throw new Error('Knowledge entry not found or access denied');
  }

  // Delete from ChromaDB if it exists
  if (entry.chromaId) {
    try {
      await chromaService.deleteEntry(entry.chromaId);
    } catch (error) {
      console.warn('Failed to delete entry from ChromaDB:', error);
      // Continue with database deletion even if ChromaDB fails
    }
  }

  // Delete from database
  await prisma.knowledgeEntry.delete({
    where: { 
      id,
      userId, // Double-check user ownership
    },
  });
}

export async function getKnowledgeEntry(id: string, userId: string): Promise<(KnowledgeEntry & { tags: Tag[] }) | null> {
  const entry = await prisma.knowledgeEntry.findUnique({
    where: { 
      id,
      userId, // Ensure user can only access their own entries
    },
  });

  if (!entry) return null;

  return {
    ...entry,
    tags: JSON.parse(entry.tags) as Tag[],
  };
}

export async function searchKnowledgeEntries(query: string, userId: string): Promise<(KnowledgeEntry & { tags: Tag[] })[]> {
  // Use hybrid search that combines vector and text search
  const searchResults = await vectorSearchService.hybridSearch(query, 20, userId);
  return searchResults.map(result => result.entry);
}