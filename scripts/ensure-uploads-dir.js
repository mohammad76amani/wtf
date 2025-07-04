const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'public/uploads/salon-logos');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log('Created uploads directory');
}
