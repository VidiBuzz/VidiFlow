// Base Agent Interface for Vidi Ai Rebranding System
// Defines the contract all rebranding agents must implement

export interface RebrandingContext {
  sourceApp: 'AnythingLLM';
  targetApp: 'Vidi Ai';
  installationPath: string;
  backupPath: string;
  extractedPath: string;
  brandingConfig: BrandingConfiguration;
}

export interface BrandingConfiguration {
  productName: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
  };
  fonts: string[];
  metaTags: Record<string, string>;
}

export interface AgentResult {
  success: boolean;
  agentId: string;
  changes: ChangeRecord[];
  errors?: string[];
}

export interface ChangeRecord {
  filePath: string;
  changeType: 'created' | 'modified' | 'deleted';
  description: string;
  timestamp: Date;
}

export interface ScanResult {
  filesWithReferences: string[];
  totalFilesScanned: number;
  referencesFound: number;
}

export interface RestoreResult {
  success: boolean;
  filesRestored: number;
  errors?: string[];
}

export abstract class BaseAgent {
  protected id: string;
  protected name: string;
  protected type: 'logo' | 'text' | 'config' | 'verification' | 'rollback';

  constructor(id: string, name: string, type: 'logo' | 'text' | 'config' | 'verification' | 'rollback') {
    this.id = id;
    this.name = name;
    this.type = type;
  }

  abstract execute(context: RebrandingContext): Promise<AgentResult>;
  
  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getType(): string {
    return this.type;
  }

  protected log(message: string): void {
    console.log(`[${this.name}] ${message}`);
  }

  protected error(message: string): void {
    console.error(`[${this.name}] ERROR: ${message}`);
  }
}