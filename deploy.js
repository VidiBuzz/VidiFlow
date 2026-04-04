const { execSync } = require('child_process');

console.log('--- EXECUTING JAVASCRIPT DEPLOY AUTOMATION ---');

  try {
      console.log('Adding files to Git...');
      // Forced addition so it ignores the .gitignore file protecting the images folder
      execSync('git add -f VidiSmart.VisualVectorSearch.html brand-swap.html images/vidismart_omni_engine.png images/company_intel_ai.png', { stdio: 'inherit', cwd: 'm:/code/vidismart' });

      console.log('Committing files to Git...');
      execSync('git commit -m "feat: Add VidiSmart Vector Search layout and brand-swap.html"', { stdio: 'inherit', cwd: 'm:/code/vidismart' });

      console.log('Pushing to remote origin...');
      execSync('git push', { stdio: 'inherit', cwd: 'm:/code/vidismart' });

      console.log('Uploading images to R2...');
      execSync('node upload_generated.js', { stdio: 'inherit', cwd: 'm:/code/vidismart' });

      console.log('----------------------------------');
      console.log('SUCCESS: Deployed HTML to server and uploaded images to R2.');
  } catch (error) {
      console.error('Error during deployment:', error.message);
  }
