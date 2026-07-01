import { copyFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const srcIcon = join(import.meta.dirname, '..', '.gemini-icon-source.png');
const publicDir = join(import.meta.dirname, '..', 'public');

// If the source file doesn't exist, check alternative location
import { existsSync } from 'fs';

let source = srcIcon;
const altSource = '/Users/jerem/.gemini/antigravity-ide/brain/93b2b403-e050-492d-afce-2eca88854554/app_icon_1782895299086.png';
if (!existsSync(source) && existsSync(altSource)) {
  source = altSource;
}

if (!existsSync(source)) {
  console.error('Source icon not found! Please place the icon at:', srcIcon);
  process.exit(1);
}

const sizes = [512, 192, 180, 32, 16];

for (const size of sizes) {
  const outPath = join(publicDir, `icon-${size}x${size}.png`);
  copyFileSync(source, outPath);
  execSync(`sips -z ${size} ${size} "${outPath}"`, { stdio: 'pipe' });
  console.log(`✅ Created icon-${size}x${size}.png`);
}

console.log('\n🎉 All icons generated successfully!');
