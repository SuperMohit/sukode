import * as MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

/**
 * Formats chat messages for display in the webview
 */
export class MessageFormatter {
  private md: MarkdownIt;
  
  constructor() {
    // Initialize markdown-it with highlight.js for syntax highlighting
    this.md = new MarkdownIt({
      html: false,         // Disable HTML tags in source
      xhtmlOut: false,     // Use '/' to close single tags (<br />)
      breaks: true,        // Convert '\n' in paragraphs into <br>
      linkify: true,       // Auto-convert URLs to links
      typographer: true,   // Enable smartypants and other substitutions
      highlight: this.highlightCode
    });
    
    // Enhance the markdown renderer
    this.enhanceMarkdownRenderer();
  }
  
  /**
   * Format message content as HTML
   */
  public formatContent(content: string): string {
    // Check if content appears to be a tree structure
    if (this.isTreeView(content)) {
      return this.formatTreeView(content);
    }
    
    // Otherwise render as markdown
    return this.md.render(content);
  }
  
  /**
   * Add enhancements to the markdown renderer
   */
  private enhanceMarkdownRenderer(): void {
    // Add plugins or custom renderers if needed
    // Example: this.md.use(plugin)
  }
  
  /**
   * Highlight code using highlight.js
   */
  private highlightCode(str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' + 
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value + 
               '</code></pre>';
      } catch (error) {
        console.error('Error highlighting code:', error);
      }
    }
    
    // Use generic highlighter if language isn't specified or found
    return '<pre class="hljs"><code>' + 
           hljs.highlightAuto(str).value + 
           '</code></pre>';
  }
  
  /**
   * Check if the content appears to be a tree view structure
   */
  private isTreeView(content: string): boolean {
    return content.includes('───') || 
           content.includes('└──') || 
           content.includes('├──') || 
           (content.includes('/') && 
            content.includes('directories') && 
            content.includes('files'));
  }
  
  /**
   * Format content as a tree view
   */
  private formatTreeView(content: string): string {
    return '<pre class="tree-view">' + 
      this.escapeHtml(content)
        // Highlight directory names
        .replace(/([^\s]+)\//g, '<strong>$1/</strong>') +
      '</pre>';
  }
  
  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}