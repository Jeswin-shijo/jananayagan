// One-off: knock out the white background of the women-safety hero illustration.
// Flood-fills near-white pixels reachable from the image border (so interior
// whites like the shield checkmark are preserved), then writes a transparent PNG.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS = path.join(__dirname, '../src/assets');
const NAME = process.argv[2] || 'women-safety'; // pass an asset name without extension
const SRC = path.join(ASSETS, `${NAME}.png`);
const BACKUP = path.join(ASSETS, `${NAME}-original.png`);
const THRESHOLD = 232; // a pixel counts as background if R,G,B all exceed this

(async () => {
  // Keep a pristine copy and always process from it (idempotent re-runs).
  if (!fs.existsSync(BACKUP)) {
    fs.copyFileSync(SRC, BACKUP);
  }

  const {data, info} = await sharp(BACKUP)
    .ensureAlpha()
    .raw()
    .toBuffer({resolveWithObject: true});
  const {width, height, channels} = info;

  const isWhite = i =>
    data[i] > THRESHOLD && data[i + 1] > THRESHOLD && data[i + 2] > THRESHOLD;

  const visited = new Uint8Array(width * height);
  const stack = [];
  const push = (x, y) => {
    if (x >= 0 && y >= 0 && x < width && y < height) {
      stack.push(y * width + x);
    }
  };

  // Seed from every border pixel.
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  let cleared = 0;
  while (stack.length) {
    const p = stack.pop();
    if (visited[p]) continue;
    visited[p] = 1;
    const i = p * channels;
    if (!isWhite(i)) continue;
    data[i + 3] = 0; // transparent
    cleared++;
    const x = p % width;
    const y = (p - x) / width;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  await sharp(data, {raw: {width, height, channels}}).png().toFile(SRC);
  console.log(`done: ${width}x${height}, cleared ${cleared} bg px`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
