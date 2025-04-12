import * as vscode from 'vscode';
import { OpenAIService } from '../openai-service';
import { WebviewContentProvider } from './ui/WebviewContentProvider';
import { MessageFormatter } from './utils/MessageFormatter';

/**
 * Provides a webview-based chat interface in the sidebar
 */
export class ChatViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private messageHistory: { role: string, content: string, id?: string }[] = [];
  private contextFiles: string[] = []; // Track files used for context
  private disposables: vscode.Disposable[] = [];
  private contentProvider: WebviewContentProvider;
  private messageFormatter: MessageFormatter;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly openAIService: OpenAIService
  ) {
    // Create formatter and content provider
    this.messageFormatter = new MessageFormatter();
    this.contentProvider = new WebviewContentProvider(extensionUri);
    
    // // Subscribe to context file updates
    // this.openAIService.onDidUpdateContextFiles(files => {
    //   this.contextFiles = files;
    //   this.updateContextFilesView();
    // });
  }

  /**
   * Called when the view is first created or becomes visible again
   */
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    console.log('Resolving webview view for sukodeChatView');
    
    this._view = webviewView;
    
    // Set up webview options
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri]
    };

    // Initialize the webview content
    this.updateWebview();

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(
      async (message) => {
        console.log('Received message from webview:', message);
        
        switch (message.command) {
          case 'sendMessage':
            await this.handleUserMessage(message.text);
            break;
            
          case 'clearChat':
            this.messageHistory = [];
            this.updateWebview();
            break;
        }
      },
      null,
      this.disposables
    );
  }

  /**
   * Process a user message, send to OpenAI, and update the chat
   */
  private async handleUserMessage(text: string) {
    if (!this._view) return;
    
    try {
      
      // Add user message to history
      this.messageHistory.push({ role: 'user', content: text });
      this.updateWebview();
      
      try {
        // Show the loading indicator
        this._view.webview.postMessage({ command: 'showProcessing' });
        
        // Process with OpenAI
        console.log('Sending query to OpenAI service:', text.substring(0, 30) + '...');
        const response = await this.openAIService.processQuery(text);

        
        // Add assistant response to history
        this.messageHistory.push({ role: 'assistant', content: response });
        
        // Hide the loading indicator
        this._view.webview.postMessage({ command: 'hideProcessing' });
      } catch (error) {
        // Hide any indicators
        this._view.webview.postMessage({ command: 'hideProcessing' });
        this._view.webview.postMessage({ command: 'endStreaming' });
        throw error; // Rethrow to be caught by outer catch block
      }
      
      // Update the webview with the new message history
      this.updateWebview();
    } catch (error) {
      console.error('Error processing user message:', error);
      
      // Create a more specific error message
      let errorMessage = 'Sorry, I encountered an error while processing your request.';
      
      if (error instanceof Error) {
        // Check for common API errors
        if (error.message.includes('API key')) {
          errorMessage = 'Error: OpenAI API key is invalid or not configured properly. Please update your API key in VS Code settings (Extensions → Sukode Code Assistant → OpenAI API Key).';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Error: OpenAI API rate limit exceeded. Please try again in a few moments.';
        } else if (error.message.includes('timeout') || error.message.includes('network')) {
          errorMessage = 'Error: Connection to OpenAI API timed out. Please check your internet connection and try again.';
        } else {
          // Include the actual error message for better debugging
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      // Add error message to history
      this.messageHistory.push({ 
        role: 'assistant', 
        content: errorMessage
      });
      this.updateWebview();
    }
  }
  
  /**
   * Update the context files view in the webview
   */
  private updateContextFilesView() {
    if (!this._view) return;
    
    // Send the updated context files to the webview
    this._view.webview.postMessage({
      command: 'updateContextFiles',
      files: this.contextFiles
    });
  }

  /**
   * Refresh the entire webview (rebuilds the HTML)
   */
  public refresh() {
    if (this._view) {
      this.updateWebview();
    }
  }

  /**
   * Update the webview content
   */
  private updateWebview() {
    if (!this._view) return;
    
    // Format messages for display
    const formattedMessages = this.messageHistory.map(msg => ({
      ...msg,
      formattedContent: this.messageFormatter.formatContent(msg.content)
    }));
    
    // Generate and set HTML content
    this._view.webview.html = this.contentProvider.getWebviewContent({
      messages: formattedMessages,
      contextFiles: this.contextFiles
    });
  }

  /**
   * Dispose of resources
   */
  public dispose() {
    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}