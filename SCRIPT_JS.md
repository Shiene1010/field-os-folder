# Field-OS :: Interactive Sensor Telemetry Engine (`SCRIPT_JS.md`)

## 1. 인터랙션 및 센서 로직 설명
1. **Ray-cast & Probe Hit-Testing**: 마우스 이벤트(`mousemove`, `click`, `mouseleave`)를 캡처하여 우선순위(노드 > 엣지 > 빈 공간 장력)에 따라 검사합니다.
2. **Field Potential Equation**: 커서 위치에서의 중력 퍼텐셜과 장력을 계산하여 빈 공간에서도 살아 숨쉬는 필드 수치를 제공합니다.
3. **자세계 조준(Aim Tracking)**: 노드에 록온되면 3D 구체 내부의 섀시가 해당 노드를 향해 회전하여 정확한 표적 조준 감각을 완성합니다.

---

## 2. 소스 코드 (`script.js`)

\`\`\`javascript
/**
 * FIELD-OS :: INTERACTIVE SENSOR TELEMETRY ENGINE
 */

// ================= 1. 3D ATTITUDE GYROSCOPE SPHERE =================
class AttitudeSphere {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.pitch = 0;
    this.targetPitch = 0;
    this.roll = 0;
    this.targetRoll = 0;
    this.yaw = 0;
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

    const eqHeight = radius * Math.cos(pitchRad);
    ctx.strokeStyle = faintColor;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, Math.max(1, Math.abs(eqHeight)), 0, 0, Math.PI * 2);
    ctx.stroke();

    // Horizon Ticks
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.moveTo(-radius, 0); ctx.lineTo(-radius + 6, 0);
    ctx.moveTo(radius - 6, 0); ctx.lineTo(radius, 0);
    ctx.stroke();

    // 3. Meridian Ring
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * Math.abs(Math.sin(this.yaw)), radius, 0, 0, Math.PI * 2);
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

    // Canopy
    ctx.fillStyle = solidColor;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.bezierCurveTo(4, -10, 6, -3, 6, 6);
    ctx.lineTo(-6, 6);
    ctx.bezierCurveTo(-6, -3, -4, -10, 0, -12);
    ctx.closePath();
    ctx.fill();

    // Wheel Indicators
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

// ================= 2. FIELD GRAPH & HIT SENSOR ENGINE =================
class FieldGraphEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
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

    // Interactive Hover State
    this.mouse = { x: -1000, y: -1000, active: false };
    this.hoveredNode = null;
    this.hoveredEdge = null;
    this.pinnedTarget = null; // Lock upon click

    this.resize();
    this.initMesh();
    this.buildAct1();
    this.attachEvents();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.resetTransform();
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
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

    this.canvas.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
      this.evaluateHitTest();
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.active = false;
      if (!this.pinnedTarget) {
        this.hoveredNode = null;
        this.hoveredEdge = null;
      }
    });

    this.canvas.addEventListener('click', () => {
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

    // 1. Node Hit Test (Circle test with padding)
    let foundNode = null;
    for (let node of this.nodes) {
      const d = Math.hypot(node.x - this.mouse.x, node.y - this.mouse.y);
      if (d <= node.radius + 12) {
        foundNode = node;
        break;
      }
    }
    this.hoveredNode = foundNode;
    if (foundNode) {
      this.hoveredEdge = null;
      return;
    }

    // 2. Edge Hit Test (Quadratic Bezier sample points)
    let foundEdge = null;
    for (let edge of this.edges) {
      const n1 = this.nodes.find(n => n.id === edge.from);
      const n2 = this.nodes.find(n => n.id === edge.to);
      if (!n1 || !n2) continue;

      const midX = (n1.x + n2.x) / 2;
      const midY = (n1.y + n2.y) / 2;
      const ctrlX = midX + (edge.biasX || 0);
      const ctrlY = midY + (edge.biasY || 0);

      // Check 10 points along curve
      for (let step = 0; step <= 10; step++) {
        const t = step / 10;
        const qx = (1 - t) * (1 - t) * n1.x + 2 * (1 - t) * t * ctrlX + t * t * n2.x;
        const qy = (1 - t) * (1 - t) * n1.y + 2 * (1 - t) * t * ctrlY + t * t * n2.y;
        if (Math.hypot(qx - this.mouse.x, qy - this.mouse.y) < 10) {
          foundEdge = edge;
          break;
        }
      }
      if (foundEdge) break;
    }
    this.hoveredEdge = foundEdge;
  }

  // Calculate local tension at any (x, y) coordinate
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

  // ================= SCENARIOS =================
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
      this.edges.push({
        id: `e_${i}`, from: `seed_${i}`, to: `seed_${(i + 1) % 12}`,
        stress: 0.1, fluxRate: 35
      });
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
      vx: 0, vy: 0, mass: 8.5, radius: 20, angle: -Math.PI / 4, density: 8520
    });

    this.nodes.push({
      id: 'crit_2', type: 'critical', stage: 2,
      x: cx + 190, y: cy + 70, targetX: cx + 190, targetY: cy + 70,
      vx: 0, vy: 0, mass: 8.0, radius: 20, angle: (3 * Math.PI) / 4, density: 8040
    });

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
      this.nodes.push({
        id: `split_${i}`, type: 'split', stage: 3,
        x: cx + Math.cos(a) * 110, y: cy + Math.sin(a) * 110,
        targetX: cx + Math.cos(a) * 110, targetY: cy + Math.sin(a) * 110,
        vx: 0, vy: 0, mass: 4.2, radius: 14, rotation: 0, density: 4200
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
        mass: 1.5, radius: 3.5, density: 1500
      });
    }

    this.edges.push({ id: 'c_link', from: 'crit_1', to: 'crit_2', stress: 1.0, isCritical: true, fluxRate: 98 });
    this.edges.push({ id: 'cs_0', from: 'crit_1', to: 'split_0', stress: 0.9, isCritical: true, fluxRate: 85 });
    this.edges.push({ id: 'cs_1', from: 'crit_2', to: 'split_1', stress: 0.9, isCritical: true, fluxRate: 85 });
    this.edges.push({ id: 'ss_0', from: 'split_0', to: 'split_2', stress: 0.6, fluxRate: 50 });
    this.edges.push({ id: 'ss_1', from: 'split_1', to: 'split_2', stress: 0.6, fluxRate: 50 });

    for (let i = 0; i < 14; i++) {
      this.edges.push({
        id: `ch_e_${i}`, from: `chaos_${i}`, to: i % 2 === 0 ? 'crit_1' : 'crit_2',
        stress: 0.75, isCritical: true, fluxRate: 70
      });
    }
  }

  buildAct3() {
    this.currentAct = 3;
    this.nodes = [];
    this.edges = [];
    const cx = this.width / 2;
    const cy = this.height / 2;

    this.nodes.push({
      id: 'poly_left', type: 'polyhedron', stage: 4,
      x: cx - 180, y: cy, targetX: cx - 180, targetY: cy,
      vx: 0, vy: 0, mass: 6.0, radius: 22, rotation: 0, density: 6000
    });

    this.nodes.push({
      id: 'poly_right', type: 'polyhedron', stage: 4,
      x: cx + 180, y: cy, targetX: cx + 180, targetY: cy,
      vx: 0, vy: 0, mass: 6.0, radius: 22, rotation: Math.PI / 4, density: 6000
    });

    this.nodes.push({
      id: 'split_top', type: 'split', stage: 3,
      x: cx, y: cy - 140, targetX: cx, targetY: cy - 140,
      vx: 0, vy: 0, mass: 3.5, radius: 14, rotation: 0, density: 3500
    });

    this.nodes.push({
      id: 'split_bot', type: 'split', stage: 3,
      x: cx, y: cy + 140, targetX: cx, targetY: cy + 140,
      vx: 0, vy: 0, mass: 3.5, radius: 14, rotation: Math.PI, density: 3500
    });

    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      this.nodes.push({
        id: `orb_${i}`, type: 'seed', stage: 1,
        x: cx + Math.cos(a) * 290, y: cy + Math.sin(a) * 230,
        targetX: cx + Math.cos(a) * 290, targetY: cy + Math.sin(a) * 230,
        vx: 0, vy: 0, mass: 1.8, radius: 3.5, density: 1800
      });
    }

    this.edges.push({ id: 'e_pt', from: 'poly_left', to: 'split_top', stress: 0.2, geodesicWarp: 1.8, fluxRate: 40 });
    this.edges.push({ id: 'e_tr', from: 'split_top', to: 'poly_right', stress: 0.2, geodesicWarp: 1.8, fluxRate: 40 });
    this.edges.push({ id: 'e_rb', from: 'poly_right', to: 'split_bot', stress: 0.2, geodesicWarp: 1.8, fluxRate: 40 });
    this.edges.push({ id: 'e_bl', from: 'split_bot', to: 'poly_left', stress: 0.2, geodesicWarp: 1.8, fluxRate: 40 });
    this.edges.push({ id: 'e_lr', from: 'poly_left', to: 'poly_right', stress: 0.3, geodesicWarp: 2.2, fluxRate: 60 });

    for (let i = 0; i < 14; i++) {
      this.edges.push({
        id: `orb_e_${i}`, from: `orb_${i}`, to: i < 7 ? 'poly_left' : 'poly_right',
        stress: 0.15, geodesicWarp: 1.2, fluxRate: 30
      });
    }
  }

  buildAct4() {
    this.currentAct = 4;
    this.nodes = [];
    this.edges = [];
    const cx = this.width / 2;
    const cy = this.height / 2;

    this.nodes.push({
      id: 'master_core', type: 'mature_circle', stage: 5,
      x: cx, y: cy, targetX: cx, targetY: cy,
      vx: 0, vy: 0, mass: 19.0, radius: 40, ripples: [0, 0.33, 0.66], density: 19000
    });

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      this.nodes.push({
        id: `sat_poly_${i}`, type: 'polyhedron', stage: 4,
        x: cx + Math.cos(a) * 170, y: cy + Math.sin(a) * 170,
        targetX: cx + Math.cos(a) * 170, targetY: cy + Math.sin(a) * 170,
        orbitAngle: a, orbitRadius: 170, orbitSpeed: 0.007,
        vx: 0, vy: 0, mass: 5.0, radius: 18, rotation: 0, density: 5000
      });
      this.edges.push({ id: `core_e_${i}`, from: 'master_core', to: `sat_poly_${i}`, stress: 0.05, geodesicWarp: 0.9, fluxRate: 75 });
    }

    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      this.nodes.push({
        id: `star_${i}`, type: 'seed', stage: 1,
        x: cx + Math.cos(a) * 300, y: cy + Math.sin(a) * 300,
        targetX: cx + Math.cos(a) * 300, targetY: cy + Math.sin(a) * 300,
        orbitAngle: a, orbitRadius: 300, orbitSpeed: 0.0035 * (i % 2 === 0 ? 1 : -1),
        vx: 0, vy: 0, mass: 1.5, radius: 3.5, density: 1500
      });
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
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Spacetime Grid
    this.renderMesh(ctx);

    // 2. Geodesic Edges
    this.renderEdges(ctx);

    // 3. Nodes
    this.renderNodes(ctx);

    // 4. Interactive Target Probe Reticle (Cursor Tracking)
    this.renderProbeReticle(ctx);
  }

  renderMesh(ctx) {
    ctx.save();
    ctx.lineWidth = 0.5;
    const isAct2 = this.currentAct === 2;
    ctx.strokeStyle = isAct2 ? 'rgba(255, 26, 60, 0.12)' : 'rgba(255, 255, 255, 0.05)';

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
  }

  renderEdges(ctx) {
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
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
      } else if (edge.isCritical) {
        const pulse = 0.5 + Math.sin(this.globalTick * 0.25) * 0.45;
        ctx.strokeStyle = `rgba(255, 26, 60, ${pulse})`;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#ff1a3c';
        ctx.shadowBlur = 10;
      } else if (this.currentAct === 3) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.8;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();

      // Moving packet dot
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
  }

  renderNodes(ctx) {
    this.nodes.forEach(node => {
      ctx.save();
      ctx.translate(node.x, node.y);

      const isTarget = (node === this.hoveredNode || node === this.pinnedTarget);

      // Lock-on Bracket
      if (isTarget) {
        const bSize = node.radius + 14;
        const arm = 6;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;

        // 4 Corner Brackets
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

          ctx.shadowColor = isTarget ? '#00f0ff' : '#ff1a3c';
          ctx.shadowBlur = 16;
          ctx.fillStyle = isTarget ? 'rgba(0, 240, 255, 0.3)' : 'rgba(255, 26, 60, 0.25)';
          ctx.strokeStyle = isTarget ? '#00f0ff' : '#ff1a3c';
          ctx.lineWidth = 2;

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
  }

  // 4. Ambient Probe Reticle Cursor in Space
  renderProbeReticle(ctx) {
    if (!this.mouse.active || this.hoveredNode || this.hoveredEdge) return;

    const mx = this.mouse.x;
    const my = this.mouse.y;
    const localTension = this.getLocalTensorAt(mx, my);
    const pulseR = 12 + Math.min(20, localTension * 0.008);

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 0.8;

    // Crosshair
    ctx.beginPath();
    ctx.moveTo(mx - 8, my); ctx.lineTo(mx + 8, my);
    ctx.moveTo(mx, my - 8); ctx.lineTo(mx, my + 8);
    ctx.stroke();

    // Pulse Tension Ring
    ctx.beginPath();
    ctx.arc(mx, my, pulseR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.stroke();

    ctx.restore();
  }
}

// ================= 3. MASTER PROBE ORCHESTRATOR =================
class TelemetryOrchestrator {
  constructor() {
    this.graph = new FieldGraphEngine('field-canvas');
    this.attitude = new AttitudeSphere('gyro-canvas');

    // DOM Labels & Values
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
    this.curPrimary = 3009;
    this.curSecondary = 89.4;
    this.curTertiary = 30.2;

    this.targetPrimary = 3009;
    this.targetSecondary = 89.4;
    this.targetTertiary = 30.2;

    this.setAct(1);
    this.startLoop();
  }

  setAct(act) {
    this.currentAct = act;
    document.querySelectorAll('.act-btn').forEach((b, i) => {
      b.classList.toggle('active', i + 1 === act);
    });

    const body = document.body;
    switch (act) {
      case 1:
        body.classList.remove('state-crisis');
        this.graph.buildAct1();
        this.attitude.setOrientation(0.4, 0);
        break;
      case 2:
        body.classList.add('state-crisis');
        this.graph.buildAct2();
        this.attitude.setOrientation(89.4, -4);
        break;
      case 3:
        body.classList.remove('state-crisis');
        this.graph.buildAct3();
        this.attitude.setOrientation(32.1, 8);
        break;
      case 4:
        body.classList.remove('state-crisis');
        this.graph.buildAct4();
        this.attitude.setOrientation(0.0, 0);
        break;
    }
  }

  startLoop() {
    const loop = () => {
      const activeTarget = this.graph.pinnedTarget || this.graph.hoveredNode || this.graph.hoveredEdge;
      const body = document.body;

      if (this.graph.hoveredNode || (this.graph.pinnedTarget && this.graph.pinnedTarget.mass)) {
        // ========== 1. NODE LOCK-ON (밀도 표기) ==========
        const node = this.graph.pinnedTarget || this.graph.hoveredNode;
        body.classList.add('is-locked');

        this.lblPrimary.innerText = "NODE DENSITY";
        this.targetPrimary = node.density || Math.round(node.mass * 1000);
        this.unitPrimary.innerText = "RHO";

        this.lblSecondary.innerText = "STAGE LEVEL";
        this.targetSecondary = node.stage || 1;
        this.unitSecondary.innerText = "LVL";

        this.lblTertiary.innerText = "INFLUENCE";
        this.targetTertiary = Math.round(node.radius * 12);
        this.unitTertiary.innerText = "PX";

        this.tickerText.innerText = `[LOCKED TARGET: NODE #${node.id}] DENSITY ${Math.round(this.targetPrimary)} RHO // STAGE ${node.stage}`;

        // Rotate Attitude Sphere toward node
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const angleDeg = (Math.atan2(node.y - cy, node.x - cx) * 180) / Math.PI;
        this.attitude.setOrientation(angleDeg * 0.4, angleDeg * 0.2);

      } else if (this.graph.hoveredEdge || (this.graph.pinnedTarget && this.graph.pinnedTarget.fluxRate)) {
        // ========== 2. EDGE LOCK-ON (장력/플럭스 표기) ==========
        const edge = this.graph.pinnedTarget || this.graph.hoveredEdge;
        body.classList.add('is-locked');

        this.lblPrimary.innerText = "LINK STRESS";
        this.targetPrimary = Math.round(edge.stress * 4200);
        this.unitPrimary.innerText = "N";

        this.lblSecondary.innerText = "GEODESIC κ";
        this.targetSecondary = (edge.geodesicWarp || (edge.stress * 1.5)).toFixed(1);
        this.unitSecondary.innerText = "RAD";

        this.lblTertiary.innerText = "FLUX RATE";
        this.targetTertiary = edge.fluxRate || 40;
        this.unitTertiary.innerText = "MB/S";

        this.tickerText.innerText = `[LOCKED LINK: ${edge.from} -> ${edge.to}] STRESS ${Math.round(this.targetPrimary)} N // FLUX ${edge.fluxRate} MB/S`;
        this.attitude.setOrientation(15, 45);

      } else if (this.graph.mouse.active) {
        // ========== 3. SPACE HOVER (얽힘장력 실시간 프로브) ==========
        body.classList.remove('is-locked');
        const localTension = this.graph.getLocalTensorAt(this.graph.mouse.x, this.graph.mouse.y);

        this.lblPrimary.innerText = "FIELD TENSION";
        this.targetPrimary = Math.round(localTension);
        this.unitPrimary.innerText = "N/M";

        this.lblSecondary.innerText = "WARP GRAD";
        this.targetSecondary = Math.min(99.9, (localTension / 45)).toFixed(1);
        this.unitSecondary.innerText = "%";

        this.lblTertiary.innerText = "POTENTIAL";
        this.targetTertiary = (localTension * 0.0012).toFixed(2);
        this.unitTertiary.innerText = "G";

        this.tickerText.innerText = `[FIELD PROBE] X: ${Math.round(this.graph.mouse.x)} Y: ${Math.round(this.graph.mouse.y)} // LOCAL TENSION ${Math.round(localTension)} N/M`;

      } else {
        // ========== 4. SYSTEM IDLE (시나리오 기저 상태) ==========
        body.classList.remove('is-locked');

        this.lblPrimary.innerText = "TENSION";
        this.unitPrimary.innerText = "KG";
        this.lblSecondary.innerText = "PITCH";
        this.unitSecondary.innerText = "DEG";
        this.lblTertiary.innerText = "ALTITUDE";
        this.unitTertiary.innerText = "FT";

        if (this.currentAct === 1) {
          this.targetPrimary = 1024;
          this.targetSecondary = 0.4;
          this.targetTertiary = 12.4;
          this.tickerText.innerText = "ACT 01 // GENESIS GROUND STATE NOMINAL";
        } else if (this.currentAct === 2) {
          this.targetPrimary = 3009;
          this.targetSecondary = 89.4;
          this.targetTertiary = 30.2;
          this.tickerText.innerText = "ACT 02 // CRITICAL STRESS MAX-Q // PITCH 89.4 DEG";
        } else if (this.currentAct === 3) {
          this.targetPrimary = 2140;
          this.targetSecondary = 32.1;
          this.targetTertiary = 48.6;
          this.tickerText.innerText = "ACT 03 // GEODESIC VECTOR RE-ROUTING STABILIZED";
        } else if (this.currentAct === 4) {
          this.targetPrimary = 1450;
          this.targetSecondary = 0.0;
          this.targetTertiary = 82.0;
          this.tickerText.innerText = "ACT 04 // ORBITAL GRAVITY WELL CAPTURE EQUILIBRIUM";
        }
      }

      // Smooth Numerical Interpolation
      this.curPrimary += (this.targetPrimary - this.curPrimary) * 0.15;
      this.curSecondary += (this.targetSecondary - this.curSecondary) * 0.15;
      this.curTertiary += (this.targetTertiary - this.curTertiary) * 0.15;

      this.valPrimary.innerText = Math.round(this.curPrimary);
      this.valSecondary.innerText = Number(this.curSecondary).toFixed(1);
      this.valTertiary.innerText = Number(this.curTertiary).toFixed(1);

      this.attitude.update();
      this.attitude.render(this.currentAct === 2, Boolean(activeTarget));

      this.graph.update();
      this.graph.render();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

let orchestrator;
window.addEventListener('DOMContentLoaded', () => {
  orchestrator = new TelemetryOrchestrator();
});
\`\`\`