// src/ai/flows/vector-search.ts
'use server';
/**
 * @fileOverview Implements vector search functionality to find relevant knowledge entries in ChromaDB based on user queries.
 *
 * - vectorSearch - A function that performs a vector similarity search against the ChromaDB.
 * - VectorSearchInput - The input type for the vectorSearch function.
 * - VectorSearchOutput - The return type for the vectorSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {embed} from 'genkit';

const VectorSearchInputSchema = z.object({
  query: z.string().describe('The user search query.'),
});
export type VectorSearchInput = z.infer<typeof VectorSearchInputSchema>;

const VectorSearchOutputSchema = z.array(z.string()).describe('An array of chroma_ids of the top 5 most relevant knowledge entries.');
export type VectorSearchOutput = z.infer<typeof VectorSearchOutputSchema>;

export async function vectorSearch(input: VectorSearchInput): Promise<VectorSearchOutput> {
  return vectorSearchFlow(input);
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) {
        return 0;
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

const vectorSearchFlow = ai.defineFlow(
  {
    name: 'vectorSearchFlow',
    inputSchema: VectorSearchInputSchema,
    outputSchema: VectorSearchOutputSchema,
  },
  async (input) => {
    // This is a placeholder for a real vector search implementation.
    // In a real application, you would query a vector database like ChromaDB.
    // Here, we simulate it by creating embeddings for some dummy data
    // and comparing it with the query embedding.

    console.log(`Performing simulated vector search for: "${input.query}"`);
    
    const queryEmbedding = await embed({
        model: 'googleai/embedding-001',
        input: input.query,
    });

    // Simulate a small corpus of documents that would exist in a vector DB.
    const documents = [
      { id: 'chroma-doc-1', text: 'Investing in AI and machine learning can be profitable.' },
      { id: 'chroma-doc-2', text: 'YouTube is a platform for video content.' },
      { id: 'chroma-doc-3', text: 'Piotroski F-Score and Altman Z-Score are financial health indicators for companies.' },
      { id: 'chroma-doc-4', text: 'Learning new skills is important for personal growth.' },
      { id: 'chroma-doc-5', text: 'X, formerly known as Twitter, is a social media platform.' },
    ];

    const documentEmbeddings = await Promise.all(
        documents.map(async (doc) => {
            const embedding = await embed({
                model: 'googleai/embedding-001',
                input: doc.text,
            });
            return { id: doc.id, embedding };
        })
    );

    // Calculate similarity and rank documents
    const rankedDocuments = documentEmbeddings.map(doc => ({
        id: doc.id,
        similarity: cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    rankedDocuments.sort((a, b) => b.similarity - a.similarity);

    // Return the IDs of the top 5 most relevant documents
    const top5Ids = rankedDocuments.slice(0, 5).map(doc => doc.id);

    return top5Ids;
  }
);
