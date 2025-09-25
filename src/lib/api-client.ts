import { KnowledgeEntry, Tag } from '@/lib/types';

const API_BASE = '/api/knowledge';

export interface KnowledgeEntriesResponse {
  entries: KnowledgeEntry[];
  nextCursor?: string;
}

export class ApiClient {
  static async getKnowledgeEntries(cursor?: string, limit = 9): Promise<KnowledgeEntriesResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE}?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch knowledge entries');
    }
    return response.json();
  }

  static async createKnowledgeEntry(source: string, tags: Tag[]): Promise<KnowledgeEntry> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ source, tags }),
    });

    if (!response.ok) {
      throw new Error('Failed to create knowledge entry');
    }
    return response.json();
  }

  static async getKnowledgeEntry(id: string): Promise<KnowledgeEntry> {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch knowledge entry');
    }
    return response.json();
  }

  static async updateKnowledgeEntry(id: string, source: string, tags: Tag[]): Promise<KnowledgeEntry> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ source, tags }),
    });

    if (!response.ok) {
      throw new Error('Failed to update knowledge entry');
    }
    return response.json();
  }

  static async deleteKnowledgeEntry(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete knowledge entry');
    }
  }

  static async searchKnowledgeEntries(query: string): Promise<KnowledgeEntry[]> {
    const params = new URLSearchParams({ q: query });
    const response = await fetch(`${API_BASE}/search?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to search knowledge entries');
    }
    return response.json();
  }
}