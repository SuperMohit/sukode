export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters?: {
      type: string;
      properties: Record<string, any>;
      required?: string[];
    };
  };
}
