const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/<label htmlFor="[^"]+"] /g, match => {
    return match.replace('"] ', '" ');
  });
  content = content.replace(/<\/label-\[htmlFor="[^"]+">/g, '</label>');
  fs.writeFileSync(filePath, content);
}

fixFile('src/pages/Login.tsx');
fixFile('src/pages/Signup.tsx');
