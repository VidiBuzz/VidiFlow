// Text Rebranding Agent
// Updates hardcoded text references in HTML, JSON, and configuration files

import * as fs from 'fs';
import * as path from 'path';
import { BaseAgent, RebrandingContext, AgentResult, ChangeRecord } from './base-agent';

export class TextRebrandingAgent extends BaseAgent {
  private changes: ChangeRecord[] = [];

  constructor() {
    super('text-rebranding-agent', 'Text Rebranding Agent', 'text');
  }

  async execute(context: RebrandingContext): Promise<AgentResult> {
    this.log('Starting text rebranding process...');
    this.changes = [];

    try {
      // Process HTML files
      await this.processHtmlFiles(context);
      
      // Process JSON files
      await this.processJsonFiles(context);
      
      // Process JavaScript files
      await this.processJavaScriptFiles(context);

      this.log(`Text rebranding completed. Made ${this.changes.length} changes.`);
      
      return {
        success: true,
        agentId: this.id,
        changes: this.changes
      };
    } catch (error) {
      this.error(`Text rebranding failed: ${error}`);
      return {
        success: false,
        agentId: this.id,
        changes: this.changes,
        errors: [String(error)]
      };
    }
  }

  private async processHtmlFiles(context: RebrandingContext): Promise<void> {
    this.log('Processing HTML files...');
    
    const htmlFiles = [
      path.join(context.extractedPath, 'dist', 'index.html'),
      path.join(context.extractedPath, 'dist', 'assistant.html')
    ];

    for (const filePath of htmlFiles) {
      if (fs.existsSync(filePath)) {
        await this.updateHtmlFile(filePath, context.brandingConfig);
      }
    }
  }

  private async updateHtmlFile(filePath: string, config: any): Promise<void> {
    this.log(`Updating HTML file: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Update title
    content = content.replace(
      /<title>AnythingLLM[^<]*<\/title>/gi,
      `<title>${config.productName} | ${config.description}</title>`
    );

    // Update meta title
    content = content.replace(
      /<meta\s+name="title"\s+content="[^"]*AnythingLLM[^"]*"/gi,
      `<meta name="title" content="${config.productName} | ${config.description}"`
    );

    // Update meta description
    content = content.replace(
      /<meta\s+name="description"\s+content="[^"]*AnythingLLM[^"]*"/gi,
      `<meta name="description" content="${config.productName} | ${config.description}"`
    );

    // Update OpenGraph title
    content = content.replace(
      /<meta\s+property="og:title"\s+content="[^"]*AnythingLLM[^"]*"/gi,
      `<meta property="og:title" content="${config.productName} | ${config.description}"`
    );

    // Update OpenGraph description
    content = content.replace(
      /<meta\s+property="og:description"\s+content="[^"]*AnythingLLM[^"]*"/gi,
      `<meta property="og:description" content="${config.productName} | ${config.description}"`
    );

    // Update Twitter title
    content = content.replace(
      /<meta\s+property="twitter:title"\s+content="[^"]*AnythingLLM[^"]*"/gi,
      `<meta property="twitter:title" content="${config.productName} | ${config.description}"`
    );

    // Update Twitter description
    content = content.replace(
      /<meta\s+property="twitter:description"\s+content="[^"]*AnythingLLM[^"]*"/gi,
      `<meta property="twitter:description" content="${config.productName} | ${config.description}"`
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      this.changes.push({
        filePath,
        changeType: 'modified',
        description: `Updated HTML metadata from AnythingLLM to ${config.productName}`,
        timestamp: new Date()
      });
      this.log(`✓ Updated ${filePath}`);
    }
  }

  private async processJsonFiles(context: RebrandingContext): Promise<void> {
    this.log('Processing JSON files...');
    
    const packageJsonPath = path.join(context.extractedPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      await this.updatePackageJson(packageJsonPath, context.brandingConfig);
    }
  }

  private async updatePackageJson(filePath: string, config: any): Promise<void> {
    this.log(`Updating package.json: ${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const packageJson = JSON.parse(content);
    const originalContent = JSON.stringify(packageJson, null, 2);

    // Update package name
    if (packageJson.name === 'anythingllm-desktop') {
      packageJson.name = 'vidi-ai-desktop';
    }

    // Update description
    if (packageJson.description && packageJson.description.includes('AnythingLLM')) {
      packageJson.description = config.description;
    }

    // Update author if needed
    if (packageJson.author && packageJson.author.includes('Mintplex Labs')) {
      packageJson.author = 'Vidi Ai Team';
    }

    const newContent = JSON.stringify(packageJson, null, 2);
    
    if (newContent !== originalContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      this.changes.push({
        filePath,
        changeType: 'modified',
        description: `Updated package.json with ${config.productName} branding`,
        timestamp: new Date()
      });
      this.log(`✓ Updated ${filePath}`);
    }
  }

  private async processJavaScriptFiles(context: RebrandingContext): Promise<void> {
    this.log('Processing JavaScript files...');
    
    const jsFiles = [
      path.join(context.extractedPath, 'dist-electron', 'preload', 'manual-browser.js')
    ];

    for (const filePath of jsFiles) {
      if (fs.existsSync(filePath)) {
        await this.updateJavaScriptFile(filePath, context.brandingConfig);
      }
    }
  }

  private async updateJavaScriptFile(filePath: string, config: any): Promise<void> {
    this.log(`Updating JavaScript file: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Update documentation URL
    content = content.replace(
      /https:\/\/docs\.anythingllm\.com/gi,
      'https://docs.vidi-ai.com'
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      this.changes.push({
        filePath,
        changeType: 'modified',
        description: `Updated documentation URL from anythingllm.com to vidi-ai.com`,
        timestamp: new Date()
      });
      this.log(`✓ Updated ${filePath}`);
    }
  }
}