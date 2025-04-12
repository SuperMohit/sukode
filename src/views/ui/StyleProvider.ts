/**
 * Manages CSS styles for the webview
 */
export class StyleProvider {
    /**
     * Get the complete CSS for the webview
     */
    public getCss(): string {
      return `
        ${this.getBaseStyles()}
        ${this.getLayoutStyles()}
        ${this.getHeaderStyles()}
        ${this.getMessageStyles()}
        ${this.getInputStyles()}
        ${this.getContextFilesStyles()}
        ${this.getMarkdownStyles()}
        ${this.getSyntaxHighlightingStyles()}
        ${this.getProcessingIndicatorStyles()}
        ${this.getResponsiveStyles()}
        ${this.getAnimations()}
      `;
    }
    
    /**
     * Base styles for the webview
     */
    private getBaseStyles(): string {
      return `
        /* Base styles */
        body {
          padding: 0;
          margin: 0;
          color: var(--vscode-foreground);
          font-family: var(--vscode-font-family);
          background-color: var(--vscode-editor-background);
          font-size: 13px;
          line-height: 1.5;
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: var(--vscode-scrollbarSlider-background);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: var(--vscode-scrollbarSlider-hoverBackground);
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
      `;
    }
    
    /**
     * Layout styles for the main containers
     */
    private getLayoutStyles(): string {
      return `
        /* Main container */
        .container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }
        
        /* Welcome message */
        .welcome-message {
          text-align: center;
          padding: 20px;
          color: var(--vscode-descriptionForeground);
          font-style: italic;
          background: rgba(0,0,0,0.05);
          border-radius: 8px;
          margin: 10px;
        }
      `;
    }
    
    /**
     * Header styles
     */
    private getHeaderStyles(): string {
      return `
        /* Header */
        .header {
          padding: 10px 16px;
          border-bottom: 1px solid var(--vscode-panel-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--vscode-sideBar-background);
        }
        
        .header h2 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }
        
        .actions {
          display: flex;
          gap: 8px;
        }
      `;
    }
    
    /**
     * Message styles for the chat interface
     */
    private getMessageStyles(): string {
      return `
        /* Messages container */
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
          background: var(--vscode-editor-background);
        }
        
        /* Message styling */
        .message {
          display: flex;
          margin-bottom: 16px;
          max-width: 95%;
          animation: message-fade-in 0.2s ease-in-out;
        }
        
        @keyframes message-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .user-message {
          margin-left: auto;
          flex-direction: row-reverse;
        }
        
        .avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 8px;
          flex-shrink: 0;
          font-size: 10px;
          font-weight: bold;
        }
        
        .user-message .avatar {
          background: var(--vscode-inputOption-activeBackground);
        }
        
        .content {
          padding: 10px 14px;
          border-radius: 12px;
          background: var(--vscode-editor-inactiveSelectionBackground);
          border: 1px solid var(--vscode-panel-border);
          overflow-wrap: break-word;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .user-message .content {
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
        }
        
        /* Streaming cursor */
        .streaming-cursor {
          display: inline-block;
          margin-left: 2px;
          animation: blink 1s infinite;
          color: var(--vscode-editor-foreground);
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `;
    }
    
    /**
     * Input area styles
     */
    private getInputStyles(): string {
      return `
        /* Input container */
        .input-container {
          display: flex;
          padding: 10px;
          border-top: 1px solid var(--vscode-panel-border);
          background: var(--vscode-sideBar-background);
        }
        
        textarea {
          flex: 1;
          padding: 10px;
          border: 1px solid var(--vscode-input-border);
          background: var(--vscode-input-background);
          color: var(--vscode-input-foreground);
          border-radius: 6px;
          resize: none;
          outline: none;
          min-height: 60px;
          font-family: var(--vscode-font-family);
          font-size: 13px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1) inset;
          transition: border 0.2s ease;
        }
        
        textarea:focus {
          border-color: var(--vscode-focusBorder);
        }
        
        button {
          margin-left: 8px;
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          padding: 0 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          height: 30px;
          align-self: flex-end;
          transition: background 0.2s ease;
          outline: none;
        }
        
        button:hover {
          background: var(--vscode-button-hoverBackground);
        }
        
        button:focus {
          outline: 1px solid var(--vscode-focusBorder);
          outline-offset: 2px;
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `;
    }
    
    /**
     * Context files panel styles
     */
    private getContextFilesStyles(): string {
      return `
        /* Context files panel */
        .context-files {
          padding: 8px 16px;
          background: var(--vscode-sideBar-background);
          border-bottom: 1px solid var(--vscode-panel-border);
          font-size: 12px;
        }
        
        .context-files-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
        }
        
        .context-files-content.expanded {
          max-height: 200px;
          margin-top: 8px;
        }
        
        .context-files-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 500;
          color: var(--vscode-foreground);
          cursor: pointer;
          user-select: none;
        }
        
        .context-files-header:hover {
          color: var(--vscode-textLink-foreground);
        }
        
        .context-files-toggle {
          margin-right: 6px;
          font-size: 10px;
        }
        
        .context-files-list {
          max-height: 160px;
          overflow-y: auto;
          font-family: var(--vscode-editor-font-family);
          background: var(--vscode-editor-background);
          border-radius: 4px;
          padding: 4px;
        }
        
        .context-file-item {
          display: flex;
          align-items: center;
          padding: 4px 6px;
          border-radius: 3px;
        }
        
        .context-file-item:hover {
          background: var(--vscode-list-hoverBackground);
        }
        
        .context-file-icon {
          margin-right: 6px;
          font-size: 14px;
        }
        
        .context-file-path {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .context-files-empty {
          font-style: italic;
          color: var(--vscode-disabledForeground);
          padding: 6px;
          text-align: center;
        }
      `;
    }
    
