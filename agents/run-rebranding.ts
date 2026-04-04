// Main Rebranding Orchestrator
// Runs the text rebranding agents on the extracted AnythingLLM files

import * as fs from 'fs';
import * as path from 'path';
import { TextRebrandingAgent } from './agents/text-rebranding-agent';
import { VerificationAgent } from './agents/verification-agent';
import { RebrandingContext, BrandingConfiguration } from './agents/base-agent';

async function main() {
  console.log('🚀 Starting Vidi Ai Text Rebranding Process...\n');

  // Load branding configuration
  const configPath = path.join(__dirname, 'branding-config.json');
  const brandingConfig: BrandingConfiguration = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Define context
  const context: RebrandingContext = {
    sourceApp: 'AnythingLLM',
    targetApp: 'Vidi Ai',
    installationPath: 'C:\\Users\\James\\AppData\\Local\\Programs\\AnythingLLM',
    backupPath: 'C:\\Backup\\anythingllm-original-20260321-173735',
    extractedPath: 'C:\\Temp\\anythingllm-extract',
    brandingConfig
  };

  console.log('📋 Rebranding Context:');
  console.log(`   Source: ${context.sourceApp}`);
  console.log(`   Target: ${context.targetApp}`);
  console.log(`   Extracted Path: ${context.extractedPath}`);
  console.log(`   Product Name: ${brandingConfig.productName}\n`);

  // Step 1: Run Text Rebranding Agent
  console.log('📝 Step 1: Running Text Rebranding Agent...');
  const textAgent = new TextRebrandingAgent();
  const textResult = await textAgent.execute(context);

  if (textResult.success) {
    console.log(`✅ Text rebranding completed successfully!`);
    console.log(`   Files modified: ${textResult.changes.length}\n`);
    
    textResult.changes.forEach(change => {
      console.log(`   - ${change.description}`);
    });
  } else {
    console.log(`❌ Text rebranding failed!`);
    if (textResult.errors) {
      textResult.errors.forEach(error => console.log(`   Error: ${error}`));
    }
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Step 2: Run Verification Agent
  console.log('🔍 Step 2: Running Verification Agent...');
  const verificationAgent = new VerificationAgent();
  const verificationResult = await verificationAgent.execute(context);

  if (verificationResult.success) {
    console.log(`✅ Verification completed successfully!`);
    console.log(`   No remaining AnythingLLM references found.\n`);
  } else {
    console.log(`⚠️  Verification found remaining references.`);
    console.log(`   Check the validation report for details.\n`);
  }

  // Display validation report
  if (verificationResult.changes.length > 0) {
    console.log('📊 Validation Report:');
    console.log(verificationResult.changes[0].description);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Step 3: Repackage asar
  console.log('📦 Step 3: Repackaging app.asar...');
  console.log('   This will be done via PowerShell command.');
  console.log('   Command: npx asar pack C:\\Temp\\anythingllm-extract C:\\Temp\\vidi-ai-app.asar\n');

  console.log('🎯 Next Steps:');
  console.log('   1. Run the repackaging command above');
  console.log('   2. Replace the original app.asar:');
  console.log('      Copy-Item C:\\Temp\\vidi-ai-app.asar "C:\\Users\\James\\AppData\\Local\\Programs\\AnythingLLM\\resources\\app.asar" -Force');
  console.log('   3. Launch Vidi Ai to verify the rebranding');
  console.log('   4. Clear browser cache if needed\n');

  console.log('✨ Text rebranding process completed!\n');
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});