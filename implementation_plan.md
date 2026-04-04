# Implementation Plan: AnythingLLM to Vidi Ai Rebranding with Agent-Based Approach

## [Overview]

This implementation plan outlines a comprehensive agent-based approach to rebrand AnythingLLM desktop application to "Vidi Ai". The plan addresses not only logo replacement (already completed) but also hardcoded text references, metadata, package configuration, and provides a scalable framework for future branding changes through specialized agents.

**Current State:** Logo assets have been replaced, but hardcoded text references remain in HTML meta tags and package.json files. This plan completes the rebranding and establishes an agent-based system for ongoing branding management.

**Scope:** 
- Complete text-based rebranding (HTML, JSON, configuration files)
- Create specialized agents for different rebranding tasks
- Establish verification and rollback procedures
- Document the agent-based architecture for future maintenance

---

## [Types]

### Agent System Types

```typescript
interface RebrandingAgent {
  id: string;
  name: string;
  type: 'logo' | 'text' | 'config' | 'verification' | 'rollback';
  capabilities: string[];
  execute(context: RebrandingContext): Promise<AgentResult>;
}

interface RebrandingContext {
  sourceApp: 'AnythingLLM';
  targetApp: 'Vidi Ai';
  installationPath: string;
  backupPath: string;
  extractedPath: string;
  brandingConfig: BrandingConfiguration;
}

interface BrandingConfiguration {
  productName: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
  };
  fonts: string[];
  metaTags: Record<string, string>;
}

interface AgentResult {
  success: boolean;
  agentId: string;
  changes: ChangeRecord[];
  errors?: string[];
}

interface ChangeRecord {
  filePath: string;
  changeType: 'created' | 'modified' | 'deleted';
  description: string;
  timestamp: Date;
}
```

---

## [Files]

### New Files to Create

1. **m:/code/vidismart/agents/branding-coordinator.ts**
   - Purpose: Main orchestrator agent that coordinates all rebranding agents
   - Manages agent execution order and error handling
   - Tracks overall progress and generates reports

2. **m:/code/vidismart/agents/logo-agent.ts**
   - Purpose: Handles all logo and image asset replacements
   - Already partially implemented via Python script
   - Agent wrapper for automated execution

3. **m:/code/vidismart/agents/text-rebranding-agent.ts**
   - Purpose: Updates all hardcoded text references
   - Handles HTML title, meta tags, descriptions
   - Updates package.json and configuration files

4. **m:/code/vidismart/agents/verification-agent.ts**
   - Purpose: Validates rebranding completeness
   - Checks for remaining AnythingLLM references
   - Verifies all logos are properly replaced

5. **m:/code/vidismart/agents/rollback-agent.ts**
   - Purpose: Handles rollback operations if needed
   - Restores from backup
   - Validates restoration success

6. **m:/code/vidismart/branding-config.json**
   - Purpose: Centralized branding configuration
   - Contains all Vidi Ai branding specifications
   - Used by all agents for consistency

### Existing Files to Modify

1. **C:\Temp\anythingllm-extract\dist\index.html**
   - Line 11: Change `<title>AnythingLLM | Superpowers for your OS using local AI</title>` → `<title>Vidi Ai | AI-powered knowledge base</title>`
   - Lines 13-14: Update meta title and description
   - Lines 19-20: Update Open Graph title and description
   - Lines 27-28: Update Twitter card title and description

2. **C:\Temp\anythingllm-extract\package.json**
   - Change `"name": "anythingllm-desktop"` → `"name": "vidi-ai-desktop"`
   - Change `"description": "AnythingLLM gives your OS superpowers using local AI."` → `"description": "Vidi Ai - AI-powered knowledge base and chat interface"`
   - Update `"author"` field if needed

3. **C:\Temp\anythingllm-extract\dist-electron\preload\manual-browser.js**
   - Line 2: Change `"https://docs.anythingllm.com/features/browser-tool"` → `"https://docs.vidi-ai.com/features/browser-tool"` (or remove URL reference)
   - This URL reference should be updated or removed based on user preference

