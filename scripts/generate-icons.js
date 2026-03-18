#!/usr/bin/env node
/**
 * Generate PWA icons (French tricolor) using only Node.js built-in modules.
 * Output: public/icons/icon-192.png, icon-512.png, icon-maskable-512.png
 */
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, "ascii");
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function createPNG(width, height, pixelFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type: RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk("IHDR", ihdrData);

  // Pixel data: filter byte + RGB per pixel per row
  const rawData = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const offset = y * (1 + width * 3);
    rawData[offset] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const px = offset + 1 + x * 3;
      const [r, g, b] = pixelFn(x, y, width, height);
      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idat = createChunk("IDAT", compressed);
  const iend = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// French tricolor: blue | white | red with a subtle gradient
function tricolorPixel(x, y, w, h) {
  const third = w / 3;
  if (x < third) return [0, 0, 145];       // French blue #000091
  if (x < third * 2) return [255, 255, 255]; // White
  return [225, 0, 15];                       // French red #E1000F
}

// Maskable: solid blue background (safe area is inner 80%)
function maskablePixel() {
  return [0, 0, 145]; // French blue
}

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, "icon-192.png"), createPNG(192, 192, tricolorPixel));
fs.writeFileSync(path.join(outDir, "icon-512.png"), createPNG(512, 512, tricolorPixel));
fs.writeFileSync(path.join(outDir, "icon-maskable-512.png"), createPNG(512, 512, maskablePixel));

console.log("✓ Generated icon-192.png, icon-512.png, icon-maskable-512.png");
