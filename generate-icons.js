// node generate-icons.js  — no dependencies required
const fs = require('fs');
const zlib = require('zlib');

function writePNG(size, filename) {
  // Draw into RGBA pixel buffer
  const px = new Uint8ClampedArray(size * size * 4);

  function setPixel(x, y, r, g, b, a) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const i = (y * size + x) * 4;
    // Alpha-blend over existing
    const oa = px[i+3] / 255;
    const na = a / 255;
    const fa = na + oa * (1 - na);
    if (fa === 0) return;
    px[i]   = Math.round((r * na + px[i]   * oa * (1 - na)) / fa);
    px[i+1] = Math.round((g * na + px[i+1] * oa * (1 - na)) / fa);
    px[i+2] = Math.round((b * na + px[i+2] * oa * (1 - na)) / fa);
    px[i+3] = Math.round(fa * 255);
  }

  function fillRect(x0, y0, x1, y1, r, g, b, a) {
    for (let y = Math.max(0,y0); y < Math.min(size,y1); y++)
      for (let x = Math.max(0,x0); x < Math.min(size,x1); x++)
        setPixel(x, y, r, g, b, a);
  }

  // Background — dark #0a0d10 with rounded corners
  const bg = [10, 13, 16];
  const gold = [232, 160, 32];
  const goldL = [245, 184, 64];
  const radius = Math.round(size * 0.18);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Rounded rect test
      const cx = Math.min(x, size-1-x);
      const cy = Math.min(y, size-1-y);
      if (cx < radius && cy < radius) {
        const dx = radius - cx - 0.5;
        const dy = radius - cy - 0.5;
        if (dx*dx + dy*dy > radius*radius) continue;
      }
      setPixel(x, y, bg[0], bg[1], bg[2], 255);
    }
  }

  // Lightning bolt — defined in 0..100 space, scaled to size
  // Points: top-right of bolt → left → lower-right of upper half → bottom → right → upper-left of lower half
  const s = size / 100;
  const bolt = [
    [57, 7],
    [29, 51],
    [47, 51],
    [41, 93],
    [71, 47],
    [53, 47],
  ];
  const scaled = bolt.map(([x,y]) => [x*s, y*s]);

  // Fill polygon using scanline
  for (let y = 0; y < size; y++) {
    const intersects = [];
    for (let i = 0; i < scaled.length; i++) {
      const [x1, y1] = scaled[i];
      const [x2, y2] = scaled[(i+1) % scaled.length];
      if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) {
        const x = x1 + (y - y1) / (y2 - y1) * (x2 - x1);
        intersects.push(x);
      }
    }
    intersects.sort((a,b) => a-b);
    for (let k = 0; k < intersects.length-1; k += 2) {
      const xa = Math.round(intersects[k]);
      const xb = Math.round(intersects[k+1]);
      for (let x = xa; x <= xb; x++) {
        // Vertical gradient: gold at top, goldL at bottom
        const t = y / size;
        const r = Math.round(gold[0] + (goldL[0]-gold[0])*t);
        const g = Math.round(gold[1] + (goldL[1]-gold[1])*t);
        const b = Math.round(gold[2] + (goldL[2]-gold[2])*t);
        setPixel(x, y, r, g, b, 255);
      }
    }
  }

  // Build PNG
  function u32(n) {
    return Buffer.from([(n>>24)&0xff,(n>>16)&0xff,(n>>8)&0xff,n&0xff]);
  }
  function chunk(type, data) {
    const t = Buffer.from(type);
    const len = u32(data.length);
    const crcBuf = Buffer.concat([t, data]);
    let crc = 0xffffffff;
    for (const b of crcBuf) {
      crc ^= b;
      for (let j=0;j<8;j++) crc = (crc>>>1) ^ (crc&1 ? 0xedb88320 : 0);
    }
    crc = (~crc) >>> 0;
    return Buffer.concat([len, t, data, u32(crc)]);
  }

  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = chunk('IHDR', Buffer.concat([u32(size),u32(size),Buffer.from([8,2,0,0,0])]));

  // Raw image data: filter byte 0 before each row
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    raw[y*(1+size*3)] = 0; // None filter
    for (let x = 0; x < size; x++) {
      const src = (y*size+x)*4;
      const dst = y*(1+size*3) + 1 + x*3;
      raw[dst]   = px[src];
      raw[dst+1] = px[src+1];
      raw[dst+2] = px[src+2];
    }
  }
  const compressed = zlib.deflateSync(raw);
  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));

  fs.writeFileSync(filename, Buffer.concat([sig, ihdr, idat, iend]));
  console.log('Written', filename);
}

writePNG(192, 'icon-192.png');
writePNG(512, 'icon-512.png');
