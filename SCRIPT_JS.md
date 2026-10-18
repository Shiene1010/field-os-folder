# Field-OS :: Interactive Sensor Telemetry Engine (`SCRIPT_JS.md`)

```javascript
/**
 * FIELD-OS :: TESLA EXTREME DEMONSTRATION ENGINE (ORCHESTRATED)
 */

// ================= 1. 3D ATTITUDE GYROSCOPE SPHERE =================
class AttitudeSphere {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.pitch = 0;
    this.targetPitch = 0;
    this.roll = 0;
    this.targetRoll = 0;
    this.yaw = 0.01;
  }

  setOrientation(pitchDeg, rollDeg) {
    this.targetPitch = pitchDeg;
    this.targetRoll = rollDeg;
  }

  update() {
    this.pitch += (this.targetPitch - this.pitch) * 0.1;
    this.roll += (this.targetRoll - this.roll) * 0.1;
    this.yaw += 0.015;
  }

  render(isCrisis, isLocked) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = 54;

    ctx.clearRect(0, 0, w, h);

    const strokeColor = isCrisis ? 'rgba(255, 26, 60, 0.8)' : (isLocked ? 'rgba(0, 240, 255, 0.8)' : 'rgba(255, 255, 255, 0.45)');
    const faintColor  = isCrisis ? 'rgba(255, 26, 60, 0.2)' : (isLocked ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.12)');
    const solidColor  = isCrisis ? '#ff1a3c' : (isLocked ? '#00f0ff' : '#ffffff');

    // 1. Horizon Boundary
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    const pitchRad = (this.pitch * Math.PI) / 180;
    const rollRad  = (this.roll * Math.PI) / 180;

    // 2. Equatorial Ellipse
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rollRad);

    const eqHeight = Math.max(1, Math.abs(radius * Math.cos(pitchRad)));
    ctx.strokeStyle = faintColor;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, eqHeight, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.moveTo(-radius, 0); ctx.lineTo(-radius + 6, 0);
    ctx.moveTo(radius - 6, 0); ctx.lineTo(radius, 0);
    ctx.stroke();

    // 3. Meridian Ring (사파리 0 에러 방지)
    const meridianR = Math.max(1, Math.abs(radius * Math.sin(this.yaw)));
    ctx.beginPath();
    ctx.ellipse(0, 0, meridianR, radius, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Central Vehicle Body
    ctx.save();
    const perspectiveScaleY = Math.cos(pitchRad);
    const perspectiveShiftY = -Math.sin(pitchRad) * 14;

    ctx.translate(0, perspectiveShiftY);
    ctx.scale(1, Math.abs(perspectiveScaleY) * 0.85 + 0.15);

    ctx.strokeStyle = solidColor;
    ctx.fillStyle = isCrisis ? 'rgba(255, 26, 60, 0.3)' : (isLocked ? 'rgba(0, 240, 255, 0.3)' : 'rgba(255, 255, 255, 0.18)');
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.bezierCurveTo(8, -20, 11, -10, 11, 4);
    ctx.lineTo(12, 18);
    ctx.lineTo(-12, 18);
    ctx.lineTo(-11, 4);
    ctx.bezierCurveTo(-11, -10, -8, -20, 0, -22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = solidColor;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.bezierCurveTo(4, -10, 6, -3, 6, 6);
    ctx.lineTo(-6, 6);
    ctx.bezierCurveTo(-6, -3, -4, -10, 0, -12);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = solidColor;
    ctx.lineWidth = 2.5;
    [-13, 11].forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x, -14); ctx.lineTo(x, -6);
      ctx.moveTo(x, 8);   ctx.lineTo(x, 16);
      ctx.stroke();
    });

    ctx.restore();
    ctx.restore();
  }
}

// ================= 2. FULLSCREEN FIELD GRAPH ENGINE =================
class FieldGraphEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.currentAct = 1;
    this.globalTick = 0;

    this.cols = 36;
    this.rows = 24;
    this.mesh = [];
    this.nodes = [];
    this.edges = [];

    this.mouse = { x: -1000, y: -1000, active: false };
    this.hoveredNode = null;
    this.hoveredEdge = null;
    this.pinnedTarget = null;

    this.resize();
    this.initMesh();
    this.buildAct1();
    this.attachEvents();
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  initMesh() {
    this.mesh = [];
    for (let r = 0; r <= this.rows; r++) {
      for (let c = 0; c <= this.cols; c++) {
        const baseX = (this.width / this.cols) * c;
        const baseY = (this.height / this.rows) * r;
        this.mesh.push({ baseX, baseY, x: baseX, y: baseY });
      }
    }
  }

  attachEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initMesh();
    });

    // 마우스가 상단 버튼이나 하단 HUD 위에 있을 때는 캔버스 프로브를 비활성화
    window.addEventListener('mousemove', e => {
      if (e.target.closest('.top-hud') || e.target.closest('.telemetry-cluster')) {
        this.mouse.active = false;
        this.hoveredNode = null;
        this.hoveredEdge = null;
        return;
      }
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
      this.evaluateHitTest();
    });

    window.addEventListener('click', e => {
      if (e.target.closest('.top-hud') || e.target.closest('.telemetry-cluster')) {
        return;
      }
      if (this.hoveredNode) {
        this.pinnedTarget = (this.pinnedTarget === this.hoveredNode) ? null : this.hoveredNode;
      } else if (this.hoveredEdge) {
        this.pinnedTarget = (this.pinnedTarget === this.hoveredEdge) ? null : this.hoveredEdge;
      } else {
        this.pinnedTarget = null;
      }
    });
  }

  evaluateHitTest() {
    if (this.pinnedTarget) return;

    let foundNode = null;
    for (let node of this.nodes) {
      const d = Math.hypot(node.x - this.mouse.x, node.y - this.mouse.y);
      if (d <= node.radius + 14) {
        foundNode = node;
        break;
      }
    }
    this.hoveredNode = foundNode;
    if (foundNode) {
      this.hoveredEdge = null;
      return;
    }

    let foundEdge = null;
    for (let edge of this.edges) {
      const n1 = this.nodes.find(n => n.id === edge.from);
      const n2 = this.nodes.find(n => n.id === edge.to);
      if (!n1 || !n2) continue;

      const midX = (n1.x + n2.x) / 2;
      const midY = (n1.y + n2.y) / 2;
      const ctrlX = midX + (edge.biasX || 0);
      const ctrlY = midY + (edge.biasY || 0);

      for (let step = 0; step <= 8; step++) {
        const t = step / 8;
        const qx = (1 - t) * (1 - t) * n1.x + 2 * (1 - t) * t * ctrlX + t * t * n2.x;
        const qy = (1 - t) * (1 - t) * n1.y + 2 * (1 - t) * t * ctrlY + t * t * n2.y;
        if (Math.hypot(qx - this.mouse.x, qy - this.mouse.y) < 14) {
          foundEdge = edge;
          break;
        }
      }
      if (foundEdge) break;
    }
    this.hoveredEdge = foundEdge;
  }

  getLocalTensorAt(x, y) {
    let totalTension = 0;
    for (let node of this.nodes) {
      const dx = node.x - x;
      const dy = node.y - y;
      const distSq = dx * dx + dy * dy + 850;
      totalTension += (node.mass * 1200) / distSq;
    }
    return totalTension;
  }

  buildAct1() {
    this.currentAct = 1;
    this.nodes = [];
    this.edges = [];
    const cx = this.width / 2;
    const cy = this.height / 2;

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const dist = 160 + Math.sin(i * 2) * 45;
      this.nodes.push({
        id: `seed_${i}`, type: 'seed', stage: 1,
        x: cx + Math.cos(a) * dist, y: cy + Math.sin(a) * dist,
        targetX: cx + Math.cos(a) * dist, targetY: cy + Math.sin(a) * dist,
        vx: 0, vy: 0, mass: 1.2, radius: 4, density: 1200
      });
    }

    for (let i = 0; i < 12; i++) {
      this.edges.push({ id: `e_${i}`, from: `seed_${i}`, to: `seed_${(i + 1) % 12}`, stress: 0.1, fluxRate: 35 });
    }
  }

  buildAct2() {
    this.currentAct = 2;
    this.nodes = [];
    this.edges = [];
    const cx = this.width / 2;
    const cy = this.height / 2;

    this.nodes.push({
      id: 'crit_1', type: 'critical', stage: 2,
      x: cx - 180, y: cy - 60, targetX: cx - 180, targetY: cy - 60,
      vx: 0, vy: 0, mass: 8.5, radius: 22, angle: -Math.PI / 4, density: 8520
    });

    this.nodes.push({
      id: 'crit_2', type: 'critical', stage: 2,
      x: cx + 190, y: cy + 70, targetX: cx + 190, targetY: cy + 70,
      vx: 0, vy: 0, mass: 8.0, radius: 22, angle: (3 * Math.PI) / 4, density: 8040
    });

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
      this.nodes.push({
        id: `split_${i}`, type: 'split', stage: 3,
        x: cx + Math.cos(a) * 110, y: cy + Math.sin(a) * 110,
        targetX: cx + Math.cos(a) * 110, targetY: cy + Math.sin(a) * 110,
        vx: 0, vy: 0, mass: 4.2, radius: 15, rotation: 0, density: 4200
      });
    }

    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const dist = 280 + Math.sin(i * 3) * 70;
      this.nodes.push({
        id: `chaos_${i}`, type: 'seed', stage: 1,
        x: cx + Math.cos(a) * dist, y: cy + Math.sin(a) * dist,
        targetX: cx + Math.cos(a) * dist, targetY: cy + Math.sin(a) * dist,
        vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
        mass: 1.5, radius: 4, density: 1500
      });
    }

    this.edges.push({ id: 'c_link', from: 'crit_1', to: 'crit_2', stress: 1.0, isCritical: true, fluxRate: 98 });
    this.edges.push({ id: 'cs_0', from: 'crit_1', to: 'split_0', stress: 0.9, isCritical: true, fluxRate: 85 });
    this.edges.push({ id: 'cs_1', from: 'crit_2', to: 'split_1', stress: 0.9, isCritical: true, fluxRate: 85 });
    this.edges.push({ id: 'ss_0', from: 'split_0', to: 'split_2', stress: 0.6, fluxRate: 50 });
    this.edges.push({ id: 'ss_1', from: 'split_1', to: 'split_2', stress: 0.6, fluxRate: 50 });

    for (let i = 0; i < 14; i++) {
      this.edges.push({ id: `ch_e_${i}`, from: `chaos_${i}`, to: i % 2 === 0 ? 'crit_1' : 'crit_2', stress: 0.75, isCritical: true, fluxRate: 70 });
    }
  }

  buildAct3() {
    this.currentAct = 3;
    this.nodes = [];
    this.edges = [];
    const cx = this.width / 2;
    const cy = this.height / 2;

    this.nodes.push({ id: 'poly_left', type: 'polyhedron', stage: 4, x: cx - 180, y: cy, targetX: cx - 180, targetY: cy, vx: 0, vy: 0, mass: 6.0, radius: 24, rotation: 0, density: 6000 });
    this.nodes.push({ id: 'poly_right', type: 'polyhedron', stage: 4, x: cx + 180, y: cy, targetX: cx + 180, targetY: cy, vx: 0, vy: 0, mass: 6.0, radius: 24, rotation: Math.PI / 4, density: 6000 });
    this.nodes.push({ id: 'split_top', type: 'split', stage: 3, x: cx, y: cy - 140, targetX: cx, targetY: cy - 140, vx: 0, vy: 0, mass: 3.5, radius: 15, rotation: 0, density: 3500 });
    this.nodes.push({ id: 'split_bot', type: 'split', stage: 3, x: cx, y: cy + 140, targetX: cx, targetY: cy + 140, vx: 0, vy: 0, mass: 3.5, radius: 15, rotation: Math.PI, density: 3500 });

    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      this.nodes.push({ id: `orb_${i}`, type: 'seed', stage: 1, x: cx + Math.cos(a) * 290, y: cy + Math.sin(a) * 230, targetX: cx + Math.cos(a) * 290, targetY: cy + Math.sin(a) * 230, vx: 0, vy: 0, mass: 1.8, radius: 4, density: 1800 });
    }

    this.edges.push({ id: 'e_pt', from: 'poly_left', to: 'split_top', stress: 0.2, geodesicWarp: 1.8, fluxRate: 40 });
    this.edges.push({ id: 'e_tr', from: 'split_top', to: 'poly_right', stress: 0.2, geodesicWarp: 1.8, fluxRate: 40 });
    this.edges.push({ id: 'e_rb', from: 'poly_right', to: 'split_bot', stress: 0.2, geodesicWarp: 1.8, fluxRate: 40 });
    this.edges.push({ id: 'e_bl', from: 'split_bot', to: 'poly_left', stress: 0.2, geodesicWarp: 1.8, fluxRate: 40 });
    this.edges.push({ id: 'e_lr', from: 'poly_left', to: 'poly_right', stress: 0.3, geodesicWarp: 2.2, fluxRate: 60 });

    for (let i = 0; i < 14; i++) {
      this.edges.push({ id: `orb_e_${i}`, from: `orb_${i}`, to: i < 7 ? 'poly_left' : 'poly_right', stress: 0.15, geodesicWarp: 1.2, fluxRate: 30 });
    }
  }

  buildAct4() {
    this.currentAct = 4;
    this.nodes = [];
    this.edges = [];
    const cx = this.width / 2;
    const cy = this.height / 2;

    this.nodes.push({ id: 'master_core', type: 'mature_circle', stage: 5, x: cx, y: cy, targetX: cx, targetY: cy, vx: 0, vy: 0, mass: 19.0, radius: 42, ripples: [0, 0.33, 0.66], density: 19000 });

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      this.nodes.push({ id: `sat_poly_${i}`, type: 'polyhedron', stage: 4, x: cx + Math.cos(a) * 170, y: cy + Math.sin(a) * 170, targetX: cx + Math.cos(a) * 170, targetY: cy + Math.sin(a) * 170, orbitAngle: a, orbitRadius: 170, orbitSpeed: 0.007, vx: 0, vy: 0, mass: 5.0, radius: 18, rotation: 0, density: 5000 });
      this.edges.push({ id: `core_e_${i}`, from: 'master_core', to: `sat_poly_${i}`, stress: 0.05, geodesicWarp: 0.9, fluxRate: 75 });
    }

    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      this.nodes.push({ id: `star_${i}`, type: 'seed', stage: 1, x: cx + Math.cos(a) * 300, y: cy + Math.sin(a) * 300, targetX: cx + Math.cos(a) * 300, targetY: cy + Math.sin(a) * 300, orbitAngle: a, orbitRadius: 300, orbitSpeed: 0.0035 * (i % 2 === 0 ? 1 : -1), vx: 0, vy: 0, mass: 1.5, radius: 3.5, density: 1500 });
      this.edges.push({ id: `orbit_e_${i}`, from: `star_${i}`, to: `sat_poly_${i % 3}`, stress: 0.02, geodesicWarp: 0.7, fluxRate: 20 });
    }
  }

  update() {
    this.globalTick++;
    const cx = this.width / 2;
    const cy = this.height / 2;

    this.nodes.forEach(node => {
      if (node.orbitAngle !== undefined) {
        node.orbitAngle += node.orbitSpeed;
        node.targetX = cx + Math.cos(node.orbitAngle) * node.orbitRadius;
        node.targetY = cy + Math.sin(node.orbitAngle) * node.orbitRadius;
      }

      this.nodes.forEach(other => {
        if (node.id === other.id) return;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.hypot(dx, dy) || 1;
        const minDist = (node.radius + other.radius) * 2.2;
        if (dist < minDist) {
          const rep = ((minDist - dist) / minDist) * 1.5;
          node.vx += (dx / dist) * rep;
          node.vy += (dy / dist) * rep;
        }
      });

      node.vx = (node.vx + (node.targetX - node.x) * 0.08) * 0.8;
      node.vy = (node.vy + (node.targetY - node.y) * 0.08) * 0.8;
      node.x += node.vx;
      node.y += node.vy;

      if (node.rotation !== undefined) node.rotation += 0.02;
    });

    const warp = this.currentAct === 2 ? 2600 : (this.currentAct === 4 ? 3400 : 1200);
    for (let pt of this.mesh) {
      let tx = 0, ty = 0;
      for (let node of this.nodes) {
        const dx = node.x - pt.baseX;
        const dy = node.y - pt.baseY;
        const d2 = dx * dx + dy * dy + 850;
        const d = Math.sqrt(d2);
        const pull = (node.mass * warp) / d2;
        tx += (dx / d) * pull;
        ty += (dy / d) * pull;

        if (node.type === 'critical') {
          const theta = Math.atan2(dy, dx);
          const shear = Math.sin(this.globalTick * 0.25) * 16;
          tx += Math.cos(theta + Math.PI / 2) * (pull * 0.85) + shear * (pull / 25);
          ty += Math.sin(theta + Math.PI / 2) * (pull * 0.85);
        }
      }
      pt.x += (pt.baseX + tx - pt.x) * 0.16;
      pt.y += (pt.baseY + ty - pt.y) * 0.16;
    }
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Spacetime Grid
    ctx.save();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = this.currentAct === 2 ? 'rgba(255, 26, 60, 0.15)' : 'rgba(255, 255, 255, 0.06)';
    for (let r = 0; r <= this.rows; r++) {
      ctx.beginPath();
      for (let c = 0; c <= this.cols; c++) {
        const pt = this.mesh[r * (this.cols + 1) + c];
        if (c === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }
    for (let c = 0; c <= this.cols; c++) {
      ctx.beginPath();
      for (let r = 0; r <= this.rows; r++) {
        const pt = this.mesh[r * (this.cols + 1) + c];
        if (r === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }
    ctx.restore();

    // 2. Geodesic Edges
    ctx.save();
    this.edges.forEach(edge => {
      const n1 = this.nodes.find(n => n.id === edge.from);
      const n2 = this.nodes.find(n => n.id === edge.to);
      if (!n1 || !n2) return;

      const midX = (n1.x + n2.x) / 2;
      const midY = (n1.y + n2.y) / 2;

      let biasX = 0, biasY = 0;
      const warpMult = edge.geodesicWarp || (this.currentAct === 3 ? 1.8 : 0.6);

      this.nodes.forEach(n => {
        const dx = n.x - midX;
        const dy = n.y - midY;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 360) {
          const pull = (n.mass * 46 * warpMult) / (d + 20);
          biasX += (dx / d) * pull;
          biasY += (dy / d) * pull;
        }
      });

      if (edge.isCritical) {
        const jitter = Math.sin(this.globalTick * 0.4 + midX) * 4;
        biasX += jitter;
        biasY += jitter;
      }

      edge.biasX = biasX;
      edge.biasY = biasY;

      const ctrlX = midX + biasX;
      const ctrlY = midY + biasY;
      const isHovered = (edge === this.hoveredEdge || edge === this.pinnedTarget);

      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.quadraticCurveTo(ctrlX, ctrlY, n2.x, n2.y);

      if (isHovered) {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3.0;
      } else if (edge.isCritical) {
        const pulse = 0.5 + Math.sin(this.globalTick * 0.25) * 0.45;
        ctx.strokeStyle = `rgba(255, 26, 60, ${pulse})`;
        ctx.lineWidth = 2.2;
      } else if (this.currentAct === 3) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.2;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 0.8;
      }
      ctx.stroke();

      const pulseSpeed = edge.isCritical ? 0.03 : 0.015;
      const t = (this.globalTick * pulseSpeed) % 1;
      const qx = (1 - t) * (1 - t) * n1.x + 2 * (1 - t) * t * ctrlX + t * t * n2.x;
      const qy = (1 - t) * (1 - t) * n1.y + 2 * (1 - t) * t * ctrlY + t * t * n2.y;

      ctx.beginPath();
      ctx.arc(qx, qy, isHovered ? 3.5 : 2.0, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? '#00f0ff' : (edge.isCritical ? '#ff1a3c' : '#ffffff');
      ctx.fill();
    });
    ctx.restore();

    // 3. Nodes
    this.nodes.forEach(node => {
      ctx.save();
      ctx.translate(node.x, node.y);

      const isTarget = (node === this.hoveredNode || node === this.pinnedTarget);

      if (isTarget) {
        const bSize = node.radius + 14;
        const arm = 6;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-bSize, -bSize + arm); ctx.lineTo(-bSize, -bSize); ctx.lineTo(-bSize + arm, -bSize);
        ctx.moveTo(bSize - arm, -bSize); ctx.lineTo(bSize, -bSize); ctx.lineTo(bSize, -bSize + arm);
        ctx.moveTo(-bSize, bSize - arm); ctx.lineTo(-bSize, bSize); ctx.lineTo(-bSize + arm, bSize);
        ctx.moveTo(bSize - arm, bSize); ctx.lineTo(bSize, bSize); ctx.lineTo(bSize, bSize - arm);
        ctx.stroke();
      }

      switch (node.type) {
        case 'seed':
          ctx.fillStyle = isTarget ? '#00f0ff' : '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, node.radius + (isTarget ? 2 : 0), 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'critical':
          ctx.rotate(node.angle || 0);
          const r = node.radius * 1.3;
          const pulse = Math.sin(this.globalTick * 0.25) * 2.5;

          ctx.fillStyle = isTarget ? 'rgba(0, 240, 255, 0.3)' : 'rgba(255, 26, 60, 0.25)';
          ctx.strokeStyle = isTarget ? '#00f0ff' : '#ff1a3c';
          ctx.lineWidth = 2.2;

          ctx.beginPath();
          ctx.moveTo(r + pulse, 0);
          ctx.lineTo(-r, -r * 0.7);
          ctx.lineTo(-r * 0.45, 0);
          ctx.lineTo(-r, r * 0.7);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(r * 0.6, 0);
          ctx.stroke();
          break;

        case 'split':
          ctx.rotate(node.rotation || 0);
          const sr = node.radius * 1.25;
          ctx.fillStyle = isTarget ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.12)';
          ctx.strokeStyle = isTarget ? '#00f0ff' : '#ffffff';
          ctx.lineWidth = 1.8;

          ctx.beginPath();
          for (let i = 0; i < 3; i++) {
            const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(a) * sr;
            const y = Math.sin(a) * sr;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;

        case 'polyhedron':
          ctx.rotate(node.rotation || 0);
          const pr = node.radius;
          ctx.strokeStyle = isTarget ? '#00f0ff' : '#ffffff';
          ctx.lineWidth = 1.8;
          ctx.fillStyle = isTarget ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)';

          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            const x = Math.cos(a) * pr;
            const y = Math.sin(a) * pr;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          const innerR = pr * 0.58;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            const ix = Math.cos(a + Math.PI / 6) * innerR;
            const iy = Math.sin(a + Math.PI / 6) * innerR;
            ctx.moveTo(Math.cos(a) * pr, Math.sin(a) * pr);
            ctx.lineTo(ix, iy);
          }
          ctx.stroke();
          break;

        case 'mature_circle':
          const mr = node.radius;
          node.ripples = node.ripples.map(wave => {
            const next = (wave + 0.007) % 1;
            const waveR = mr + next * 90;
            ctx.beginPath();
            ctx.arc(0, 0, waveR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - next) * 0.4})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            return next;
          });

          ctx.fillStyle = isTarget ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.2)';
          ctx.strokeStyle = isTarget ? '#00f0ff' : '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, mr, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, mr * 0.32, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
      ctx.restore();
    });

    // 4. Cursor Probe
    if (this.mouse.active && !this.hoveredNode && !this.hoveredEdge) {
      const mx = this.mouse.x;
      const my = this.mouse.y;
      const localTension = this.getLocalTensorAt(mx, my);
      const pulseR = 12 + Math.min(20, localTension * 0.008);

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(mx - 8, my); ctx.lineTo(mx + 8, my);
      ctx.moveTo(mx, my - 8); ctx.lineTo(mx, my + 8);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(mx, my, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.stroke();
      ctx.restore();
    }
  }
}

// ================= 3. MASTER PROBE ORCHESTRATOR =================
class TelemetryOrchestrator {
  constructor() {
    this.graph = new FieldGraphEngine('field-canvas');
    this.attitude = new AttitudeSphere('gyro-canvas');

    this.lblPrimary = document.getElementById('lbl-primary');
    this.valPrimary = document.getElementById('val-primary');
    this.unitPrimary = document.getElementById('unit-primary');

    this.lblSecondary = document.getElementById('lbl-secondary');
    this.valSecondary = document.getElementById('val-secondary');
    this.unitSecondary = document.getElementById('unit-secondary');

    this.lblTertiary = document.getElementById('lbl-tertiary');
    this.valTertiary = document.getElementById('val-tertiary');
    this.unitTertiary = document.getElementById('unit-tertiary');

    this.tickerText = document.getElementById('ticker-text');

    this.currentAct = 1;
    this.curPrimary = 1024;
    this.curSecondary = 0.4;
    this.curTertiary = 12.4;

    this.targetPrimary = 1024;
    this.targetSecondary = 0.4;
    this.targetTertiary = 12.4;

    this.bindButtons();
    this.setAct(1);
    this.startLoop();
  }

  // 상단 버튼에 직접 클릭 이벤트 바인딩 (스코프 에러 원천 차단)
  bindButtons() {
    const buttons = document.querySelectorAll('.act-btn');
    buttons.forEach((btn, idx) => {
      btn.style.cursor = 'pointer';
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setAct(idx + 1);
      };
    });
  }

  setAct(act) {
    this.currentAct = act;
    const buttons = document.querySelectorAll('.act-btn');
    buttons.forEach((b, i) => {
      b.classList.toggle('active', i + 1 === act);
    });

    const body = document.body;
    switch (act) {
      case 1:
        body.classList.remove('state-crisis');
        this.graph.buildAct1();
        this.attitude.setOrientation(0.4, 0);
        this.targetPrimary = 1024;
        this.targetSecondary = 0.4;
        this.targetTertiary = 12.4;
        if (this.tickerText) this.tickerText.innerText = "ACT 01 // GENESIS GROUND STATE NOMINAL";
        break;

      case 2:
        body.classList.add('state-crisis');
        this.graph.buildAct2();
        this.attitude.setOrientation(89.4, -4);
        this.targetPrimary = 3009;
        this.targetSecondary = 89.4;
        this.targetTertiary = 30.2;
        if (this.tickerText) this.tickerText.innerText = "ACT 02 // CRITICAL STRESS MAX-Q // PITCH 89.4 DEG";
        break;

      case 3:
        body.classList.remove('state-crisis');
        this.graph.buildAct3();
        this.attitude.setOrientation(32.1, 8);
        this.targetPrimary = 2140;
        this.targetSecondary = 32.1;
        this.targetTertiary = 48.6;
        if (this.tickerText) this.tickerText.innerText = "ACT 03 // GEODESIC VECTOR RE-ROUTING STABILIZED";
        break;

      case 4:
        body.classList.remove('state-crisis');
        this.graph.buildAct4();
        this.attitude.setOrientation(0.0, 0);
        this.targetPrimary = 1450;
        this.targetSecondary = 0.0;
        this.targetTertiary = 82.0;
        if (this.tickerText) this.tickerText.innerText = "ACT 04 // ORBITAL GRAVITY WELL CAPTURE EQUILIBRIUM";
        break;
    }
  }

  startLoop() {
    const loop = () => {
      const activeTarget = this.graph.pinnedTarget || this.graph.hoveredNode || this.graph.hoveredEdge;
      const body = document.body;

      if (this.graph.hoveredNode || (this.graph.pinnedTarget && this.graph.pinnedTarget.mass)) {
        const node = this.graph.pinnedTarget || this.graph.hoveredNode;
        body.classList.add('is-locked');

        if (this.lblPrimary) this.lblPrimary.innerText = "NODE DENSITY";
        this.targetPrimary = node.density || Math.round(node.mass * 1000);
        if (this.unitPrimary) this.unitPrimary.innerText = "RHO";

        if (this.lblSecondary) this.lblSecondary.innerText = "STAGE LEVEL";
        this.targetSecondary = node.stage || 1;
        if (this.unitSecondary) this.unitSecondary.innerText = "LVL";

        if (this.lblTertiary) this.lblTertiary.innerText = "INFLUENCE";
        this.targetTertiary = Math.round(node.radius * 12);
        if (this.unitTertiary) this.unitTertiary.innerText = "PX";

        if (this.tickerText) this.tickerText.innerText = `[TARGET LOCK: #${node.id}] DENSITY ${Math.round(this.targetPrimary)} RHO // STAGE ${node.stage}`;

        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const angleDeg = (Math.atan2(node.y - cy, node.x - cx) * 180) / Math.PI;
        this.attitude.setOrientation(angleDeg * 0.4, angleDeg * 0.2);

      } else if (this.graph.hoveredEdge || (this.graph.pinnedTarget && this.graph.pinnedTarget.fluxRate)) {
        const edge = this.graph.pinnedTarget || this.graph.hoveredEdge;
        body.classList.add('is-locked');

        if (this.lblPrimary) this.lblPrimary.innerText = "LINK STRESS";
        this.targetPrimary = Math.round(edge.stress * 4200);
        if (this.unitPrimary) this.unitPrimary.innerText = "N";

        if (this.lblSecondary) this.lblSecondary.innerText = "GEODESIC κ";
        this.targetSecondary = (edge.geodesicWarp || (edge.stress * 1.5)).toFixed(1);
        if (this.unitSecondary) this.unitSecondary.innerText = "RAD";

        if (this.lblTertiary) this.lblTertiary.innerText = "FLUX RATE";
        this.targetTertiary = edge.fluxRate || 40;
        if (this.unitTertiary) this.unitTertiary.innerText = "MB/S";

        if (this.tickerText) this.tickerText.innerText = `[LINK LOCK: ${edge.from} -> ${edge.to}] STRESS ${Math.round(this.targetPrimary)} N // FLUX ${edge.fluxRate} MB/S`;
        this.attitude.setOrientation(15, 45);

      } else if (this.graph.mouse.active) {
        body.classList.remove('is-locked');
        const localTension = this.graph.getLocalTensorAt(this.graph.mouse.x, this.graph.mouse.y);

        if (this.lblPrimary) this.lblPrimary.innerText = "FIELD TENSION";
        this.targetPrimary = Math.round(localTension);
        if (this.unitPrimary) this.unitPrimary.innerText = "N/M";

        if (this.lblSecondary) this.lblSecondary.innerText = "WARP GRAD";
        this.targetSecondary = Math.min(99.9, (localTension / 45)).toFixed(1);
        if (this.unitSecondary) this.unitSecondary.innerText = "%";

        if (this.lblTertiary) this.lblTertiary.innerText = "POTENTIAL";
        this.targetTertiary = (localTension * 0.0012).toFixed(2);
        if (this.unitTertiary) this.unitTertiary.innerText = "G";

        if (this.tickerText) this.tickerText.innerText = `[FIELD PROBE] X:${Math.round(this.graph.mouse.x)} Y:${Math.round(this.graph.mouse.y)} // TENSION ${Math.round(localTension)} N/M`;

      } else {
        body.classList.remove('is-locked');

        if (this.lblPrimary) this.lblPrimary.innerText = "TENSION";
        if (this.unitPrimary) this.unitPrimary.innerText = "KG";
        if (this.lblSecondary) this.lblSecondary.innerText = "PITCH";
        if (this.unitSecondary) this.unitSecondary.innerText = "DEG";
        if (this.lblTertiary) this.lblTertiary.innerText = "ALTITUDE";
        if (this.unitTertiary) this.unitTertiary.innerText = "FT";
      }

      this.curPrimary += (this.targetPrimary - this.curPrimary) * 0.15;
      this.curSecondary += (this.targetSecondary - this.curSecondary) * 0.15;
      this.curTertiary += (this.targetTertiary - this.curTertiary) * 0.15;

      if (this.valPrimary) this.valPrimary.innerText = Math.round(this.curPrimary);
      if (this.valSecondary) this.valSecondary.innerText = Number(this.curSecondary).toFixed(1);
      if (this.valTertiary) this.valTertiary.innerText = Number(this.curTertiary).toFixed(1);

      this.attitude.update();
      this.attitude.render(this.currentAct === 2, Boolean(activeTarget));

      this.graph.update();
      this.graph.render();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// 전역 등록 및 즉시 구동
window.orchestrator = new TelemetryOrchestrator();
window.setAct = (act) => window.orchestrator.setAct(act);