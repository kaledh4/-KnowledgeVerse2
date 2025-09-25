import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { 
  getKnowledgeEntries, 
  searchKnowledgeEntries, 
  createKnowledgeEntry,
  getKnowledgeEntry 
} from './knowledge-actions.js';
import { vectorSearchService } from './vector-search.js';

class KnowledgeBaseMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'knowledgeverse-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_knowledge',
            description: 'Search the knowledge base using hybrid vector and text search',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query to find relevant knowledge entries',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 10)',
                  default: 10,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_knowledge_entries',
            description: 'Get a list of knowledge entries with pagination',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Number of entries to return (default: 20)',
                  default: 20,
                },
                cursor: {
                  type: 'string',
                  description: 'Cursor for pagination',
                },
              },
            },
          },
          {
            name: 'get_knowledge_entry',
            description: 'Get a specific knowledge entry by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The ID of the knowledge entry to retrieve',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'create_knowledge_entry',
            description: 'Create a new knowledge entry',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Title of the knowledge entry',
                },
                textForEmbedding: {
                  type: 'string',
                  description: 'Text content for embedding and search',
                },
                originalSource: {
                  type: 'string',
                  description: 'Original source URL or reference',
                },
                contentType: {
                  type: 'string',
                  enum: ['TEXT', 'YOUTUBE_LINK', 'X_POST_LINK'],
                  description: 'Type of content',
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Tags for categorization',
                },
              },
              required: ['title', 'textForEmbedding', 'contentType'],
            },
          },
          {
            name: 'vector_search',
            description: 'Perform semantic vector search on the knowledge base',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Query for semantic search',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 10)',
                  default: 10,
                },
              },
              required: ['query'],
            },
          },
        ] as Tool[],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_knowledge': {
            const { query, limit = 10 } = args as { query: string; limit?: number };
            const results = await searchKnowledgeEntries(query);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(results.slice(0, limit), null, 2),
                },
              ],
            };
          }

          case 'get_knowledge_entries': {
            const { limit = 20, cursor } = args as { limit?: number; cursor?: string };
            const result = await getKnowledgeEntries(limit, cursor);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'get_knowledge_entry': {
            const { id } = args as { id: string };
            const entry = await getKnowledgeEntry(id);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(entry, null, 2),
                },
              ],
            };
          }

          case 'create_knowledge_entry': {
            const data = args as {
              title: string;
              textForEmbedding: string;
              originalSource?: string;
              contentType: 'TEXT' | 'YOUTUBE_LINK' | 'X_POST_LINK';
              tags?: string[];
            };
            const entry = await createKnowledgeEntry(data);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(entry, null, 2),
                },
              ],
            };
          }

          case 'vector_search': {
            const { query, limit = 10 } = args as { query: string; limit?: number };
            const results = await vectorSearchService.vectorSearch(query, limit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(results, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('KnowledgeVerse MCP Server running on stdio');
  }
}

// Run the server if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new KnowledgeBaseMCPServer();
  server.run().catch(console.error);
}

export { KnowledgeBaseMCPServer };