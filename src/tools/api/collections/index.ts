import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { AxiosInstance } from 'axios';
import {
  ToolCallResponse,
  ToolDefinition,
  ToolHandler,
} from '../../../types/index.js';
import { BasePostmanTool } from '../base.js';
import { TOOL_DEFINITIONS } from './definitions.js';

/**
 * Implements Postman Collection API operations
 * @see https://www.postman.com/postman/workspace/postman-public-workspace/documentation/12959542-c8142d51-e97c-46b6-bd77-52bb66712c9a
 */
export class CollectionTools extends BasePostmanTool implements ToolHandler {
  constructor(existingClient: AxiosInstance) {
    super(null, {}, existingClient);
  }

  getToolDefinitions(): ToolDefinition[] {
    return TOOL_DEFINITIONS;
  }

  private createResponse(data: any): ToolCallResponse {
    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
    };
  }

  async handleToolCall(name: string, args: any): Promise<ToolCallResponse> {
    try {
      switch (name) {
        case 'list_collections':
          return await this.listCollections(args);
        case 'get_collection':
          return await this.getCollection(args);
        case 'create_collection':
          return await this.createCollection(args);
        case 'update_collection':
          return await this.updateCollection(args);
        case 'patch_collection':
          return await this.patchCollection(args);
        case 'create_collection_folder':
          return await this.createCollectionFolder(args);
        case 'get_collection_folder':
          return await this.getCollectionFolder(args);
        case 'update_collection_folder':
          return await this.updateCollectionFolder(args);
        case 'create_collection_request':
          return await this.createCollectionRequest(args);
        case 'get_collection_request':
          return await this.getCollectionRequest(args);
        case 'update_collection_request':
          return await this.updateCollectionRequest(args);
        case 'create_collection_response':
          return await this.createCollectionResponse(args);
        case 'get_collection_response':
          return await this.getCollectionResponse(args);
        case 'update_collection_response':
          return await this.updateCollectionResponse(args);
        case 'fork_collection':
          return await this.forkCollection(args);
        case 'get_collection_forks':
          return await this.getCollectionForks(args);
        case 'merge_collection_fork':
          return await this.mergeCollectionFork(args);
        case 'pull_collection_changes':
          return await this.pullCollectionChanges(args);
        case 'transfer_collection_items':
          return await this.transferCollectionItems(args);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    } catch (error) {
      // Let base class interceptor handle API errors
      throw error;
    }
  }

  /**
   * List all collections in a workspace
   * If workspace not specified, lists collections in "My Workspace"
   */
  async listCollections(args: any): Promise<ToolCallResponse> {
    const response = await this.client.get('/collections', { params: args });
    return this.createResponse(response.data);
  }

  /**
   * Get details of a specific collection
   */
  async getCollection(args: any): Promise<ToolCallResponse> {
    const { collection_id, ...params } = args;
    const response = await this.client.get(`/collections/${collection_id}`, { params });
    return this.createResponse(response.data);
  }

  /**
   * Create a new collection in a workspace
   * Creates in "My Workspace" if workspace not specified
   */
  async createCollection(args: any): Promise<ToolCallResponse> {
    const response = await this.client.post('/collections', {
      collection: args.collection,
      workspace: args.workspace ? { id: args.workspace, type: 'workspace' } : undefined
    });
    return this.createResponse(response.data);
  }

  /**
   * Update an existing collection (full replacement)
   * Maximum collection size: 20 MB
   */
  async updateCollection(args: any): Promise<ToolCallResponse> {
    const response = await this.client.put(`/collections/${args.collection_id}`, {
      collection: args.collection
    });
    return this.createResponse(response.data);
  }

  /**
   * Partially update a collection
   * Only updates provided fields
   */
  async patchCollection(args: any): Promise<ToolCallResponse> {
    const response = await this.client.patch(`/collections/${args.collection_id}`, {
      collection: args.collection
    });
    return this.createResponse(response.data);
  }

  /**
   * Create a new folder in a collection
   */
  async createCollectionFolder(args: any): Promise<ToolCallResponse> {
    const response = await this.client.post(
      `/collections/${args.collection_id}/folders`,
      args.folder
    );
    return this.createResponse(response.data);
  }

  /**
   * Get details of a specific folder in a collection
   */
  async getCollectionFolder(args: any): Promise<ToolCallResponse> {
    const { collection_id, folder_id, ...params } = args;
    const response = await this.client.get(
      `/collections/${collection_id}/folders/${folder_id}`,
      { params }
    );
    return this.createResponse(response.data);
  }

  /**
   * Update a folder in a collection
   * Acts like PATCH, only updates provided values
   */
  async updateCollectionFolder(args: any): Promise<ToolCallResponse> {
    const response = await this.client.put(
      `/collections/${args.collection_id}/folders/${args.folder_id}`,
      args.folder
    );
    return this.createResponse(response.data);
  }

  /**
   * Create a new request in a collection
   */
  async createCollectionRequest(args: any): Promise<ToolCallResponse> {
    const response = await this.client.post(
      `/collections/${args.collection_id}/requests`,
      args.request,
      { params: args.folder_id ? { folder_id: args.folder_id } : undefined }
    );
    return this.createResponse(response.data);
  }

  /**
   * Get details of a specific request in a collection
   */
  async getCollectionRequest(args: any): Promise<ToolCallResponse> {
    const { collection_id, request_id, ...params } = args;
    const response = await this.client.get(
      `/collections/${collection_id}/requests/${request_id}`,
      { params }
    );
    return this.createResponse(response.data);
  }

  /**
   * Update a request in a collection
   * Cannot change request folder
   */
  async updateCollectionRequest(args: any): Promise<ToolCallResponse> {
    const response = await this.client.put(
      `/collections/${args.collection_id}/requests/${args.request_id}`,
      args.request
    );
    return this.createResponse(response.data);
  }

  /**
   * Create a new response in a collection
   */
  async createCollectionResponse(args: any): Promise<ToolCallResponse> {
    const response = await this.client.post(
      `/collections/${args.collection_id}/responses`,
      args.response,
      { params: { request_id: args.request_id } }
    );
    return this.createResponse(response.data);
  }

  /**
   * Get details of a specific response in a collection
   */
  async getCollectionResponse(args: any): Promise<ToolCallResponse> {
    const { collection_id, response_id, ...params } = args;
    const response = await this.client.get(
      `/collections/${collection_id}/responses/${response_id}`,
      { params }
    );
    return this.createResponse(response.data);
  }

  /**
   * Update a response in a collection
   * Acts like PATCH, only updates provided values
   */
  async updateCollectionResponse(args: any): Promise<ToolCallResponse> {
    const response = await this.client.put(
      `/collections/${args.collection_id}/responses/${args.response_id}`,
      args.response
    );
    return this.createResponse(response.data);
  }

  /**
   * Fork a collection to a workspace
   */
  async forkCollection(args: any): Promise<ToolCallResponse> {
    const response = await this.client.post(`/collections/fork/${args.collection_id}`, {
      workspace: { id: args.workspace, type: 'workspace' },
      label: args.label
    });
    return this.createResponse(response.data);
  }

  /**
   * Get a list of collection forks
   */
  async getCollectionForks(args: any): Promise<ToolCallResponse> {
    const { collection_id, ...params } = args;
    const response = await this.client.get(`/collections/${collection_id}/forks`, {
      params: {
        cursor: params.cursor,
        limit: params.limit,
        direction: params.direction,
        sort: params.sort
      }
    });
    return this.createResponse(response.data);
  }

  /**
   * Merge a forked collection back into its parent
   */
  async mergeCollectionFork(args: any): Promise<ToolCallResponse> {
    const response = await this.client.put('/collection-merges', {
      strategy: args.strategy,
      source: args.source,
      destination: args.destination
    });
    return this.createResponse(response.data);
  }

  /**
   * Pull changes from parent collection into forked collection
   */
  async pullCollectionChanges(args: any): Promise<ToolCallResponse> {
    const response = await this.client.put(`/collections/${args.collection_id}/pulls`, {});
    return this.createResponse(response.data);
  }

  /**
   * Transfer items between collections
   */
  async transferCollectionItems(args: any): Promise<ToolCallResponse> {
    const endpoint = args.type === 'folder' ? '/collection-folders-transfers' :
                    args.type === 'request' ? '/collection-requests-transfers' :
                    '/collection-responses-transfers';

    const response = await this.client.post(endpoint, {
      ids: args.ids,
      target: args.target,
      location: args.location,
      mode: args.mode
    });
    return this.createResponse(response.data);
  }
}
