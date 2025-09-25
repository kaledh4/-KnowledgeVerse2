#!/usr/bin/env node

import { KnowledgeBaseMCPServer } from '../src/lib/mcp-server.js';

const server = new KnowledgeBaseMCPServer();
server.run().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});