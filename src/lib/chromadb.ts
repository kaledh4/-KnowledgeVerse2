import { ChromaClient } from 'chromadb';

// Initialize ChromaDB client
const chromaClient = new ChromaClient({
  path: process.env.CHROMADB_URL || 'http://localhost:8000',
});

// We'll use the default embedding function for now
// OpenAI embedding function needs to be configured differently in newer versions

// Collection name for knowledge entries
const COLLECTION_NAME = 'knowledge_entries';

export class ChromaDBService {
  private collection: any = null;
  private isAvailable: boolean = true;

  async initialize() {
    try {
      // Get or create collection without custom embedding function for now
      this.collection = await chromaClient.getOrCreateCollection({
        name: COLLECTION_NAME,
      });
      this.isAvailable = true;
      console.log('ChromaDB collection initialized successfully');
    } catch (error) {
      console.warn('ChromaDB not available, falling back to database-only mode:', error);
      this.isAvailable = false;
      // Don't throw error - allow the app to continue without vector search
    }
  }

  async addEntry(id: string, text: string, metadata: Record<string, any>) {
    if (!this.isAvailable) {
      console.log('ChromaDB not available, skipping vector storage');
      return id;
    }

    if (!this.collection) {
      await this.initialize();
    }

    if (!this.isAvailable) {
      return id;
    }

    try {
      await this.collection.add({
        ids: [id],
        documents: [text],
        metadatas: [metadata],
      });
      return id;
    } catch (error) {
      console.error('Failed to add entry to ChromaDB:', error);
      this.isAvailable = false;
      return id; // Don't throw error, just continue without vector storage
    }
  }

  async updateEntry(id: string, text: string, metadata: Record<string, any>) {
    if (!this.isAvailable) {
      console.log('ChromaDB not available, skipping vector update');
      return;
    }

    if (!this.collection) {
      await this.initialize();
    }

    if (!this.isAvailable) {
      return;
    }

    try {
      await this.collection.update({
        ids: [id],
        documents: [text],
        metadatas: [metadata],
      });
    } catch (error) {
      console.error('Failed to update entry in ChromaDB:', error);
      this.isAvailable = false;
      // Don't throw error, just continue without vector storage
    }
  }

  async deleteEntry(id: string) {
    if (!this.isAvailable) {
      console.log('ChromaDB not available, skipping vector deletion');
      return;
    }

    if (!this.collection) {
      await this.initialize();
    }

    if (!this.isAvailable) {
      return;
    }

    try {
      await this.collection.delete({
        ids: [id],
      });
    } catch (error) {
      console.error('Failed to delete entry from ChromaDB:', error);
      this.isAvailable = false;
      // Don't throw error, just continue without vector storage
    }
  }

  async searchSimilar(query: string, limit: number = 10) {
    if (!this.isAvailable) {
      console.log('ChromaDB not available, returning empty vector search results');
      return [];
    }

    if (!this.collection) {
      await this.initialize();
    }

    if (!this.isAvailable) {
      return [];
    }

    try {
      const results = await this.collection.query({
        queryTexts: [query],
        nResults: limit,
      });

      return results.ids[0]?.map((id: string, index: number) => ({
        id,
        document: results.documents[0][index],
        metadata: results.metadatas[0][index],
        distance: results.distances?.[0]?.[index],
      })) || [];
    } catch (error) {
      console.error('Failed to search ChromaDB:', error);
      this.isAvailable = false;
      return []; // Return empty results instead of throwing
    }
  }
}

// Singleton instance
export const chromaService = new ChromaDBService();