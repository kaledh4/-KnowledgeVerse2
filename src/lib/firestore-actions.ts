'use client';

import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  serverTimestamp,
  where,
  query,
  getDocs,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { extractContent } from '@/ai/flows/content-extraction';
import { ingestKnowledge } from '@/ai/flows/chromadb-ingestion';
import { deleteKnowledgeEntry } from '@/ai/flows/knowledge-deletion-sync';
import { vectorSearch } from '@/ai/flows/vector-search';
import type { KnowledgeEntryClient, Tag } from './types';
import { FirestorePermissionError, errorEmitter } from '@/firebase';
import { getApp } from 'firebase/app';

// Get the firestore instance from the initialized client-side app
const db = getFirestore(getApp());

interface AddOrUpdateEntryInput {
  entryId?: string;
  userId: string;
  originalSource: string;
  tags: Tag[];
  // This field is only provided when editing a YouTube entry's transcript
  textForEmbedding?: string; 
}

export async function addOrUpdateEntry(input: AddOrUpdateEntryInput) {
  const { entryId, userId, originalSource, tags } = input;

  try {
    const isUrl = originalSource.startsWith('http');
    let extractedContent: { title: string; text_for_embedding: string; content_type: "TEXT" | "YOUTUBE_LINK" | "X_POST_LINK"; };

    if (isUrl) {
      // For any URL, we rely on the content extraction flow
      extractedContent = await extractContent({ url: originalSource });
    } else {
      // Plain text entry
      extractedContent = {
        title: originalSource.substring(0, 50) + (originalSource.length > 50 ? '...' : ''),
        text_for_embedding: originalSource,
        content_type: 'TEXT',
      };
    }
    
    // Always prepend title to the text for embedding to make it searchable
    const textForEmbedding = `${extractedContent.title}\n\n${extractedContent.text_for_embedding}`;
    const { title, content_type: contentType } = extractedContent;

    const collectionRef = collection(db, `users/${userId}/knowledge_entries`);

    if (entryId) {
      // Update existing entry
      const entryRef = doc(collectionRef, entryId);
      const updatedData: Partial<KnowledgeEntryClient> & { updatedAt: any } = {
        tags,
        updatedAt: serverTimestamp(),
      };
      
      // Check if text was manually updated (e.g., editing a transcript)
      if (input.textForEmbedding && input.textForEmbedding !== originalSource) {
         updatedData.textForEmbedding = `${title}\n\n${input.textForEmbedding}`;
      }

      await updateDoc(entryRef, updatedData);
      
      // Always re-ingest on update to ensure vector is fresh
      const finalIngestionText = updatedData.textForEmbedding || textForEmbedding;
      const ingestResult = await ingestKnowledge({
        documentId: entryId,
        contentType: contentType,
        originalSource: originalSource,
        textForEmbedding: finalIngestionText,
      });
      await updateDoc(entryRef, { chromaId: ingestResult.chromaId });

    } else {
      // Create new entry
      const newEntryData = {
        userId,
        title,
        contentType,
        originalSource,
        textForEmbedding,
        tags,
        chromaId: '', // Start with an empty chromaId
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 1. Add the document to get an ID
      const entryRef = await addDoc(collectionRef, newEntryData);
      
      // 2. Ingest the content to get a chromaId
      const ingestResult = await ingestKnowledge({
        documentId: entryRef.id,
        contentType: contentType,
        originalSource: originalSource,
        textForEmbedding: textForEmbedding,
      });

      // 3. Update the document with the new chromaId
      await updateDoc(entryRef, { chromaId: ingestResult.chromaId });
    }
  } catch (error: any) {
    console.error('Error in addOrUpdateEntry:', error);
    // Let the calling form handle UI errors
    throw error;
  }
}

export async function deleteEntry(userId: string, entryId: string, chromaId?: string) {
    const entryRef = doc(db, `users/${userId}/knowledge_entries`, entryId);
    
    await deleteDoc(entryRef);

    if (chromaId) {
        await deleteKnowledgeEntry({ chromaId });
    }
}

export async function searchEntries(userId: string, searchQuery: string): Promise<KnowledgeEntryClient[]> {
  try {
    const vectorHits = await vectorSearch({ query: searchQuery });

    if (vectorHits.length === 0) {
      return [];
    }

    const entriesRef = collection(db, `users/${userId}/knowledge_entries`);
    // Firestore 'in' queries are limited to 30 items.
    const q = query(entriesRef, where('chromaId', 'in', vectorHits.slice(0, 30)));
    
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    const results = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate(),
      } as KnowledgeEntryClient;
    });

    // The vector search may not be perfectly ordered, so we re-order based on the original hits
    results.sort((a, b) => {
        const indexA = a.chromaId ? vectorHits.indexOf(a.chromaId) : -1;
        const indexB = b.chromaId ? vectorHits.indexOf(b.chromaId) : -1;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    return results;

  } catch (error) {
    console.error("Search failed:", error);
    throw new Error("Search operation failed.");
  }
}
