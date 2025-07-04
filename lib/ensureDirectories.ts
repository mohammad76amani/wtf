import fs from 'fs';
import path from 'path';

export function ensureDirectoriesExist() {
  const directories = [
    path.join(process.cwd(), 'public', 'images', 'hero'),
    path.join(process.cwd(), 'public', 'images', 'logos'),
    path.join(process.cwd(), 'public', 'images', 'salon-logos')
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}
