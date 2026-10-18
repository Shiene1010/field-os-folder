/**
 * FIELD-OS :: TESLA EXTREME DEMONSTRATION ENGINE
 * Fullscreen Metric Warp Graph & 3D Attitude Sphere
 */

// ================= 1. 3D ATTITUDE GYROSCOPE SPHERE SIMULATOR =================
class AttitudeSphere {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // Pitch: vertical inclination (0°: level, 90°: vertical wall climb)
    this.pitch = 0;       // Current Pitch (Degrees)
    this.targetPitch = 0; // Target Pitch
    this.roll = 0;        // Current Roll
    this.targetRoll = 0;
    this.yaw = 0;         // Spin rotation
  }

  setOrientation(pitchDeg, rollDeg) {
    this.targetPitch = pitchDeg;
    this.targetRoll = rollDeg;
  }

  update() {
    this.pitch += (this.targetPitch - this.pitch) * 0.08;
    this.roll += (this.targetRoll - this.roll) * 0.08;
    this.yaw += 0.015; // Slow ambient orbit
  }

  render(isCrisis) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = 54;

    ctx.clearRect(0, 0, w, h);

    const strokeColor = isCrisis ? 'rgba(255, 26, 60, 0.7)' : 'rgba(255, 255, 255, 0.45)';
    const faintColor  = isCrisis ? 'rgba(255, 26, 60, 0.18)' : 'rgba(255, 255, 255, 0.12)';
    const solidColor  = isCrisis ? '#ff1a3c' : '#ffffff';

    // 1. Outer Horizon Circle
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Convert angles to radians
    const pitchRad = (this.pitch * Math.PI) / 180;
    const rollRad  = (this.roll * Math.PI) / 180;

    // 2. Equatorial Ring (Perspective Ellipse tilting with Pitch)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rollRad);

    const eqHeight = radius * Math.cos(pitchRad);
    ctx.strokeStyle = faintColor;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, Math.max(1, Math.abs(eqHeight)), 0, 0, Math.PI * 2);
    ctx.stroke();

    // Equatorial Horizon Tick Marks
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.moveTo(-radius, 0); ctx.lineTo(-radius + 6, 0);
    ctx.moveTo(radius - 6, 0); ctx.lineTo(radius, 0);
    ctx.stroke();

    // 3. Vertical Longitude Meridian Ring
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * Math.abs(Math.sin(this.yaw)), radius, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Central 3D Vehicle / Field Orientation Silhouette (The Climbing Roadster Model)
    // Projects top-down shape tilting vertically up to 90 degrees
    ctx.save();
    // Invert scale height based on cosine of pitch (looks flat when climbing vertical)
    const perspectiveScaleY = Math.cos(pitchRad);
    const perspectiveShiftY = -Math.sin(pitchRad) * 14;

    ctx.translate(0, perspectiveShiftY);
    ctx.scale(1, Math.abs(perspectiveScaleY) * 0.85 + 0.15);

    // Car/Chassis Body Shell (Tesla Streamlined Wedge)
    ctx.strokeStyle = solidColor;
    ctx.fillStyle = isCrisis ? 'rgba(255, 26, 60, 0.3)' : 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    // Aerodynamic nose
    ctx.moveTo(0, -22);
    ctx.bezierCurveTo(8, -20, 11, -10, 11, 4);
    // Rear haunch & spoiler
    ctx.lineTo(12, 18);
    ctx.lineTo(-12, 18);
    ctx.lineTo(-11, 4);
    ctx.bezierCurveTo(-11, -10, -8, -20, 0, -22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Canopy / Cockpit Glass
    ctx.fillStyle = isCrisis ? '#ff1a3c' : '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.bezierCurveTo(4, -10, 6, -3, 6, 6);
    ctx.lineTo(-6, 6);
    ctx.bezierCurveTo(-6, -3, -4, -10, 0, -12);
    ctx.closePath();
    ctx.fill();

    // Wheel Arcs Indicator
    ctx.strokeStyle = solidColor;
    ctx.lineWidth = 2.5;
    [-13, 11].forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x, -14); ctx.lineTo(x, -6);
      ctx.moveTo(x, 8);   ctx.lineTo(x, 16);
      ctx.stroke();
    });

    ctx.restore(); // restore car
    ctx.restore(); // restore translated gyro
  }
}

