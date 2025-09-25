import { fetchTranscript } from 'youtube-transcript-plus';

export interface ExtractContentInput {
  url: string;
}

export interface ExtractContentOutput {
  text_for_embedding: string;
  title: string;
  content_type: 'TEXT' | 'YOUTUBE_LINK' | 'X_POST_LINK';
}

export async function extractContent(input: ExtractContentInput): Promise<ExtractContentOutput> {
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
    // X.com scraping is challenging due to authentication requirements and API limitations
    // We'll try to use Twitter's oEmbed API for basic information, then fall back to URL parsing
    try {
      // Try to extract username and tweet ID from URL
      const urlMatch = input.url.match(/(?:x\.com|twitter\.com)\/([^\/]+)\/status\/(\d+)/);
      const username = urlMatch ? urlMatch[1] : 'unknown';
      const tweetId = urlMatch ? urlMatch[2] : 'unknown';
      
      // Attempt to use Twitter's oEmbed API for basic tweet information
      let title = `X Post by @${username}`;
      let content = `X/Twitter post from @${username} (ID: ${tweetId}).`;
      
      try {
        // Twitter's oEmbed endpoint (may work for some public tweets)
        const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(input.url)}&omit_script=true`;
        const oembedResponse = await fetch(oembedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (oembedResponse.ok) {
          const oembedData = await oembedResponse.json();
          if (oembedData.html) {
            // Extract text content from the HTML
            const htmlContent = oembedData.html;
            // Simple regex to extract text content (removing HTML tags)
            const textMatch = htmlContent.match(/>([^<]+)</g);
            if (textMatch && textMatch.length > 0) {
              const extractedText = textMatch
                .map(match => match.replace(/^>|<$/g, '').trim())
                .filter(text => text.length > 10 && !text.includes('twitter.com') && !text.includes('pic.twitter.com'))
                .join(' ');
              
              if (extractedText.length > 20) {
                content = extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : '');
                title = `X Post by @${username}: ${extractedText.substring(0, 50)}${extractedText.length > 50 ? '...' : ''}`;
              }
            }
          }
          
          if (oembedData.author_name) {
            title = `X Post by @${oembedData.author_name}`;
          }
        }
      } catch (oembedError) {
        console.log(`oEmbed extraction failed for ${input.url}, using fallback`);
      }
      
      return {
        title: title,
        text_for_embedding: `${content} URL: ${input.url}`,
        content_type: 'X_POST_LINK',
      };
    } catch (error) {
      return {
        title: 'X Post Content',
        text_for_embedding: `X/Twitter post content. Note: Full content extraction requires authentication or third-party services due to platform restrictions. URL: ${input.url}`,
        content_type: 'X_POST_LINK',
      };
    }
  } else {
    // Fallback for plain text or other URLs
    return {
      title: input.url.substring(0, 50) + (input.url.length > 50 ? '...' : ''),
      text_for_embedding: input.url,
      content_type: 'TEXT',
    };
  }
}