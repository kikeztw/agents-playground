import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';

import { handleQuery } from './handleQuery.js';
import { handleWrite } from './handleWrite.js';
import { handleListTables } from './handleListTables.js';

export const setupHandlers = (server: Server) => {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'postgres_list_tables',
          description: 'List all tables in the PostgreSQL database with optional schema and column information',
          inputSchema: {
            type: 'object',
            properties: {
              schema: {
                type: 'string',
                description: 'Schema name to list tables from (default: public)',
                default: 'public'
              },
              includeViews: {
                type: 'boolean',
                description: 'Include views in the results (default: false)',
                default: false
              },
              includeColumns: {
                type: 'boolean',
                description: 'Include column information for each table (default: false)',
                default: false
              }
            },
            required: []
          }
        },
        {
          name: 'postgres_query',
          description: 'Execute a SELECT query on any PostgreSQL table',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'SQL SELECT query to execute'
              },
              params: {
                type: 'array',
                description: 'Parameters for the SQL query (optional)',
                items: { type: 'string' }
              }
            },
            required: ['query']
          }
        },
        {
          name: 'postgres_write',
          description: 'Perform write operations (INSERT, UPDATE, DELETE) on PostgreSQL tables',
          inputSchema: {
            type: 'object',
            properties: {
              table: {
                type: 'string',
                description: 'Name of the table to operate on'
              },
              operation: {
                type: 'string',
                enum: ['insert', 'update', 'delete'],
                description: 'Type of operation to perform'
              },
              data: {
                type: 'object',
                description: 'Data for insert/update operations',
                additionalProperties: true
              },
              where: {
                type: 'object',
                description: 'WHERE conditions for update/delete operations',
                additionalProperties: true
              },
              returning: {
                type: 'array',
                description: 'Columns to return after operation',
                items: { type: 'string' }
              }
            },
            required: ['table', 'operation']
          }
        }
      ] as Tool[]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      switch (name) {
        case 'postgres_query':
          return await handleQuery(args);
        case 'postgres_write':
          return await handleWrite(args);
        case 'postgres_list_tables':
          return await handleListTables(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  });
}


