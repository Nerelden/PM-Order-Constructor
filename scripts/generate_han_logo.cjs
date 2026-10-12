const fs = require('fs');
const fastPng = require('fast-png');

const size = 256;
const data = new Uint8Array(size * size * 4);

function setPixel(x, y, r, g, b, a) {
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const idx = (y * size + x) * 4;
  data[idx] = r;
  data[idx + 1] = g;
  data[idx + 2] = b;
  data[idx + 3] = a;
}

// Transparent background initially
for (let i = 0; i < data.length; i += 4) {
  data[i] = 0;
  data[i + 1] = 0;
  data[i + 2] = 0;
  data[i + 3] = 0;
}

const cx = 128;
const cy = 128;
const outerR = 118; // diamond radius from center to vertices

// Diamond distance: |x - cx| + |y - cy|
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const d = Math.abs(x - cx) + Math.abs(y - cy);
    if (d <= outerR) {
      // Inside outer diamond -> White background
      setPixel(x, y, 255, 255, 255, 255);
      
      // Outer border (thickness ~ 9px)
      if (d >= outerR - 9) {
        setPixel(x, y, 16, 16, 16, 255);
      }
    }
  }
}

// Function to draw diamond line segment
function drawDiamondSegment(qX, qY, barIndex, isBroken, gapPos) {
  // qX in [-1, 1], qY in [-1, 1] for 4 quadrants
  // Each bar has offset
  const barOffsets = [38, 54, 70]; // distance along diagonal
  const baseOffset = barOffsets[barIndex];
  const barThickness = 4.5;
  
  // Scan pixels in the quadrant
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      
      // Check quadrant
      if (Math.sign(dx) !== qX && dx !== 0) continue;
      if (Math.sign(dy) !== qY && dy !== 0) continue;
      
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const d = absDx + absDy;
      
      // Exclude center diamond and outer border
      if (d < 30 || d > outerR - 14) continue;
      // White divider channel around center axes
      if (absDx < 5 || absDy < 5) continue;
      
      // Stripe angle: parallel to center-outward diagonal
      // In top-left (qX=-1, qY=-1): stripes run from vertical axis down-left
      // That means absDx + absDy ~ distance, or absDy - absDx
      // In the logo: bars are parallel to the diagonal of that quadrant!
      // Specifically: absDx + absDy constant means parallel to outer edge.
      // But in the logo, look at the bars:
      // The bars run along the slope from vertical axis towards the left/right!
      // Let's check slope: absDy has range, absDx has range.
      // Notice: in top-left, the bars run at slope +0.8 or parallel to the sides!
      // Wait, in top-left: the bars are parallel to the outer edge (d = absDx + absDy)?
      // No, in the logo, the bars are parallel to the lines connecting vertical axis to horizontal axis!
      // Wait, the outer edge IS connecting (cx, cy-outerR) to (cx-outerR, cy)!
      // That equation is absDx + absDy = outerR!
      // That means the bars are parallel to the outer edge!
      if (Math.abs(d - baseOffset) <= barThickness) {
        // Check if this bar has a break (broken trigram bar)
        let isGap = false;
        if (isBroken) {
          // Gap in the middle of the bar: where absDx ~= absDy
          const diff = Math.abs(absDx - absDy);
          if (diff <= 5.5) {
            isGap = true;
          }
        }
        
        if (!isGap) {
          setPixel(x, y, 16, 16, 16, 255);
        }
      }
    }
  }
}

// Center diamond: d <= 26 is white
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const d = Math.abs(x - cx) + Math.abs(y - cy);
    if (d <= 27) {
      setPixel(x, y, 255, 255, 255, 255);
    }
  }
}

// Draw central Roman numeral "I"
for (let y = cy - 16; y <= cy + 16; y++) {
  for (let x = cx - 3; x <= cx + 3; x++) {
    setPixel(x, y, 16, 16, 16, 255);
  }
}

// Top-Left (☰ Geon - 3 solid bars)
drawDiamondSegment(-1, -1, 0, false);
drawDiamondSegment(-1, -1, 1, false);
drawDiamondSegment(-1, -1, 2, false);

// Top-Right (☲ Ri - solid, broken, solid)
drawDiamondSegment(1, -1, 0, false);
drawDiamondSegment(1, -1, 1, true);
drawDiamondSegment(1, -1, 2, false);

// Bottom-Left (☵ Gam - broken, solid, broken)
drawDiamondSegment(-1, 1, 0, true);
drawDiamondSegment(-1, 1, 1, false);
drawDiamondSegment(-1, 1, 2, true);

// Bottom-Right (☷ Gon - 3 broken bars)
drawDiamondSegment(1, 1, 0, true);
drawDiamondSegment(1, 1, 1, true);
drawDiamondSegment(1, 1, 2, true);

// Clean central vertical and horizontal white channels
for (let y = cy - outerR + 10; y <= cy + outerR - 10; y++) {
  for (let dx = -4; dx <= 4; dx++) {
    const x = cx + dx;
    const d = Math.abs(x - cx) + Math.abs(y - cy);
    if (d > 28 && d < outerR - 10) {
      setPixel(x, y, 255, 255, 255, 255);
    }
  }
}
for (let x = cx - outerR + 10; x <= cx + outerR - 10; x++) {
  for (let dy = -4; dy <= 4; dy++) {
    const y = cy + dy;
    const d = Math.abs(x - cx) + Math.abs(y - cy);
    if (d > 28 && d < outerR - 10) {
      setPixel(x, y, 255, 255, 255, 255);
    }
  }
}

// Encode to PNG
const pngBuffer = fastPng.encode({
  width: size,
  height: size,
  data: data
});

fs.writeFileSync('public/logo_han.png', Buffer.from(pngBuffer));
console.log('Successfully written public/logo_han.png');
