import * as vscode from 'vscode';
import { ChatViewProvider } from './views/ChatViewProvider';
import { ProjectPathService } from './services/ProjectPathService';
import { OpenAIService } from './openai-service';
import { ServiceFactory } from './services/ServiceFactory';
import { DiagnosticInfo } from './services/DiagnosticsService';

/**
 * Group diagnostics by file path
 */
function groupDiagnosticsByFile(diagnostics: DiagnosticInfo[]): Record<string, DiagnosticInfo[]> {
  const result: Record<string, DiagnosticInfo[]> = {};
  
  for (const diagnostic of diagnostics) {
    if (!result[diagnostic.filePath]) {
      result[diagnostic.filePath] = [];
    }
    result[diagnostic.filePath].push(diagnostic);
  }
  
  return result;
}

/**
 * Create a markdown report from diagnostics
 */
function createDiagnosticsReport(errorsByFile: Record<string, DiagnosticInfo[]>): string {
  let report = '# TypeScript Diagnostics Report\n\n';
  
  // Add summary
  const totalErrors = Object.values(errorsByFile).reduce((sum, errors) => sum + errors.length, 0);
  const totalFiles = Object.keys(errorsByFile).length;
  report += `Found **${totalErrors}** errors across **${totalFiles}** files.\n\n`;
  
  // Add details for each file
  for (const [filePath, errors] of Object.entries(errorsByFile)) {
    const fileName = filePath.split('/').pop() || filePath;
    report += `## ${fileName}\n\n`;
    
    errors.forEach((error, index) => {
      const location = `Line ${error.range.startLine + 1}, Column ${error.range.startCharacter + 1}`;
      const codeId = error.code ? ` (${error.code})` : '';
      
      report += `### Error ${index + 1}${codeId}\n\n`;
      report += `**Location:** ${location}\n\n`;
      report += `**Message:** ${error.message}\n\n`;
      
      if (error.relatedInformation && error.relatedInformation.length > 0) {
        report += `**Related Information:**\n\n`;
        error.relatedInformation.forEach(info => {
          const relatedFile = info.filePath.split('/').pop() || info.filePath;
          const relatedLocation = `Line ${info.range.startLine + 1}, Column ${info.range.startCharacter + 1}`;
          report += `- ${info.message} (${relatedFile}, ${relatedLocation})\n`;
        });
        report += '\n';
      }
    });
    
    report += '---\n\n';
  }
  
  return report;
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Activating Sukode Code Assistant extension');
  
  // Initialize ProjectPathService first
  // This ensures the current project path is available before other services
  const projectPathService = ProjectPathService.getInstance();
  context.subscriptions.push({
    dispose: () => projectPathService.dispose()
  });
  console.log('ProjectPathService initialized');
  
  // Initialize OpenAI service
  const openAIService = new OpenAIService(projectPathService.getCurrentProjectPath() || '');
  
  // Initialize the chat view provider for the side panel
  const chatViewProvider = new ChatViewProvider(context.extensionUri, openAIService);
  
  // Register the webview view provider
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('sukodeChatView', chatViewProvider)
  );
  console.log('WebviewViewProvider registered successfully');
  
  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('sukodeCodeAssistant.open', async () => {
      console.log('Command executed: sukodeCodeAssistant.open');
      
      // Focus the view in the side panel
      await vscode.commands.executeCommand('sukodeChatView.focus');
    })
  );
  
  context.subscriptions.push(
    vscode.commands.registerCommand('sukodeCodeAssistant.refresh', () => {
      console.log('Command executed: sukodeCodeAssistant.refresh');
      chatViewProvider.refresh();
    })
  );
  
  // Register command to analyze diagnostics
  context.subscriptions.push(
    vscode.commands.registerCommand('sukodeCodeAssistant.analyzeDiagnostics', async () => {
      console.log('Command executed: sukodeCodeAssistant.analyzeDiagnostics');
      
      // Get the diagnostics service
      const diagnosticsService = ServiceFactory.getDiagnosticsService();
      
      // Get all TypeScript errors
      const tsErrors = diagnosticsService.getTypeScriptDiagnostics()
        .filter(d => d.severity === vscode.DiagnosticSeverity.Error);
      
      if (tsErrors.length === 0) {
        vscode.window.showInformationMessage('No TypeScript errors found in the workspace.');
        return;
      }
      
      // Group errors by file
      const errorsByFile = groupDiagnosticsByFile(tsErrors);
      
      // Create a report
      const report = createDiagnosticsReport(errorsByFile);
      
      // Show the report in a new untitled document
      const document = await vscode.workspace.openTextDocument({
        content: report,
        language: 'markdown'
      });
      
      await vscode.window.showTextDocument(document);
    })
  );
  
  console.log('Extension activation complete');
}

export function deactivate() {
  // Clean up resources
}