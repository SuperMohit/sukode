import * as vscode from 'vscode';
import OpenAI from 'openai';
import { APIKeyValidation } from './types';

/**
 * Handles the OpenAI API client initialization and validation
 */
export class OpenAIClient {
  private client: OpenAI | null = null;

  /**
   * Initialize the OpenAI client with the API key from VS Code settings
   */
  public initializeClient(): OpenAI {
    const apiKey = vscode.workspace.getConfiguration('sukodeCodeAssistant').get<string>('apiKey');
    const apiUrl = vscode.workspace.getConfiguration('sukodeCodeAssistant').get<string>('apiUrl');
    
    console.log(apiKey, apiUrl);
    
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: apiUrl,
    });
    
    return this.client;
  }

  /**
   * Get the OpenAI client instance, initializing it if needed
   */
  public getClient(): OpenAI {
    if (!this.client) {
      return this.initializeClient();
    }
    return this.client;
  }

  /**
   * Validates the OpenAI API key and returns an error message if invalid
   */
  public validateApiKey(): APIKeyValidation {
    const apiKey = vscode.workspace.getConfiguration('sukodeCodeAssistant').get<string>('openaiApiKey');
    
    if (!apiKey || apiKey.trim() === '') {
      return {
        valid: false,
        message: 'OpenAI API key is not configured. Please set it in VS Code settings (File > Preferences > Settings > Extensions > Sukode Code Assistant).'
      };
    }
    

    // Check for openai api key or cerebras api key
   if (!apiKey.startsWith('sk-') && !apiKey.startsWith('csk-')) {
      return {
        valid: false,
        message: 'Invalid OpenAI API key format. API keys should start with "sk-" or "csk-"'
      };
    }
    
    return { valid: true };
  }
}
