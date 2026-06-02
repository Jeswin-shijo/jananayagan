/**
 * JANANAYAGAN — App Icon Generator
 * Converts src/assets/icon.svg → all required iOS + Android icon sizes.
 * Run: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const SVG_PATH = path.join(ROOT, 'src/assets/icon.svg');

// ──────────────────────────────────────────────
// iOS sizes  (AppIcon.appiconset)
// ──────────────────────────────────────────────
const IOS_DIR = path.join(
  ROOT,
  'ios/JANANAYAGAN/Images.xcassets/AppIcon.appiconset',
);

const iosSizes = [
  // iPhone notifications
  { size: 40,   file: 'Icon-20@2x.png'  },
  { size: 60,   file: 'Icon-20@3x.png'  },
  // iPhone settings
  { size: 58,   file: 'Icon-29@2x.png'  },
  { size: 87,   file: 'Icon-29@3x.png'  },
  // iPhone spotlight
  { size: 80,   file: 'Icon-40@2x.png'  },
  { size: 120,  file: 'Icon-40@3x.png'  },
  // iPhone home screen
  { size: 120,  file: 'Icon-60@2x.png'  },
  { size: 180,  file: 'Icon-60@3x.png'  },
  // App Store
  { size: 1024, file: 'Icon-1024.png'   },
];

// ──────────────────────────────────────────────
// Android sizes  (mipmap-*)
// ──────────────────────────────────────────────
const ANDROID_RES = path.join(ROOT, 'android/app/src/main/res');

const androidDensities = [
  { size: 48,  density: 'mdpi'    },
  { size: 72,  density: 'hdpi'    },
  { size: 96,  density: 'xhdpi'   },
  { size: 144, density: 'xxhdpi'  },
  { size: 192, density: 'xxxhdpi' },
];

// Adaptive icon foreground — padded version (icon fits within safe zone)
// Safe zone = central 66.7% of the canvas (108dp canvas, 72dp safe zone)
const ADAPTIVE_SCALE = 0.667;
const androidAdaptiveDensities = [
  { size: 108, density: 'mdpi'    }, // 108 = 48 * (108/48) but for adaptive we use different sizes
  { size: 162, density: 'hdpi'    },
  { size: 216, density: 'xhdpi'   },
  { size: 324, density: 'xxhdpi'  },
  { size: 432, density: 'xxxhdpi' },
];

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
async function generatePNG(size, outputPath) {
  await sharp(SVG_PATH, { density: Math.ceil((size / 1024) * 72 * 4) })
    .resize(size, size)
    .png()
    .toFile(outputPath);
}

async function generatePNGWithPadding(size, paddingRatio, outputPath) {
  const innerSize = Math.round(size * paddingRatio);
  const offset = Math.round((size - innerSize) / 2);

  const resized = await sharp(SVG_PATH, { density: Math.ceil((innerSize / 1024) * 72 * 4) })
    .resize(innerSize, innerSize)
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }, // transparent background for foreground layer
    },
  })
    .composite([{ input: resized, left: offset, top: offset }])
    .png()
    .toFile(outputPath);
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function main() {
  console.log('\n🎨  JANANAYAGAN Icon Generator\n');

  // ── iOS ──────────────────────────────────
  console.log('📱  Generating iOS icons...');
  fs.mkdirSync(IOS_DIR, { recursive: true });

  for (const { size, file } of iosSizes) {
    const out = path.join(IOS_DIR, file);
    await generatePNG(size, out);
    console.log(`   ✓  ${file}  (${size}×${size})`);
  }

  // Write updated Contents.json
  const contentsJson = {
    images: [
      { idiom: 'iphone', scale: '2x', size: '20x20', filename: 'Icon-20@2x.png'  },
      { idiom: 'iphone', scale: '3x', size: '20x20', filename: 'Icon-20@3x.png'  },
      { idiom: 'iphone', scale: '2x', size: '29x29', filename: 'Icon-29@2x.png'  },
      { idiom: 'iphone', scale: '3x', size: '29x29', filename: 'Icon-29@3x.png'  },
      { idiom: 'iphone', scale: '2x', size: '40x40', filename: 'Icon-40@2x.png'  },
      { idiom: 'iphone', scale: '3x', size: '40x40', filename: 'Icon-40@3x.png'  },
      { idiom: 'iphone', scale: '2x', size: '60x60', filename: 'Icon-60@2x.png'  },
      { idiom: 'iphone', scale: '3x', size: '60x60', filename: 'Icon-60@3x.png'  },
      { idiom: 'ios-marketing', scale: '1x', size: '1024x1024', filename: 'Icon-1024.png' },
    ],
    info: { author: 'xcode', version: 1 },
  };
  fs.writeFileSync(
    path.join(IOS_DIR, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2),
  );
  console.log('   ✓  Contents.json updated\n');

  // ── Android regular mipmap icons ─────────
  console.log('🤖  Generating Android launcher icons...');
  for (const { size, density } of androidDensities) {
    const dir = path.join(ANDROID_RES, `mipmap-${density}`);
    fs.mkdirSync(dir, { recursive: true });

    const regular = path.join(dir, 'ic_launcher.png');
    const round   = path.join(dir, 'ic_launcher_round.png');
    await generatePNG(size, regular);
    await generatePNG(size, round);
    console.log(`   ✓  mipmap-${density}/ic_launcher.png  (${size}×${size})`);
  }

  // ── Android adaptive icon foreground ─────
  console.log('\n🤖  Generating Android adaptive foreground icons...');
  for (const { size, density } of androidAdaptiveDensities) {
    const dir = path.join(ANDROID_RES, `mipmap-${density}`);
    fs.mkdirSync(dir, { recursive: true });

    const foreground = path.join(dir, 'ic_launcher_foreground.png');
    // Foreground: icon scaled to 66% with transparent padding (safe zone)
    await generatePNGWithPadding(size, ADAPTIVE_SCALE, foreground);
    console.log(`   ✓  mipmap-${density}/ic_launcher_foreground.png  (${size}×${size})`);
  }

  // ── Android adaptive icon XML ─────────────
  console.log('\n🤖  Writing adaptive icon XML files...');
  const anydpiDir = path.join(ANDROID_RES, 'mipmap-anydpi-v26');
  fs.mkdirSync(anydpiDir, { recursive: true });

  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'), adaptiveXml);
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher_round.xml'), adaptiveXml);
  console.log('   ✓  mipmap-anydpi-v26/ic_launcher.xml');
  console.log('   ✓  mipmap-anydpi-v26/ic_launcher_round.xml');

  // ── Android color resource ─────────────────
  const colorsPath = path.join(ANDROID_RES, 'values/ic_launcher_colors.xml');
  fs.writeFileSync(
    colorsPath,
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Background color for adaptive launcher icon -->
    <color name="ic_launcher_background">#1A4ED8</color>
</resources>
`,
  );
  console.log('   ✓  values/ic_launcher_colors.xml');

  console.log('\n✅  All icons generated successfully!\n');
}

main().catch(err => {
  console.error('\n❌  Icon generation failed:', err.message);
  process.exit(1);
});