3. **C:\Users\James\AppData\Local\Programs\AnythingLLM\resources\app.asar**
   - Will be repackaged with updated HTML and package.json

### Files to Delete (After Verification)

1. **C:\Temp\vidi-ai-app.asar** (old repackaged version)
   - Will be replaced with newly repackaged version including text updates

---

## [Functions]

### New Functions

1. **coordinator.executeRebrandingPipeline(context: RebrandingContext): Promise<AgentResult[]>**
   - File: m:/code/vidismart/agents/branding-coordinator.ts
   - Purpose: Orchestrates the execution of all rebranding agents in correct order
   - Returns: Array of results from all agents

2. **textAgent.updateHtmlMetadata(htmlPath: string, config: BrandingConfiguration): Promise<ChangeRecord[]>**
   - File: m:/code/vidismart/agents/text-rebranding-agent.ts
   - Purpose: Updates all HTML meta tags and title with Vidi Ai branding
   - Parses HTML, replaces text, saves file

3. **textAgent.updatePackageJson(packagePath: string, config: BrandingConfiguration): Promise<ChangeRecord>**
   - File: m:/code/vidismart/agents/text-rebranding-agent.ts
   - Purpose: Updates package.json with Vidi Ai product information
   - Handles name, description, and metadata fields

4. **verificationAgent.scanForReferences(directoryPath: string, patterns: string[]): Promise<ScanResult>**
   - File: m:/code/vidismart/agents/verification-agent.ts
   - Purpose: Scans directory for any remaining AnythingLLM references
   - Returns: List of files containing old branding

5. **rollbackAgent.restoreFromBackup(backupPath: string, targetPath: string): Promise<RestoreResult>**
   - File: m:/code/vidismart/agents/rollback-agent.ts
   - Purpose: Restores original AnythingLLM installation from backup
   - Validates restoration completeness

### Modified Functions

1. **logoAgent.generateLogos(config: BrandingConfiguration): Promise<void>**
   - File: m:/code/vidismart/agents/logo-agent.ts
   - Current: create_vidi_ai_logos.py script
   - Modification: Wrap Python script in TypeScript agent interface
   - Add progress tracking and error handling

---

## [Classes]

### New Classes

1. **BrandingCoordinator**
   - File: m:/code/vidismart/agents/branding-coordinator.ts
   - Key Methods:
     - `initialize()`: Sets up agent registry and context
     - `executePipeline()`: Runs all agents in sequence
     - `generateReport()`: Creates execution summary
   - Inheritance: BaseAgent

2. **TextRebrandingAgent**
   - File: m:/code/vidismart/agents/text-rebranding-agent.ts
   - Key Methods:
     - `processHtmlFiles()`: Updates all HTML files
     - `processJsonFiles()`: Updates package.json and config files
     - `processJavaScriptFiles()`: Updates any JS with hardcoded strings
   - Inheritance: BaseAgent

3. **VerificationAgent**
   - File: m:/code/vidismart/agents/verification-agent.ts
   - Key Methods:
     - `validateLogos()`: Checks all logo files are replaced
     - `validateText()`: Scans for remaining old references
     - `generateValidationReport()`: Creates detailed report
   - Inheritance: BaseAgent

4. **RollbackAgent**
   - File: m:/code/vidismart/agents/rollback-agent.ts
   - Key Methods:
     - `validateBackup()`: Ensures backup integrity
     - `executeRollback()`: Restores from backup
     - `verifyRollback()`: Confirms successful restoration
   - Inheritance: BaseAgent

### Modified Classes

1. **BaseAgent (New Interface)**
   - File: m:/code/vidismart/agents/base-agent.ts
   - Defines common agent interface
   - All specific agents implement this interface

---

## [Dependencies]

### New Packages

