'use server';

/**
 * @fileOverview Deletes corresponding vector entries in ChromaDB when a knowledge entry is deleted from Firestore.
 *
 * - deleteKnowledgeEntry - A function that handles the deletion of knowledge entry in ChromaDB.
 * - DeleteKnowledgeEntryInput - The input type for the deleteKnowledgeEntry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DeleteKnowledgeEntryInputSchema = z.object({
  chromaId: z
    .string()
    .describe('The ChromaDB ID of the knowledge entry to delete.'),
});
export type DeleteKnowledgeEntryInput = z.infer<typeof DeleteKnowledgeEntryInputSchema>;


export async function deleteKnowledgeEntry(input: DeleteKnowledgeEntryInput): Promise<void> {
  return deleteKnowledgeEntryFlow(input);
}

const deleteKnowledgeEntryFlow = ai.defineFlow(
  {
    name: 'deleteKnowledgeEntryFlow',
    inputSchema: DeleteKnowledgeEntryInputSchema,
    outputSchema: z.void(),
  },
  async input => {
    // Logic to call ChromaDB and delete the vector entry.
    // Placeholder for ChromaDB deletion logic.
    console.log(`Deleting ChromaDB entry with ID: ${input.chromaId}`);
    // In a real implementation, you would call the ChromaDB API here.

    return;
  }
);
