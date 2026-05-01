import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/mohan/Downloads/QRise/qrise/data/before-auth/api-doc';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

const fullDocs = {};

files.forEach(file => {
    const name = file.replace('.json', '');
    const content = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    fullDocs[name] = content;
});

fs.writeFileSync('c:/Users/mohan/Downloads/QRise/qrise/data/before-auth/full-docs.json', JSON.stringify(fullDocs, null, 2));
console.log('Merged ' + files.length + ' files into full-docs.json');
