/* =========================================================================
   POWER LAB 3D SCENE BUILDER (Three.js Toon Outlined Isometric 3D)
   Authentic "How It's Wired" aesthetic: cream workbench grid, ink outlines,
   sprouting "nyoki-nyoki" entrance animations, smooth spring levers,
   flowing 3D current pulses, and interactive distribution board (breaker box).
   ========================================================================= */

const INK_COLOR = 0x1E293B;

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function makeMat(THREE, color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.72,
    metalness: opts.metalness ?? 0.08,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    transparent: !!opts.transparent,
    opacity: opts.opacity ?? 1
  });
}

function addOutlined(THREE, parent, geo, mat, x = 0, y = 0, z = 0, opts = {}) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  if (opts.rx) mesh.rotation.x = opts.rx;
  if (opts.ry) mesh.rotation.y = opts.ry;
  if (opts.rz) mesh.rotation.z = opts.rz;
  if (opts.castShadow !== false) mesh.castShadow = true;
  if (opts.receiveShadow !== false) mesh.receiveShadow = true;
  if (opts.hitId) mesh.userData.hitId = opts.hitId;
  if (!opts.noOutline) {
    const edges = new THREE.EdgesGeometry(geo, opts.edgeAngle ?? 24);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: opts.outlineColor ?? INK_COLOR })
    );
    mesh.add(line);
  }
  parent.add(mesh);
  return mesh;
}

function addBox(THREE, parent, w, h, d, color, x = 0, y = 0, z = 0, opts = {}) {
  return addOutlined(THREE, parent, new THREE.BoxGeometry(w, h, d), makeMat(THREE, color, opts), x, y, z, opts);
}

function addCyl(THREE, parent, rt, rb, h, segs, color, x = 0, y = 0, z = 0, opts = {}) {
  return addOutlined(THREE, parent, new THREE.CylinderGeometry(rt, rb, h, segs), makeMat(THREE, color, opts), x, y, z, opts);
}

function makeCanvasLabel(THREE, lines, w, h, { bg = '#F8FAFC', fg = '#1E293B', accent = null, fontSize = 36, bolt = false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = Math.max(128, Math.round((256 * h) / w));
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (bolt) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) * 0.78;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#FACC15';
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#1E293B';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 8, cy - r * 0.58);
    ctx.lineTo(cx - r * 0.36, cy + 6);
    ctx.lineTo(cx + 2, cy + 6);
    ctx.lineTo(cx - 10, cy + r * 0.58);
    ctx.lineTo(cx + r * 0.38, cy - 8);
    ctx.lineTo(cx - 2, cy - 8);
    ctx.closePath();
    ctx.fillStyle = '#1E293B';
    ctx.fill();
  } else {
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const arr = Array.isArray(lines) ? lines : [lines];
    const lineH = fontSize * 1.22;
    const startY = canvas.height / 2 - ((arr.length - 1) * lineH) / 2;
    arr.forEach((txt, i) => {
      ctx.font = `900 ${i === 0 ? fontSize : Math.round(fontSize * 0.72)}px sans-serif`;
      ctx.fillStyle = (i > 0 && accent) ? accent : fg;
      ctx.fillText(txt, canvas.width / 2, startY + i * lineH);
    });
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({ map: tex });
  const geo = new THREE.PlaneGeometry(w, h);
  return new THREE.Mesh(geo, mat);
}

/** Build the warm cream workbench floor + subtle isometric grid lines */
export function buildWorkbenchFloor(THREE, scene) {
  const floorGeo = new THREE.PlaneGeometry(36, 36);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xFAF3E3, roughness: 0.96, metalness: 0 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(28, 28, 0xDFD3BC, 0xEAE0CC);
  grid.position.y = 0.006;
  scene.add(grid);
}

