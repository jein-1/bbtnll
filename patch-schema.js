const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

content = content.replace(/provider = "mysql"/g, 'provider = "postgresql"');
content = content.replace(/@db\.LongText/g, '@db.Text');

fs.writeFileSync(schemaPath, content);
console.log('Berhasil menyesuaikan skema untuk PostgreSQL!');
