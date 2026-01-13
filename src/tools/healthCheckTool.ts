import { ToolHandler, ToolDefinition, ToolCallResponse } from '../types/index.js';
import { healthCheck } from './healthCheck.js';

export class HealthCheckTool implements ToolHandler {
  getToolDefinitions(): ToolDefinition[] {
    return [
      {
        name: 'health_check',
        description: 'Perform a local system health check to verify Postman MCP server configuration and connectivity. Returns system information and configuration status.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      }
    ];
  }

  async handleToolCall(name: string, args: unknown): Promise<ToolCallResponse> {
    if (name !== 'health_check') {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      const result = await healthCheck.execute(args || {});
      // Return a simple generic message if health check is successful
      if (result.success) {
        return {
          content: [{ type: 'text', text: 'Postman MCP is healthy' }]
        };
      } else {
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      }
    } catch (error: any) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }],
        isError: true
      };
    }
  }

  async listToolResources(): Promise<any[]> {
    return [];
  }

  async getToolResourceDetails(resourceUri: string): Promise<any> {
    throw new Error('Health check tool does not support resources');
  }

  async canHandleResource(resourceUri: string): Promise<boolean> {
    return false;
  }

  getToolMappings(): { [key: string]: ToolHandler } {
    const mappings: { [key: string]: ToolHandler } = {};
    const toolDefinitions = this.getToolDefinitions();
    toolDefinitions.forEach(tool => {
      mappings[tool.name] = this;
    });
    return mappings;
  }
}

