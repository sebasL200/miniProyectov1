const fs = require('fs');
const path = require('path');

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Fix optionalStringValue(query.field) -> optionalStringValue(query.field, 'field', issues)
  content = content.replace(/(optionalStringValue|optionalTrimmedStringValue|optionalQueryBoolean)\(([\w]+)\.([\w]+)\)/g, (match, fn, obj, field) => {
    changed = true;
    return `${fn}(${obj}.${field}, '${field}', issues)`;
  });

  if (changed) {
    fs.writeFileSync(file, content);
  }
}

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

processDir('apps/api/src/app');