// ================= 2. FULLSCREEN FIELD GRAPH ENGINE =================
class FieldGraphEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.currentAct = 1;
    this.globalTick = 0;

    // Spacetime Metric Mesh
    this.cols = 36;
    this.rows = 24;
    this.mesh = [];

    // Graph Entities
    this.nodes = [];
    this.edges = [];

    this.resize();
    this.initMesh();
    this.buildAct1();

    window.addEventListener('resize', () => {
      this.resize();
      this.initMesh();
    });
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

  // ================= SCENARIO STATES =================

  buildAct1() {
    this.currentAct = 1;
    this.nodes = [];
    this.edges = [];
    const cx = this.width / 2;
    const cy = this.height / 2;

    const count = 12;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const dist = 160 + Math.sin(i * 2) * 45;
      this.nodes.push({
        id: `seed_${i}`,
        type: 'seed',
        x: cx + Math.cos(a) * dist,
        y: cy + Math.sin(a) * dist,
        targetX: cx + Math.cos(a) * dist,
        targetY: cy + Math.sin(a) * dist,
        vx: 0, vy: 0,
        mass: 1.0,
        radius: 3.5
      });
    }

    for (let i = 0; i < count; i++) {
      this.edges.push({
        from: `seed_${i}`,
        to: `seed_${(i + 1) % count}`,
        stress: 0.05,
        isCritical: false
      });
    }
  }

  buildAct2() {
    this.currentAct = 2;
    this.nodes = [];
    this.edges = [];
    const cx = this.width / 2;
    const cy = this.height / 2;

    // Critical Nodes (Asymmetric Sharp Stress Shards)
    this.nodes.push({
      id: 'crit_1',
      type: 'critical',
      x: cx - 180, y: cy - 60,
      targetX: cx - 180, targetY: cy - 60,
      vx: 0, vy: 0,
      mass: 8.5,
      radius: 20,
      angle: -Math.PI / 4
    });

    this.nodes.push({
      id: 'crit_2',
      type: 'critical',
      x: cx + 190, y: cy + 70,
      targetX: cx + 190, targetY: cy + 70,
      vx: 0, vy: 0,
      mass: 8.0,
      radius: 20,
      angle: (3 * Math.PI) / 4
    });

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
      this.nodes.push({
        id: `split_${i}`,
        type: 'split',
        x: cx + Math.cos(a) * 110,
        y: cy + Math.sin(a) * 110,
        targetX: cx + Math.cos(a) * 110,
        targetY: cy + Math.sin(a) * 110,
        vx: 0, vy: 0,
        mass: 4.2,
        radius: 14,
        rotation: 0
      });
    }

    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const dist = 280 + Math.sin(i * 3) * 70;
      this.nodes.push({
        id: `chaos_${i}`,
        type: 'seed',
        x: cx + Math.cos(a) * dist,
        y: cy + Math.sin(a) * dist,
        targetX: cx + Math.cos(a) * dist,
        targetY: cy + Math.sin(a) * dist,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        mass: 1.5,
        radius: 3.5
      });
    }

    this.edges.push({ from: 'crit_1', to: 'crit_2', stress: 1.0, isCritical: true });
    this.edges.push({ from: 'crit_1', to: 'split_0', stress: 0.9, isCritical: true });
    this.edges.push({ from: 'crit_2', to: 'split_1', stress: 0.9, isCritical: true });
    this.edges.push({ from: 'split_0', to: 'split_2', stress: 0.6, isCritical: false });
    this.edges.push({ from: 'split_1', to: 'split_2', stress: 0.6, isCritical: false });

    for (let i = 0; i < 14; i++) {
      this.edges.push({
        from: `chaos_${i}`,
        to: i % 2 === 0 ? 'crit_1' : 'crit_2',
        stress: 0.75,
        isCritical: true
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
      id: 'poly_left',
      type: 'polyhedron',
      x: cx - 180, y: cy,
      targetX: cx - 180, targetY: cy,
      vx: 0, vy: 0,
      mass: 6.0,
      radius: 22,
      rotation: 0
    });

    this.nodes.push({
      id: 'poly_right',
      type: 'polyhedron',
      x: cx + 180, y: cy,
      targetX: cx + 180, targetY: cy,
      vx: 0, vy: 0,
      mass: 6.0,
      radius: 22,
      rotation: Math.PI / 4
    });

    this.nodes.push({
      id: 'split_top',
      type: 'split',
      x: cx, y: cy - 140,
      targetX: cx, targetY: cy - 140,
      vx: 0, vy: 0,
      mass: 3.5,
      radius: 14,
      rotation: 0
    });

    this.nodes.push({
      id: 'split_bot',
      type: 'split',
      x: cx, y: cy + 140,
      targetX: cx, targetY: cy + 140,
      vx: 0, vy: 0,
      mass: 3.5,
      radius: 14,
      rotation: Math.PI
    });

    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      this.nodes.push({
        id: `orb_${i}`,
        type: 'seed',
        x: cx + Math.cos(a) * 290,
        y: cy + Math.sin(a) * 230,
        targetX: cx + Math.cos(a) * 290,
        targetY: cy + Math.sin(a) * 230,
        vx: 0, vy: 0,
        mass: 1.8,
        radius: 3.5
      });
    }

    this.edges.push({ from: 'poly_left', to: 'split_top', stress: 0.2, geodesicWarp: 1.8 });
    this.edges.push({ from: 'split_top', to: 'poly_right', stress: 0.2, geodesicWarp: 1.8 });
    this.edges.push({ from: 'poly_right', to: 'split_bot', stress: 0.2, geodesicWarp: 1.8 });
    this.edges.push({ from: 'split_bot', to: 'poly_left', stress: 0.2, geodesicWarp: 1.8 });
    this.edges.push({ from: 'poly_left', to: 'poly_right', stress: 0.3, geodesicWarp: 2.2 });

    for (let i = 0; i < 14; i++) {
      this.edges.push({
        from: `orb_${i}`,
        to: i < 7 ? 'poly_left' : 'poly_right',
        stress: 0.15,
        geodesicWarp: 1.2
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
      id: 'master_core',
      type: 'mature_circle',
      x: cx, y: cy,
      targetX: cx, targetY: cy,
      vx: 0, vy: 0,
      mass: 19.0,
      radius: 40,
      ripples: [0, 0.33, 0.66]
    });

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      this.nodes.push({
        id: `sat_poly_${i}`,
        type: 'polyhedron',
        x: cx + Math.cos(a) * 170,
        y: cy + Math.sin(a) * 170,
        targetX: cx + Math.cos(a) * 170,
        targetY: cy + Math.sin(a) * 170,
        orbitAngle: a,
        orbitRadius: 170,
        orbitSpeed: 0.007,
        vx: 0, vy: 0,
        mass: 5.0,
        radius: 18,
        rotation: 0
      });
      this.edges.push({ from: 'master_core', to: `sat_poly_${i}`, stress: 0.05, geodesicWarp: 0.9 });
    }

    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      this.nodes.push({
        id: `star_${i}`,
        type: 'seed',
        x: cx + Math.cos(a) * 300,
        y: cy + Math.sin(a) * 300,
        targetX: cx + Math.cos(a) * 300,
        targetY: cy + Math.sin(a) * 300,
        orbitAngle: a,
        orbitRadius: 300,
        orbitSpeed: 0.0035 * (i % 2 === 0 ? 1 : -1),
        vx: 0, vy: 0,
        mass: 1.5,
        radius: 3.5
      });
      this.edges.push({ from: `star_${i}`, to: `sat_poly_${i % 3}`, stress: 0.02, geodesicWarp: 0.7 });
    }
  }

  // ================= UPDATE PHYSICS & WARP =================

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

  // ================= RENDER PASSES =================

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Metric space distortion mesh (Minimal, razor thin)
    this.renderMesh(ctx);

    // 2. Geodesic curved laser lines
    this.renderEdges(ctx);

    // 3. Five-stage maturity entities
    this.renderNodes(ctx);
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

      const ctrlX = midX + biasX;
      const ctrlY = midY + biasY;

      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.quadraticCurveTo(ctrlX, ctrlY, n2.x, n2.y);

      if (edge.isCritical) {
        const pulse = 0.5 + Math.sin(this.globalTick * 0.25) * 0.45;
        ctx.strokeStyle = `rgba(255, 26, 60, ${pulse})`;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#ff1a3c';
        ctx.shadowBlur = 10;
      } else if (this.currentAct === 3) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.shadowBlur = 0;
      } else if (this.currentAct === 4) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.0;
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
      ctx.arc(qx, qy, edge.isCritical ? 2.5 : 1.8, 0, Math.PI * 2);
      ctx.fillStyle = edge.isCritical ? '#ff1a3c' : '#ffffff';
      ctx.fill();
    });

    ctx.restore();
  }

  renderNodes(ctx) {
    this.nodes.forEach(node => {
      ctx.save();
      ctx.translate(node.x, node.y);

      switch (node.type) {
        case 'seed':
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'critical':
          ctx.rotate(node.angle || 0);
          const r = node.radius * 1.3;
          const pulse = Math.sin(this.globalTick * 0.25) * 2.5;

          ctx.shadowColor = '#ff1a3c';
          ctx.shadowBlur = 16;
          ctx.fillStyle = 'rgba(255, 26, 60, 0.25)';
          ctx.strokeStyle = '#ff1a3c';
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
          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.strokeStyle = '#ffffff';
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
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';

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

          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.strokeStyle = '#ffffff';
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
}

// ================= 3. MASTER TELEMETRY ORCHESTRATOR =================
class TelemetryOrchestrator {
  constructor() {
    this.graph = new FieldGraphEngine('field-canvas');
    this.attitude = new AttitudeSphere('gyro-canvas');

    this.valTension = document.getElementById('val-tension');
    this.valPitch = document.getElementById('val-pitch');
    this.valCurvature = document.getElementById('val-curvature');
    this.tickerText = document.getElementById('ticker-text');

    this.currentAct = 1;
    this.targetTension = 1420;
    this.curTension = 1420;

    this.targetPitchNum = 0.4;
    this.curPitchNum = 0.4;

    this.targetAltitude = 12.4;
    this.curAltitude = 12.4;

    this.setAct(1);
    this.startLoop();
  }

  setAct(act) {
    this.currentAct = act;

    // Button states
    document.querySelectorAll('.act-btn').forEach((b, i) => {
      b.classList.toggle('active', i + 1 === act);
    });

    const body = document.body;

    switch (act) {
      case 1:
        body.classList.remove('state-crisis');
        this.graph.buildAct1();
        this.attitude.setOrientation(0.4, 0);
        this.targetTension = 1024;
        this.targetPitchNum = 0.4;
        this.targetAltitude = 12.4;
        this.tickerText.innerText = "ACT 01 // GENESIS GROUND STATE NOMINAL";
        break;

      case 2:
        // Stunt Peak: Vertical climb 89.4 DEG (Exact match with reference image)
        body.classList.add('state-crisis');
        this.graph.buildAct2();
        this.attitude.setOrientation(89.4, -4);
        this.targetTension = 3009;
        this.targetPitchNum = 89.4;
        this.targetAltitude = 30.2;
        this.tickerText.innerText = "ACT 02 // CRITICAL STRESS MAX-Q // PITCH 89.4 DEG";
        break;

      case 3:
        body.classList.remove('state-crisis');
        this.graph.buildAct3();
        this.attitude.setOrientation(32.1, 8);
        this.targetTension = 2140;
        this.targetPitchNum = 32.1;
        this.targetAltitude = 48.6;
        this.tickerText.innerText = "ACT 03 // GEODESIC VECTOR RE-ROUTING STABILIZED";
        break;

      case 4:
        body.classList.remove('state-crisis');
        this.graph.buildAct4();
        this.attitude.setOrientation(0.0, 0);
        this.targetTension = 1450;
        this.targetPitchNum = 0.0;
        this.targetAltitude = 82.0;
        this.tickerText.innerText = "ACT 04 // ORBITAL GRAVITY WELL CAPTURE EQUILIBRIUM";
        break;
    }
  }

  startLoop() {
    const loop = () => {
      // Numerical interpolation for smooth live indicator readout
      this.curTension += (this.targetTension - this.curTension) * 0.1;
      this.curPitchNum += (this.targetPitchNum - this.curPitchNum) * 0.1;
      this.curAltitude += (this.targetAltitude - this.curAltitude) * 0.1;

      // Subtle telemetry jitter
      const jitter = (Math.random() - 0.5) * 0.08;
      const displayPitch = (this.curPitchNum + jitter).toFixed(1);
      const displayAlt = (this.curAltitude + jitter).toFixed(1);

      this.valTension.innerText = Math.round(this.curTension);
      this.valPitch.innerText = displayPitch;
      this.valCurvature.innerText = displayAlt;

      this.attitude.update();
      this.attitude.render(this.currentAct === 2);

      this.graph.update();
      this.graph.render();

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// Boot application
let orchestrator;
window.addEventListener('DOMContentLoaded', () => {
  orchestrator = new TelemetryOrchestrator();
});