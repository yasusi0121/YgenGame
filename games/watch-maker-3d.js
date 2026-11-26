/* =========================================================================
   WATCH MAKER 3D VIEWER — Faithful True-3D Models Matching All 9 Clocks
   1-to-1 geometry, materials, dials, and hands matching the photographed
   clocks & 2D assembly models:
     1. wood-hygro     (Vertical wood board + upper clock + lower dual gauges)
     2. square-brown   (Deep bevel dark-wood square frame + squircle dial)
     3. cuckoo-white   (Flat-bottom white pitched-roof house + arched shutters)
     4. steampunk-pipe (Left riveted iron disc + upper-right pressure gauge + pipes + red valve)
     5. modern-black   (Matte-black square housing + recessed round dial)
     6. pendulum-clock (3-finial ornate brown cabinet + gold trim + open gear/pendulum bay)
     7. vintage-gold   (Dark wood square frame + silver bezel + champagne linen dial + 3D baton indices + baroque hands)
     8. round-radio    (Natural light-oak round frame + ferrite rod antenna)
     9. apple-watch    (Midnight aluminum + curved sport band + Digital Crown + Numerals Duo OLED)
   ========================================================================= */

const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
let cachedThree = null;

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function makeRoundedRectShape(THREE, w, h, r) {
  const s = new THREE.Shape();
  const hw = w / 2, hh = h / 2;
  const cr = Math.min(r, hw, hh);
  s.moveTo(-hw + cr, -hh);
  s.lineTo(hw - cr, -hh);
  s.quadraticCurveTo(hw, -hh, hw, -hh + cr);
  s.lineTo(hw, hh - cr);
  s.quadraticCurveTo(hw, hh, hw - cr, hh);
  s.lineTo(-hw + cr, hh);
  s.quadraticCurveTo(-hw, hh, -hw, hh - cr);
  s.lineTo(-hw, -hh + cr);
  s.quadraticCurveTo(-hw, -hh, -hw + cr, -hh);
  return s;
}

/** Procedural warm wood-grain canvas texture */
function makeWoodTexture(THREE, baseHex, grainHex, vertical = true) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = grainHex;
  for (let i = 0; i < 42; i++) {
    ctx.globalAlpha = 0.08 + (i % 5) * 0.04;
    ctx.lineWidth = 1.5 + (i % 3);
    ctx.beginPath();
    const pos = (i / 42) * 256;
    if (vertical) {
      ctx.moveTo(pos, 0);
      ctx.bezierCurveTo(pos + 6, 85, pos - 6, 170, pos + 2, 256);
    } else {
      ctx.moveTo(0, pos);
      ctx.bezierCurveTo(85, pos + 6, 170, pos - 6, 256, pos + 2);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Real extruded 3D gear with teeth and ruby axle */
function make3DGear(THREE, outerR, innerR, teeth, depth, color) {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.22;
    const a2 = a0 + step * 0.48;
    const a3 = a0 + step * 0.72;
    const x0 = Math.cos(a0) * innerR, y0 = Math.sin(a0) * innerR;
    if (i === 0) shape.moveTo(x0, y0);
    else shape.lineTo(x0, y0);
    shape.lineTo(Math.cos(a1) * outerR, Math.sin(a1) * outerR);
    shape.lineTo(Math.cos(a2) * outerR, Math.sin(a2) * outerR);
    shape.lineTo(Math.cos(a3) * innerR, Math.sin(a3) * innerR);
  }
  shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, Math.max(0.05, innerR * 0.26), 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2
  });
  geo.center();
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, metalness: 0.55, roughness: 0.3 }));
  const ruby = new THREE.Mesh(
    new THREE.CylinderGeometry(innerR * 0.16, innerR * 0.16, depth + 0.04, 12),
    new THREE.MeshStandardMaterial({ color: 0xE11D48, metalness: 0.2, roughness: 0.2 })
  );
  ruby.rotation.x = Math.PI / 2;
  mesh.add(ruby);
  return mesh;
}

/** Build a 4-sided recessed beveled picture-frame border */
function addBeveledFrame(THREE, parent, outerW, outerH, borderW, depth, mat, zCenter = 0) {
  const innerW = outerW - borderW * 2;
  const innerH = outerH - borderW * 2;
  const top = new THREE.Mesh(new THREE.BoxGeometry(outerW, borderW, depth), mat);
  top.position.set(0, (outerH - borderW) / 2, zCenter);
  const bot = new THREE.Mesh(new THREE.BoxGeometry(outerW, borderW, depth), mat);
  bot.position.set(0, -(outerH - borderW) / 2, zCenter);
  const left = new THREE.Mesh(new THREE.BoxGeometry(borderW, innerH, depth), mat);
  left.position.set(-(outerW - borderW) / 2, 0, zCenter);
  const right = new THREE.Mesh(new THREE.BoxGeometry(borderW, innerH, depth), mat);
  right.position.set((outerW - borderW) / 2, 0, zCenter);
  parent.add(top, bot, left, right);
}

