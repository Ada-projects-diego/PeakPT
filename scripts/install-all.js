const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const directories = ['', '', 'backend', 'peakptapp'];

console.log('Installing dependencies for all projects...');

directories.forEach(dir => {
  const fullPath = path.join(rootDir, dir);
  console.log(`Installing dependencies in ${fullPath}...`);
  execSync('npm install', { cwd: fullPath, stdio: 'inherit' });
});

console.log('All dependencies installed successfully!');