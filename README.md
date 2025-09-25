# KnowledgeVerse

A modern knowledge management system with AI-powered search capabilities, built with Next.js, Prisma, ChromaDB, and Model Context Protocol (MCP) integration.

## Features

- 📝 **Knowledge Entry Management**: Create, edit, and organize knowledge entries
- 🔍 **Hybrid Search**: Combines vector similarity search with traditional text search
- 🎥 **YouTube Integration**: Automatically extract transcripts from YouTube videos
- 🐦 **X/Twitter Support**: Basic support for X/Twitter post links
- 🤖 **MCP Integration**: Expose knowledge base as tools for LLM integration
- 🎨 **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- 📊 **Vector Storage**: ChromaDB integration for semantic search capabilities

## Tech Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Vector Database**: ChromaDB
- **AI Integration**: OpenAI embeddings, MCP (Model Context Protocol)
- **Content Extraction**: YouTube transcript API
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ 
- Docker (for ChromaDB)
- OpenAI API key (for embeddings)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd knowledgeverse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   CHROMADB_URL="http://localhost:8000"
   OPENAI_API_KEY="your-openai-api-key-here"
   ```

4. **Start ChromaDB**
   ```bash
   docker-compose up -d chromadb
   ```

5. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Usage

### Adding Knowledge Entries

1. Navigate to the application
2. Click "Add Entry" 
3. Choose content type:
   - **Text**: Direct text input
   - **YouTube Link**: Automatically extracts transcript
   - **X/Twitter Link**: Basic link support
4. Add title, content, and tags
5. Save the entry

### Searching Knowledge

- Use the search bar to find entries
- The system uses hybrid search combining:
  - Vector similarity search (semantic understanding)
  - Traditional text search (keyword matching)
- Results are ranked by relevance and similarity

### MCP Integration

The knowledge base can be exposed as tools for LLM integration:

```bash
npm run mcp-server
```

Available MCP tools:
- `search_knowledge`: Search the knowledge base
- `get_knowledge_entries`: List entries with pagination
- `get_knowledge_entry`: Get specific entry by ID
- `create_knowledge_entry`: Create new entries
- `vector_search`: Semantic vector search

## Development

### Database Schema

The application uses a simple schema with one main table:

```sql
model KnowledgeEntry {
  id               String   @id @default(cuid())
  title            String
  contentType      String   // 'TEXT' | 'YOUTUBE_LINK' | 'X_POST_LINK'
  originalSource   String
  textForEmbedding String
  tags             String   // JSON string of tags array
  chromaId         String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── knowledge/       # Knowledge-specific components
│   ├── layout/          # Layout components
│   └── ui/              # Reusable UI components
├── lib/                 # Utility libraries
│   ├── chromadb.ts      # ChromaDB client
│   ├── content-extraction.ts # Content extraction logic
│   ├── knowledge-actions.ts  # Database operations
│   ├── mcp-server.ts    # MCP server implementation
│   ├── prisma.ts        # Prisma client
│   ├── types.ts         # Type definitions
│   └── vector-search.ts # Vector search service
└── generated/           # Generated Prisma client
```

### Adding New Content Types

1. Update the `contentType` enum in the Prisma schema
2. Add extraction logic in `src/lib/content-extraction.ts`
3. Update the UI components to handle the new type
4. Run database migration: `npx prisma migrate dev`

## Deployment

### Vercel Deployment

1. **Prepare for deployment**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy automatically on push to main branch

3. **Database Options**
   - **Development**: Local SQLite
   - **Production**: Turso (SQLite cloud) or PostgreSQL

### ChromaDB Deployment

For production, consider:
- ChromaDB Cloud
- Self-hosted ChromaDB on cloud providers
- Alternative vector databases (Pinecone, Weaviate)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [ChromaDB](https://www.trychroma.com/) for vector database capabilities
- [Prisma](https://www.prisma.io/) for database ORM
- [Model Context Protocol](https://modelcontextprotocol.io/) for LLM integration
- [Radix UI](https://www.radix-ui.com/) for accessible UI components
