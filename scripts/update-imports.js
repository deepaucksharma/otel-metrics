const fs = require('fs');
const path = require('path');

// Get all files from a directory recursively
function getFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      getFiles(fullPath, files);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Process all files in the src directory
const srcDir = path.join(__dirname, '../src');
const files = getFiles(srcDir);
const testsDir = path.join(__dirname, '../tests');
if (fs.existsSync(testsDir)) {
  getFiles(testsDir, files);
}

let modifiedFiles = 0;

// Process each file
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Replace imports from @/contracts
  if (content.includes('@/contracts')) {
    // Replace specific imports
    content = content.replace(/from\s+['"]@\/contracts\/types['"]/g, "from '@intellimetric/contracts/types'");
    content = content.replace(/from\s+['"]@\/contracts\/rawOtlpTypes['"]/g, "from '@intellimetric/contracts/rawOtlpTypes'");
    content = content.replace(/from\s+['"]@\/contracts\/either['"]/g, "from '@intellimetric/contracts/either'");
    
    // Replace general imports
    content = content.replace(/from\s+['"]@\/contracts['"]/g, "from '@intellimetric/contracts'");
    
    // Replace import types
    content = content.replace(/import\s+type[^;]+from\s+['"]@\/contracts\/types['"]/g, (match) => {
      return match.replace('@/contracts/types', '@intellimetric/contracts/types');
    });
    content = content.replace(/import\s+type[^;]+from\s+['"]@\/contracts\/rawOtlpTypes['"]/g, (match) => {
      return match.replace('@/contracts/rawOtlpTypes', '@intellimetric/contracts/rawOtlpTypes');
    });
    content = content.replace(/import\s+type[^;]+from\s+['"]@\/contracts\/either['"]/g, (match) => {
      return match.replace('@/contracts/either', '@intellimetric/contracts/either');
    });
    content = content.replace(/import\s+type[^;]+from\s+['"]@\/contracts['"]/g, (match) => {
      return match.replace('@/contracts', '@intellimetric/contracts');
    });
    
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(file, content);
    modifiedFiles++;
    console.log(`Updated imports in: ${path.relative(__dirname, file)}`);
  }
}

console.log(`Modified ${modifiedFiles} files.`);
