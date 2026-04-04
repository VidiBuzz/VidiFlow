// Verification Agent
// Validates rebranding completeness and scans for remaining references

import * as fs from 'fs';
import * as path from 'path';
import { BaseAgent, RebrandingContext, AgentResult, ChangeRecord, ScanResult } from './base-agent';

export class VerificationAgent extends BaseAgent {
  private scanResults: ScanResult = {
    filesWithReferences: [],
    totalFilesScanned: 0,
    referencesFound: 0
  };

  constructor() {
    super('verification-agent', 'Verification Agent', 'verification');
  }

  async execute(context: RebrandingContext): Promise<AgentResult> {
    this.log('Starting verification process...');
    
    try {
      // Scan for remaining text references
      await this.scanForTextReferences(context);
      
      // Validate logo replacements
      await this.validateLogos(context);
      
      // Generate validation report
      const report = this.generateValidationReport();
      
      this.log(`Verification completed. Found ${this.scanResults.referencesFound} remaining references.`);
      
      return {
        success: this.scanResults.referencesFound === 0,
        agentId: this.id,
        changes: [{
          filePath: 'verification-report',
          changeType: 'created',
          description: report,
          timestamp: new Date()
        }]
      };
    } catch (error) {
      this.error(`Verification failed: ${error}`);
      return {
        success: false,
        agentId: this.id,
        changes: [],
        errors: [String(error)]
      };
    }
  }

  private async scanForTextReferences(context: RebrandingContext): Promise<void> {
    this.log('Scanning for remaining AnythingLLM text references...');
    
    const searchPatterns = [
      'AnythingLLM',
      'anythingllm',
      'anything-llm',
      'anything_llm'
    ];

    const directoriesToScan = [
      context.extractedPath
    ];

    for (const directory of directoriesToScan) {
      if (fs.existsSync(directory)) {
        await this.scanDirectory(directory, searchPatterns);
      }
    }
  }

  private async scanDirectory(directory: string, patterns: string[]): Promise<void> {
    const files = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = path.join(directory, file.name);
      
      if (file.isDirectory() && !file.name.includes('node_modules') && !file.name.includes('.git')) {
        await this.scanDirectory(filePath, patterns);
      } else if (file.isFile() && this.isTextFile(file.name)) {
        await this.scanFile(filePath, patterns);
      }
    }
  }

  private isTextFile(filename: string): boolean {
    const textExtensions = ['.html', '.js', '.ts', '.json', '.md', '.txt', '.css', '.scss'];
    const ext = path.extname(filename).toLowerCase();
    return textExtensions.includes(ext);
  }

  private async scanFile(filePath: string, patterns: string[]): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.scanResults.totalFilesScanned++;
      
      for (const pattern of patterns) {
        const regex = new RegExp(pattern, 'gi');
        const matches = content.match(regex);
        
        if (matches && matches.length > 0) {
          this.scanResults.filesWithReferences.push(filePath);
          this.scanResults.referencesFound += matches.length;
          this.log(`⚠️  Found ${matches.length} reference(s) to "${pattern}" in ${filePath}`);
          break; // Only report each file once
        }
      }
    } catch (error) {
      // Skip binary files or files that can't be read
    }
  }

  private async validateLogos(context: RebrandingContext): Promise<void> {
    this.log('Validating logo replacements...');
    
    const expectedLogos = [
      path.join(context.extractedPath, 'dist', 'anything-llm-dark.png'),
      path.join(context.extractedPath, 'dist', 'anything-llm-light.png'),
      path.join(context.extractedPath, 'dist', 'favicon.ico'),
      path.join(context.extractedPath, 'dist', 'favicon.png'),
      path.join(context.extractedPath, 'dist', 'assets', 'login-logo-893f9fb0.svg')
    ];

    let missingLogos = 0;
    
    for (const logoPath of expectedLogos) {
      if (!fs.existsSync(logoPath)) {
        this.log(`❌ Missing logo file: ${logoPath}`);
        missingLogos++;
      }
    }

    if (missingLogos === 0) {
      this.log('✓ All expected logo files are present');
    }
  }

  private generateValidationReport(): string {
    const report = `
# Vidi Ai Rebranding Validation Report

## Summary
- **Total Files Scanned:** ${this.scanResults.totalFilesScanned}
- **Files with Remaining References:** ${this.scanResults.filesWithReferences.length}
- **Total Remaining References:** ${this.scanResults.referencesFound}

## Status: ${this.scanResults.referencesFound === 0 ? '✅ COMPLETE' : '⚠️ NEEDS ATTENTION'}

${this.scanResults.referencesFound > 0 ? `
## Files with Remaining References
${this.scanResults.filesWithReferences.map(file => `- ${file}`).join('\n')}

## Recommended Actions
1. Review the files listed above
2. Update any remaining "AnythingLLM" references to "Vidi Ai"
3. Re-run verification to confirm all references are updated
` : `
## All Checks Passed ✅
No remaining "AnythingLLM" references found in scanned files.
Logo files are properly replaced.
Ready for final asar repackaging.
`}

---
**Generated:** ${new Date().toISOString()}
**Agent:** Verification Agent
`;
    
    return report;
  }
}