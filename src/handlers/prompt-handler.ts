import { ListPromptsRequestSchema, GetPromptRequestSchema, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

/**
 * Handles prompt requests according to MCP specification
 */
export class PromptHandler {
  constructor(private server: Server) {
    this.setupHandlers();
  }

  private setupHandlers() {
    this.setupListPrompts();
    this.setupGetPrompt();
  }

  private setupListPrompts() {
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: "list_workspaces",
          description: "Show all available workspaces and their details"
        },
        {
          name: "list_collections",
          description: "Show all collections across workspaces"
        },
        {
          name: "list_environments",
          description: "Show all environments and their variables"
        },
        {
          name: "analyze_collection",
          description: "Analyze a Postman collection for potential improvements and best practices",
          arguments: [
            {
              name: "collection_id",
              description: "ID of the collection to analyze",
              required: true
            }
          ]
        },
        {
          name: "document_api",
          description: "Generate documentation for an API based on its collection and schema",
          arguments: [
            {
              name: "api_id",
              description: "ID of the API to document",
              required: true
            },
            {
              name: "format",
              description: "Documentation format (markdown/html)",
              required: false
            }
          ]
        },
        {
          name: "suggest_tests",
          description: "Suggest test cases for API endpoints in a collection",
          arguments: [
            {
              name: "collection_id",
              description: "ID of the collection to analyze",
              required: true
            },
            {
              name: "coverage_level",
              description: "Desired test coverage level (basic/comprehensive)",
              required: false
            }
          ]
        },
        {
          name: "review_environment",
          description: "Review environment variables for security and completeness",
          arguments: [
            {
              name: "environment_id",
              description: "ID of the environment to review",
              required: true
            }
          ]
        }
      ]
    }));
  }

  private setupGetPrompt() {
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_workspaces': {
            return {
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: 'Please show all available workspaces with:\n\n' +
                          '1. Workspace name and ID\n' +
                          '2. Type (personal/team)\n' +
                          '3. Number of collections\n' +
                          '4. Number of environments\n' +
                          '5. Last modified date'
                  }
                }
              ]
            };
          }

          case 'list_collections': {
            return {
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: 'Please show all collections with:\n\n' +
                          '1. Collection name and ID\n' +
                          '2. Workspace location\n' +
                          '3. Number of requests\n' +
                          '4. Last updated date\n' +
                          '5. Associated environments'
                  }
                }
              ]
            };
          }

          case 'list_environments': {
            return {
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: 'Please show all environments with:\n\n' +
                          '1. Environment name and ID\n' +
                          '2. Workspace location\n' +
                          '3. Number of variables\n' +
                          '4. Associated collections\n' +
                          '5. Last modified date'
                  }
                }
              ]
            };
          }

          case 'analyze_collection': {
            if (!args?.collection_id) {
              throw new McpError(ErrorCode.InvalidParams, 'Collection ID is required');
            }

            return {
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: `Please analyze the Postman collection ${args.collection_id} for:\n\n` +
                          '1. API design best practices\n' +
                          '2. Request/response structure consistency\n' +
                          '3. Error handling coverage\n' +
                          '4. Authentication implementation\n' +
                          '5. Documentation completeness'
                  }
                }
              ]
            };
          }

          case 'document_api': {
            if (!args?.api_id) {
              throw new McpError(ErrorCode.InvalidParams, 'API ID is required');
            }

            const format = args.format || 'markdown';

            return {
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: `Generate ${format} documentation for API ${args.api_id} including:\n\n` +
                          '1. Overview and purpose\n' +
                          '2. Authentication methods\n' +
                          '3. Available endpoints\n' +
                          '4. Request/response examples\n' +
                          '5. Error codes and handling'
                  }
                }
              ]
            };
          }

          case 'suggest_tests': {
            if (!args?.collection_id) {
              throw new McpError(ErrorCode.InvalidParams, 'Collection ID is required');
            }

            const coverage = args.coverage_level || 'basic';

            return {
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: `Suggest ${coverage} test cases for collection ${args.collection_id} covering:\n\n` +
                          '1. Positive test scenarios\n' +
                          '2. Error handling\n' +
                          '3. Edge cases\n' +
                          '4. Performance considerations\n' +
                          '5. Security testing'
                  }
                }
              ]
            };
          }

          case 'review_environment': {
            if (!args?.environment_id) {
              throw new McpError(ErrorCode.InvalidParams, 'Environment ID is required');
            }

            return {
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: `Review environment ${args.environment_id} for:\n\n` +
                          '1. Security of sensitive values\n' +
                          '2. Required variables presence\n' +
                          '3. Naming conventions\n' +
                          '4. Value formatting\n' +
                          '5. Environment completeness'
                  }
                }
              ]
            };
          }

          default:
            throw new McpError(ErrorCode.InvalidRequest, `Unknown prompt: ${name}`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          error instanceof Error ? error.message : 'An unknown error occurred'
        );
      }
    });
  }
}