/** Build authentic model-specific 2D dial texture matching the photographed clocks */
function makeDialTexture(THREE, clockId) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');
  const cx = 256, cy = 256;

  if (clockId === 'wood-hygro') {
    ctx.fillStyle = '#F7F3E7'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 60; i++) {
      const a = (i * 6 - 90) * Math.PI / 180;
      if (i % 5 === 0) {
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 224, cy + Math.sin(a) * 224, 7.5, 0, Math.PI * 2);
        ctx.strokeStyle = '#1E293B'; ctx.lineWidth = 3.5; ctx.stroke();
      } else {
        for (const off of [-0.015, 0.015]) {
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a + off) * 214, cy + Math.sin(a + off) * 214);
          ctx.lineTo(cx + Math.cos(a + off) * 234, cy + Math.sin(a + off) * 234);
          ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.stroke();
        }
      }
    }
    ctx.fillStyle = '#1E293B'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '800 48px sans-serif';
    ['1','2','3','4','5','6','7','8','9','10','11','12'].forEach((n, i) => {
      const a = ((i + 1) * 30 - 90) * Math.PI / 180;
      ctx.fillText(n, cx + Math.cos(a) * 174, cy + Math.sin(a) * 174);
    });
    ctx.font = '700 18px sans-serif'; ctx.fillStyle = '#334155';
    ctx.fillText('QUARTZ', cx, 322);
  } else if (clockId === 'square-brown') {
    ctx.fillStyle = '#FAF9F5'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 60; i++) {
      const a = (i * 6 - 90) * Math.PI / 180;
      const cos = Math.cos(a), sin = Math.sin(a);
      const sc = 1 / Math.pow(Math.pow(Math.abs(cos), 3.6) + Math.pow(Math.abs(sin), 3.6), 1 / 3.6);
      const x1 = cx + cos * sc * 204, y1 = cy + sin * sc * 204;
      const x2 = cx + cos * sc * 222, y2 = cy + sin * sc * 222;
      if (i % 5 === 0) {
        ctx.beginPath(); ctx.arc((x1 + x2) / 2, (y1 + y2) / 2, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = '#18181B'; ctx.fill();
      } else {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#3F3F46'; ctx.lineWidth = 2.6; ctx.stroke();
      }
    }
    ctx.fillStyle = '#18181B'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '700 56px Georgia, serif';
    ['1','2','3','4','5','6','7','8','9','10','11','12'].forEach((n, i) => {
      const a = ((i + 1) * 30 - 90) * Math.PI / 180;
      const cos = Math.cos(a), sin = Math.sin(a);
      const sc = 1 / Math.pow(Math.pow(Math.abs(cos), 3.2) + Math.pow(Math.abs(sin), 3.2), 1 / 3.2);
      ctx.fillText(n, cx + cos * sc * 162, cy + sin * sc * 162);
    });
    ctx.font = '700 18px sans-serif'; ctx.fillStyle = '#52525B';
    ctx.fillText('QUARTZ', cx, 344);
  } else if (clockId === 'cuckoo-white') {
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#18181B'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '700 50px sans-serif';
    ['1','2','3','4','5','6','7','8','9','10','11','12'].forEach((n, i) => {
      const a = ((i + 1) * 30 - 90) * Math.PI / 180;
      ctx.fillText(n, cx + Math.cos(a) * 188, cy + Math.sin(a) * 188);
    });
  } else if (clockId === 'steampunk-pipe') {
    ctx.fillStyle = '#F4F4F5'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 60; i++) {
      const a = (i * 6 - 90) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 218, cy + Math.sin(a) * 218);
      ctx.lineTo(cx + Math.cos(a) * 238, cy + Math.sin(a) * 238);
      ctx.strokeStyle = '#3F3F46'; ctx.lineWidth = i % 5 === 0 ? 4.5 : 2; ctx.stroke();
    }
    // Bold pressure-gauge wedges
    for (let i = 0; i < 12; i++) {
      if (i % 3 === 0) continue;
      const a = (i * 30 - 90) * Math.PI / 180;
      const ax = Math.cos(a), ay = Math.sin(a), px = -ay * 10, py = ax * 10;
      ctx.beginPath();
      ctx.moveTo(cx + ax * 204 - px, cy + ay * 204 - py);
      ctx.lineTo(cx + ax * 204 + px, cy + ay * 204 + py);
      ctx.lineTo(cx + ax * 138, cy + ay * 138);
      ctx.closePath(); ctx.fillStyle = '#27272A'; ctx.fill();
    }
    ctx.strokeStyle = '#71717A'; ctx.lineWidth = 3; ctx.setLineDash([7, 5]);
    ctx.beginPath(); ctx.arc(cx, cy, 86, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#18181B'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '900 72px sans-serif';
    ctx.fillText('12', cx, 98); ctx.fillText('3', 416, cy + 4); ctx.fillText('6', cx, 420); ctx.fillText('9', 96, cy + 4);
    ctx.font = '800 18px monospace'; ctx.fillStyle = '#52525B'; ctx.fillText('BAR / PSI', cx, 326);
  } else if (clockId === 'modern-black') {
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(0, 0, 512, 512);
    // Inner minute tick ring (just like IMG_3272!)
    for (let i = 0; i < 60; i++) {
      const a = (i * 6 - 90) * Math.PI / 180;
      const isH = i % 5 === 0;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (isH ? 136 : 144), cy + Math.sin(a) * (isH ? 136 : 144));
      ctx.lineTo(cx + Math.cos(a) * 156, cy + Math.sin(a) * 156);
      ctx.strokeStyle = '#18181B'; ctx.lineWidth = isH ? 7 : 2.5; ctx.stroke();
    }
    ctx.fillStyle = '#18181B'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '700 46px sans-serif';
    ['1','2','3','4','5','6','7','8','9','10','11','12'].forEach((n, i) => {
      const a = ((i + 1) * 30 - 90) * Math.PI / 180;
      ctx.fillText(n, cx + Math.cos(a) * 204, cy + Math.sin(a) * 204);
    });
  } else if (clockId === 'pendulum-clock') {
    ctx.fillStyle = '#FAF5E4'; ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#92400E'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(cx, cy, 232, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 148, 0, Math.PI * 2); ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#18181B'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '700 38px Georgia, serif';
    ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'].forEach((n, i) => {
      const a = ((i + 1) * 30 - 90) * Math.PI / 180;
      ctx.fillText(n, cx + Math.cos(a) * 190, cy + Math.sin(a) * 190);
    });
  } else if (clockId === 'vintage-gold') {
    // Champagne brushed linen dial (IMG_3274) — NO numbers, subtle hairline texture + fine ticks
    ctx.fillStyle = '#DDD4B4'; ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(120, 100, 60, 0.14)'; ctx.lineWidth = 1.5;
    for (let k = 0; k < 512; k += 8) {
      ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, k); ctx.lineTo(512, k); ctx.stroke();
    }
    ctx.strokeStyle = '#52525B'; ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, 464, 464);
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      const a = (i * 6 - 90) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 192, cy + Math.sin(a) * 192);
      ctx.lineTo(cx + Math.cos(a) * 204, cy + Math.sin(a) * 204);
      ctx.strokeStyle = '#52525B'; ctx.lineWidth = 2.2; ctx.stroke();
    }
    ctx.fillStyle = '#52525B'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '700 18px Georgia, serif'; ctx.fillText('QUARTZ', cx, 344);
  } else if (clockId === 'bead-watch') {
    // Child's personal beaded watch dial (IMG_3294): pure white, bold classic black numerals 1-12, QUARTZ, no tick ring
    ctx.fillStyle = '#FAFAFA'; ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#18181B'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '900 54px Georgia, serif';
    ['1','2','3','4','5','6','7','8','9','10','11','12'].forEach((n, i) => {
      const a = ((i + 1) * 30 - 90) * Math.PI / 180;
      ctx.fillText(n, cx + Math.cos(a) * 184, cy + Math.sin(a) * 184);
    });
    ctx.font = '800 24px sans-serif'; ctx.fillStyle = '#27272A';
    ctx.fillText('QUARTZ', cx, 356);
  } else {
    // round-radio: clean white dial
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 60; i++) {
      const a = (i * 6 - 90) * Math.PI / 180;
      const isH = i % 5 === 0;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (isH ? 210 : 218), cy + Math.sin(a) * (isH ? 210 : 218));
      ctx.lineTo(cx + Math.cos(a) * 232, cy + Math.sin(a) * 232);
      ctx.strokeStyle = '#18181B'; ctx.lineWidth = isH ? 6 : 2.2; ctx.stroke();
    }
    ctx.fillStyle = '#18181B'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '800 44px sans-serif';
    ['1','2','3','4','5','6','7','8','9','10','11','12'].forEach((n, i) => {
      const a = ((i + 1) * 30 - 90) * Math.PI / 180;
      ctx.fillText(n, cx + Math.cos(a) * 172, cy + Math.sin(a) * 172);
    });
    ctx.font = '800 17px sans-serif'; ctx.fillStyle = '#0284C7'; ctx.fillText('RADIO CONTROL', cx, 336);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Mini sub-gauge texture for wood-hygro (Humidity & Temperature) */
function makeSubGaugeTexture(THREE, type) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  const cx = 128, cy = 128;
  ctx.fillStyle = '#F7F3E7'; ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy, 86, Math.PI * 0.72, Math.PI * 2.28); ctx.stroke();
  ctx.fillStyle = '#1E293B'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '800 18px sans-serif';
  ctx.fillText(type === 'hygro' ? 'HUMIDITY' : 'TEMPERATURE', cx, 214);
  ctx.font = '800 22px sans-serif';
  ctx.fillText(type === 'hygro' ? '50%' : '20°C', cx, 58);
  // Needle
  const ang = type === 'hygro' ? -0.6 : 0.12;
  ctx.strokeStyle = '#18181B'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(ang) * 76, cy - Math.cos(ang) * 76); ctx.stroke();
  ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Dynamic canvas texture for Apple Watch Numerals Duo OLED display */
