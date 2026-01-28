const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SOURCE_IMAGE = path.join(__dirname, '../assets/icon-original.png');
const ANDROID_RES_PATH = path.join(__dirname, '../android/app/src/main/res');

const ANDROID_SIZES = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

async function generateAndroidIcons() {
  console.log('Generating Android icons...');

  for (const { folder, size } of ANDROID_SIZES) {
    const outputDir = path.join(ANDROID_RES_PATH, folder);

    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate square icon (ic_launcher.png)
    await sharp(SOURCE_IMAGE)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(path.join(outputDir, 'ic_launcher.png'));

    console.log(`Created ${folder}/ic_launcher.png (${size}x${size})`);

    // Generate round icon (ic_launcher_round.png)
    const roundMask = Buffer.from(
      `<svg width="${size}" height="${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
      </svg>`
    );

    const resizedImage = await sharp(SOURCE_IMAGE)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();

    await sharp(resizedImage)
      .composite([{ input: roundMask, blend: 'dest-in' }])
      .png()
      .toFile(path.join(outputDir, 'ic_launcher_round.png'));

    console.log(`Created ${folder}/ic_launcher_round.png (${size}x${size})`);
  }

  console.log('\nAndroid icons generated successfully!');
}

generateAndroidIcons().catch(console.error);
