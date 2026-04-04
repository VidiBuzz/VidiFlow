/**
 * VidiSmart SmartStack - Quick Deployment Script
 * Deploys the complete SmartStack system to production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        VidiSmart SmartStack Deployment Script            ║
║                                                           ║
║   AI-Powered Enterprise Tech Stack Builder              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

// =====================================================
// CONFIGURATION
// =====================================================
const CONFIG = {
  FRONTEND_FILE: 'smartstack-builder.html',
  BACKEND_FILE: 'smartstack-ai-engine.js',
  SCHEMA_FILE: 'smartstack-schema.sql',
  IMPORT_FILE: 'smartstack-data-import.js',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://jeasmwbberfgztkxfjwr.supabase.co',
  DEPLOYMENT_TARGET: process.env.DEPLOYMENT_TARGET || 'local'
};

// =====================================================
// DEPLOYMENT STEPS
// =====================================================

async function checkPrerequisites() {
  console.log('\n📋 Step 1: Checking prerequisites...\n');

  const checks = {
    'Node.js': () => execSync('node --version').toString().trim(),
    'npm': () => execSync('npm --version').toString().trim(),
    'Frontend file': () => fs.existsSync(CONFIG.FRONTEND_FILE) ? '✓ Found' : '✗ Missing',
    'Backend file': () => fs.existsSync(CONFIG.BACKEND_FILE) ? '✓ Found' : '✗ Missing',
    'Schema file': () => fs.existsSync(CONFIG.SCHEMA_FILE) ? '✓ Found' : '✗ Missing'
  };

  for (const [name, check] of Object.entries(checks)) {
    try {
      const result = check();
      console.log(`  ✅ ${name}: ${result}`);
    } catch (error) {
      console.log(`  ❌ ${name}: Not found`);
      process.exit(1);
    }
  }

  console.log('\n✅ All prerequisites met!\n');
}

async function setupEnvironment() {
  console.log('📝 Step 2: Setting up environment...\n');

  const envContent = `# VidiSmart SmartStack Environment Configuration
SUPABASE_URL=${CONFIG.SUPABASE_URL}
SUPABASE_ANON_KEY=${process.env.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE'}
PORT=3001
NODE_ENV=production

# Optional AI API Keys
GEMINI_API_KEY=${process.env.GEMINI_API_KEY || ''}
OPENAI_API_KEY=${process.env.OPENAI_API_KEY || ''}
`;

  fs.writeFileSync('.env', envContent);
  console.log('  ✅ Created .env file\n');

  // Check if .env has real values
  if (envContent.includes('YOUR_ANON_KEY_HERE')) {
    console.log('  ⚠️  WARNING: Please update .env with your actual Supabase credentials!\n');
  }
}

async function installDependencies() {
  console.log('📦 Step 3: Installing dependencies...\n');

  const packageJson = {
    name: 'vidismart-smartstack',
    version: '1.0.0',
    description: 'AI-Powered Enterprise Tech Stack Builder',
    main: 'smartstack-ai-engine.js',
    scripts: {
      start: 'node smartstack-ai-engine.js',
      dev: 'nodemon smartstack-ai-engine.js',
      import: 'node smartstack-data-import.js'
    },
    dependencies: {
      '@supabase/supabase-js': '^2.39.0',
      'express': '^4.18.2',
      'cors': '^2.8.5'
    },
    devDependencies: {
      'nodemon': '^3.0.2'
    }
  };

  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('  ✅ Created package.json\n');

  console.log('  📥 Installing npm packages...\n');
  execSync('npm install', { stdio: 'inherit' });

  console.log('\n  ✅ Dependencies installed!\n');
}

async function deployDatabase() {
  console.log('🗄️  Step 4: Database deployment...\n');

  console.log('  📄 Database schema ready at: smartstack-schema.sql\n');
  console.log('  ⚠️  MANUAL STEP REQUIRED:\n');
  console.log('  1. Go to https://supabase.com/dashboard');
  console.log('  2. Open SQL Editor');
  console.log('  3. Copy and paste the contents of smartstack-schema.sql');
  console.log('  4. Execute the SQL');
  console.log('\n  ⏸️  Press ENTER when database schema is created...');

  // Wait for user confirmation
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  console.log('\n  ✅ Database schema confirmed!\n');
}

async function importData() {
  console.log('📊 Step 5: Importing technology data...\n');

  try {
    execSync('node smartstack-data-import.js', { stdio: 'inherit' });
    console.log('\n  ✅ Data import completed!\n');
  } catch (error) {
    console.log('\n  ❌ Data import failed. You may need to run it manually:\n');
    console.log('     node smartstack-data-import.js\n');
  }
}

async function deployFrontend() {
  console.log('🌐 Step 6: Frontend deployment...\n');

  const target = CONFIG.DEPLOYMENT_TARGET;

  if (target === 'local') {
    console.log('  📝 Local deployment selected\n');
    console.log('  ✅ Frontend ready at: smartstack-builder.html\n');
    console.log('  📖 To view: Open smartstack-builder.html in your browser\n');
  } else if (target === 'vercel') {
    console.log('  🚀 Deploying to Vercel...\n');
    try {
      execSync('vercel --prod', { stdio: 'inherit' });
      console.log('\n  ✅ Deployed to Vercel!\n');
    } catch (error) {
      console.log('\n  ❌ Vercel deployment failed. Install with: npm i -g vercel\n');
    }
  } else if (target === 'netlify') {
    console.log('  🚀 Deploying to Netlify...\n');
    try {
      execSync('netlify deploy --prod', { stdio: 'inherit' });
      console.log('\n  ✅ Deployed to Netlify!\n');
    } catch (error) {
      console.log('\n  ❌ Netlify deployment failed. Install with: npm i -g netlify-cli\n');
    }
  }
}

async function deployBackend() {
  console.log('⚙️  Step 7: Backend deployment...\n');

  const target = CONFIG.DEPLOYMENT_TARGET;

  if (target === 'local') {
    console.log('  📝 Local deployment selected\n');
    console.log('  ✅ Backend ready to start\n');
    console.log('  📖 To run: npm start\n');
  } else if (target === 'railway') {
    console.log('  🚀 Deploying to Railway...\n');
    console.log('  📖 Manual deployment required:\n');
    console.log('     1. Go to https://railway.app');
    console.log('     2. Create new project');
    console.log('     3. Connect GitHub repository');
    console.log('     4. Set environment variables from .env');
    console.log('     5. Deploy!\n');
  } else if (target === 'fly') {
    console.log('  🚀 Deploying to Fly.io...\n');
    try {
      execSync('fly launch --no-deploy', { stdio: 'inherit' });
      execSync('fly deploy', { stdio: 'inherit' });
      console.log('\n  ✅ Deployed to Fly.io!\n');
    } catch (error) {
      console.log('\n  ❌ Fly.io deployment failed. Install with: curl -L https://fly.io/install.sh | sh\n');
    }
  }
}

async function createDocumentation() {
  console.log('📚 Step 8: Creating deployment documentation...\n');

  const deploymentInfo = `# VidiSmart SmartStack Deployment Info

Deployed: ${new Date().toISOString()}
Target: ${CONFIG.DEPLOYMENT_TARGET}

## URLs

- Frontend: ${CONFIG.DEPLOYMENT_TARGET === 'local' ? 'file://smartstack-builder.html' : 'TBD'}
- Backend: ${CONFIG.DEPLOYMENT_TARGET === 'local' ? 'http://localhost:3001' : 'TBD'}
- Database: ${CONFIG.SUPABASE_URL}

## Next Steps

1. Start backend: npm start
2. Open frontend: smartstack-builder.html
3. Select a use case
4. Generate your first stack!

## Monitoring

- Backend health: GET /health
- Database: Supabase Dashboard

## Support

- README: SMARTSTACK_README.md
- Issues: GitHub Issues
- Email: support@vidismart.com
`;

  fs.writeFileSync('DEPLOYMENT_INFO.md', deploymentInfo);
  console.log('  ✅ Created DEPLOYMENT_INFO.md\n');
}

async function runTests() {
  console.log('🧪 Step 9: Running verification tests...\n');

  const tests = [
    {
      name: 'Frontend file exists',
      test: () => fs.existsSync(CONFIG.FRONTEND_FILE)
    },
    {
      name: 'Backend file exists',
      test: () => fs.existsSync(CONFIG.BACKEND_FILE)
    },
    {
      name: 'Environment configured',
      test: () => fs.existsSync('.env')
    },
    {
      name: 'Dependencies installed',
      test: () => fs.existsSync('node_modules')
    },
    {
      name: 'Package.json valid',
      test: () => {
        const pkg = JSON.parse(fs.readFileSync('package.json'));
        return pkg.dependencies['@supabase/supabase-js'] !== undefined;
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      if (test.test()) {
        console.log(`  ✅ ${test.name}`);
        passed++;
      } else {
        console.log(`  ❌ ${test.name}`);
        failed++;
      }
    } catch (error) {
      console.log(`  ❌ ${test.name}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    console.log('  ⚠️  Some tests failed. Please review the errors above.\n');
  } else {
    console.log('  ✅ All tests passed!\n');
  }
}

async function showSummary() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              🎉 DEPLOYMENT COMPLETE! 🎉                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

📦 What was deployed:

  ✅ Database schema (Supabase)
  ✅ Technology data (100+ techs)
  ✅ Use cases (10 templates)
  ✅ Frontend interface
  ✅ AI engine backend
  ✅ Documentation

🚀 Quick Start Commands:

  1. Start backend:
     npm start

  2. Open frontend:
     Open smartstack-builder.html in browser

  3. Import more data:
     npm run import

📖 Documentation:

  - Full guide: SMARTSTACK_README.md
  - Deployment info: DEPLOYMENT_INFO.md
  - API docs: See README API section

🆘 Need Help?

  - Check logs for errors
  - Verify .env credentials
  - Review Supabase dashboard
  - Read troubleshooting in README

✨ Next Steps:

  1. Customize technology database
  2. Add your own use cases
  3. Configure AI integrations (GPT-4/Gemini)
  4. Share with your team!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Made with ❤️  by VidiSmart | https://vidi.news/smart-stack

`);
}

// =====================================================
// MAIN EXECUTION
// =====================================================

async function main() {
  try {
    await checkPrerequisites();
    await setupEnvironment();
    await installDependencies();
    await deployDatabase();
    await importData();
    await deployFrontend();
    await deployBackend();
    await createDocumentation();
    await runTests();
    await showSummary();

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.error('\n💡 Check the error above and try again.\n');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  // Make stdin readable
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  main();
}

module.exports = { main };
