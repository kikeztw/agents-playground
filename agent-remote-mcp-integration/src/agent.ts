import 'dotenv/config.js'
import { Agent, run, hostedMcpTool, AgentInputItem } from '@openai/agents';

import { createBackendClient } from "@pipedream/sdk/server";

console.log('PIPEDREAM_CLIENT_ID:', process.env.PIPEDREAM_CLIENT_ID);
console.log('PIPEDREAM_CLIENT_SECRET:', process.env.PIPEDREAM_CLIENT_SECRET);
console.log('PIPEDREAM_PROJECT_ID:', process.env.PIPEDREAM_PROJECT_ID);
console.log('PIPEDREAM_ENVIRONMENT:', process.env.PIPEDREAM_ENVIRONMENT);
 
// Initialize the Pipedream SDK client
const pd = createBackendClient({
  environment: process.env.PIPEDREAM_ENVIRONMENT as "development" | "production",
  credentials: {
    clientId: process.env.PIPEDREAM_CLIENT_ID as string,
    clientSecret: process.env.PIPEDREAM_CLIENT_SECRET as string,
  },
  projectId: process.env.PIPEDREAM_PROJECT_ID as string,
});
 
// Find the app to use for the MCP server
// For this example, we'll use Notion
const apps = await pd.getApps({ q: "google_sheets" });
const appSlug = apps.data[0].name_slug; // e.g., "notion",
console.log(`Using app: ${JSON.stringify(apps, null, 2)}`);
 
// Get access token for MCP server auth
const accessToken = await pd.rawAccessToken();
 
// Send the unique ID that you use to identify this user in your system
const externalUserId = 'abc-1233'; // Used in MCP URL to identify the user

const lenguage = 'Spanish';

const google_sheet_agent_prompt = `
  Role: Google Sheets Assistant.

  Objective: Help users efficiently and easily create new spreadsheets (sheets) in Google Sheets.

  Background: You are MaIA, a virtual assistant expert in data management and organization in Google Sheets. You are designed to guide users step by step in creating new sheets, ensuring clarity and accuracy in every instruction.

  Restrictions:

  - Do not provide information related to software development, including code or code examples.
  - Limit your responses to topics related to the creation and management of sheets in Google Sheets. Decline to answer unrelated questions.

  Language: Always communicate in ${lenguage}.

  Output format:

  Provide clear and concise responses, maintaining a friendly and professional tone.
`;

export const GoogleSheetAgentHandler = new Agent({
  name: 'Google Sheet Agent',
  model: 'gpt-4.1',
  instructions: google_sheet_agent_prompt,
  tools: [
     hostedMcpTool({
        serverLabel: appSlug,
        serverUrl: `https://remote.mcp.pipedream.net`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-pd-project-id": process.env.PIPEDREAM_PROJECT_ID as string,
          "x-pd-environment": process.env.PIPEDREAM_ENVIRONMENT as string,
          "x-pd-external-user-id": externalUserId,
          "x-pd-app-slug": appSlug,
        },
        requireApproval: 'never'
    }),
  ],
});

export const runGoogleSheetAgentHandler = (input: AgentInputItem[]) => {
  return run(GoogleSheetAgentHandler, input)
}