/** Reusable Power Supply Box (100V~) with clickable red power rocker */
function buildPowerBox(THREE, parent, x, z, hitId = 'power') {
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  // Rubber feet
  addBox(THREE, g, 0.28, 0.1, 0.28, 0x334155, -0.78, 0.05, -0.68);
  addBox(THREE, g, 0.28, 0.1, 0.28, 0x334155, 0.78, 0.05, -0.68);
  addBox(THREE, g, 0.28, 0.1, 0.28, 0x334155, -0.78, 0.05, 0.68);
  addBox(THREE, g, 0.28, 0.1, 0.28, 0x334155, 0.78, 0.05, 0.68);

  // Cream steel enclosure
  addBox(THREE, g, 1.9, 1.45, 1.65, 0xEFE7D5, 0, 0.82, 0);
  // Top bevel lid
  addBox(THREE, g, 1.96, 0.12, 1.71, 0xE6DCC5, 0, 1.56, 0);

  // Top label: でんげん 100V~
  const topLbl = makeCanvasLabel(THREE, ['でんげん', '100 V ~'], 1.25, 0.72, {
    bg: '#E6DCC5', fg: '#334155', accent: '#B91C1C', fontSize: 44
  });
  topLbl.rotation.x = -Math.PI / 2;
  topLbl.position.set(0, 1.63, 0);
  g.add(topLbl);

  // Front ventilation slits & yellow lightning bolt badge
  for (let i = 0; i < 4; i++) {
    addBox(THREE, g, 0.48, 0.07, 0.04, 0x334155, -0.45, 0.56 + i * 0.17, 0.84, { noOutline: true });
  }
  const boltLbl = makeCanvasLabel(THREE, '', 0.64, 0.64, { bg: '#EFE7D5', bolt: true });
  boltLbl.position.set(0.32, 0.82, 0.835);
  g.add(boltLbl);

  // Cable glands on right side
  addCyl(THREE, g, 0.14, 0.14, 0.22, 10, 0x475569, 1.0, 0.52, -0.32, { rz: Math.PI / 2 });
  addCyl(THREE, g, 0.14, 0.14, 0.22, 10, 0x475569, 1.0, 0.52, 0.34, { rz: Math.PI / 2 });

  // Red power rocker switch on right side (clickable!)
  addBox(THREE, g, 0.14, 0.52, 0.38, 0x1E293B, 0.98, 1.12, 0.02, { hitId });
  const pivot = new THREE.Group();
  pivot.position.set(1.06, 1.12, 0.02);
  const rocker = addBox(THREE, pivot, 0.22, 0.42, 0.28, 0xEF4444, 0.06, 0, 0, { hitId });
  // Invisible larger tap hitbox for little fingers
  const hitBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 1.0, 0.9),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitBox.position.set(0.2, 0, 0);
  hitBox.userData.hitId = hitId;
  pivot.add(hitBox);
  g.add(pivot);

  // Status LED on top front corner
  const ledMat = makeMat(THREE, 0x22C55E, { emissive: 0x22C55E, emissiveIntensity: 0 });
  const led = addCyl(THREE, g, 0.08, 0.08, 0.08, 10, 0x22C55E, 0.68, 1.65, 0.54, { noOutline: true });
  led.material = ledMat;

  parent.add(g);
  return { group: g, leverPivot: pivot, rocker, ledMat };
}

/** Wooden base rocker switch (white or green lever) */
function buildRockerSwitch(THREE, parent, x, z, hitId, { leverColor = 0xF8FAFC, ry = 0, label = '' } = {}) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;

  // Wooden base
  addBox(THREE, g, 1.9, 0.22, 1.05, 0xC6935B, 0, 0.11, 0);
  // White vertical backplate
  addBox(THREE, g, 1.5, 0.68, 0.1, 0xF1F5F9, 0, 0.55, -0.34);

  // Brass terminal blocks & screw heads
  addBox(THREE, g, 0.34, 0.2, 0.34, 0x9A7B2C, -0.68, 0.3, 0.05);
  addBox(THREE, g, 0.34, 0.2, 0.34, 0x9A7B2C, 0.68, 0.3, 0.05);
  addCyl(THREE, g, 0.09, 0.09, 0.08, 10, 0x64748B, -0.68, 0.43, 0.05);
  addCyl(THREE, g, 0.09, 0.09, 0.08, 10, 0x64748B, 0.68, 0.43, 0.05);

  // Brass center contact bar
  addBox(THREE, g, 1.12, 0.1, 0.16, 0xB48E32, 0, 0.27, 0.05);

  // Rotating rocker lever pivot
  const pivot = new THREE.Group();
  pivot.position.set(0, 0.42, 0.05);
  addBox(THREE, pivot, 0.18, 0.28, 0.18, 0x64748B, 0, 0.04, 0, { hitId });
  addBox(THREE, pivot, 0.92, 0.24, 0.34, leverColor, 0, 0.24, 0, { hitId });

  // Generous tap hitbox
  const hitMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 1.2, 1.3),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitMesh.position.set(0, 0.35, 0);
  hitMesh.userData.hitId = hitId;
  pivot.add(hitMesh);
  g.add(pivot);

  if (label) {
    const lbl = makeCanvasLabel(THREE, label, 1.15, 0.32, { bg: '#C6935B', fg: '#3E2723', fontSize: 38 });
    lbl.rotation.x = -Math.PI / 2;
    lbl.position.set(0, 0.23, 0.34);
    g.add(lbl);
  }

  parent.add(g);
  return { group: g, leverPivot: pivot };
}