function createAppleWatchScreen(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 640;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  const draw = (hh, mm, dotAlpha = 1) => {
    ctx.fillStyle = '#0EA5E9'; ctx.fillRect(0, 0, 512, 320);
    ctx.fillStyle = '#93C5FD'; ctx.fillRect(0, 320, 512, 320);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 280px sans-serif';
    ctx.fillStyle = '#F8FAFC'; ctx.fillText(hh, 256, 178);
    ctx.fillStyle = '#09090B'; ctx.fillText(mm, 256, 478);
    ctx.beginPath(); ctx.arc(432, 74, 16, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(74, 222, 128, ${dotAlpha.toFixed(2)})`; ctx.fill();
    tex.needsUpdate = true;
  };
  const d = new Date();
  draw(String(d.getHours()).padStart(2, '0'), String(d.getMinutes()).padStart(2, '0'), 1);
  return { tex, draw };
}

function makeChipTexture(THREE, lines, bg, fg, accent) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 192;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 256, 192);
  ctx.strokeStyle = accent; ctx.lineWidth = 8; ctx.strokeRect(10, 10, 236, 172);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((txt, i) => {
    ctx.font = `900 ${i === 0 ? 52 : 30}px monospace`;
    ctx.fillStyle = i === 0 ? fg : accent;
    ctx.fillText(txt, 128, lines.length === 1 ? 96 : 70 + i * 56);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Authentic 3D clock hands tailored to each photographed clock */
function build3DHands(THREE, parent, radius, clockId) {
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x18181B, metalness: 0.35, roughness: 0.35 });
  const grayMat = new THREE.MeshStandardMaterial({ color: 0x3F3F46, roughness: 0.55 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.78, roughness: 0.24 });
  const redMat  = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.35 });
  const silMat  = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.75, roughness: 0.25 });

  const hour = new THREE.Group(); hour.position.z = 0.05;
  const minute = new THREE.Group(); minute.position.z = 0.09;
  const second = new THREE.Group(); second.position.z = 0.13;
  parent.add(hour, minute, second);

  if (clockId === 'wood-hygro') {
    // Breguet hollow-circle hour hand (IMG_3268!)
    const hStem = new THREE.Mesh(new THREE.BoxGeometry(0.06, radius * 0.36, 0.025), darkMat);
    hStem.position.y = radius * 0.16;
    const hRing = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.16, 0.032, 8, 20), darkMat);
    hRing.position.y = radius * 0.44;
    const hTip = new THREE.Mesh(new THREE.BoxGeometry(0.05, radius * 0.14, 0.025), darkMat);
    hTip.position.y = radius * 0.64;
    hour.add(hStem, hRing, hTip);
    const mBar = new THREE.Mesh(new THREE.BoxGeometry(0.055, radius * 0.88, 0.025), darkMat);
    mBar.position.y = radius * 0.36; minute.add(mBar);
    const sBar = new THREE.Mesh(new THREE.BoxGeometry(0.022, radius * 1.05, 0.02), darkMat);
    sBar.position.y = radius * 0.26;
    const sBall = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 14), darkMat);
    sBall.rotation.x = Math.PI / 2; sBall.position.y = -radius * 0.32;
    second.add(sBar, sBall);
  } else if (clockId === 'cuckoo-white') {
    // Bold matte-gray baton hands, NO second hand (IMG_3270!)
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.11, radius * 0.66, 0.03), grayMat);
    hBar.position.y = radius * 0.24; hour.add(hBar);
    const mBar = new THREE.Mesh(new THREE.BoxGeometry(0.085, radius * 0.96, 0.03), grayMat);
    mBar.position.y = radius * 0.38; minute.add(mBar);
    second.visible = false;
  } else if (clockId === 'vintage-gold') {
    // Ornate baroque scrollwork hour & minute hands + slim silver second (IMG_3274!)
    const hLoop = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.12, 0.026, 8, 16), darkMat);
    hLoop.position.y = radius * 0.24;
    const hSpire = new THREE.Mesh(new THREE.ConeGeometry(0.05, radius * 0.46, 6), darkMat);
    hSpire.position.y = radius * 0.44;
    hour.add(hLoop, hSpire);
    const mLoop = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.09, 0.022, 8, 16), darkMat);
    mLoop.position.y = radius * 0.36;
    const mSpire = new THREE.Mesh(new THREE.ConeGeometry(0.04, radius * 0.78, 6), darkMat);
    mSpire.position.y = radius * 0.48;
    minute.add(mLoop, mSpire);
    const sBar = new THREE.Mesh(new THREE.BoxGeometry(0.02, radius * 1.05, 0.02), silMat);
    sBar.position.y = radius * 0.3; second.add(sBar);
  } else if (clockId === 'bead-watch') {
    // Polished silver pointed dauphine hands + slim silver second (IMG_3294!)
    const hCone = new THREE.Mesh(new THREE.ConeGeometry(0.065, radius * 0.64, 4), silMat);
    hCone.scale.set(1, 1, 0.35); hCone.position.y = radius * 0.26; hour.add(hCone);
    const mCone = new THREE.Mesh(new THREE.ConeGeometry(0.048, radius * 0.88, 4), silMat);
    mCone.scale.set(1, 1, 0.35); mCone.position.y = radius * 0.38; minute.add(mCone);
    const sBar = new THREE.Mesh(new THREE.BoxGeometry(0.018, radius * 0.98, 0.018), grayMat);
    sBar.position.y = radius * 0.32; second.add(sBar);
  } else {
    const hMat = darkMat;
    const mMat = darkMat;
    const sMat = clockId === 'square-brown' ? goldMat : (clockId === 'pendulum-clock' ? redMat : darkMat);
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.095, radius * 0.62, 0.03), hMat);
    hBar.position.y = radius * 0.24; hour.add(hBar);
    const mBar = new THREE.Mesh(new THREE.BoxGeometry(0.068, radius * 0.88, 0.03), mMat);
    mBar.position.y = radius * 0.36; minute.add(mBar);
    const sBar = new THREE.Mesh(new THREE.BoxGeometry(0.024, radius * 1.0, 0.02), sMat);
    sBar.position.y = radius * 0.3; second.add(sBar);
  }

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.085, 0.16, 16),
    (clockId === 'cuckoo-white' || clockId === 'bead-watch') ? silMat : goldMat
  );
  cap.rotation.x = Math.PI / 2; cap.position.z = 0.09;
  parent.add(cap);

  return { hour, minute, second };
}

/** Add extruded 3D gear train behind the dial (revealed on explode!) */
function addInternalGears(THREE, root, anim, x, y, baseZ, radius, extraMeshes = []) {
  const mechGroup = new THREE.Group();
  mechGroup.position.set(x, y, baseZ);
  root.add(mechGroup);

  const s = radius / 1.4;
  [
    { gx: 0, gy: 0, r: 0.44 * s, t: 18, c: 0xFBBF24, sp: 0.9 },
    { gx: 0.52 * s, gy: 0.32 * s, r: 0.32 * s, t: 14, c: 0xCBD5E1, sp: -1.4 },
    { gx: -0.48 * s, gy: 0.32 * s, r: 0.35 * s, t: 16, c: 0xEA580C, sp: -1.1 },
    { gx: 0.32 * s, gy: -0.46 * s, r: 0.28 * s, t: 12, c: 0xF59E0B, sp: 1.8 }
  ].forEach((gs) => {
    const gm = make3DGear(THREE, gs.r, gs.r * 0.82, gs.t, 0.1, gs.c);
    gm.position.set(gs.gx, gs.gy, 0);
    mechGroup.add(gm);
    anim.gears.push({ mesh: gm, speed: gs.sp });
  });
  extraMeshes.forEach((m) => mechGroup.add(m));
  anim.explodeParts.push({ obj: mechGroup, baseZ, expZ: baseZ + 0.72 });
}

/** 1. Wood Hygro-Thermo Clock (IMG_3268): Vertical wood board + upper dial + lower dual gauges */
function buildWoodHygro3D(THREE, root, anim) {
  const woodTex = makeWoodTexture(THREE, '#9B5114', '#5A2906', true);
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.58, metalness: 0.04 });

  // Vertical wooden board (depth 0.56 + bevel 0.10 => front face at z = +0.33)
  const boardGeo = new THREE.ExtrudeGeometry(makeRoundedRectShape(THREE, 3.05, 3.72, 0.12), {
    depth: 0.56, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 2
  });
  boardGeo.center();
  root.add(new THREE.Mesh(boardGeo, woodMat));

  // Upper recessed round bezel & dial (cleanly in front of z = +0.33!)
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.06, 12, 36), new THREE.MeshStandardMaterial({ color: 0x6B340A, roughness: 0.6 }));
  bezel.position.set(0, 0.48, 0.37);
  root.add(bezel);

  addInternalGears(THREE, root, anim, 0, 0.48, 0.12, 1.08);

  const dialMat = new THREE.MeshStandardMaterial({ map: makeDialTexture(THREE, 'wood-hygro'), roughness: 0.65, transparent: true, opacity: 1 });
  const dial = new THREE.Mesh(new THREE.CircleGeometry(1.15, 40), dialMat);
  dial.position.set(0, 0.48, 0.36);
  root.add(dial);
  anim.explodeParts.push({ obj: dial, baseZ: 0.36, expZ: 1.42, fadeMat: dialMat });

  const handsGrp = new THREE.Group();
  handsGrp.position.set(0, 0.48, 0.39);
  root.add(handsGrp);
  anim.hands = build3DHands(THREE, handsGrp, 1.05, 'wood-hygro');
  anim.explodeParts.push({ obj: handsGrp, baseZ: 0.39, expZ: 1.78 });

  const glass = new THREE.Mesh(new THREE.CircleGeometry(1.17, 40),
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.16, roughness: 0.06 }));
  glass.position.set(0, 0.48, 0.52);
  root.add(glass);
  anim.explodeParts.push({ obj: glass, baseZ: 0.52, expZ: 2.22 });

  // Lower-left Humidity gauge & Lower-right Temperature gauge (IMG_3268!)
  [['hygro', -0.84], ['thermo', 0.84]].forEach(([type, gx]) => {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.04, 10, 28), new THREE.MeshStandardMaterial({ color: 0x6B340A, roughness: 0.6 }));
    rim.position.set(gx, -1.16, 0.37);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.47, 32),
      new THREE.MeshStandardMaterial({ map: makeSubGaugeTexture(THREE, type), roughness: 0.65 }));
    face.position.set(gx, -1.16, 0.36);
    root.add(rim, face);
  });

  // Rear battery housing
  const rear = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 0.24), new THREE.MeshStandardMaterial({ color: 0x1E293B }));
  rear.position.set(0, 0.48, -0.4);
  root.add(rear);
}

/** 2. Dark Brown Square Frame Clock (IMG_3269) */
function buildSquareBrown3D(THREE, root, anim) {
  const woodMat = new THREE.MeshStandardMaterial({ map: makeWoodTexture(THREE, '#331410', '#1A0806', false), roughness: 0.45, metalness: 0.08 });
  const back = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.2, 0.28), woodMat);
  back.position.z = -0.26;
  root.add(back);
  // Thick stepped recessed dark-wood frame
  addBeveledFrame(THREE, root, 3.36, 3.36, 0.36, 0.72, woodMat, 0.04);

  addInternalGears(THREE, root, anim, 0, 0, -0.02, 1.2);

  const dialMat = new THREE.MeshStandardMaterial({ map: makeDialTexture(THREE, 'square-brown'), roughness: 0.68, transparent: true, opacity: 1 });
  const dial = new THREE.Mesh(new THREE.PlaneGeometry(2.64, 2.64), dialMat);
  dial.position.z = 0.18;
  root.add(dial);
  anim.explodeParts.push({ obj: dial, baseZ: 0.18, expZ: 1.25, fadeMat: dialMat });

  const handsGrp = new THREE.Group(); handsGrp.position.z = 0.21;
  root.add(handsGrp);
  anim.hands = build3DHands(THREE, handsGrp, 1.18, 'square-brown');
  anim.explodeParts.push({ obj: handsGrp, baseZ: 0.21, expZ: 1.65 });

  const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.68, 2.68),
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.16, roughness: 0.06 }));
  glass.position.z = 0.38;
  root.add(glass);
  anim.explodeParts.push({ obj: glass, baseZ: 0.38, expZ: 2.1 });
}

/** 3. White Minimalist Cuckoo House (IMG_3270): Flat bottom, NO pendulum, arched shutters, direct wall numerals */
function buildCuckooWhite3D(THREE, root, anim) {
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.65 });
  const roofMat  = new THREE.MeshStandardMaterial({ color: 0xF1F5F9, roughness: 0.58 });

  const houseShape = new THREE.Shape();
  houseShape.moveTo(-1.26, -1.68);
  houseShape.lineTo(1.26, -1.68);
  houseShape.lineTo(1.26, 0.86);
  houseShape.lineTo(0, 1.88);
  houseShape.lineTo(-1.26, 0.86);
  houseShape.closePath();
  // depth 1.15 + bevel 0.08 => front face at z = +0.615
  const houseGeo = new THREE.ExtrudeGeometry(houseShape, { depth: 1.15, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 2 });
  houseGeo.center();
  root.add(new THREE.Mesh(houseGeo, whiteMat));

  // Overhanging clean white pitched roof slabs
  const roofL = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.14, 1.38), roofMat);
  roofL.position.set(-0.78, 1.38, 0); roofL.rotation.z = Math.PI * 0.215;
  const roofR = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.14, 1.38), roofMat);
  roofR.position.set(0.78, 1.38, 0); roofR.rotation.z = -Math.PI * 0.215;
  root.add(roofL, roofR);

  // Arched louvered shutters + 3D pop-out Cuckoo bird (IMG_3270)
  const winHole = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.56, 0.1), new THREE.MeshBasicMaterial({ color: 0x1E293B }));
  winHole.position.set(0, 0.62, 0.59);
  const shL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.58, 0.05), roofMat);
  shL.position.set(-0.38, 0.62, 0.74); shL.rotation.y = -0.75;
  const shR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.58, 0.05), roofMat);
  shR.position.set(0.38, 0.62, 0.74); shR.rotation.y = 0.75;
  root.add(winHole, shL, shR);

  const bird = new THREE.Group();
  bird.position.set(0, 0.6, 0.7);
  const bBody = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), new THREE.MeshStandardMaterial({ color: 0x38BDF8, roughness: 0.45 }));
  bBody.scale.set(0.9, 0.9, 1.35);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 8), new THREE.MeshStandardMaterial({ color: 0xF59E0B }));
  beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.03, 0.25);
  bird.add(bBody, beak);
  root.add(bird);
  anim.cuckooBird = bird;

  addInternalGears(THREE, root, anim, 0, -0.62, 0.24, 0.95);

  // Direct numerals on white wall (cleanly in front of z = +0.615!)
  const dialMat = new THREE.MeshStandardMaterial({ map: makeDialTexture(THREE, 'cuckoo-white'), roughness: 0.65, transparent: true, opacity: 1 });
  const dial = new THREE.Mesh(new THREE.PlaneGeometry(1.96, 1.96), dialMat);
  dial.position.set(0, -0.62, 0.64);
  root.add(dial);
  anim.explodeParts.push({ obj: dial, baseZ: 0.64, expZ: 1.55, fadeMat: dialMat });

  const handsGrp = new THREE.Group(); handsGrp.position.set(0, -0.62, 0.67);
  root.add(handsGrp);
  anim.hands = build3DHands(THREE, handsGrp, 0.88, 'cuckoo-white');
  anim.explodeParts.push({ obj: handsGrp, baseZ: 0.67, expZ: 1.92 });
}

/** 4. Steampunk Pipe & Pressure Gauge Clock (IMG_3271): Exact asymmetric composition! */
function buildSteampunk3D(THREE, root, anim) {
  const ironMat   = new THREE.MeshStandardMaterial({ color: 0x27272A, metalness: 0.68, roughness: 0.42 });
  const silverMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.78, roughness: 0.3 });
  const goldMat   = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.72, roughness: 0.28 });
  const redMat    = new THREE.MeshStandardMaterial({ color: 0x991B1B, metalness: 0.35, roughness: 0.45 });

  // Lower-left riveted dark-iron circular boiler plate + heavy stand base
  const boiler = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.22, 0.36, 36), ironMat);
  boiler.rotation.x = Math.PI / 2;
  boiler.position.set(-0.36, -0.22, -0.1);
  const boilerRim = new THREE.Mesh(new THREE.TorusGeometry(1.16, 0.08, 10, 36), silverMat);
  boilerRim.position.set(-0.36, -0.22, 0.06);
  const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.82, 0.42, 24), ironMat);
  standBase.position.set(-0.36, -1.42, -0.1);
  root.add(boiler, boilerRim, standBase);

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const rv = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), silverMat);
    rv.position.set(-0.36 + Math.cos(a) * 1.16, -0.22 + Math.sin(a) * 1.16, 0.14);
    root.add(rv);
  }

  // Heavy lower-right & right vertical iron plumbing pipe + T-joint + elbow
  const pipeV = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.35, 14), ironMat);
  pipeV.position.set(1.22, -0.42, 0.0);
  const pipeB = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.75, 14), ironMat);
  pipeB.rotation.z = Math.PI / 2; pipeB.position.set(0.32, -1.58, 0.22);
  const teeR = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.44, 14), silverMat);
  teeR.position.set(1.22, -0.12, 0.0);
  const elbowBR = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 12), silverMat);
  elbowBR.position.set(1.22, -1.58, 0.16);
  const teeL = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.56, 14), silverMat);
  teeL.position.set(-1.92, -0.32, 0.16);
  root.add(pipeV, pipeB, teeR, elbowBR, teeL);

  // Thin golden U-tube on upper-left + horizontal cross-tube + 3 branch tubes into boiler (IMG_3271!)
  const uCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.92, -0.05, 0.16),
    new THREE.Vector3(-1.92, 1.38, 0.16),
    new THREE.Vector3(-0.98, 1.38, 0.16),
    new THREE.Vector3(-0.98, 0.34, 0.16)
  ], false, 'catmullrom', 0.18);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(uCurve, 32, 0.055, 10, false), goldMat));

  const lowGold = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.92, -0.58, 0.16),
    new THREE.Vector3(-1.82, -1.56, 0.22),
    new THREE.Vector3(-0.58, -1.58, 0.22)
  ], false, 'catmullrom', 0.2);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(lowGold, 24, 0.055, 10, false), goldMat));

  const crossBar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.15, 10), goldMat);
  crossBar.rotation.z = Math.PI / 2; crossBar.position.set(-0.35, -0.32, 0.26);
  root.add(crossBar);
  [-0.36, -0.14, 0.08].forEach((bx) => {
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.52, 8), goldMat);
    br.position.set(bx, -0.06, 0.22);
    root.add(br);
  });

  // Horizontal upward-facing RED industrial wheel valve at bottom front (IMG_3271!)
  const valve = new THREE.Group();
  valve.position.set(-0.42, -1.16, 0.22);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.42, 10), ironMat);
  stem.position.y = -0.2;
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.07, 10, 20), redMat);
  wheel.rotation.x = Math.PI / 2;
  const sp1 = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.06, 0.08), redMat);
  const sp2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.68), redMat);
  valve.add(stem, wheel, sp1, sp2);
  root.add(valve);
  anim.valveWheel = valve;

  // UPPER-RIGHT independent silver Pressure-Gauge Clock (drum front at gz + 0.28 = +0.34)
  const gx = 1.22, gy = 1.14, gz = 0.06;
  const gDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.86, 0.56, 32), silverMat);
  gDrum.rotation.x = Math.PI / 2; gDrum.position.set(gx, gy, gz);
  const gRim = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.07, 10, 32), silverMat);
  gRim.position.set(gx, gy, gz + 0.32);
  root.add(gDrum, gRim);

  addInternalGears(THREE, root, anim, gx, gy, gz + 0.08, 0.72);

  const dialMat = new THREE.MeshStandardMaterial({ map: makeDialTexture(THREE, 'steampunk-pipe'), roughness: 0.6, transparent: true, opacity: 1 });
  const dial = new THREE.Mesh(new THREE.CircleGeometry(0.79, 36), dialMat);
  dial.position.set(gx, gy, gz + 0.31);
  root.add(dial);
  anim.explodeParts.push({ obj: dial, baseZ: gz + 0.31, expZ: gz + 1.18, fadeMat: dialMat });

  const handsGrp = new THREE.Group(); handsGrp.position.set(gx, gy, gz + 0.34);
  root.add(handsGrp);
  anim.hands = build3DHands(THREE, handsGrp, 0.72, 'steampunk-pipe');
  anim.explodeParts.push({ obj: handsGrp, baseZ: gz + 0.34, expZ: gz + 1.52 });

  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.81, 36),
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.16, roughness: 0.06 }));
  glass.position.set(gx, gy, gz + 0.44);
  root.add(glass);
  anim.explodeParts.push({ obj: glass, baseZ: gz + 0.44, expZ: gz + 1.9 });
}

/** 5. Matte Black Square Body + Recessed Round Dial (IMG_3272) */
function buildModernBlack3D(THREE, root, anim) {
  const blkMat = new THREE.MeshStandardMaterial({ color: 0x18181B, roughness: 0.55, metalness: 0.12 });
  // depth 0.72 + bevel 0.10 => front face at z = +0.41
  const bodyGeo = new THREE.ExtrudeGeometry(makeRoundedRectShape(THREE, 3.16, 3.16, 0.14), {
    depth: 0.72, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 2
  });
  bodyGeo.center();
  root.add(new THREE.Mesh(bodyGeo, blkMat));

  // Glossy round bezel ring around circular dial (cleanly in front of z = +0.41!)
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(1.26, 0.08, 12, 36), new THREE.MeshStandardMaterial({ color: 0x09090B, roughness: 0.25, metalness: 0.3 }));
  bezel.position.z = 0.46;
  root.add(bezel);

  addInternalGears(THREE, root, anim, 0, 0, 0.18, 1.15);

  const dialMat = new THREE.MeshStandardMaterial({ map: makeDialTexture(THREE, 'modern-black'), roughness: 0.65, transparent: true, opacity: 1 });
  const dial = new THREE.Mesh(new THREE.CircleGeometry(1.22, 40), dialMat);
  dial.position.z = 0.44;
  root.add(dial);
  anim.explodeParts.push({ obj: dial, baseZ: 0.44, expZ: 1.46, fadeMat: dialMat });

  const handsGrp = new THREE.Group(); handsGrp.position.z = 0.47;
  root.add(handsGrp);
  anim.hands = build3DHands(THREE, handsGrp, 1.12, 'modern-black');
  anim.explodeParts.push({ obj: handsGrp, baseZ: 0.47, expZ: 1.84 });

  const glass = new THREE.Mesh(new THREE.CircleGeometry(1.24, 40),
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.16, roughness: 0.06 }));
  glass.position.z = 0.58;
  root.add(glass);
  anim.explodeParts.push({ obj: glass, baseZ: 0.58, expZ: 2.24 });
}

/** 6. Ornate Brown Brick-Style Pendulum Clock (IMG_3273): 3 finials, gold trim, open gear bay + gold ball pendulum */
function buildPendulumClock3D(THREE, root, anim) {
  const brownMat = new THREE.MeshStandardMaterial({ color: 0x5B2318, roughness: 0.58 });
  const darkBrn  = new THREE.MeshStandardMaterial({ color: 0x3B140C, roughness: 0.62 });
  const goldMat  = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.78, roughness: 0.24 });

  // Tall stepped brick cabinet (topBox front face at -0.05 + 0.42 = +0.37)
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.98, 3.65, 0.28), darkBrn);
  back.position.set(0, -0.1, -0.34);
  const topBox = new THREE.Mesh(new THREE.BoxGeometry(2.05, 1.65, 0.84), brownMat);
  topBox.position.set(0, 0.88, -0.05);
  const colL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.85, 0.76), brownMat);
  colL.position.set(-0.88, -0.9, -0.05);
  const colR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.85, 0.76), brownMat);
  colR.position.set(0.88, -0.9, -0.05);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.32, 0.96), brownMat);
  plinth.position.set(0, -1.92, -0.02);
  root.add(back, topBox, colL, colR, plinth);

  // 3 Top Finials + gold crest
  [[0, 1.98, 0.22], [-0.88, 1.86, 0.14], [0.88, 1.86, 0.14]].forEach(([fx, fy, fr]) => {
    const urn = new THREE.Mesh(new THREE.SphereGeometry(fr, 14, 12), brownMat);
    urn.position.set(fx, fy, -0.05);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(fr * 0.45, 10, 10), goldMat);
    tip.position.set(fx, fy + fr * 1.1, -0.05);
    root.add(urn, tip);
  });
  const crest = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.12), goldMat);
  crest.position.set(0, 1.62, 0.38);
  root.add(crest);

  // Gold filigree side trim bars & circular ornate bezel
  [-0.86, 0.86].forEach((tx) => {
    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.25, 0.12), goldMat);
    trim.position.set(tx, 0.82, 0.4);
    root.add(trim);
  });
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.08, 12, 32), goldMat);
  bezel.position.set(0, 0.82, 0.42);
  root.add(bezel);

  // Visible exposed gears inside the open lower bay
  [
    { gx: -0.32, gy: -0.68, r: 0.24, c: 0x334155, sp: 0.9 },
    { gx: 0.28,  gy: -0.78, r: 0.26, c: 0x94A3B8, sp: -1.1 },
    { gx: 0.52,  gy: -1.06, r: 0.2,  c: 0xD4AF37, sp: 1.5 },
    { gx: -0.48, gy: -1.12, r: 0.22, c: 0x1E293B, sp: -1.3 }
  ].forEach((gs) => {
    const gm = make3DGear(THREE, gs.r, gs.r * 0.8, 12, 0.08, gs.c);
    gm.position.set(gs.gx, gs.gy, -0.14);
    root.add(gm);
    anim.gears.push({ mesh: gm, speed: gs.sp });
  });

  // Big glossy golden spherical pendulum bob swinging in the open bay
  const pend = new THREE.Group();
  pend.position.set(0, 0.1, 0.12);
  const rod = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.25, 0.06), goldMat);
  rod.position.y = -0.62;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 18), goldMat);
  ball.scale.set(1, 1, 0.65); ball.position.y = -1.22;
  pend.add(rod, ball);
  root.add(pend);
  anim.pendulum = pend;

  // Upper dial + hands (cleanly in front of topBox z = +0.37!)
  const dialMat = new THREE.MeshStandardMaterial({ map: makeDialTexture(THREE, 'pendulum-clock'), roughness: 0.65, transparent: true, opacity: 1 });
  const dial = new THREE.Mesh(new THREE.CircleGeometry(0.72, 36), dialMat);
  dial.position.set(0, 0.82, 0.4);
  root.add(dial);
  anim.explodeParts.push({ obj: dial, baseZ: 0.4, expZ: 1.35, fadeMat: dialMat });

  const handsGrp = new THREE.Group(); handsGrp.position.set(0, 0.82, 0.43);
  root.add(handsGrp);
  anim.hands = build3DHands(THREE, handsGrp, 0.64, 'pendulum-clock');
  anim.explodeParts.push({ obj: handsGrp, baseZ: 0.43, expZ: 1.72 });
}

/** 7. Vintage Dark-Wood Frame + Silver Trim + Champagne Linen Dial + 12 3D Silver Batons (IMG_3274) */
function buildVintageGold3D(THREE, root, anim) {
  const woodMat   = new THREE.MeshStandardMaterial({ map: makeWoodTexture(THREE, '#3A1512', '#1C0706', false), roughness: 0.46, metalness: 0.06 });
  const silverMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.85, roughness: 0.22 });
  const innerMat  = new THREE.MeshStandardMaterial({ color: 0xE2D9B8, roughness: 0.55 });

  const back = new THREE.Mesh(new THREE.BoxGeometry(3.45, 3.25, 0.24), woodMat);
  back.position.z = -0.26;
  root.add(back);
  addBeveledFrame(THREE, root, 3.55, 3.35, 0.42, 0.68, woodMat, 0.04);
  addBeveledFrame(THREE, root, 2.72, 2.52, 0.07, 0.46, silverMat, 0.14);
  addBeveledFrame(THREE, root, 2.58, 2.38, 0.12, 0.36, innerMat, 0.08);

  addInternalGears(THREE, root, anim, 0, 0, -0.04, 1.1);

  const dialGrp = new THREE.Group();
  dialGrp.position.z = 0.14;
  const dialMat = new THREE.MeshStandardMaterial({ map: makeDialTexture(THREE, 'vintage-gold'), roughness: 0.62, transparent: true, opacity: 1 });
  const dial = new THREE.Mesh(new THREE.PlaneGeometry(2.38, 2.18), dialMat);
  dialGrp.add(dial);

  for (let i = 0; i < 12; i++) {
    const a = (i * 30 - 90) * Math.PI / 180;
    const isCard = i % 3 === 0;
    const baton = new THREE.Mesh(new THREE.BoxGeometry(isCard ? 0.1 : 0.075, isCard ? 0.28 : 0.24, 0.05), silverMat);
    baton.position.set(Math.cos(a) * 0.88, -Math.sin(a) * 0.82, 0.03);
    baton.rotation.z = -a + Math.PI / 2;
    dialGrp.add(baton);
  }
  root.add(dialGrp);
  anim.explodeParts.push({ obj: dialGrp, baseZ: 0.14, expZ: 1.25, fadeMat: dialMat });

  const handsGrp = new THREE.Group(); handsGrp.position.z = 0.2;
  root.add(handsGrp);
  anim.hands = build3DHands(THREE, handsGrp, 0.96, 'vintage-gold');
  anim.explodeParts.push({ obj: handsGrp, baseZ: 0.2, expZ: 1.65 });

  const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.58, 2.38),
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.16, roughness: 0.06 }));
  glass.position.z = 0.38;
  root.add(glass);
  anim.explodeParts.push({ obj: glass, baseZ: 0.38, expZ: 2.1 });
}

/** 8. Natural Light-Oak Round Radio Clock */
function buildRoundRadio3D(THREE, root, anim) {
  const oakMat = new THREE.MeshStandardMaterial({ map: makeWoodTexture(THREE, '#C7A672', '#9A7B4F', true), roughness: 0.62 });
  // drum front face at z = +0.34
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.74, 1.7, 0.68, 40), oakMat);
  drum.rotation.x = Math.PI / 2;
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(1.64, 0.14, 14, 40), oakMat);
  bezel.position.z = 0.36;
  root.add(drum, bezel);

  // Ferrite rod radio antenna inside
  const ferrite = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.3, 12), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 }));
  ferrite.rotation.z = Math.PI / 2; ferrite.position.set(0, 0.86, 0);
  addInternalGears(THREE, root, anim, 0, 0, 0.08, 1.35, [ferrite]);

  const dialMat = new THREE.MeshStandardMaterial({ map: makeDialTexture(THREE, 'round-radio'), roughness: 0.65, transparent: true, opacity: 1 });
  const dial = new THREE.Mesh(new THREE.CircleGeometry(1.52, 40), dialMat);
  dial.position.z = 0.37;
  root.add(dial);
  anim.explodeParts.push({ obj: dial, baseZ: 0.37, expZ: 1.38, fadeMat: dialMat });

  const handsGrp = new THREE.Group(); handsGrp.position.z = 0.4;
  root.add(handsGrp);
  anim.hands = build3DHands(THREE, handsGrp, 1.38, 'round-radio');
  anim.explodeParts.push({ obj: handsGrp, baseZ: 0.4, expZ: 1.78 });

  const glass = new THREE.Mesh(new THREE.CircleGeometry(1.54, 40),
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.16, roughness: 0.06 }));
  glass.position.z = 0.5;
  root.add(glass);
  anim.explodeParts.push({ obj: glass, baseZ: 0.5, expZ: 2.2 });

  const waveMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.85 });
  const w1 = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.04, 8, 20, Math.PI * 0.65), waveMat);
  w1.position.set(0, 1.92, 0); w1.rotation.z = Math.PI * 0.175;
  const w2 = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.036, 8, 20, Math.PI * 0.65), waveMat);
  w2.position.set(0, 1.92, 0); w2.rotation.z = Math.PI * 0.175;
  root.add(w1, w2);
  anim.radioWaveMat = waveMat;
}

/** 9. Apple Watch (Midnight Aluminum + Curved Sport Band + Digital Crown + Numerals Duo OLED + Internals) */
function buildAppleWatch3D(THREE, root, anim) {
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.65, roughness: 0.28 });
  const bandMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.78, metalness: 0.05 });
  const pinMat  = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.85, roughness: 0.2 });

  // depth 0.54 + bevel 0.24 => front face at z = +0.39
  const caseGeo = new THREE.ExtrudeGeometry(makeRoundedRectShape(THREE, 2.05, 2.52, 0.56), {
    depth: 0.54, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.09, bevelSegments: 5
  });
  caseGeo.center();
  root.add(new THREE.Mesh(caseGeo, bodyMat));

  // Curved wrist-loop fluoroelastomer Sport Band + stainless pin
  const bandPts = [];
  for (let i = 0; i <= 24; i++) {
    const ang = (i / 24 - 0.5) * Math.PI * 1.72;
    bandPts.push(new THREE.Vector3(0, Math.sin(ang) * 2.15, Math.cos(ang) * 1.48 - 1.56));
  }
  const bandGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bandPts), 44, 0.11, 10, false);
  bandGeo.scale(5.2, 1.0, 0.72);
  root.add(new THREE.Mesh(bandGeo, bandMat));

  const claspPin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 20), pinMat);
  claspPin.rotation.x = Math.PI / 2; claspPin.position.set(0, -0.1, -3.08);
  root.add(claspPin);

  // Knurled Digital Crown + Side button
  const crownPivot = new THREE.Group();
  crownPivot.position.set(1.16, 0.52, 0.02);
  const crownDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.2, 20), bodyMat);
  crownDrum.rotation.z = Math.PI / 2; crownPivot.add(crownDrum);
  const gMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.5, roughness: 0.4 });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const g = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.028, 0.03), gMat);
    g.position.set(0, Math.cos(a) * 0.235, Math.sin(a) * 0.235);
    crownPivot.add(g);
  }
  root.add(crownPivot);
  anim.awCrown = crownPivot;

  const sideBtn = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.62, 0.22), bodyMat);
  sideBtn.position.set(1.1, -0.45, 0.02);
  root.add(sideBtn);

  // Back ceramic dome + optical Heart Rate / SpO2 LEDs
  const backDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45),
    new THREE.MeshStandardMaterial({ color: 0x09090B, metalness: 0.4, roughness: 0.15 })
  );
  backDome.rotation.x = -Math.PI / 2; backDome.scale.set(1, 1, 0.35); backDome.position.set(0, 0, -0.34);
  root.add(backDome);

  const hrLedMat = new THREE.MeshStandardMaterial({ color: 0x22C55E, emissive: 0x22C55E, emissiveIntensity: 1.4 });
  const spLedMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, emissive: 0xEF4444, emissiveIntensity: 0.9 });
  [[-0.22, 0.18, hrLedMat], [0.22, 0.18, hrLedMat], [-0.22, -0.18, spLedMat], [0.22, -0.18, spLedMat]].forEach(([lx, ly, m]) => {
    const led = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 12), m);
    led.rotation.x = Math.PI / 2; led.position.set(lx, ly, -0.58);
    root.add(led);
  });
  anim.awHrMat = hrLedMat;

  // Internal electronics (Coil, S10 SiP, Taptic Engine, 327mAh Battery)
  const internal = new THREE.Group(); internal.position.z = 0.04; root.add(internal);
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.065, 10, 28), new THREE.MeshStandardMaterial({ color: 0xD97706, metalness: 0.75, roughness: 0.25 }));
  coil.position.set(0, 0, -0.12); internal.add(coil);
  anim.explodeParts.push({ obj: coil, baseZ: -0.12, expZ: 0.42 });

  const sip = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.86, 0.12), new THREE.MeshStandardMaterial({ map: makeChipTexture(THREE, ['S10', 'SiP 64-BIT'], '#18181B', '#F8FAFC', '#38BDF8'), roughness: 0.45 }));
  sip.position.set(0, 0.46, 0.02); internal.add(sip);
  anim.explodeParts.push({ obj: sip, baseZ: 0.02, expZ: 0.88 });

  const taptic = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.42, 0.14), new THREE.MeshStandardMaterial({ map: makeChipTexture(THREE, ['TAPTIC'], '#CBD5E1', '#0F172A', '#F59E0B'), metalness: 0.6, roughness: 0.3 }));
  taptic.position.set(0, -0.72, 0.02); internal.add(taptic);
  anim.awTaptic = taptic;
  anim.explodeParts.push({ obj: taptic, baseZ: 0.02, expZ: 0.88 });

  const battery = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.78, 0.14), new THREE.MeshStandardMaterial({ map: makeChipTexture(THREE, ['327mAh', '1.266 Wh'], '#18181B', '#4ADE80', '#64748B'), roughness: 0.55 }));
  battery.position.set(0.06, -0.02, 0.16); internal.add(battery);
  anim.explodeParts.push({ obj: battery, baseZ: 0.16, expZ: 1.38 });

  // Front Numerals Duo OLED + Ion-X Cover Glass (cleanly in front of z = +0.39!)
  const awScreen = createAppleWatchScreen(THREE);
  anim.awScreen = awScreen;
  const screenGeo = new THREE.ShapeGeometry(makeRoundedRectShape(THREE, 1.78, 2.24, 0.44), 16);
  const posAttr = screenGeo.attributes.position;
  const uvs = new Float32Array(posAttr.count * 2);
  for (let i = 0; i < posAttr.count; i++) {
    uvs[i * 2] = (posAttr.getX(i) + 0.89) / 1.78;
    uvs[i * 2 + 1] = (posAttr.getY(i) + 1.12) / 2.24;
  }
  screenGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  const screenMat = new THREE.MeshBasicMaterial({ map: awScreen.tex, transparent: true, opacity: 1.0 });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.z = 0.42;
  root.add(screenMesh);
  anim.explodeParts.push({ obj: screenMesh, baseZ: 0.42, expZ: 2.02, fadeMat: screenMat });

  const glassGeo = new THREE.ExtrudeGeometry(makeRoundedRectShape(THREE, 1.88, 2.34, 0.48), {
    depth: 0.04, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3
  });
  glassGeo.center();
  const glassMesh = new THREE.Mesh(glassGeo, new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.2, roughness: 0.06, metalness: 0.15 }));
  glassMesh.position.z = 0.48;
  root.add(glassMesh);
  anim.explodeParts.push({ obj: glassMesh, baseZ: 0.48, expZ: 2.42 });
}

/** 10. Beaded Bracelet Watch (IMG_3294): Chrome round case on right + exact 11 glossy pastel/pink beads on white elastic loop */
function buildBeadWatch3D(THREE, root, anim) {
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.9, roughness: 0.12 });
  const steelBackMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.82, roughness: 0.24 });
  const cordMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.65, metalness: 0.02 });

  const bx = -0.22;
  const br = 1.34;
  const hx = 0.84;

  // White elastic bracelet loop (open arc from top lug counter-clockwise to bottom lug)
  const topLugAngle = Math.atan2(0.83, hx - bx); // ~0.664 rad
  const cordArc = Math.PI * 2 - topLugAngle * 2;
  const cordMesh = new THREE.Mesh(new THREE.TorusGeometry(br, 0.044, 10, 48, cordArc), cordMat);
  cordMesh.position.set(bx, 0, 0);
  cordMesh.rotation.z = topLugAngle;
  root.add(cordMesh);

  // Exact 11 glossy round beads (counter-clockwise from top lug to bottom lug)
  const beadColors = [
    0xDF4B9B, // 1. Magenta pink (top lug)
    0x6E9ED2, // 2. Pastel blue
    0xDF4B9B, // 3. Magenta pink
    0xF8A39A, // 4. Coral peach
    0xF7F1D5, // 5. Cream white
    0xDF4B9B, // 6. Magenta pink (left)
    0xECE459, // 7. Lemon yellow
    0xDF4B9B, // 8. Magenta pink
    0xECE459, // 9. Lemon yellow
    0xB2E39E, // 10. Pastel mint green
    0xF6C8D2  // 11. Baby pink (bottom lug)
  ];
  const beadGeo = new THREE.SphereGeometry(0.295, 22, 18);
  const startAngle = topLugAngle + 0.24;
  const endAngle = Math.PI * 2 - startAngle;
  const step = (endAngle - startAngle) / (beadColors.length - 1);
  beadColors.forEach((hex, idx) => {
    const a = startAngle + step * idx;
    const mat = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.16, metalness: 0.06 });
    const bead = new THREE.Mesh(beadGeo, mat);
    bead.position.set(bx + Math.cos(a) * br, Math.sin(a) * br, 0);
    root.add(bead);
  });

  // Mirror-polished chrome round watch head on right (front face at z = +0.20)
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.80, 0.78, 0.40, 40), chromeMat);
  drum.rotation.x = Math.PI / 2;
  drum.position.set(hx, 0, 0);
  root.add(drum);

  // Rounded chrome front bezel
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.085, 14, 44), chromeMat);
  bezel.position.set(hx, 0, 0.21);
  root.add(bezel);

  // Top & bottom silver lug rings connecting elastic cord to case
  [0.83, -0.83].forEach((ly) => {
    const lug = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.036, 10, 20), chromeMat);
    lug.position.set(hx, ly, 0);
    lug.rotation.y = Math.PI / 6;
    root.add(lug);
  });

  // 3 o'clock knurled silver crown
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.14, 12), chromeMat);
  stem.rotation.z = Math.PI / 2;
  stem.position.set(hx + 0.82, 0, 0);
  root.add(stem);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.11, 14), chromeMat);
  crown.rotation.z = Math.PI / 2;
  crown.position.set(hx + 0.90, 0, 0);
  root.add(crown);

  // Brushed stainless steel snap caseback
  const back = new THREE.Mesh(new THREE.CylinderGeometry(0.70, 0.66, 0.06, 36), steelBackMat);
  back.rotation.x = Math.PI / 2;
  back.position.set(hx, 0, -0.22);
  root.add(back);

  // Internal miniature quartz gear train + SR626 silver button battery
  const buttonCell = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.09, 20), steelBackMat);
  buttonCell.rotation.x = Math.PI / 2;
  buttonCell.position.set(-0.24, -0.22, 0.04);
  addInternalGears(THREE, root, anim, hx, 0, 0.06, 0.68, [buttonCell]);

  // White dial with bold classic serif 1-12 & QUARTZ (cleanly in front of z = +0.20)
  const dialMat = new THREE.MeshStandardMaterial({ map: makeDialTexture(THREE, 'bead-watch'), roughness: 0.42, transparent: true, opacity: 1 });
  const dial = new THREE.Mesh(new THREE.CircleGeometry(0.72, 40), dialMat);
  dial.position.set(hx, 0, 0.23);
  root.add(dial);
  anim.explodeParts.push({ obj: dial, baseZ: 0.23, expZ: 1.28, fadeMat: dialMat });

  // Pointed silver dauphine hands + slim second hand
  const handsGroup = new THREE.Group();
  handsGroup.position.set(hx, 0, 0.26);
  root.add(handsGroup);
  anim.hands = build3DHands(THREE, handsGroup, 0.64, 'bead-watch');
  anim.explodeParts.push({ obj: handsGroup, baseZ: 0.26, expZ: 1.72 });

  // Clear cover glass
  const glass = new THREE.Mesh(
    new THREE.CircleGeometry(0.73, 40),
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.14 })
  );
  glass.position.set(hx, 0, 0.33);
  root.add(glass);
  anim.explodeParts.push({ obj: glass, baseZ: 0.33, expZ: 2.12 });
}

/**
 * Interactive True-3D Watch Viewer mounted inside WatchMakerGame on completion.
 */
export class WatchMaker3DViewer {
  constructor(mountEl, { onFirstDrag = null } = {}) {
    this.mountEl = mountEl;
    this.onFirstDrag = onFirstDrag;
    this.THREE = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.watchRoot = null;
    this.animData = null;

    this.yaw = -0.35;
    this.pitch = 0.16;
    this.targetYaw = -0.35;
    this.targetPitch = 0.16;
    this.exploded = false;
    this.explodeLerp = 0;
    this.sproutTime = 0;
    this.runTime = 0;
    this.lastSec = -1;

    this.dragging = false;
    this.hasDragged = false;
    this.lastX = 0;
    this.lastY = 0;
    this.paused = false;
    this.destroyed = false;
    this.rafId = null;
    this.lastFrame = 0;

    this._onDown = (e) => this.handleDown(e);
    this._onMove = (e) => this.handleMove(e);
    this._onUp = () => { this.dragging = false; };
    this._onResize = () => this.handleResize();
  }

  async show(clockId, { exploded = false } = {}) {
    this.exploded = exploded;
    this.explodeLerp = exploded ? 1 : 0;
    this.clockId = clockId;

    if (!cachedThree) {
      cachedThree = await import(THREE_CDN);
    }
    if (this.destroyed) return;
    this.THREE = cachedThree;

    if (!this.renderer) {
      this.initRenderer();
    }
    this.buildModel(clockId);
    this.startLoop();
  }

  initRenderer() {
    const THREE = this.THREE;
    const rect = this.mountEl.getBoundingClientRect();
    const w = Math.max(260, rect.width || 460);
    const h = Math.max(220, rect.height || 360);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setSize(w, h);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;cursor:grab;touch-action:none;';
    this.mountEl.innerHTML = '';
    this.mountEl.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, w / h, 0.2, 50);
    this.updateCameraFit(w, h);

    this.scene.add(new THREE.HemisphereLight(0xFFFFFF, 0x334155, 1.1));
    const key = new THREE.DirectionalLight(0xFFFDF5, 1.35);
    key.position.set(4, 6, 7);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x93C5FD, 0.72);
    rim.position.set(-5, -2, -5);
    this.scene.add(rim);

    this.watchRoot = new THREE.Group();
    this.scene.add(this.watchRoot);

    this.renderer.domElement.addEventListener('pointerdown', this._onDown);
    window.addEventListener('pointermove', this._onMove, { passive: false });
    window.addEventListener('pointerup', this._onUp);
    window.addEventListener('pointercancel', this._onUp);
    window.addEventListener('resize', this._onResize);
  }

  updateCameraFit(w, h) {
    if (!this.camera) return;
    const aspect = w / Math.max(1, h);
    this.camera.aspect = aspect;
    // Pull camera back on narrow portrait iPhone screens so wide clocks fit cleanly
    this.camera.position.set(0, 0, aspect < 0.95 ? (7.8 / Math.max(0.56, aspect * 0.96)) : 7.8);
    this.camera.updateProjectionMatrix();
  }

  buildModel(clockId) {
    while (this.watchRoot.children.length > 0) {
      const obj = this.watchRoot.children[0];
      this.watchRoot.remove(obj);
      this.disposeObject(obj);
    }

    const holder = new this.THREE.Group();
    this.watchRoot.add(holder);
    const anim = { gears: [], explodeParts: [], hands: null };

    const builders = {
      'wood-hygro':     buildWoodHygro3D,
      'square-brown':   buildSquareBrown3D,
      'cuckoo-white':   buildCuckooWhite3D,
      'steampunk-pipe': buildSteampunk3D,
      'modern-black':   buildModernBlack3D,
      'pendulum-clock': buildPendulumClock3D,
      'vintage-gold':   buildVintageGold3D,
      'round-radio':    buildRoundRadio3D,
      'apple-watch':    buildAppleWatch3D,
      'bead-watch':     buildBeadWatch3D
    };
    const fn = builders[clockId] || buildRoundRadio3D;
    fn(this.THREE, holder, anim);
    this.animData = anim;

    this.sproutTime = 0;
    this.watchRoot.scale.set(0.01, 0.01, 0.01);
    this.targetYaw = -0.35;
    this.targetPitch = 0.16;
    this.yaw = -0.85;
    this.pitch = 0.3;
  }

  setExploded(val) { this.exploded = !!val; }
  resetView() { this.targetYaw = 0; this.targetPitch = 0; }

  handleDown(e) {
    e.preventDefault();
    this.dragging = true;
    this.lastX = e.clientX; this.lastY = e.clientY;
    if (!this.hasDragged) {
      this.hasDragged = true;
      if (this.onFirstDrag) this.onFirstDrag();
    }
  }

  handleMove(e) {
    if (!this.dragging) return;
    e.preventDefault();
    const dx = e.clientX - this.lastX;
    const dy = e.clientY - this.lastY;
    this.lastX = e.clientX; this.lastY = e.clientY;
    this.targetYaw += dx * 0.011;
    this.targetPitch = Math.max(-1.05, Math.min(1.05, this.targetPitch + dy * 0.009));
  }

  handleResize() {
    if (!this.renderer || !this.camera || !this.mountEl) return;
    const rect = this.mountEl.getBoundingClientRect();
    const w = Math.max(260, rect.width || 460);
    const h = Math.max(220, rect.height || 360);
    this.updateCameraFit(w, h);
    this.renderer.setSize(w, h);
  }

  startLoop() {
    this.stopLoop();
    this.lastFrame = performance.now();
    const MIN_FRAME_MS = 32; // ~30fps cap

    const tick = (now) => {
      if (this.paused || this.destroyed) { this.rafId = null; return; }
      const elapsed = now - this.lastFrame;
      if (elapsed < MIN_FRAME_MS) { this.rafId = requestAnimationFrame(tick); return; }
      const dt = Math.min(elapsed / 1000, 0.06);
      this.lastFrame = now;
      this.runTime += dt;

      if (this.sproutTime < 0.5) {
        this.sproutTime += dt;
        const s = Math.max(0.01, easeOutBack(Math.min(1, this.sproutTime / 0.45)));
        this.watchRoot.scale.set(s, s, s);
      }

      this.yaw += (this.targetYaw - this.yaw) * 0.16;
      this.pitch += (this.targetPitch - this.pitch) * 0.16;
      this.watchRoot.rotation.y = this.yaw;
      this.watchRoot.rotation.x = this.pitch;

      this.explodeLerp += ((this.exploded ? 1 : 0) - this.explodeLerp) * 0.16;

      if (this.animData) {
        for (const ep of this.animData.explodeParts) {
          ep.obj.position.z = ep.baseZ + (ep.expZ - ep.baseZ) * this.explodeLerp;
          if (ep.fadeMat) ep.fadeMat.opacity = 1.0 - this.explodeLerp * 0.72;
        }
        for (const g of this.animData.gears) g.mesh.rotation.z += g.speed * dt;

        const d = new Date();
        if (this.animData.hands) {
          const sec = d.getSeconds() + d.getMilliseconds() / 1000;
          const min = d.getMinutes() + sec / 60;
          const hr = (d.getHours() % 12) + min / 60;
          this.animData.hands.hour.rotation.z = -(hr * Math.PI) / 6;
          this.animData.hands.minute.rotation.z = -(min * Math.PI) / 30;
          this.animData.hands.second.rotation.z = -(Math.floor(sec) * Math.PI) / 30;
        }
        if (this.animData.pendulum) this.animData.pendulum.rotation.z = Math.sin(this.runTime * Math.PI) * 0.24;
        if (this.animData.cuckooBird) this.animData.cuckooBird.position.z = 0.68 + Math.sin(this.runTime * 5.5) * 0.16;
        if (this.animData.valveWheel) this.animData.valveWheel.rotation.y = Math.sin(this.runTime * 1.8) * 0.55;
        if (this.animData.radioWaveMat) this.animData.radioWaveMat.opacity = 0.3 + 0.7 * Math.abs(Math.sin(this.runTime * 4));
        if (this.animData.awCrown) this.animData.awCrown.rotation.x += dt * 0.9;
        if (this.animData.awHrMat) this.animData.awHrMat.emissiveIntensity = 0.5 + 1.3 * Math.abs(Math.sin(this.runTime * 3.4));
        if (this.animData.awTaptic) {
          const cyc = this.runTime % 2.2;
          this.animData.awTaptic.position.x = cyc < 0.24 ? Math.sin(cyc * 95) * 0.045 : 0;
        }
        if (this.animData.awScreen && d.getSeconds() !== this.lastSec) {
          this.lastSec = d.getSeconds();
          this.animData.awScreen.draw(String(d.getHours()).padStart(2, '0'), String(d.getMinutes()).padStart(2, '0'), this.lastSec % 2 === 0 ? 1.0 : 0.35);
        }
      }

      this.renderer.render(this.scene, this.camera);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stopLoop() { if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; } }
  onPause() { this.paused = true; this.stopLoop(); }
  onResume() { if (!this.paused) return; this.paused = false; if (this.renderer) this.startLoop(); }

  disposeObject(obj) {
    obj.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    });
  }

  destroy() {
    this.destroyed = true;
    this.stopLoop();
    if (this.renderer) {
      this.renderer.domElement.removeEventListener('pointerdown', this._onDown);
      this.disposeObject(this.scene);
      this.renderer.dispose();
      this.renderer = null;
    }
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerup', this._onUp);
    window.removeEventListener('pointercancel', this._onUp);
    window.removeEventListener('resize', this._onResize);
    if (this.mountEl) this.mountEl.innerHTML = '';
  }
}
