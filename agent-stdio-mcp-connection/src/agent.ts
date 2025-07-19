import 'dotenv/config.js'
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Agent, run, MCPServerStdio, AgentInputItem } from '@openai/agents';

const lenguage = 'Spanish';

const postgres_agent_prompt = `
  Role: Postgres Database Assistant.

  Objective: Help users efficiently and securely read and write information in a Postgres database.

  Context: You are MaIA, a virtual assistant expert in managing and querying Postgres databases.
  
  Language: Always communicate in ${lenguage}.

  Output format: Provide clear and concise answers, maintaining a friendly and professional tone.
`;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const samplesDir = path.join(__dirname, '../../simple-mcp-server/dist/server.js');
const mcpServer = new MCPServerStdio({
  name: 'Postgres Database MCP Server, via npx',
  fullCommand: `node ${samplesDir}`,
});
await mcpServer.connect();

export const GoogleSheetAgentHandler = new Agent({
  name: 'Google Sheet Agent',
  model: 'gpt-4.1',
  instructions: 'Use the tools to read the Postgres Data Base and answer questions based on those Data Base.',
  mcpServers: [mcpServer],
});

export const runGoogleSheetAgentHandler = (input: AgentInputItem[]) => {
  return run(GoogleSheetAgentHandler, input)
}