1. **cheerio** (^1.0.0-rc.12)
   - Purpose: HTML parsing and manipulation for text rebranding
   - Integration: Used by TextRebrandingAgent to update HTML files

2. **typescript** (^5.3.3)
   - Purpose: Type safety for agent system
   - Integration: All agent files will be TypeScript

3. **jest** (^29.7.0)
   - Purpose: Testing framework for agent validation
   - Integration: Unit tests for each agent

### Version Changes

- Node.js: ^20.14.0 (existing, compatible)
- No breaking dependency changes required

---

## [Testing]

### Test File Requirements

1. **m:/code/vidismart/tests/agents/text-rebranding-agent.test.ts**
   - Test HTML metadata updates
   - Test package.json modifications
   - Test handling of various file encodings

2. **m:/code/vidismart/tests/agents/verification-agent.test.ts**
   - Test reference scanning accuracy
   - Test false positive handling
   - Test report generation

3. **m:/code/vidismart/tests/agents/rollback-agent.test.ts**
   - Test backup validation
   - Test restoration process
   - Test error handling

### Existing Test Modifications

- No existing tests to modify (new system)

### Validation Strategies

1. **Pre-execution validation**: Verify backup integrity before any changes
2. **Post-execution validation**: Run verification agent after all changes
3. **Rollback testing**: Test rollback procedure in isolated environment
4. **Integration testing**: Full pipeline test with sample installation

---

## [Implementation Order]

1. **Create branding-config.json** with Vidi Ai specifications
2. **Implement BaseAgent interface** for agent system foundation
3. **Implement TextRebrandingAgent** to update HTML and JSON files
4. **Run TextRebrandingAgent** on extracted asar directory
5. **Implement VerificationAgent** to scan for remaining references
6. **Run VerificationAgent** to confirm text rebranding completeness
7. **Repackage app.asar** with updated HTML and package.json
8. **Replace app.asar** in AnythingLLM installation
9. **Implement BrandingCoordinator** to orchestrate full pipeline
10. **Implement RollbackAgent** for safety
11. **Run full pipeline** through coordinator
12. **Final verification** with VerificationAgent
13. **Create agent documentation** for future maintenance

### Contingency Procedures

**Contingency 1: HTML Parsing Fails**
- Fallback: Use simple string replacement with regex
- Agent detects parsing failure and switches strategy

**Contingency 2: Package.json Structure Unexpected**
- Fallback: Manual field-by-field replacement
- Validation agent confirms all required fields updated

**Contingency 3: Asar Repackaging Fails**
- Fallback: Use original asar, modify only accessible files
- Log all unmodified files for manual intervention

**Contingency 4: Verification Finds Remaining References**
- Agent generates detailed report of remaining references
- Secondary pass with expanded pattern matching
- Manual review flag for edge cases

**Contingency 5: Rollback Required**
- RollbackAgent validates backup integrity
- Executes restoration with progress tracking
- VerificationAgent confirms successful rollback

---

## [Agent Execution Flow]

```
┌─────────────────────────────────────────┐
│  BrandingCoordinator (Orchestrator)     │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌──────────────┐ ┌──────────────┐
│ TextRebrand  │ │  LogoAgent   │
│   Agent      │ │  (Complete)  │
└──────┬───────┘ └──────────────┘
       │
       ▼
┌──────────────┐
│ Verification │
│    Agent     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Rollback    │
│  Agent       │
└──────────────┘
```

---

## [Success Criteria]

1. ✅ All HTML meta tags updated to Vidi Ai
2. ✅ package.json reflects Vidi Ai branding
3. ✅ Zero remaining "AnythingLLM" references in critical files
4. ✅ All logo assets properly replaced (already complete)
5. ✅ Application launches with Vidi Ai branding
6. ✅ Rollback procedure tested and documented
7. ✅ Agent system operational for future changes

---

**Document Version:** 1.0  
**Created:** March 21, 2026  
**Status:** Ready for Implementation  
**Next Step:** Create implementation task and begin execution