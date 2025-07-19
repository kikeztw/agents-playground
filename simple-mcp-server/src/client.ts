import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/server.js"]
});

const client = new Client(
  {
    name: "example-client",
    version: "1.0.0"
  }
);

await client.connect(transport);
// List prompts
// const prompts = await client.listPrompts();

// Get a prompt
// const prompt = await client.getPrompt({
//   name: "example-prompt",
//   arguments: {
//     arg1: "value"
//   }
// });

// List resources
// const resources = await client.listResources();
// console.log('resources result', JSON.stringify(resources, null, 2));


// Read a resource
// const resource = await client.readResource({
//   uri: "schema://main"
// });
// console.log('resources result', JSON.stringify(resource, null, 2));

// tools list
// const result = await client.listTools();
// console.log('tools result', JSON.stringify(result, null, 2));

// Call a tool
const result = await client.callTool({
  name: "postgres_list_tables",
});
console.log('tool result', JSON.stringify(result));


process.on('SIGTERM', async () => {
  transport.close();
  process.exit(0);
});
