#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { setupHandlers } from './tools/tool_list.js';

// Crear servidor MCP
const server = new Server(
  {
    name: 'postgres-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// tools register
setupHandlers(server);

// Manejo de señales para cerrar limpiamente
process.on('SIGINT', async () => {
  console.error('Shutting down server...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Shutting down server...');
  await server.close();
  process.exit(0);
});

// Función principal para iniciar el servidor
async function main() {
  try {
    // Crear transport para stdio
    const transport = new StdioServerTransport();
    
    // Conectar el servidor al transport
    await server.connect(transport);
    
    // Log para debug (va a stderr para no interferir con stdio)
    console.error('MCP Server started and listening on stdio');
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Ejecutar el servidor
main();
