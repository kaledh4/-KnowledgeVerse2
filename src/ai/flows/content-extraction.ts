'use server';

/**
 * @fileOverview Extracts content from a given URL (YouTube or X posts).
 *
 * - extractContent - A function that extracts the main content from a URL.
 * - ExtractContentInput - The input type for the extractContent function.
 * - ExtractContentOutput - The return type for the extractContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { fetchTranscript } from 'youtube-transcript-plus';

const ExtractContentInputSchema = z.object({
  url: z.string().describe('The URL of the content to extract (e.g., YouTube video, X post).'),
});
export type ExtractContentInput = z.infer<typeof ExtractContentInputSchema>;

const ExtractContentOutputSchema = z.object({
  text_for_embedding: z.string().describe('The extracted text content for embedding.'),
  title: z.string().describe('The title of the content.'),
  content_type: z.enum(['TEXT', 'YOUTUBE_LINK', 'X_POST_LINK']).describe('Type of content extracted'),
});
export type ExtractContentOutput = z.infer<typeof ExtractContentOutputSchema>;

export async function extractContent(input: ExtractContentInput): Promise<ExtractContentOutput> {
  return extractContentFlow(input);
}

const extractContentFlow = ai.defineFlow(
  {
    name: 'extractContentFlow',
    inputSchema: ExtractContentInputSchema,
    outputSchema: ExtractContentOutputSchema,
  },
  async (input) => {
    const isYouTube = input.url.includes('youtube.com') || input.url.includes('youtu.be');
    const isX = input.url.includes('x.com') || input.url.includes('twitter.com');

    if (isYouTube) {
      try {
        const transcript = await fetchTranscript(input.url, {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });
        const text = transcript.map((item) => item.text).join(' ');
        
        // For title, we need to make another request if possible or generate a fallback.
        // Let's try to get video details via an oEmbed endpoint.
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(input.url)}&format=json`;
        let title = `YouTube Video`;
        try {
          const oembedResponse = await fetch(oembedUrl);
          if (oembedResponse.ok) {
            const oembedData = await oembedResponse.json();
            title = oembedData.title || title;
          }
        } catch (titleError) {
          console.error(`Could not fetch oEmbed title for ${input.url}:`, titleError);
          const videoIdMatch = input.url.match(/(?:v=|\/|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\?|&|$)/);
          const videoId = videoIdMatch ? videoIdMatch[1] : 'unknown';
          title = `YouTube Video: ${videoId}`;
        }

        return {
          title: title,
          text_for_embedding: text,
          content_type: 'YOUTUBE_LINK',
        };
      } catch (error) {
        console.error(`Failed to fetch transcript for ${input.url}:`, error);
        
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(input.url)}&format=json`;
        let title = `YouTube Video`;
        try {
          const oembedResponse = await fetch(oembedUrl);
          if (oembedResponse.ok) {
            const oembedData = await oembedResponse.json();
            title = oembedData.title || title;
          }
        } catch (titleError) {
           console.error(`Could not fetch oEmbed title for ${input.url}:`, titleError);
        }

        return {
          title: title,
          text_for_embedding: `Could not retrieve transcript for this video. It may be private, age-restricted, or have transcripts disabled. URL: ${input.url}`,
          content_type: 'YOUTUBE_LINK',
        };
      }
    } else if (isX) {
      // X.com scraping is very unreliable. Returning placeholder.
      return {
        title: 'X Post Content',
        text_for_embedding: 'This is the dummy content of the X post from ' + input.url,
        content_type: 'X_POST_LINK',
      };
    } else {
      // Fallback for plain text or other URLs
      return {
        title: input.url.substring(0, 50) + (input.url.length > 50 ? '...' : ''),
        text_for_embedding: input.url,
        content_type: 'TEXT',
      };
    }
  }
);
