// Proves developer mode is absent from a production bundle.
//   npm run check:release
//
// Everything in lib/dev.ts, app/99-dev.tsx and components/DevBadge.tsx sits
// behind __DEV__, which Metro replaces with false in production and then drops
// as dead code. This exports a real production bundle and greps it for strings
// that only exist inside developer mode.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, '.check', 'export');

const MARKERS = [
  'Developer mode',
  'Wipe everything',
  'Seed 13 nights',
  'Open developer mode',
];

fs.rmSync(outDir, { recursive: true, force: true });

console.log('exporting a production bundle...');
execFileSync(
  process.execPath,
  [require.resolve('expo/bin/cli'), 'export', '--platform', 'android', '--output-dir', outDir],
  { cwd: root, stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } }
);

const bundles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(js|hbc)$/.test(entry.name)) bundles.push(full);
  }
};
walk(outDir);

let found = 0;
for (const bundle of bundles) {
  const contents = fs.readFileSync(bundle, 'utf8');
  for (const marker of MARKERS) {
    if (contents.includes(marker)) {
      console.log(`FAIL  "${marker}" is still in ${path.relative(root, bundle)}`);
      found += 1;
    }
  }
}

console.log(`checked ${bundles.length} bundle file(s) for ${MARKERS.length} developer-mode markers`);
console.log(found === 0 ? 'developer mode is not in the release bundle' : `${found} leak(s)`);
process.exit(found === 0 ? 0 : 1);
