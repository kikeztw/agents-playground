# agents-playground

## Usage Example: `simple-sales-agent`

Follow these steps to install dependencies and run the example:

```bash
# Clone the repository
git clone https://github.com/your-username/agents-openAI-examples.git
cd agents-openAI-examples/simple-sales-agent

# Install dependencies
npm install
```

Setup your openAI Key

Create a `.env` file in the `simple-sales-agent` directory and add your OpenAI API key:

```env
OPENAI_API_KEY=your-openai-api-key-here
```


## Prerequisites
To use either the remote or self-hosted MCP server, you’ll need:

A Pipedream account
A Pipedream project. Accounts connected via MCP will be stored here.
Pipedream OAuth credentials
​
Set up your environment
Set the following environment variables:


```
Ask AI
PIPEDREAM_CLIENT_ID=your_client_id
PIPEDREAM_CLIENT_SECRET=your_client_secret
PIPEDREAM_PROJECT_ID=your_project_id # proj_xxxxxxx
PIPEDREAM_ENVIRONMENT=development # development | production
Learn more about environments in Pipedream Connect.
```


### API Authentication

To authenticate requests to Pipedream’s MCP server, you need to include an access token with every HTTP request. Here’s how to get it:
​

```ts
import { createBackendClient } from "@pipedream/sdk/server";
 
// Initialize the Pipedream SDK client
const pd = createBackendClient({
  environment: PIPEDREAM_ENVIRONMENT,
  credentials: {
    clientId: PIPEDREAM_CLIENT_ID,
    clientSecret: PIPEDREAM_CLIENT_SECRET,
  },
  projectId: PIPEDREAM_PROJECT_ID
});
 
// Get access token for MCP server auth
const accessToken = await pd.rawAccessToken();
 
console.log(accessToken);
```


Now you can run the example script:

```bash
npm run dev
```

This will start the simple sales agent and demonstrate its capabilities. You can modify `src/main.ts` to customize the agent's behavior or integrate it into your own projects.
