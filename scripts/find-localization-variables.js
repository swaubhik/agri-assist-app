const fs = require('fs');
const path = require('path');

const TRANSLATION_FUNCTIONS = ['t', 'translate'];

function findLocalizationVariables(targetPath, results = new Set()) {
  if (!fs.existsSync(targetPath)) return results;

  const stat = fs.statSync(targetPath);

  if (stat.isDirectory()) {
    const files = fs.readdirSync(targetPath);
    files.forEach((file) => {
      findLocalizationVariables(path.join(targetPath, file), results);
    });
  } else if (/\.(js|jsx|ts|tsx)$/.test(targetPath)) {
    const content = fs.readFileSync(targetPath, 'utf8');
    TRANSLATION_FUNCTIONS.forEach((fn) => {
      // Match t('key') or t("key")
      const regex = new RegExp(`${fn}\\(\\s*['"]([^'"]+)['"]\\s*\\)`, 'g');
      let match;
      while ((match = regex.exec(content)) !== null) {
        results.add(match[1]);
      }
    });
  }

  return results;
}

// Usage
const target = process.argv[2] || '.'; // Pass file or directory as argument or use current
const keys = findLocalizationVariables(target);

console.log('Localization keys found:');
[...keys].sort().forEach((key) => console.log(key));