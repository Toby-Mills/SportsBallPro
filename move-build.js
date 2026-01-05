const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'docs', 'browser');
const targetDir = path.join(__dirname, 'docs');

// Check if browser directory exists
if (!fs.existsSync(sourceDir)) {
  console.log('No browser directory found, nothing to move.');
  process.exit(0);
}

// Get all files and folders in the browser directory
const items = fs.readdirSync(sourceDir);

// Move each item to the parent docs directory
items.forEach(item => {
  const sourcePath = path.join(sourceDir, item);
  const targetPath = path.join(targetDir, item);
  
  // Remove target if it exists
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
  
  // Move the item
  fs.renameSync(sourcePath, targetPath);
  console.log(`Moved: ${item}`);
});

// Remove the now-empty browser directory
fs.rmdirSync(sourceDir);
console.log('Cleaned up browser directory.');

// Create a copy of index.html as 404.html for GitHub Pages SPA routing
const indexPath = path.join(targetDir, 'index.html');
const notFoundPath = path.join(targetDir, '404.html');

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('Created 404.html from index.html.');
}
