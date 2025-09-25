'use server';

/**
 * @fileOverview Ingests new or updated knowledge entries into ChromaDB using a Cloud Function, triggered by Firestore document changes.
 *
 * - ingestKnowledge - A function that handles the knowledge ingestion process.
 * - IngestKnowledgeInput - The input type for the ingestKnowledge function.
 * - IngestKnowledgeOutput - The return type for the ingestKnowledge function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IngestKnowledgeInputSchema = z.object({
  documentId: z.string().describe('The ID of the Firestore document.'),
  contentType: z.enum(['TEXT', 'YOUTUBE_LINK', 'X_POST_LINK']).describe('The type of content being ingested.'),
  originalSource: z.string().describe('The raw text or URL pasted by the user.'),
  textForEmbedding: z.string().describe('The full, extracted, and cleaned text for vector embedding.'),
});
export type IngestKnowledgeInput = z.infer<typeof IngestKnowledgeInputSchema>;

const IngestKnowledgeOutputSchema = z.object({
  chromaId: z.string().describe('The ID returned from ChromaDB after successful vector ingestion.'),
});
export type IngestKnowledgeOutput = z.infer<typeof IngestKnowledgeOutputSchema>;

export async function ingestKnowledge(input: IngestKnowledgeInput): Promise<IngestKnowledgeOutput> {
  return ingestKnowledgeFlow(input);
}

const ingestKnowledgeFlow = ai.defineFlow(
  {
    name: 'ingestKnowledgeFlow',
    inputSchema: IngestKnowledgeInputSchema,
    outputSchema: IngestKnowledgeOutputSchema,
  },
  async input => {
    // Dummy logic - replace with actual ChromaDB ingestion
    console.log(`Ingesting document ${input.documentId} into ChromaDB.`);
    // Return a consistent, fake chromaId for now.
    const dummyChromaId = `chroma-${input.documentId}`;
    return { chromaId: dummyChromaId };
  }
);