    /**
     * Markdown content styles
     */
    private getMarkdownStyles(): string {
      return `
        /* Markdown styling */
        .content h1, 
        .content h2, 
        .content h3, 
        .content h4, 
        .content h5, 
        .content h6 {
          margin-top: 16px;
          margin-bottom: 8px;
          color: var(--vscode-editor-foreground);
          font-weight: 600;
          line-height: 1.3;
        }
        
        .content h1 { font-size: 1.6em; border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: 4px; }
        .content h2 { font-size: 1.4em; border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: 3px; }
        .content h3 { font-size: 1.2em; }
        .content h4 { font-size: 1.1em; }
        
        .content p {
          margin-top: 8px;
          margin-bottom: 8px;
        }
        
        .content ul, 
        .content ol {
          margin-top: 8px;
          margin-bottom: 8px;
          padding-left: 20px;
        }
        
        .content blockquote {
          border-left: 3px solid var(--vscode-activityBarBadge-background);
          margin: 8px 0;
          padding-left: 16px;
          color: var(--vscode-descriptionForeground);
        }
        
        .content a {
          color: var(--vscode-textLink-foreground);
          text-decoration: none;
        }
        
        .content a:hover {
          text-decoration: underline;
        }
        
        .content code {
          font-family: var(--vscode-editor-font-family);
          background: var(--vscode-textCodeBlock-background);
          padding: 2px 4px;
          border-radius: 3px;
          font-size: 0.9em;
        }
        
        .content pre {
          background: var(--vscode-textCodeBlock-background);
          padding: 10px;
          border-radius: 6px;
          overflow-x: auto;
          font-family: var(--vscode-editor-font-family);
          margin: 8px 0;
          font-size: 0.9em;
        }
        
        .content pre code {
          background: transparent;
          padding: 0;
          border-radius: 0;
        }
        
        /* Tree view styling */
        .content pre.tree-view {
          font-family: monospace;
          white-space: pre;
          line-height: 1.3;
          overflow-x: auto;
        }
        
        .content pre.tree-view strong {
          color: var(--vscode-textLink-foreground);
          font-weight: bold;
        }
        
        /* Table styling */
        .content table {
          border-collapse: collapse;
          width: 100%;
          margin: 12px 0;
        }
        
        .content th {
          background: var(--vscode-editor-lineHighlightBackground);
          text-align: left;
          padding: 8px;
          border-bottom: 2px solid var(--vscode-panel-border);
          font-weight: bold;
        }
        
        .content td {
          padding: 8px;
          border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .content tr:nth-child(even) {
          background: rgba(0,0,0,0.03);
        }
      `;
    }
    
    /**
     * Syntax highlighting styles
     */
    private getSyntaxHighlightingStyles(): string {
      return `
        /* Syntax highlighting styles */
        .hljs {
          display: block;
          overflow-x: auto;
          color: var(--vscode-editor-foreground);
          background: transparent;
        }
        
        .hljs-keyword,
        .hljs-selector-tag,
        .hljs-literal,
        .hljs-section,
        .hljs-link {
          color: #569CD6;
        }
        
        .hljs-function {
          color: #DCDCAA;
        }
        
        .hljs-string,
        .hljs-attr,
        .hljs-regexp,
        .hljs-number {
          color: #CE9178;
        }
        
        .hljs-built_in,
        .hljs-builtin-name {
          color: #4EC9B0;
        }
        
        .hljs-comment,
        .hljs-quote {
          color: #6A9955;
          font-style: italic;
        }
        
        .hljs-variable,
        .hljs-template-variable {
          color: #9CDCFE;
        }
        
        .hljs-title,
        .hljs-name,
        .hljs-type {
          color: #4EC9B0;
        }
      `;
    }
    
    /**
     * Processing indicator styles
     */
    private getProcessingIndicatorStyles(): string {
      return `
        /* Processing indicator styles */
        .processing-indicator {
          display: none;
          margin: 16px 0;
          text-align: center;
          padding: 12px;
          background: var(--vscode-editor-background);
          border-radius: 8px;
          border: 1px solid var(--vscode-panel-border);
        }
        
        .processing-indicator.active {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fade-in 0.3s ease-in-out;
        }
        
        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(120, 120, 120, 0.3);
          border-radius: 50%;
          border-top-color: var(--vscode-button-background);
          animation: spin 1s linear infinite;
          margin-right: 12px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
    }
    
    /**
     * Responsive design styles
     */
    private getResponsiveStyles(): string {
      return `
        /* Responsive adjustments */
        @media (max-width: 480px) {
          .message {
            max-width: 95%;
          }
          
          .avatar {
            width: 24px;
            height: 24px;
            font-size: 8px;
          }
          
          .content {
            padding: 8px 10px;
            font-size: 12px;
          }
          
          .header h2 {
            font-size: 14px;
            margin: 6px 0;
          }
          
          .button {
            padding: 4px 10px;
            font-size: 12px;
          }
        }
        
        /* Extra adjustments for very narrow sidebar */
        @media (max-width: 360px) {
          .header {
            padding: 6px 10px;
          }
          
          .header h2 {
            font-size: 13px;
          }
          
          .actions {
            gap: 4px;
          }
          
          button {
            padding: 0 10px;
          }
          
          .content {
            font-size: 12px;
          }
        }
      `;
    }
    
    /**
     * Animation styles
     */
    private getAnimations(): string {
      return `
        /* Animations */
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `;
    }
  }