/** Wooden base ceramic socket + glowing glass lightbulb */
function buildLightBulb(THREE, parent, x, z, hitId = null) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  // Wooden base
  addBox(THREE, g, 1.18, 0.22, 1.18, 0xC6935B, 0, 0.11, 0);
  // Brass terminals
  addCyl(THREE, g, 0.09, 0.09, 0.16, 8, 0xB48E32, -0.44, 0.27, 0);
  addCyl(THREE, g, 0.09, 0.09, 0.16, 8, 0xB48E32, 0.44, 0.27, 0);
  // Ceramic & metal screw socket
  addCyl(THREE, g, 0.28, 0.32, 0.24, 14, 0xE2E8F0, 0, 0.34, 0);
  addCyl(THREE, g, 0.22, 0.24, 0.26, 14, 0x94A3B8, 0, 0.56, 0);

  // Inner glowing filament core
  const filMat = makeMat(THREE, 0xFDE047, { emissive: 0xF59E0B, emissiveIntensity: 0 });
  const filMesh = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 8, 16, Math.PI), filMat);
  filMesh.position.set(0, 0.96, 0);
  g.add(filMesh);

  // Glass bulb globe
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xFFFDF0,
    roughness: 0.18,
    metalness: 0.05,
    emissive: 0xFACC15,
    emissiveIntensity: 0,
    transparent: true,
    opacity: 0.84
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 14), glassMat);
  bulb.position.set(0, 1.0, 0);
  bulb.castShadow = true;
  // Crisp dark rim ring for toon look
  const rim = new THREE.Mesh(
    new THREE.SphereGeometry(0.395, 16, 12),
    new THREE.MeshBasicMaterial({ color: INK_COLOR, side: THREE.BackSide })
  );
  bulb.add(rim);
  if (hitId) bulb.userData.hitId = hitId;
  g.add(bulb);

  // Soft outer halo sphere (visible when lit)
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xFEF08A,
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.62, 14, 12), haloMat);
  halo.position.set(0, 1.0, 0);
  g.add(halo);

  parent.add(g);
  return { group: g, filMat, glassMat, haloMat, glow: 0, targetGlow: 0 };
}

/** 3D curved insulated wire tube + floor clips + animated yellow current pulses */
function buildWire(THREE, parent, pts, color, pulseCount = 8, clipIndices = []) {
  const g = new THREE.Group();
  const vecs = pts.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const curve = new THREE.CatmullRomCurve3(vecs, false, 'catmullrom', 0.2);

  const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.085, 10, false);
  const tubeMat = makeMat(THREE, color, { roughness: 0.55 });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  tube.castShadow = true;
  // Ink silhouette around wire tube
  const outGeo = new THREE.TubeGeometry(curve, 36, 0.108, 10, false);
  const outMesh = new THREE.Mesh(outGeo, new THREE.MeshBasicMaterial({ color: INK_COLOR, side: THREE.BackSide }));
  tube.add(outMesh);
  g.add(tube);

  // Floor cable clips
  for (const frac of clipIndices) {
    const p = curve.getPointAt(frac);
    const tang = curve.getTangentAt(frac);
    const clip = addBox(THREE, g, 0.28, 0.12, 0.12, 0x334155, p.x, 0.06, p.z, { noOutline: true });
    clip.rotation.y = Math.atan2(tang.x, tang.z);
  }

  // Animated yellow current pulses along curve
  const pulses = [];
  const pGeo = new THREE.SphereGeometry(0.115, 8, 8);
  const pMat = new THREE.MeshBasicMaterial({ color: 0xFACC15 });
  for (let i = 0; i < pulseCount; i++) {
    const m = new THREE.Mesh(pGeo, pMat);
    m.visible = false;
    g.add(m);
    pulses.push(m);
  }

  parent.add(g);
  return { group: g, curve, pulses, active: false, speed: 0.45, dir: 1, phase: 0 };
}

