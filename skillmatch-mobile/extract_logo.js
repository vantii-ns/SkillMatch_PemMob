const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

const pdfPath = 'c:/Users/raden/Documents/aski/SkillMatch_PemMob/Untitled (1)/logo.pdf';
const pdfBuf = fs.readFileSync(pdfPath);

// 1. Get SMask (Object 4)
const s4 = pdfBuf.indexOf('4 0 obj');
const stream4 = pdfBuf.indexOf('stream', s4);
let start4 = stream4 + 6;
while (pdfBuf[start4] === 10 || pdfBuf[start4] === 13) start4++;
const maskCompressed = pdfBuf.slice(start4, start4 + 37328);
const mask = zlib.inflateSync(maskCompressed);

// 2. Get JPEG (Object 9)
const s9 = pdfBuf.indexOf('9 0 obj');
const stream9 = pdfBuf.indexOf('stream', s9);
let start9 = stream9 + 6;
while (pdfBuf[start9] === 10 || pdfBuf[start9] === 13) start9++;
const s10 = pdfBuf.indexOf('10 0 obj');
const lenStr = pdfBuf.toString('utf8', s10, s10 + 100);
const lenMatch = lenStr.match(/10 0 obj\s+(\d+)\s+endobj/);
const len9 = parseInt(lenMatch[1], 10);
const jpegBuf = pdfBuf.slice(start9, start9 + len9);

const rawJpeg = jpeg.decode(jpegBuf, { useTArray: true });
console.log('Decoded JPEG:', rawJpeg.width, 'x', rawJpeg.height);

const png = new PNG({ width: rawJpeg.width, height: rawJpeg.height });
for (let y = 0; y < rawJpeg.height; y++) {
  for (let x = 0; x < rawJpeg.width; x++) {
    const idx = y * rawJpeg.width + x;
    const rgbaIdx = idx * 4;
    png.data[rgbaIdx] = rawJpeg.data[rgbaIdx];
    png.data[rgbaIdx + 1] = rawJpeg.data[rgbaIdx + 1];
    png.data[rgbaIdx + 2] = rawJpeg.data[rgbaIdx + 2];
    png.data[rgbaIdx + 3] = mask[idx];
  }
}

// Find non-transparent bounds
let minX = png.width, minY = png.height, maxX = 0, maxY = 0;
for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    const a = png.data[(y * png.width + x) * 4 + 3];
    if (a > 10) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log('Bounding Box:', { minX, minY, maxX, maxY });

const croppedWidth = maxX - minX + 1;
const croppedHeight = maxY - minY + 1;
const croppedPng = new PNG({ width: croppedWidth, height: croppedHeight });
PNG.bitblt(png, croppedPng, minX, minY, croppedWidth, croppedHeight, 0, 0);

const assetsDir = 'c:/Users/raden/Documents/aski/SkillMatch_PemMob/skillmatch-mobile/assets';
fs.mkdirSync(assetsDir, { recursive: true });

fs.writeFileSync(path.join(assetsDir, 'logo.png'), PNG.sync.write(croppedPng));
console.log('Saved logo.png successfully, size:', croppedWidth, 'x', croppedHeight);

// Find gap between emblem and wordmark
let gapY = -1;
for (let y = minY + 100; y < maxY - 50; y++) {
  let rowCount = 0;
  for (let x = minX; x <= maxX; x++) {
    if (png.data[(y * png.width + x) * 4 + 3] > 10) rowCount++;
  }
  if (rowCount === 0) {
    gapY = y;
    break;
  }
}

if (gapY !== -1) {
  // Emblem
  let emblemMinX = png.width, emblemMaxX = 0;
  for (let y = minY; y < gapY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (png.data[(y * png.width + x) * 4 + 3] > 10) {
        if (x < emblemMinX) emblemMinX = x;
        if (x > emblemMaxX) emblemMaxX = x;
      }
    }
  }
  const emblemW = emblemMaxX - emblemMinX + 1;
  const emblemH = gapY - minY;
  const emblemPng = new PNG({ width: emblemW, height: emblemH });
  PNG.bitblt(png, emblemPng, emblemMinX, minY, emblemW, emblemH, 0, 0);
  fs.writeFileSync(path.join(assetsDir, 'logo-emblem.png'), PNG.sync.write(emblemPng));

  // Wordmark
  let wordMinX = png.width, wordMaxX = 0, wordMinY = png.height, wordMaxY = 0;
  for (let y = gapY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (png.data[(y * png.width + x) * 4 + 3] > 10) {
        if (x < wordMinX) wordMinX = x;
        if (x > wordMaxX) wordMaxX = x;
        if (y < wordMinY) wordMinY = y;
        if (y > wordMaxY) wordMaxY = y;
      }
    }
  }
  const wordW = wordMaxX - wordMinX + 1;
  const wordH = wordMaxY - wordMinY + 1;
  const wordPng = new PNG({ width: wordW, height: wordH });
  PNG.bitblt(png, wordPng, wordMinX, wordMinY, wordW, wordH, 0, 0);
  fs.writeFileSync(path.join(assetsDir, 'logo-wordmark.png'), PNG.sync.write(wordPng));
  console.log('Saved logo-emblem.png and logo-wordmark.png!');
}
