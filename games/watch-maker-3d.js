/* =========================================================================
   WATCH MAKER 3D VIEWER — True Three.js 3D Models for All 9 Clocks
   Full 360-degree orbit inspection, real 3D geometry per model (curved
   Apple Watch Sport Band & Digital Crown, pitched-roof Cuckoo House,
   Steampunk Pipes & Valve, Pendulum Cabinet, Extruded Gears), live
   real-time hands/OLED clock, and smooth exploded internal cutaway view.
   ========================================================================= */

const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
let cachedThree = null;

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** Build rounded-rectangle THREE.Shape centered at (0,0) */
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

/** Build real extruded 3D gear mesh with teeth */
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
  hole.absarc(0, 0, Math.max(0.06, innerR * 0.26), 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 2
  });
  geo.center();
  const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.55, roughness: 0.3 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  // Center ruby axle jewel
  const ruby = new THREE.Mesh(
    new THREE.CylinderGeometry(innerR * 0.16, innerR * 0.16, depth + 0.05, 12),
    new THREE.MeshStandardMaterial({ color: 0xE11D48, metalness: 0.2, roughness: 0.2 })
  );
  ruby.rotation.x = Math.PI / 2;
  mesh.add(ruby);
  return mesh;
}

/** High-DPI canvas dial texture for analog clocks */
function makeAnalogDialTexture(THREE, clockId) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  const cx = 256, cy = 256;

  const bgMap = {
    'wood-hygro':     '#FAF7EE',
    'square-brown':   '#FAF9F5',
    'cuckoo-white':   '#FFFFFF',
    'steampunk-pipe': '#F4F4F5',
    'modern-black':   '#F8FAFC',
    'pendulum-clock': '#FFFDF5',
    'vintage-gold':   '#FEF9E7',
    'round-radio':    '#FFFFFF'
  };
  ctx.fillStyle = bgMap[clockId] || '#FFFFFF';
  ctx.fillRect(0, 0, 512, 512);

  // Minute ticks
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 - 90) * Math.PI / 180;
    const isHour = i % 5 === 0;
    const r1 = isHour ? 202 : 212;
    const r2 = 228;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.strokeStyle = isHour ? '#18181B' : '#64748B';
    ctx.lineWidth = isHour ? 6 : 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Numbers
  ctx.fillStyle = clockId === 'vintage-gold' ? '#78350F' : '#18181B';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const font = (clockId === 'square-brown' || clockId === 'vintage-gold' || clockId === 'pendulum-clock')
    ? '700 44px Georgia, serif'
    : '900 42px sans-serif';
  ctx.font = font;
  const labels = clockId === 'steampunk-pipe'
    ? ['', '', '3', '', '', '6', '', '', '9', '', '', '12']
    : ['1','2','3','4','5','6','7','8','9','10','11','12'];
  labels.forEach((lbl, i) => {
    if (!lbl) return;
    const a = ((i + 1) * 30 - 90) * Math.PI / 180;
    ctx.fillText(lbl, cx + Math.cos(a) * 164, cy + Math.sin(a) * 164);
  });

  // Model-specific dial details
  if (clockId === 'wood-hygro') {
    // Mini thermometer & hygrometer subdials
    ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(178, 300, 40, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(334, 300, 40, 0, Math.PI * 2); ctx.stroke();
    ctx.font = '800 18px sans-serif'; ctx.fillStyle = '#0284C7';
    ctx.fillText('55%', 178, 304);
    ctx.fillStyle = '#EA580C';
    ctx.fillText('22°', 334, 304);
  } else if (clockId === 'steampunk-pipe') {
    ctx.font = '800 22px monospace'; ctx.fillStyle = '#71717A';
    ctx.fillText('BAR / PSI', cx, 342);
    ctx.strokeStyle = '#71717A'; ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.arc(cx, cy, 86, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  } else if (clockId === 'round-radio') {
    ctx.font = '800 20px sans-serif'; ctx.fillStyle = '#0284C7';
    ctx.fillText('RADIO CONTROL', cx, 336);
  } else {
    ctx.font = '800 19px sans-serif'; ctx.fillStyle = '#64748B';
    ctx.fillText('QUARTZ', cx, 338);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Dynamic canvas texture for Apple Watch Numerals Duo OLED display */
function createAppleWatchScreen(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  const draw = (hh, mm, dotAlpha = 1) => {
    // Top cyan half
    ctx.fillStyle = '#0EA5E9';
    ctx.fillRect(0, 0, 512, 320);
    // Bottom light blue half
    ctx.fillStyle = '#93C5FD';
    ctx.fillRect(0, 320, 512, 320);

    // Huge bold Numerals Duo typography matching photo
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 280px sans-serif';
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText(hh, 256, 178);
    ctx.fillStyle = '#09090B';
    ctx.fillText(mm, 256, 478);

    // Subtle green active pulse dot in top-right
    ctx.beginPath();
    ctx.arc(432, 74, 16, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(74, 222, 128, ${dotAlpha.toFixed(2)})`;
    ctx.fill();

    tex.needsUpdate = true;
  };
  const d = new Date();
  draw(String(d.getHours()).padStart(2, '0'), String(d.getMinutes()).padStart(2, '0'), 1);
  return { tex, draw };
}

/** Build 3D label texture for electronic components (S10 SiP, Battery, Taptic) */
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

/** Build 3D clock hands assembly */
function build3DHands(THREE, parent, radius, style = 'dark') {
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x18181B, metalness: 0.4, roughness: 0.35 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, metalness: 0.25, roughness: 0.4 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xD97706, metalness: 0.7, roughness: 0.25 });

  const makePivotHand = (w, len, tail, z, mat) => {
    const p = new THREE.Group();
    p.position.z = z;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, len + tail, 0.03), mat);
    mesh.position.y = (len - tail) / 2;
    mesh.castShadow = true;
    p.add(mesh);
    parent.add(p);
    return p;
  };

  const hour = makePivotHand(0.095, radius * 0.52, 0.14, 0.05, darkMat);
  const minute = makePivotHand(0.068, radius * 0.76, 0.18, 0.09, darkMat);
  const second = makePivotHand(0.028, radius * 0.82, 0.24, 0.13, style === 'red-sec' ? redMat : darkMat);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.16, 16), goldMat);
  cap.rotation.x = Math.PI / 2;
  cap.position.z = 0.09;
  parent.add(cap);

  return { hour, minute, second };
}

/** Build authentic Apple Watch 3D model (Midnight Aluminum + Curved Sport Band + Internals) */
function buildAppleWatch3D(THREE, root) {
  const anim = { gears: [], explodeParts: [] };
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.65, roughness: 0.28 });
  const bandMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.78, metalness: 0.05 });
  const pinMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.85, roughness: 0.2 });

  // 1. Main Midnight Aluminum Unibody Case (rounded squircle extrusion with bevel)
  const caseShape = makeRoundedRectShape(THREE, 2.05, 2.52, 0.56);
  const caseGeo = new THREE.ExtrudeGeometry(caseShape, {
    depth: 0.54,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.09,
    bevelSegments: 5
  });
  caseGeo.center();
  const caseMesh = new THREE.Mesh(caseGeo, bodyMat);
  caseMesh.castShadow = true;
  root.add(caseMesh);

  // 2. Curved Wrist-Loop Fluoroelastomer Sport Band (real curved loop around wrist!)
  const bandPoints = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const ang = (t - 0.5) * Math.PI * 1.72; // wraps cleanly from top lug around back to bottom lug
    const y = Math.sin(ang) * 2.15;
    const z = Math.cos(ang) * 1.48 - 1.56;
    bandPoints.push(new THREE.Vector3(0, y, z));
  }
  const bandCurve = new THREE.CatmullRomCurve3(bandPoints);
  const bandGeo = new THREE.TubeGeometry(bandCurve, 44, 0.11, 10, false);
  // Flatten tube horizontally into wide watch strap profile!
  bandGeo.scale(5.2, 1.0, 0.72);
  const bandMesh = new THREE.Mesh(bandGeo, bandMat);
  bandMesh.castShadow = true;
  root.add(bandMesh);

  // Stainless steel pin-and-tuck clasp on back of strap
  const claspPin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 20), pinMat);
  claspPin.rotation.x = Math.PI / 2;
  claspPin.position.set(0, -0.1, -3.08);
  root.add(claspPin);

  // 3. Right side: Knurled 3D Digital Crown (spins!) + Side Button + Mic hole
  const crownPivot = new THREE.Group();
  crownPivot.position.set(1.16, 0.52, 0.02);
  const crownDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.2, 20), bodyMat);
  crownDrum.rotation.z = Math.PI / 2;
  crownPivot.add(crownDrum);
  // Knurled grooves around crown rim
  const grooveMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.5, roughness: 0.4 });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const g = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.028, 0.03), grooveMat);
    g.position.set(0, Math.cos(a) * 0.235, Math.sin(a) * 0.235);
    crownPivot.add(g);
  }
  root.add(crownPivot);
  anim.awCrown = crownPivot;

  // Side pill button
  const sideBtn = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.62, 0.22), bodyMat);
  sideBtn.position.set(1.1, -0.45, 0.02);
  root.add(sideBtn);

  // Left side: Dual speaker acoustic slits
  const slitMat = new THREE.MeshBasicMaterial({ color: 0x09090B });
  const slit1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.09), slitMat);
  slit1.position.set(-1.1, 0.25, 0.02);
  const slit2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.09), slitMat);
  slit2.position.set(-1.1, -0.25, 0.02);
  root.add(slit1, slit2);

  // 4. Back Ceramic Dome + Optical Heart Rate / SpO2 Sensor Cluster
  const backDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45),
    new THREE.MeshStandardMaterial({ color: 0x09090B, metalness: 0.4, roughness: 0.15 })
  );
  backDome.rotation.x = -Math.PI / 2;
  backDome.scale.set(1, 1, 0.35);
  backDome.position.set(0, 0, -0.34);
  root.add(backDome);

  const hrLedMat = new THREE.MeshStandardMaterial({ color: 0x22C55E, emissive: 0x22C55E, emissiveIntensity: 1.4 });
  const spLedMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, emissive: 0xEF4444, emissiveIntensity: 0.9 });
  [[-0.22, 0.18, hrLedMat], [0.22, 0.18, hrLedMat], [-0.22, -0.18, spLedMat], [0.22, -0.18, spLedMat]].forEach(([lx, ly, m]) => {
    const led = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 12), m);
    led.rotation.x = Math.PI / 2;
    led.position.set(lx, ly, -0.58);
    root.add(led);
  });
  anim.awHrMat = hrLedMat;

  // 5. Internal Precision Electronic Components (revealed when exploded!)
  const internalGroup = new THREE.Group();
  internalGroup.position.z = 0.04;
  root.add(internalGroup);

  // Wireless charging copper coil
  const coil = new THREE.Mesh(
    new THREE.TorusGeometry(0.56, 0.065, 10, 28),
    new THREE.MeshStandardMaterial({ color: 0xD97706, metalness: 0.75, roughness: 0.25 })
  );
  coil.position.set(0, 0, -0.12);
  internalGroup.add(coil);
  anim.explodeParts.push({ obj: coil, baseZ: -0.12, expZ: 0.42 });

  // S10 SiP logic board
  const sipTex = makeChipTexture(THREE, ['S10', 'SiP 64-BIT'], '#18181B', '#F8FAFC', '#38BDF8');
  const sip = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.86, 0.12),
    [
      new THREE.MeshStandardMaterial({ color: 0x27272A }), new THREE.MeshStandardMaterial({ color: 0x27272A }),
      new THREE.MeshStandardMaterial({ color: 0x27272A }), new THREE.MeshStandardMaterial({ color: 0x27272A }),
      new THREE.MeshStandardMaterial({ map: sipTex, roughness: 0.45 }), new THREE.MeshStandardMaterial({ color: 0x27272A })
    ]
  );
  sip.position.set(0, 0.46, 0.02);
  internalGroup.add(sip);
  anim.explodeParts.push({ obj: sip, baseZ: 0.02, expZ: 0.88 });

  // Taptic Engine (vibrates periodically!)
  const tapticTex = makeChipTexture(THREE, ['TAPTIC'], '#CBD5E1', '#0F172A', '#F59E0B');
  const taptic = new THREE.Mesh(
    new THREE.BoxGeometry(1.36, 0.42, 0.14),
    new THREE.MeshStandardMaterial({ map: tapticTex, metalness: 0.6, roughness: 0.3 })
  );
  taptic.position.set(0, -0.72, 0.02);
  internalGroup.add(taptic);
  anim.awTaptic = taptic;
  anim.explodeParts.push({ obj: taptic, baseZ: 0.02, expZ: 0.88 });

  // 327mAh Li-ion Battery
  const batTex = makeChipTexture(THREE, ['327mAh', '1.266 Wh'], '#18181B', '#4ADE80', '#64748B');
  const battery = new THREE.Mesh(
    new THREE.BoxGeometry(1.18, 0.78, 0.14),
    new THREE.MeshStandardMaterial({ map: batTex, roughness: 0.55 })
  );
  battery.position.set(0.06, -0.02, 0.16);
  internalGroup.add(battery);
  anim.explodeParts.push({ obj: battery, baseZ: 0.16, expZ: 1.38 });

  // 6. Front Numerals Duo LTPO OLED Screen + Ion-X Cover Glass
  const awScreen = createAppleWatchScreen(THREE);
  anim.awScreen = awScreen;
  const screenShape = makeRoundedRectShape(THREE, 1.78, 2.24, 0.44);
  const screenGeo = new THREE.ShapeGeometry(screenShape, 16);
  // Normalize UVs to [0, 1] for crisp canvas display mapping
  const posAttr = screenGeo.attributes.position;
  const uvs = new Float32Array(posAttr.count * 2);
  for (let i = 0; i < posAttr.count; i++) {
    uvs[i * 2] = (posAttr.getX(i) + 0.89) / 1.78;
    uvs[i * 2 + 1] = (posAttr.getY(i) + 1.12) / 2.24;
  }
  screenGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  const screenMat = new THREE.MeshBasicMaterial({ map: awScreen.tex, transparent: true, opacity: 1.0 });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.z = 0.41;
  root.add(screenMesh);
  anim.explodeParts.push({ obj: screenMesh, baseZ: 0.41, expZ: 2.02, fadeMat: screenMat });

  const glassGeo = new THREE.ExtrudeGeometry(makeRoundedRectShape(THREE, 1.88, 2.34, 0.48), {
    depth: 0.04, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3
  });
  glassGeo.center();
  const glassMesh = new THREE.Mesh(
    glassGeo,
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.22, roughness: 0.06, metalness: 0.15 })
  );
  glassMesh.position.z = 0.45;
  root.add(glassMesh);
  anim.explodeParts.push({ obj: glassMesh, baseZ: 0.45, expZ: 2.42 });

  return anim;
}

/** Build authentic 3D geometries for all 8 traditional/mechanical/quartz clocks */
function buildTraditionalClock3D(THREE, root, clockId) {
  const anim = { gears: [], explodeParts: [], hands: null };
  let dialRadius = 1.55;
  let dialY = 0;
  let frontZ = 0.45;

  if (clockId === 'cuckoo-white') {
    // Pitched-roof Cuckoo House 3D Cabinet!
    const houseShape = new THREE.Shape();
    houseShape.moveTo(-1.35, -1.75);
    houseShape.lineTo(1.35, -1.75);
    houseShape.lineTo(1.35, 0.65);
    houseShape.lineTo(0, 1.95);
    houseShape.lineTo(-1.35, 0.65);
    houseShape.closePath();
    const houseGeo = new THREE.ExtrudeGeometry(houseShape, {
      depth: 1.1, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 2
    });
    houseGeo.center();
    const house = new THREE.Mesh(houseGeo, new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.72 }));
    house.castShadow = true;
    root.add(house);

    // Overhanging pitched roof slabs
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.65 });
    const roofL = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.14, 1.42), roofMat);
    roofL.position.set(-0.78, 1.38, 0); roofL.rotation.z = Math.PI * 0.245;
    const roofR = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.14, 1.42), roofMat);
    roofR.position.set(0.78, 1.38, 0); roofR.rotation.z = -Math.PI * 0.245;
    root.add(roofL, roofR);

    // Cuckoo window + open shutters + 3D pop-out Cuckoo Bird!
    const winHole = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.56, 0.12), new THREE.MeshBasicMaterial({ color: 0x1E293B }));
    winHole.position.set(0, 1.05, 0.57);
    root.add(winHole);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.6 });
    const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.56, 0.06), doorMat);
    doorL.position.set(-0.4, 1.05, 0.72); doorL.rotation.y = -0.7;
    const doorR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.56, 0.06), doorMat);
    doorR.position.set(0.4, 1.05, 0.72); doorR.rotation.y = 0.7;
    root.add(doorL, doorR);

    const bird = new THREE.Group();
    bird.position.set(0, 1.02, 0.72);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), new THREE.MeshStandardMaterial({ color: 0x38BDF8, roughness: 0.5 }));
    body.scale.set(0.9, 0.9, 1.35);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 8), new THREE.MeshStandardMaterial({ color: 0xF59E0B }));
    beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.04, 0.28);
    bird.add(body, beak);
    root.add(bird);
    anim.cuckooBird = bird;

    // Hanging pendulum under house
    const pend = new THREE.Group();
    pend.position.set(0, -1.7, 0);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), new THREE.MeshStandardMaterial({ color: 0xD97706, metalness: 0.6 }));
    rod.position.y = -0.45;
    const bob = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0xFBBF24, metalness: 0.7, roughness: 0.25 }));
    bob.rotation.x = Math.PI / 2; bob.position.y = -0.9;
    pend.add(rod, bob);
    root.add(pend);
    anim.pendulum = pend;

    dialRadius = 0.92; dialY = -0.45; frontZ = 0.62;
  } else if (clockId === 'pendulum-clock') {
    // Tall wooden pendulum cabinet with upper dial box & lower glazed pendulum chamber
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x6D3224, roughness: 0.65 });
    const darkWood = new THREE.MeshStandardMaterial({ color: 0x3B1810, roughness: 0.7 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xFBBF24, metalness: 0.75, roughness: 0.25 });

    const backBox = new THREE.Mesh(new THREE.BoxGeometry(2.15, 3.6, 0.36), woodMat);
    backBox.position.set(0, -0.1, -0.32);
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.6, 0.92), woodMat);
    sideL.position.set(-0.98, -0.1, -0.04);
    const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.6, 0.92), woodMat);
    sideR.position.set(0.98, -0.1, -0.04);
    const topCap = new THREE.Mesh(new THREE.BoxGeometry(2.38, 0.26, 1.05), darkWood);
    topCap.position.set(0, 1.82, -0.02);
    const botCap = new THREE.Mesh(new THREE.BoxGeometry(2.38, 0.26, 1.05), darkWood);
    botCap.position.set(0, -2.02, -0.02);
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 14), goldMat);
    finial.position.set(0, 2.1, -0.02);
    root.add(backBox, sideL, sideR, topCap, botCap, finial);

    // Swinging brass pendulum inside lower chamber
    const pend = new THREE.Group();
    pend.position.set(0, 0.2, 0.04);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.65, 8), goldMat);
    rod.position.y = -0.82;
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.1, 24), goldMat);
    disc.rotation.x = Math.PI / 2; disc.position.y = -1.65;
    pend.add(rod, disc);
    root.add(pend);
    anim.pendulum = pend;

    // Lower glass window pane
    const winGlass = new THREE.Mesh(
      new THREE.BoxGeometry(1.75, 1.55, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.2, roughness: 0.08 })
    );
    winGlass.position.set(0, -1.05, 0.42);
    root.add(winGlass);
    anim.explodeParts.push({ obj: winGlass, baseZ: 0.42, expZ: 1.65 });

    dialRadius = 0.88; dialY = 0.82; frontZ = 0.46;
  } else if (clockId === 'steampunk-pipe') {
    // Heavy brass pressure-gauge drum + 3D metal plumbing pipes + red wheel valve!
    const brassMat = new THREE.MeshStandardMaterial({ color: 0x92400E, metalness: 0.65, roughness: 0.35 });
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x52525B, metalness: 0.72, roughness: 0.32 });
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.48, 0.88, 32), brassMat);
    drum.rotation.x = Math.PI / 2;
    drum.castShadow = true;
    root.add(drum);

    // 3D outer pipe frame wrapping around gauge
    const pipePts = [
      new THREE.Vector3(-1.95, -1.55, -0.05),
      new THREE.Vector3(-1.95, 1.55, -0.05),
      new THREE.Vector3(1.95, 1.55, -0.05),
      new THREE.Vector3(1.95, -1.55, -0.05),
      new THREE.Vector3(-0.35, -1.55, -0.05)
    ];
    const pipeCurve = new THREE.CatmullRomCurve3(pipePts, false, 'catmullrom', 0.12);
    const pipeMesh = new THREE.Mesh(new THREE.TubeGeometry(pipeCurve, 44, 0.16, 12, false), pipeMat);
    root.add(pipeMesh);

    // Red industrial valve wheel on bottom-left pipe!
    const valve = new THREE.Group();
    valve.position.set(-0.65, -1.55, 0.25);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xDC2626, roughness: 0.45, metalness: 0.2 });
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.075, 10, 24), redMat);
    const sp1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.06), redMat);
    const sp2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.06), redMat);
    valve.add(wheel, sp1, sp2);
    root.add(valve);
    anim.valveWheel = valve;

    dialRadius = 1.24; dialY = 0; frontZ = 0.46;
  } else if (clockId === 'square-brown') {
    // Stepped wooden square wall clock frame
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.68 });
    const frameGeo = new THREE.ExtrudeGeometry(makeRoundedRectShape(THREE, 3.25, 3.25, 0.26), {
      depth: 0.72, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 3
    });
    frameGeo.center();
    const frame = new THREE.Mesh(frameGeo, woodMat);
    frame.castShadow = true;
    root.add(frame);

    // Rear quartz battery box
    const rearBox = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.34), new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.7 }));
    rearBox.position.set(0, 0, -0.54);
    root.add(rearBox);

    dialRadius = 1.38; dialY = 0; frontZ = 0.44;
  } else {
    // Round framed wall clocks: wood-hygro, modern-black, vintage-gold, round-radio
    const frameColors = {
      'wood-hygro':   { c: 0xB45309, m: 0.08, r: 0.72 },
      'modern-black': { c: 0x18181B, m: 0.35, r: 0.52 },
      'vintage-gold': { c: 0xD4AF37, m: 0.78, r: 0.24 },
      'round-radio':  { c: 0xCBD5E1, m: 0.65, r: 0.28 }
    }[clockId] || { c: 0x475569, m: 0.3, r: 0.5 };

    const rimMat = new THREE.MeshStandardMaterial({ color: frameColors.c, metalness: frameColors.m, roughness: frameColors.r });
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.78, 1.72, 0.72, 40), rimMat);
    drum.rotation.x = Math.PI / 2;
    drum.castShadow = true;
    root.add(drum);

    // Sculpted outer bezel torus
    const bezel = new THREE.Mesh(new THREE.TorusGeometry(1.68, 0.14, 14, 40), rimMat);
    bezel.position.z = 0.34;
    root.add(bezel);

    // Rear quartz movement housing + AA battery
    const rearBox = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.15, 0.3), new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.7 }));
    rearBox.position.set(0, 0, -0.48);
    root.add(rearBox);

    // Radio clock floating 3D reception wave arcs on top
    if (clockId === 'round-radio') {
      const waveMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8, transparent: true, opacity: 0.85 });
      const w1 = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.045, 8, 20, Math.PI * 0.65), waveMat);
      w1.position.set(0, 1.98, 0); w1.rotation.z = Math.PI * 0.175;
      const w2 = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.04, 8, 20, Math.PI * 0.65), waveMat);
      w2.position.set(0, 1.98, 0); w2.rotation.z = Math.PI * 0.175;
      root.add(w1, w2);
      anim.radioWaveMat = waveMat;
    }

    dialRadius = 1.54; dialY = 0; frontZ = 0.42;
  }

  // Internal 3D Extruded Gear Train (visible when exploded!)
  const mechGroup = new THREE.Group();
  mechGroup.position.set(0, dialY, frontZ - 0.24);
  root.add(mechGroup);

  const gScale = dialRadius / 1.5;
  const gearSpecs = [
    { x: 0, y: 0, r: 0.48 * gScale, t: 18, c: 0xFBBF24, sp: 0.9 },
    { x: 0.56 * gScale, y: 0.34 * gScale, r: 0.34 * gScale, t: 14, c: 0xCBD5E1, sp: -1.4 },
    { x: -0.52 * gScale, y: 0.36 * gScale, r: 0.38 * gScale, t: 16, c: 0xEA580C, sp: -1.1 },
    { x: 0.36 * gScale, y: -0.52 * gScale, r: 0.3 * gScale, t: 12, c: 0xF59E0B, sp: 1.8 }
  ];
  gearSpecs.forEach((gs) => {
    const gm = make3DGear(THREE, gs.r, gs.r * 0.82, gs.t, 0.12, gs.c);
    gm.position.set(gs.x, gs.y, 0);
    mechGroup.add(gm);
    anim.gears.push({ mesh: gm, speed: gs.sp });
  });
  anim.explodeParts.push({ obj: mechGroup, baseZ: frontZ - 0.24, expZ: frontZ + 0.55 });

  // Dial Face Plate (slides forward + turns translucent when exploded!)
  const dialTex = makeAnalogDialTexture(THREE, clockId);
  const dialMat = new THREE.MeshStandardMaterial({ map: dialTex, roughness: 0.7, transparent: true, opacity: 1.0 });
  const dialGeo = clockId === 'square-brown'
    ? new THREE.BoxGeometry(dialRadius * 1.98, dialRadius * 1.98, 0.05)
    : new THREE.CylinderGeometry(dialRadius, dialRadius, 0.05, 40);
  const dialMesh = new THREE.Mesh(dialGeo, dialMat);
  if (clockId !== 'square-brown') {
    dialMesh.rotation.x = Math.PI / 2;
    dialMesh.rotation.y = -Math.PI / 2; // align 12 o'clock to +Y
  }
  dialMesh.position.set(0, dialY, frontZ);
  root.add(dialMesh);
  anim.explodeParts.push({ obj: dialMesh, baseZ: frontZ, expZ: frontZ + 1.35, fadeMat: dialMat });

  // 3D Clock Hands Group
  const handsGroup = new THREE.Group();
  handsGroup.position.set(0, dialY, frontZ + 0.04);
  root.add(handsGroup);
  anim.hands = build3DHands(THREE, handsGroup, dialRadius * 0.92, clockId === 'pendulum-clock' ? 'red-sec' : 'dark');
  anim.explodeParts.push({ obj: handsGroup, baseZ: frontZ + 0.04, expZ: frontZ + 1.75 });

  // Front Crystal Cover Glass
  const glassGeo = clockId === 'square-brown'
    ? new THREE.BoxGeometry(dialRadius * 2.02, dialRadius * 2.02, 0.05)
    : new THREE.CylinderGeometry(dialRadius * 1.02, dialRadius * 1.02, 0.05, 40);
  const glassMesh = new THREE.Mesh(
    glassGeo,
    new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.2, roughness: 0.06, metalness: 0.15 })
  );
  if (clockId !== 'square-brown') glassMesh.rotation.x = Math.PI / 2;
  glassMesh.position.set(0, dialY, frontZ + 0.22);
  root.add(glassMesh);
  anim.explodeParts.push({ obj: glassMesh, baseZ: frontZ + 0.22, expZ: frontZ + 2.25 });

  return anim;
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

    this.yaw = -0.45;
    this.pitch = 0.22;
    this.targetYaw = -0.45;
    this.targetPitch = 0.22;
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
    this.camera.position.set(0, 0, 7.6);

    // Crisp 3-point studio lighting for metallic & wooden clock surfaces
    this.scene.add(new THREE.HemisphereLight(0xFFFFFF, 0x334155, 1.05));
    const key = new THREE.DirectionalLight(0xFFFDF5, 1.35);
    key.position.set(4, 6, 7);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x93C5FD, 0.75);
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

  buildModel(clockId) {
    while (this.watchRoot.children.length > 0) {
      const obj = this.watchRoot.children[0];
      this.watchRoot.remove(obj);
      this.disposeObject(obj);
    }

    const holder = new this.THREE.Group();
    this.watchRoot.add(holder);
    this.animData = clockId === 'apple-watch'
      ? buildAppleWatch3D(this.THREE, holder)
      : buildTraditionalClock3D(this.THREE, holder, clockId);

    this.sproutTime = 0;
    this.watchRoot.scale.set(0.01, 0.01, 0.01);
    this.targetYaw = -0.45;
    this.targetPitch = 0.2;
    this.yaw = -0.95;
    this.pitch = 0.35;
  }

  setExploded(val) {
    this.exploded = !!val;
  }

  resetView() {
    this.targetYaw = 0;
    this.targetPitch = 0;
  }

  handleDown(e) {
    e.preventDefault();
    this.dragging = true;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
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
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this.targetYaw += dx * 0.011; // Full 360-degree rotation!
    this.targetPitch = Math.max(-1.05, Math.min(1.05, this.targetPitch + dy * 0.009));
  }

  handleResize() {
    if (!this.renderer || !this.camera || !this.mountEl) return;
    const rect = this.mountEl.getBoundingClientRect();
    const w = Math.max(260, rect.width || 460);
    const h = Math.max(220, rect.height || 360);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  startLoop() {
    this.stopLoop();
    this.lastFrame = performance.now();
    const MIN_FRAME_MS = 32; // ~30fps cap for iPad battery health

    const tick = (now) => {
      if (this.paused || this.destroyed) {
        this.rafId = null;
        return;
      }
      const elapsed = now - this.lastFrame;
      if (elapsed < MIN_FRAME_MS) {
        this.rafId = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(elapsed / 1000, 0.06);
      this.lastFrame = now;
      this.runTime += dt;

      // Smooth nyoki-nyoki pop-in scale
      if (this.sproutTime < 0.5) {
        this.sproutTime += dt;
        const p = Math.min(1, this.sproutTime / 0.45);
        const s = Math.max(0.01, easeOutBack(p));
        this.watchRoot.scale.set(s, s, s);
      }

      // Smooth orbit damping
      this.yaw += (this.targetYaw - this.yaw) * 0.16;
      this.pitch += (this.targetPitch - this.pitch) * 0.16;
      this.watchRoot.rotation.y = this.yaw;
      this.watchRoot.rotation.x = this.pitch;

      // Smooth exploded internal cutaway transition
      const expTarget = this.exploded ? 1 : 0;
      this.explodeLerp += (expTarget - this.explodeLerp) * 0.16;

      if (this.animData) {
        for (const ep of this.animData.explodeParts) {
          ep.obj.position.z = ep.baseZ + (ep.expZ - ep.baseZ) * this.explodeLerp;
          if (ep.fadeMat) {
            ep.fadeMat.opacity = 1.0 - this.explodeLerp * 0.72;
          }
        }
        // Rotate internal 3D gears
        for (const g of this.animData.gears) {
          g.mesh.rotation.z += g.speed * dt;
        }
        // Real-time analog hands
        const d = new Date();
        if (this.animData.hands) {
          const sec = d.getSeconds() + d.getMilliseconds() / 1000;
          const min = d.getMinutes() + sec / 60;
          const hr = (d.getHours() % 12) + min / 60;
          this.animData.hands.hour.rotation.z = -(hr * Math.PI) / 6;
          this.animData.hands.minute.rotation.z = -(min * Math.PI) / 30;
          this.animData.hands.second.rotation.z = -(Math.floor(sec) * Math.PI) / 30;
        }
        // Model-specific live animations
        if (this.animData.pendulum) {
          this.animData.pendulum.rotation.z = Math.sin(this.runTime * Math.PI) * 0.28;
        }
        if (this.animData.cuckooBird) {
          this.animData.cuckooBird.position.z = 0.72 + Math.sin(this.runTime * 5.5) * 0.16;
        }
        if (this.animData.valveWheel) {
          this.animData.valveWheel.rotation.z = Math.sin(this.runTime * 1.8) * 0.5;
        }
        if (this.animData.radioWaveMat) {
          this.animData.radioWaveMat.opacity = 0.3 + 0.7 * Math.abs(Math.sin(this.runTime * 4));
        }
        if (this.animData.awCrown) {
          this.animData.awCrown.rotation.x += dt * 0.9;
        }
        if (this.animData.awHrMat) {
          this.animData.awHrMat.emissiveIntensity = 0.5 + 1.3 * Math.abs(Math.sin(this.runTime * 3.4));
        }
        if (this.animData.awTaptic) {
          const cyc = this.runTime % 2.2;
          this.animData.awTaptic.position.x = cyc < 0.24 ? Math.sin(cyc * 95) * 0.045 : 0;
        }
        if (this.animData.awScreen && d.getSeconds() !== this.lastSec) {
          this.lastSec = d.getSeconds();
          const hh = String(d.getHours()).padStart(2, '0');
          const mm = String(d.getMinutes()).padStart(2, '0');
          this.animData.awScreen.draw(hh, mm, this.lastSec % 2 === 0 ? 1.0 : 0.35);
        }
      }

      this.renderer.render(this.scene, this.camera);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stopLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  onPause() {
    this.paused = true;
    this.stopLoop();
  }

  onResume() {
    if (!this.paused) return;
    this.paused = false;
    if (this.renderer) this.startLoop();
  }

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
