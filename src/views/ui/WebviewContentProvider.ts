import * as vscode from 'vscode';
import { StyleProvider } from './StyleProvider';
import { getNonce } from '../utils/SecurityUtils';

/**
 * Interface for messages passed to the webview content provider
 */
interface FormattedMessage {
  role: string;
  content: string;
  formattedContent: string;
  id?: string;
}

/**
 * Interface for data needed to render the webview
 */
interface WebviewContentData {
  messages: FormattedMessage[];
  contextFiles: string[];
}

/**
 * Responsible for generating HTML content for the webview
 */
export class WebviewContentProvider {
  private styleProvider: StyleProvider;
  
  constructor(private readonly extensionUri: vscode.Uri) {
    this.styleProvider = new StyleProvider();
  }
  
  /**
   * Generate the complete HTML for the webview
   */
  public getWebviewContent(data: WebviewContentData): string {
    const nonce = getNonce();
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
        <title>Sukode Code Assistant</title>
        <style>
          ${this.styleProvider.getCss()}
        </style>
      </head>
      <body>
        <div class="container">
          ${this.renderContextFilesSection(data.contextFiles)}
          ${this.renderHeader()}
          ${this.renderMessagesContainer(data.messages)}
          ${this.renderInputContainer()}
        </div>
        
        <script nonce="${nonce}">
          ${this.getJavaScript()}
        </script>
      </body>
      </html>
    `;
  }
  
  /**
   * Render the context files section
   */
  private renderContextFilesSection(files: string[]): string {
    const fileCount = files.length;
    
    // Generate file list HTML
    let fileListHtml = '';
    if (fileCount === 0) {
      fileListHtml = '<div class="context-files-empty">No files used for context yet</div>';
    } else {
      fileListHtml = files.map(file => {
        // Get just the filename from the path
        const fileName = file.split('/').pop() || file;
        return `
          <div class="context-file-item">
            <span class="context-file-icon">📄</span>
            <span class="context-file-path" title="${file}">${fileName}</span>
          </div>
        `;
      }).join('');
    }
    
    return `
      <div class="context-files" id="contextFiles">
        <div class="context-files-header" id="contextFilesHeader">
          <div>
            <span class="context-files-toggle">▶</span>
            <span>Context Files</span>
          </div>
          <span id="contextFileCount">(${fileCount})</span>
        </div>
        <div class="context-files-content" id="contextFilesContent">
          <div class="context-files-list" id="contextFilesList">
            ${fileListHtml}
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render the header section
   */
  private renderHeader(): string {
    return `
      <div class="header">
        <h2>Sukode Code Assistant</h2>
        <div class="actions">
          <button id="clearChat">Clear Chat</button>
        </div>
      </div>
    `;
  }
  
  /**
   * Render the messages container with all messages
   */
  private renderMessagesContainer(messages: FormattedMessage[]): string {
    const messagesHtml = messages.map(msg => this.renderMessage(msg)).join('');
    
    return `
      <div class="messages-container" id="messages">
        ${messagesHtml.length ? messagesHtml : '<div class="welcome-message">Start a conversation by typing your coding question below.</div>'}
        
        <!-- Processing indicator -->
        <div class="processing-indicator" id="processingIndicator">
          <div class="spinner"></div>
          <div>Processing your request...</div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render a single message
   */
  private renderMessage(msg: FormattedMessage): string {
    const isUser = msg.role === 'user';
    const messageClass = isUser ? 'user-message' : 'assistant-message';
    const avatarLabel = isUser ? 'You' : 'AI';
    
    // Include data-id attribute if the message has an ID (for streaming)
    const dataIdAttr = msg.id ? ` data-id="${msg.id}"` : '';
    
    return `
      <div class="message ${messageClass}"${dataIdAttr}>
        <div class="avatar">${avatarLabel}</div>
        <div class="content">${msg.formattedContent}</div>
      </div>
    `;
  }
  
  /**
   * Render the input container
   */
  private renderInputContainer(): string {
    return `
      <div class="input-container">
        <textarea id="userInput" placeholder="Type your message here..." rows="3"></textarea>
        <button id="sendButton">Send</button>
      </div>
    `;
  }
  
  /**
   * Get the JavaScript for the webview
   */
  private getJavaScript(): string {
    return `
      const vscode = acquireVsCodeApi();
      const messagesContainer = document.getElementById('messages');
      const userInput = document.getElementById('userInput');
      const sendButton = document.getElementById('sendButton');
      const clearButton = document.getElementById('clearChat');
      
      // Scroll to bottom of messages
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      // Send message when Send button is clicked
      sendButton.addEventListener('click', sendMessage);
      
      // Send message when Enter key is pressed (without Shift)
      userInput.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          sendMessage();
        }
      });
      
      // Clear chat history
      clearButton.addEventListener('click', () => {
        vscode.postMessage({
          command: 'clearChat'
        });
      });
      
      // Toggle context files panel
      document.getElementById('contextFilesHeader').addEventListener('click', function() {
        const content = document.getElementById('contextFilesContent');
        const toggle = this.querySelector('.context-files-toggle');
        
        if (content.classList.contains('expanded')) {
          content.classList.remove('expanded');
          toggle.textContent = '▶';
        } else {
          content.classList.add('expanded');
          toggle.textContent = '▼';
        }
      });
      
      // Handle messages from extension
      window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.command) {
          case 'showProcessing':
            document.getElementById('processingIndicator').classList.add('active');
            // Scroll to show the processing indicator
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            // Disable the input and send button during processing
            userInput.disabled = true;
            sendButton.disabled = true;
            break;
            
          case 'hideProcessing':
            document.getElementById('processingIndicator').classList.remove('active');
            // Re-enable the input and send button
            userInput.disabled = false;
            sendButton.disabled = false;
            break;
          
          case 'startStreaming':
            // Start a streaming assistant message
            userInput.disabled = true;
            sendButton.disabled = true;
            
            if (message.id) {
              // Find the message element with the ID
              const streamingMessage = document.querySelector('.message[data-id="' + message.id + '"] .content');
              if (streamingMessage) {
                // Create and append a cursor to indicate streaming
                const cursor = document.createElement('span');
                cursor.className = 'streaming-cursor';
                cursor.textContent = '▌';
                streamingMessage.appendChild(cursor);
              }
            }
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            break;
            
          case 'updateStreamingContent':
            // Update the content of a streaming message
            if (message.id && message.content) {
              const streamingMessage = document.querySelector('.message[data-id="' + message.id + '"] .content');
              
              if (streamingMessage) {
                // Detect if it's tree view content
                const isTreeViewContent = message.content.includes('───') || 
                                          message.content.includes('└──') || 
                                          message.content.includes('├──');
                
                // Process the content based on its type
                let processedContent;
                
                if (isTreeViewContent) {
                  // Special handling for tree view content
                  processedContent = '<pre class="tree-view">' + 
                    message.content
                      .replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;')
                      .replace(/'/g, '&#039;')
                      // Highlight directory names
                      .replace(/([^\s]+)\//g, '<strong>$1/</strong>')
                    + '</pre>';
                } else {
                  // Use the content as is (should be pre-processed HTML)
                  processedContent = message.content;
                }
                
                // Update the content
                streamingMessage.innerHTML = processedContent;
                
                // Re-add the cursor
                const cursor = document.createElement('span');
                cursor.className = 'streaming-cursor';
                cursor.textContent = '▌';
                streamingMessage.appendChild(cursor);
                
                // Scroll to the bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
              }
            }
            break;
            
          case 'endStreaming':
            // End streaming and finalize the message
            userInput.disabled = false;
            sendButton.disabled = false;
            
            // Remove all streaming cursors
            document.querySelectorAll('.streaming-cursor').forEach(cursor => cursor.remove());
            break;
            
          case 'updateContextFiles':
            updateContextFiles(message.files);
            break;
        }
      });
      
      function sendMessage() {
        const text = userInput.value.trim();
        if (text) {
          vscode.postMessage({
            command: 'sendMessage',
            text: text
          });
          userInput.value = '';
        }
      }
      
      // Update the context files panel
      function updateContextFiles(files) {
        const contextFilesList = document.getElementById('contextFilesList');
        const contextFileCount = document.getElementById('contextFileCount');
        
        // Update the file count
        contextFileCount.textContent = '(' + files.length + ')';
        
        // If no files, show empty message
        if (files.length === 0) {
          contextFilesList.innerHTML = '<div class="context-files-empty">No files used for context yet</div>';
          return;
        }
        
        // Build the list of files
        let html = '';
        files.forEach(function(file) {
          // Get just the filename from the path
          const fileName = file.split('/').pop();
          html += \`
            <div class="context-file-item">
              <span class="context-file-icon">📄</span>
              <span class="context-file-path" title="\${file}">\${fileName}</span>
            </div>
          \`;
        });
        
        contextFilesList.innerHTML = html;
      }
    `;
  }
}