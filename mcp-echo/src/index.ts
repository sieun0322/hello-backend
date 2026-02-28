import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createWikipediaServer } from "./wikipedia.js";

const server = createWikipediaServer();
const transport = new StdioServerTransport();
await server.connect(transport);
