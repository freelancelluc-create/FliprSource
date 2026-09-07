import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(size) {
  // Simple PNG encoder for solid rounded emerald rect with lightning bolt
  const width = size;
  const height = size;
  const rawData = Buffer.alloc(height * (1 + width * 4));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      
      // Normalized coords [0..1]
      const nx = x / width;
      const ny = y / height;
      
      // Rounded rect check (radius 0.25)
      const r = 0.22;
      let inside = true;
      if (nx < r && ny < r) {
        inside = ((nx - r) ** 2 + (ny - r) ** 2) <= r ** 2;
      } else if (nx > 1 - r && ny < r) {
        inside = ((nx - (1 - r)) ** 2 + (ny - r) ** 2) <= r ** 2;
      } else if (nx < r && ny > 1 - r) {
        inside = ((nx - r) ** 2 + (ny - (1 - r)) ** 2) <= r ** 2;
      } else if (nx > 1 - r && ny > 1 - r) {
        inside = ((nx - (1 - r)) ** 2 + (ny - (1 - r)) ** 2) <= r ** 2;
      }

      if (!inside) {
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0; // Transparent
        continue;
      }

      // Emerald gradient background (#10b981 to #059669)
      const rVal = Math.floor(16 + (5 - 16) * ny);
      const gVal = Math.floor(185 + (150 - 185) * ny);
      const bVal = Math.floor(129 + (105 - 129) * ny);

      // Simple lightning shape check
      // Points approx: (0.55, 0.15), (0.28, 0.55), (0.48, 0.55), (0.42, 0.85), (0.72, 0.45), (0.52, 0.45)
      const isLightning = (
        (ny >= 0.18 && ny <= 0.52 && nx >= (0.55 - (ny - 0.18) * 0.7) && nx <= (0.55 - (ny - 0.18) * 0.7 + 0.18)) ||
        (ny >= 0.48 && ny <= 0.82 && nx >= (0.70 - (ny - 0.48) * 0.8) && nx <= (0.70 - (ny - 0.48) * 0.8 + 0.18)) ||
        (ny >= 0.44 && ny <= 0.56 && nx >= 0.35 && nx <= 0.65)
      );

      if (isLightning) {
        // Dark Charcoal / Black Bolt
        rawData[pixelOffset] = 9;
        rawData[pixelOffset + 1] = 10;
        rawData[pixelOffset + 2] = 15;
        rawData[pixelOffset + 3] = 255;
      } else {
        rawData[pixelOffset] = rVal;
        rawData[pixelOffset + 1] = gVal;
        rawData[pixelOffset + 2] = bVal;
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 72, 13, 10, 26, 10]);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const body = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeInt32BE(crc32(body), 0);
    return Buffer.concat([len, body, crc]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return crc ^ -1;
}

const outDir = path.resolve('./extension/icons');
[16, 48, 128].forEach(size => {
  const png = createPNG(size);
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png);
  console.log(`Generated icon-${size}.png (${png.length} bytes)`);
});