/** Build the interactive 3D Distribution Board (Breaker Box) — Stage 4 */
function buildDistributionBoard(THREE, parent, registerSprout) {
  const root = new THREE.Group();
  root.position.set(0, 0, -0.3);
  parent.add(root);

  // Back mounting wall panel
  const wall = new THREE.Group();
  addBox(THREE, wall, 5.4, 3.6, 0.24, 0xEFE5CF, 0, 1.85, -0.62);
  root.add(wall);
  registerSprout(wall, 0.04);

  // Grey steel breaker cabinet enclosure
  const cab = new THREE.Group();
  addBox(THREE, cab, 4.4, 2.95, 0.18, 0x475569, 0, 1.85, -0.42); // back interior
  addBox(THREE, cab, 4.6, 0.22, 0.92, 0xCBD5E1, 0, 3.36, 0.02);  // top frame
  addBox(THREE, cab, 4.6, 0.22, 0.92, 0xCBD5E1, 0, 0.34, 0.02);  // bottom frame
  addBox(THREE, cab, 0.22, 2.95, 0.92, 0xCBD5E1, -2.19, 1.85, 0.02); // left wall
  addBox(THREE, cab, 0.22, 2.95, 0.92, 0xCBD5E1, 2.19, 1.85, 0.02);  // right wall
  // DIN rail bar inside
  addBox(THREE, cab, 3.9, 0.18, 0.12, 0x94A3B8, 0, 2.08, -0.28);
  root.add(cab);
  registerSprout(cab, 0.12);

  // Hinged left metal door (opens/closes smoothly on tap!)
  const doorPivot = new THREE.Group();
  doorPivot.position.set(-2.22, 1.85, 0.48);
  addBox(THREE, doorPivot, 2.2, 2.9, 0.1, 0xCBD5E1, 1.1, 0, 0, { hitId: 'door' });
  addBox(THREE, doorPivot, 0.12, 0.42, 0.16, 0x334155, 2.02, 0, 0.08, { hitId: 'door' }); // handle
  const doorLbl = makeCanvasLabel(THREE, ['ぶんでんばん', '100 V ~'], 1.4, 0.8, {
    bg: '#CBD5E1', fg: '#1E293B', accent: '#0F172A', fontSize: 36
  });
  doorLbl.position.set(1.1, 0.3, 0.06);
  doorPivot.add(doorLbl);
  const doorLblBack = makeCanvasLabel(THREE, ['ぶんでんばん'], 1.4, 0.6, {
    bg: '#CBD5E1', fg: '#334155', fontSize: 38
  });
  doorLblBack.rotation.y = Math.PI;
  doorLblBack.position.set(1.1, 0.3, -0.06);
  doorPivot.add(doorLblBack);
  root.add(doorPivot);
  registerSprout(doorPivot, 0.22);

  // Helper to build a realistic DIN-rail breaker module
  const makeBreaker = (xPos, w, topText, subText, leverColor, hitId, delay, hasTestBtn = false) => {
    const bg = new THREE.Group();
    bg.position.set(xPos, 2.08, -0.04);

    addBox(THREE, bg, w, 1.18, 0.52, 0xF8FAFC, 0, 0, 0, { hitId });
    const lbl = makeCanvasLabel(THREE, subText ? [topText, subText] : [topText], w * 0.88, 0.38, {
      bg: '#F8FAFC', fg: '#0F172A', accent: '#64748B', fontSize: topText.length > 3 ? 42 : 56
    });
    lbl.position.set(0, 0.34, 0.27);
    bg.add(lbl);

    // Status indicator window (red=ON, green=OFF)
    const winMat = makeMat(THREE, 0xEF4444);
    const win = addBox(THREE, bg, w * 0.38, 0.12, 0.05, 0xEF4444, 0, -0.38, 0.26, { noOutline: true });
    win.material = winMat;

    // Rotating breaker toggle lever
    const leverPivot = new THREE.Group();
    leverPivot.position.set(0, -0.06, 0.24);
    addBox(THREE, leverPivot, w * 0.64, 0.24, 0.32, leverColor, 0, 0, 0.14, { hitId });
    const hitBox = new THREE.Mesh(
      new THREE.BoxGeometry(w * 1.05, 1.25, 0.8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitBox.userData.hitId = hitId;
    leverPivot.add(hitBox);
    bg.add(leverPivot);

    // Optional yellow RCD Test button
    let testBtnMesh = null;
    if (hasTestBtn) {
      testBtnMesh = addBox(THREE, bg, 0.24, 0.24, 0.18, 0xFACC15, -0.22, 0.06, 0.3, { hitId: 'rcd-test' });
      const tHit = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.45, 0.5),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      tHit.position.set(-0.22, 0.06, 0.35);
      tHit.userData.hitId = 'rcd-test';
      bg.add(tHit);
    }

    root.add(bg);
    registerSprout(bg, delay);
    return { group: bg, leverPivot, winMat, testBtnMesh, angle: 0, targetAngle: 0 };
  };

  const breakers = {
    main: makeBreaker(-1.46, 0.78, 'メイン', '100V', 0xEF4444, 'brk-main', 0.30),
    rcd:  makeBreaker(-0.62, 0.78, 'RCD',   'ろうでん', 0x1E293B, 'brk-rcd', 0.38, true),
    b32:  makeBreaker(0.16,  0.48, 'B32',   'エアコン', 0x1E293B, 'brk-b32', 0.46),
    b20:  makeBreaker(0.68,  0.48, 'B20',   'キッチン', 0x1E293B, 'brk-b20', 0.52),
    b16:  makeBreaker(1.20,  0.48, 'B16',   'リビング', 0x1E293B, 'brk-b16', 0.58),
    b6:   makeBreaker(1.72,  0.48, 'B6',    'あかり',   0x1E293B, 'brk-b6',  0.64)
  };

  // Bottom Neutral (N - Blue) and Earth (PE - Green) brass terminal bars
  const bars = new THREE.Group();
  addBox(THREE, bars, 0.34, 0.28, 0.22, 0x2563EB, -1.56, 0.82, -0.14);
  addBox(THREE, bars, 1.35, 0.24, 0.24, 0xB48E32, -0.72, 0.82, -0.14);
  addBox(THREE, bars, 0.34, 0.28, 0.22, 0x16A34A, 0.38, 0.82, -0.14);
  addBox(THREE, bars, 1.35, 0.24, 0.24, 0xB48E32, 1.22, 0.82, -0.14);
  for (let i = 0; i < 5; i++) {
    addCyl(THREE, bars, 0.06, 0.06, 0.08, 8, 0xE2E8F0, -1.2 + i * 0.24, 0.82, -0.01, { rx: Math.PI / 2, noOutline: true });
    addCyl(THREE, bars, 0.06, 0.06, 0.08, 8, 0xE2E8F0, 0.74 + i * 0.24, 0.82, -0.01, { rx: Math.PI / 2, noOutline: true });
  }
  root.add(bars);
  registerSprout(bars, 0.70);

  // Internal realistic wiring tubes
  const wires = {
    supply: buildWire(THREE, root, [[-1.92, 0.5, -0.18], [-1.92, 2.95, -0.18], [-1.52, 2.95, -0.14], [-1.52, 2.66, -0.14]], 0x9A5B2C, 7),
    rcdBus: buildWire(THREE, root, [[-1.46, 1.48, -0.14], [-1.46, 1.22, -0.14], [-0.62, 1.22, -0.14], [-0.62, 1.48, -0.14]], 0xEA580C, 5),
    topBus: buildWire(THREE, root, [[-0.62, 2.66, -0.14], [-0.62, 2.95, -0.14], [0.16, 2.95, -0.14], [1.72, 2.95, -0.14]], 0xD97706, 8),
    neutral: buildWire(THREE, root, [[-1.82, 0.5, -0.22], [-1.82, 2.84, -0.22], [1.94, 2.84, -0.22], [1.94, 1.06, -0.18], [-0.72, 1.06, -0.14]], 0x2563EB, 10),
    earth:  buildWire(THREE, root, [[-1.72, 0.54, -0.16], [0.4, 0.54, -0.16], [1.6, 0.54, -0.16]], 0x84CC16, 4)
  };
  Object.values(wires).forEach((w, idx) => registerSprout(w.group, 0.74 + idx * 0.05));

  return { root, doorPivot, breakers, wires };
}

/**
 * Main stage factory for PowerLabGame
 */
export function buildPowerLabStage(THREE, stageRoot, stageId, onSproutPop) {
  const sprouts = [];
  const registerSprout = (obj, delay) => {
    const baseScale = obj.scale.clone();
    obj.scale.set(0.001, 0.001, 0.001);
    sprouts.push({ obj, baseScale, delay, done: false, popped: false });
  };

  let data = { stageId, wires: {}, bulbs: {}, switches: {}, panel: null, meterAnchors: [] };

  if (stageId === 'basic') {
    const pwr = buildPowerBox(THREE, stageRoot, -2.55, -0.55, 'power');
    const sw = buildRockerSwitch(THREE, stageRoot, 0.75, -0.75, 'sw1', { leverColor: 0xF8FAFC });
    const bulb = buildLightBulb(THREE, stageRoot, 2.25, 1.05);

    const wLive1 = buildWire(THREE, stageRoot, [[-1.55, 0.52, -0.87], [-0.95, 0.92, -0.85], [-0.35, 0.42, -0.75], [0.07, 0.34, -0.7]], 0x9A5B2C, 6);
    const wLive2 = buildWire(THREE, stageRoot, [[1.43, 0.34, -0.7], [2.15, 0.48, -0.3], [2.5, 0.32, 0.45], [2.25, 0.28, 0.68]], 0x9A5B2C, 6);
    const wNeut  = buildWire(THREE, stageRoot, [[-1.55, 0.52, -0.21], [-1.35, 0.1, 0.35], [-1.5, 0.1, 1.35], [1.65, 0.1, 1.85], [1.85, 0.26, 1.15]], 0x2563EB, 10, [0.22, 0.42, 0.62, 0.8]);

    registerSprout(pwr.group, 0.04);
    registerSprout(sw.group, 0.16);
    registerSprout(bulb.group, 0.28);
    registerSprout(wLive1.group, 0.38);
    registerSprout(wLive2.group, 0.46);
    registerSprout(wNeut.group, 0.54);

    data.switches = { power: pwr, sw1: sw };
    data.bulbs = { b1: bulb };
    data.wires = { wLive1, wLive2, wNeut };
    data.meterAnchors = [{ id: 'm1', pos: new THREE.Vector3(2.25, 2.05, 1.05) }];
  } else if (stageId === 'series') {
    const pwr = buildPowerBox(THREE, stageRoot, -2.75, -0.75, 'power');
    const modeSw = buildRockerSwitch(THREE, stageRoot, -0.15, -1.65, 'mode', { leverColor: 0x22C55E, label: 'ちょく/へい' });
    const b1 = buildLightBulb(THREE, stageRoot, 0.25, 0.35, 'b1-toggle');
    const b2 = buildLightBulb(THREE, stageRoot, 2.45, 0.85, 'b2-toggle');

    const wSupply = buildWire(THREE, stageRoot, [[-1.75, 0.52, -1.07], [-1.3, 0.72, -1.45], [-0.83, 0.34, -1.6]], 0x9A5B2C, 5);
    const wToB1   = buildWire(THREE, stageRoot, [[0.53, 0.34, -1.6], [0.75, 0.32, -0.65], [0.25, 0.28, -0.05]], 0x9A5B2C, 5);
    const wMid    = buildWire(THREE, stageRoot, [[0.68, 0.28, 0.35], [1.35, 0.58, 0.6], [2.02, 0.28, 0.85]], 0x475569, 6);
    const wPar    = buildWire(THREE, stageRoot, [[0.53, 0.34, -1.6], [2.25, 0.42, -1.0], [2.45, 0.28, 0.42]], 0xEA580C, 7);
    const wRet    = buildWire(THREE, stageRoot, [[-1.75, 0.52, -0.41], [-1.6, 0.1, 0.85], [-1.25, 0.1, 1.75], [2.2, 0.1, 1.95], [2.45, 0.28, 1.25]], 0x2563EB, 11, [0.28, 0.5, 0.72]);

    registerSprout(pwr.group, 0.04);
    registerSprout(modeSw.group, 0.14);
    registerSprout(b1.group, 0.24);
    registerSprout(b2.group, 0.34);
    registerSprout(wSupply.group, 0.42);
    registerSprout(wToB1.group, 0.48);
    registerSprout(wMid.group, 0.54);
    registerSprout(wPar.group, 0.60);
    registerSprout(wRet.group, 0.66);

    data.switches = { power: pwr, mode: modeSw };
    data.bulbs = { b1, b2 };
    data.wires = { wSupply, wToB1, wMid, wPar, wRet };
    data.meterAnchors = [
      { id: 'm1', pos: new THREE.Vector3(0.25, 2.05, 0.35) },
      { id: 'm2', pos: new THREE.Vector3(2.45, 2.05, 0.85) }
    ];
  } else if (stageId === 'stairs') {
    const pwr = buildPowerBox(THREE, stageRoot, -2.85, -0.55, 'power');
    const sw1 = buildRockerSwitch(THREE, stageRoot, -0.35, -1.2, 'sw1', { leverColor: 0xF8FAFC, label: '1かい' });
    const sw2 = buildRockerSwitch(THREE, stageRoot, 1.95, -0.65, 'sw2', { leverColor: 0xF8FAFC, label: '2かい' });
    const bulb = buildLightBulb(THREE, stageRoot, 1.15, 1.35);

    const wIn  = buildWire(THREE, stageRoot, [[-1.85, 0.52, -0.87], [-1.45, 0.65, -1.1], [-1.03, 0.34, -1.15]], 0x9A5B2C, 5);
    const wTrA = buildWire(THREE, stageRoot, [[0.33, 0.34, -1.35], [0.85, 0.42, -1.65], [1.27, 0.34, -0.85]], 0xD97706, 6);
    const wTrB = buildWire(THREE, stageRoot, [[0.33, 0.34, -1.0], [0.8, 0.22, -0.6], [1.27, 0.34, -0.48]], 0x334155, 6);
    const wOut = buildWire(THREE, stageRoot, [[2.63, 0.34, -0.6], [2.75, 0.25, 0.85], [1.58, 0.28, 1.35]], 0x9A5B2C, 7);
    const wRet = buildWire(THREE, stageRoot, [[-1.85, 0.52, -0.21], [-1.7, 0.1, 1.25], [0.45, 0.1, 1.65], [0.72, 0.28, 1.35]], 0x2563EB, 9, [0.28, 0.56, 0.8]);

    registerSprout(pwr.group, 0.04);
    registerSprout(sw1.group, 0.15);
    registerSprout(sw2.group, 0.26);
    registerSprout(bulb.group, 0.37);
    registerSprout(wIn.group, 0.46);
    registerSprout(wTrA.group, 0.52);
    registerSprout(wTrB.group, 0.58);
    registerSprout(wOut.group, 0.64);
    registerSprout(wRet.group, 0.70);

    data.switches = { power: pwr, sw1, sw2 };
    data.bulbs = { b1: bulb };
    data.wires = { wIn, wTrA, wTrB, wOut, wRet };
    data.meterAnchors = [{ id: 'm1', pos: new THREE.Vector3(1.15, 2.3, 1.35) }];
  } else if (stageId === 'panel') {
    data.panel = buildDistributionBoard(THREE, stageRoot, registerSprout);
    data.wires = data.panel.wires;
    data.meterAnchors = [{ id: 'm1', pos: new THREE.Vector3(0, 3.85, 0) }];
  }

  // Update function for nyoki-nyoki sprouting entrance animation
  data.sproutTime = 0;
  data.updateSprouts = (dt) => {
    data.sproutTime += dt;
    let allDone = true;
    sprouts.forEach((s, idx) => {
      if (s.done) return;
      const localT = (data.sproutTime - s.delay) / 0.42;
      if (localT <= 0) {
        allDone = false;
        return;
      }
      if (!s.popped) {
        s.popped = true;
        if (onSproutPop) onSproutPop(idx);
      }
      if (localT >= 1) {
        s.obj.scale.copy(s.baseScale);
        s.done = true;
        return;
      }
      allDone = false;
      // Squash & stretch nyoki-nyoki growth (Y stretches up first, X/Z follow elastically)
      const sy = Math.max(0.01, easeOutBack(localT));
      const sxz = Math.max(0.01, easeOutBack(Math.min(1, localT * 1.12)));
      s.obj.scale.set(s.baseScale.x * sxz, s.baseScale.y * sy, s.baseScale.z * sxz);
    });
    return allDone;
  };

  data.replaySprouts = () => {
    data.sproutTime = 0;
    sprouts.forEach((s) => {
      s.done = false;
      s.popped = false;
      s.obj.scale.set(0.001, 0.001, 0.001);
    });
  };

  return data;
}
