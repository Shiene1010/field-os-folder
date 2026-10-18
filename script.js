/**
 * FIELD-OS :: SPACEX & TESLA HUD TELEMETRY ENGINE
 */

class SpaceXFieldSimulator {
  constructor() {
    this.canvas = document.getElementById('telemetry-canvas');
    this.ctx = this.canvas.getContext('2d');

    // G-Meter mini canvas
    this.gCanvas = document.getElementById('g-meter-canvas');
    this.gCtx = this.gCanvas.getContext('2d');

    this.currentAct = 1;
    this.globalTick = 0;
    this.startTime = performance.now();
    this.lastFpsUpdate = performance.now();
    this.frameCount = 0;

    // Metric Tensor Coordinate Mesh
    this.cols = 40;
    this.rows = 26;
    this.mesh = [];

    // Topology entities
    this.nodes = [];
    this.edges = [];

    // Telemetry metrics
    this.tension = 1420;
    this.entropy = 0.05;
    this.curvature = 0.08;
    this.gForceX = 0;
    this.gForceY = 0;

    this.resize();
    this.initMesh();
    this.buildAct1();

    window.addEventListener('resize', () => {
      this.resize();
      this.initMesh();
    });
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
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
        this.mesh.push({ baseX, baseY, x: baseX, y: baseY, vx: 0, vy: 0 });
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

    const count = 10;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const dist = 140 + Math.sin(i * 2) * 50;
      this.nodes.push({
        id: `seed_${i}`,
        type: 'seed',
        x: cx + Math.cos(a) * dist,
        y: cy + Math.sin(a) * dist,
        targetX: cx + Math.cos(a) * dist,
        targetY: cy + Math.sin(a) * dist,
        vx: 0, vy: 0,
        mass: 1.0,
        radius: 4,
        label: `SD-${i + 1}`
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

    this.nodes.push({
      id: 'crit_1',
      type: 'critical',
      x: cx - 160, y: cy - 50,
      targetX: cx - 160, targetY: cy - 50,
      vx: 0, vy: 0,
      mass: 8.5,
      radius: 20,
      angle: -Math.PI / 4,
      label: 'CRIT-ABORT-01'
    });

    this.nodes.push({
      id: 'crit_2',
      type: 'critical',
      x: cx + 170, y: cy + 60,
      targetX: cx + 170, targetY: cy + 60,
      vx: 0, vy: 0,
      mass: 8.0,
      radius: 20,
      angle: (3 * Math.PI) / 4,
      label: 'CRIT-ABORT-02'
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
        rotation: 0,
        label: `STAGE-SEP-${i + 1}`
      });
    }

    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const dist = 260 + Math.sin(i * 3) * 60;
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
        radius: 3.5,
        label: `RPT-${i + 10}`
      });
    }

    this.edges.push({ from: 'crit_1', to: 'crit_2', stress: 1.0, isCritical: true });
    this.edges.push({ from: 'crit_1', to: 'split_0', stress: 0.85, isCritical: true });
    this.edges.push({ from: 'crit_2', to: 'split_1', stress: 0.85, isCritical: true });
    this.edges.push({ from: 'split_0', to: 'split_2', stress: 0.6, isCritical: false });
    this.edges.push({ from: 'split_1', to: 'split_2', stress: 0.6, isCritical: false });

    for (let i = 0; i < 14; i++) {
      this.edges.push({
        from: `chaos_${i}`,
        to: i % 2 === 0 ? 'crit_1' : 'crit_2',
        stress: 0.7,
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
      x: cx - 170, y: cy,
      targetX: cx - 170, targetY: cy,
      vx: 0, vy: 0,
      mass: 6.0,
      radius: 22,
      rotation: 0,
      label: 'POLY-CORE-ALPHA'
    });

    this.nodes.push({
      id: 'poly_right',
      type: 'polyhedron',
      x: cx + 170, y: cy,
      targetX: cx + 170, targetY: cy,
      vx: 0, vy: 0,
      mass: 6.0,
      radius: 22,
      rotation: Math.PI / 4,
      label: 'POLY-CORE-BETA'
    });

    this.nodes.push({
      id: 'split_n',
      type: 'split',
      x: cx, y: cy - 140,
      targetX: cx, targetY: cy - 140,
      vx: 0, vy: 0,
      mass: 3.5,
      radius: 14,
      rotation: 0,
      label: 'GIMBAL-N'
    });

    this.nodes.push({
      id: 'split_s',
      type: 'split',
      x: cx, y: cy + 140,
      targetX: cx, targetY: cy + 140,
      vx: 0, vy: 0,
      mass: 3.5,
      radius: 14,
      rotation: Math.PI,
      label: 'GIMBAL-S'
    });

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      this.nodes.push({
        id: `sat_${i}`,
        type: 'seed',
        x: cx + Math.cos(a) * 270,
        y: cy + Math.sin(a) * 220,
        targetX: cx + Math.cos(a) * 270,
        targetY: cy + Math.sin(a) * 220,
        vx: 0, vy: 0,
        mass: 1.8,
        radius: 4,
        label: `TRAJ-${i + 1}`
      });
    }

    this.edges.push({ from: 'poly_left', to: 'split_n', stress: 0.2, geodesicWarp: 1.8 });
    this.edges.push({ from: 'split_n', to: 'poly_right', stress: 0.2, geodesicWarp: 1.8 });
    this.edges.push({ from: 'poly_right', to: 'split_s', stress: 0.2, geodesicWarp: 1.8 });
    this.edges.push({ from: 'split_s', to: 'poly_left', stress: 0.2, geodesicWarp: 1.8 });
    this.edges.push({ from: 'poly_left', to: 'poly_right', stress: 0.3, geodesicWarp: 2.4 });

    for (let i = 0; i < 12; i++) {
      this.edges.push({
        from: `sat_${i}`,
        to: i < 6 ? 'poly_left' : 'poly_right',
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
      id: 'mature_master',
      type: 'mature_circle',
      x: cx, y: cy,
      targetX: cx, targetY: cy,
      vx: 0, vy: 0,
      mass: 18.0,
      radius: 38,
      ripples: [0, 0.33, 0.66],
      label: 'ORBITAL-WELL-01'
    });

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      this.nodes.push({
        id: `orb_poly_${i}`,
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
        rotation: 0,
        label: `SAT-POLY-${i + 1}`
      });
      this.edges.push({ from: 'mature_master', to: `orb_poly_${i}`, stress: 0.05, geodesicWarp: 0.9 });
    }

    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      this.nodes.push({
        id: `orb_seed_${i}`,
        type: 'seed',
        x: cx + Math.cos(a) * 280,
        y: cy + Math.sin(a) * 280,
        targetX: cx + Math.cos(a) * 280,
        targetY: cy + Math.sin(a) * 280,
        orbitAngle: a,
        orbitRadius: 280,
        orbitSpeed: 0.0035 * (i % 2 === 0 ? 1 : -1),
        vx: 0, vy: 0,
        mass: 1.5,
        radius: 3.5,
        label: `STARLINK-${100 + i}`
      });
      this.edges.push({ from: `orb_seed_${i}`, to: `orb_poly_${i % 3}`, stress: 0.02, geodesicWarp: 0.7 });
    }
  }

  // ================= UPDATE PHYSICS & TELEMETRY =================

  update() {
    this.globalTick++;
    const cx = this.width / 2;
    const cy = this.height / 2;

    // Mission Clock T+ Calculation
    const elapsedMs = performance.now() - this.startTime;
    const totalSec = Math.floor(elapsedMs / 1000);
    const hours = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    const ms = String(Math.floor((elapsedMs % 1000) / 100));
    document.getElementById('mission-clock').innerText = `T+ ${hours}:${mins}:${secs}.${ms}`;

    // Node Dynamics
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

    // Space-Time Metric Grid Warp
    const warp = this.currentAct === 2 ? 2600 : (this.currentAct === 4 ? 3400 : 1300);
    for (let pt of this.mesh) {
      let tx = 0, ty = 0;
      for (let node of this.nodes) {
        const dx = node.x - pt.baseX;
        const dy = node.y - pt.baseY;
        const d2 = dx * dx + dy * dy + 800;
        const d = Math.sqrt(d2);
        const pull = (node.mass * warp) / d2;
        tx += (dx / d) * pull;
        ty += (dy / d) * pull;

        if (node.type === 'critical') {
          const theta = Math.atan2(dy, dx);
          const shear = Math.sin(this.globalTick * 0.2) * 15;
          tx += Math.cos(theta + Math.PI / 2) * (pull * 0.85) + shear * (pull / 25);
          ty += Math.sin(theta + Math.PI / 2) * (pull * 0.85);
        }
      }
      pt.x += (pt.baseX + tx - pt.x) * 0.16;
      pt.y += (pt.baseY + ty - pt.y) * 0.16;
    }

    // Telemetry Tape Calculations
    if (this.currentAct === 1) {
      this.tension = 1420 + Math.sin(this.globalTick * 0.05) * 80;
      this.entropy = 0.05 + Math.cos(this.globalTick * 0.04) * 0.01;
      this.curvature = 0.08;
      this.gForceX = Math.sin(this.globalTick * 0.03) * 0.1;
      this.gForceY = 1.0 + Math.cos(this.globalTick * 0.03) * 0.05;
    } else if (this.currentAct === 2) {
      this.tension = 4450 + Math.sin(this.globalTick * 0.25) * 350;
      this.entropy = 0.94 + Math.cos(this.globalTick * 0.2) * 0.05;
      this.curvature = 0.74 + Math.sin(this.globalTick * 0.15) * 0.08;
      this.gForceX = (Math.random() - 0.5) * 1.8;
      this.gForceY = 2.4 + (Math.random() - 0.5) * 1.2;
    } else if (this.currentAct === 3) {
      this.tension = 2650 + Math.sin(this.globalTick * 0.08) * 120;
      this.entropy = 0.28 + Math.cos(this.globalTick * 0.06) * 0.02;
      this.curvature = 0.58;
      this.gForceX = Math.sin(this.globalTick * 0.05) * 0.4;
      this.gForceY = 1.6 + Math.cos(this.globalTick * 0.05) * 0.2;
    } else if (this.currentAct === 4) {
      this.tension = 1820;
      this.entropy = 0.02;
      this.curvature = 0.98;
      this.gForceX = 0;
      this.gForceY = 1.0;
    }

    this.updateHUD();
    this.renderGMeter();
  }

  updateHUD() {
    document.getElementById('tape-tension-num').innerText = Math.round(this.tension).toLocaleString();
    document.getElementById('tape-tension-bar').style.width = `${Math.min(100, (this.tension / 5000) * 100)}%`;

    document.getElementById('tape-entropy-num').innerText = this.entropy.toFixed(2);
    document.getElementById('tape-entropy-bar').style.width = `${Math.min(100, this.entropy * 100)}%`;

    document.getElementById('tape-curvature-num').innerText = this.curvature.toFixed(2);
    document.getElementById('tape-curvature-bar').style.width = `${Math.min(100, this.curvature * 100)}%`;

    const totalG = Math.hypot(this.gForceX, this.gForceY);
    document.getElementById('g-force-val').innerText = `${totalG.toFixed(2)} G`;

    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 500) {
      const fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      document.getElementById('fps-val').innerText = fps;
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  renderGMeter() {
    const ctx = this.gCtx;
    const w = this.gCanvas.width;
    const h = this.gCanvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    [20, 40, 58].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.moveTo(cx, 8); ctx.lineTo(cx, h - 8);
    ctx.moveTo(8, cy); ctx.lineTo(w - 8, cy);
    ctx.stroke();

    const px = cx + this.gForceX * 24;
    const py = cy - (this.gForceY - 1.0) * 24;

    ctx.fillStyle = this.currentAct === 2 ? '#ff1a3c' : '#00f0ff';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // ================= RENDER PASSES =================

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    this.renderCoordinateMesh(ctx);
    this.renderGeodesicVectors(ctx);
    this.renderAerospaceNodes(ctx);
  }

  renderCoordinateMesh(ctx) {
    ctx.save();
    ctx.lineWidth = 0.6;
    const isAct2 = this.currentAct === 2;
    ctx.strokeStyle = isAct2 ? 'rgba(255, 26, 60, 0.15)' : 'rgba(255, 255, 255, 0.08)';

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

    ctx.fillStyle = isAct2 ? 'rgba(255, 26, 60, 0.4)' : 'rgba(255, 255, 255, 0.2)';
    for (let r = 2; r < this.rows; r += 4) {
      for (let c = 2; c < this.cols; c += 4) {
        const pt = this.mesh[r * (this.cols + 1) + c];
        ctx.fillRect(pt.x - 2, pt.y - 0.5, 4, 1);
        ctx.fillRect(pt.x - 0.5, pt.y - 2, 1, 4);
      }
    }
    ctx.restore();
  }

  renderGeodesicVectors(ctx) {
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
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
        ctx.lineWidth = 1.4;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 6;
      } else if (this.currentAct === 4) {
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
        ctx.lineWidth = 1.4;
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.0;
        ctx.shadowBlur = 0;
      }

      ctx.stroke();

      const pulseSpeed = edge.isCritical ? 0.03 : 0.015;
      const t = (this.globalTick * pulseSpeed) % 1;
      const qx = (1 - t) * (1 - t) * n1.x + 2 * (1 - t) * t * ctrlX + t * t * n2.x;
      const qy = (1 - t) * (1 - t) * n1.y + 2 * (1 - t) * t * ctrlY + t * t * n2.y;

      ctx.beginPath();
      ctx.arc(qx, qy, edge.isCritical ? 2.8 : 2.0, 0, Math.PI * 2);
      ctx.fillStyle = edge.isCritical ? '#ff1a3c' : '#ffffff';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 6;
      ctx.fill();
    });

    ctx.restore();
  }

  renderAerospaceNodes(ctx) {
    this.nodes.forEach(node => {
      ctx.save();
      ctx.translate(node.x, node.y);

      if (node.type !== 'seed') {
        this.drawTargetBrackets(ctx, node);
      }

      switch (node.type) {
        case 'seed':
          this.drawSeedNode(ctx, node);
          break;
        case 'critical':
          this.drawCriticalNode(ctx, node);
          break;
        case 'split':
          this.drawSplitNode(ctx, node);
          break;
        case 'polyhedron':
          this.drawPolyhedronNode(ctx, node);
          break;
        case 'mature_circle':
          this.drawMatureCircleNode(ctx, node);
          break;
      }

      if (node.label && (this.currentAct !== 2 || node.type === 'critical')) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillText(node.label, node.radius + 8, 3);
      }

      ctx.restore();
    });
  }

  drawTargetBrackets(ctx, node) {
    const bSize = node.radius + 12;
    const arm = 6;
    ctx.strokeStyle = node.type === 'critical' ? '#ff1a3c' : 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(-bSize, -bSize + arm); ctx.lineTo(-bSize, -bSize); ctx.lineTo(-bSize + arm, -bSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bSize - arm, -bSize); ctx.lineTo(bSize, -bSize); ctx.lineTo(bSize, -bSize + arm);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-bSize, bSize - arm); ctx.lineTo(-bSize, bSize); ctx.lineTo(-bSize + arm, bSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bSize - arm, bSize); ctx.lineTo(bSize, bSize); ctx.lineTo(bSize, bSize - arm);
    ctx.stroke();
  }

  drawSeedNode(ctx, node) {
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, node.radius * 0.4, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawCriticalNode(ctx, node) {
    ctx.rotate(node.angle || 0);
    const r = node.radius * 1.3;
    const pulse = Math.sin(this.globalTick * 0.25) * 2.5;

    ctx.shadowColor = '#ff1a3c';
    ctx.shadowBlur = 18;
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
  }

  drawSplitNode(ctx, node) {
    ctx.rotate(node.rotation || 0);
    const r = node.radius * 1.25;

    ctx.shadowColor = '#ffb700';
    ctx.shadowBlur = 12;
    ctx.fillStyle = 'rgba(255, 183, 0, 0.15)';
    ctx.strokeStyle = '#ffb700';
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawPolyhedronNode(ctx, node) {
    ctx.rotate(node.rotation || 0);
    const r = node.radius;

    ctx.shadowColor = '#b347ff';
    ctx.shadowBlur = 16;
    ctx.strokeStyle = '#b347ff';
    ctx.lineWidth = 1.8;
    ctx.fillStyle = 'rgba(179, 71, 255, 0.12)';

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const innerR = r * 0.58;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const ix = Math.cos(a + Math.PI / 6) * innerR;
      const iy = Math.sin(a + Math.PI / 6) * innerR;
      ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.lineTo(ix, iy);
    }
    ctx.stroke();
  }

  drawMatureCircleNode(ctx, node) {
    const r = node.radius;

    node.ripples = node.ripples.map(wave => {
      const next = (wave + 0.007) % 1;
      const waveR = r + next * 90;
      ctx.beginPath();
      ctx.arc(0, 0, waveR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 255, 136, ${(1 - next) * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      return next;
    });

    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 24;
    ctx.fillStyle = 'rgba(0, 255, 136, 0.22)';
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate(this.globalTick * 0.02);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 7]);
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// ================= DOWNSLINK REALTIME STREAM CONSOLE =================

class SpaceXConsole {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.queue = [];
    this.isTyping = false;
  }

  post(tag, msg, color = 'text-white', packet = null) {
    this.queue.push({ tag, msg, color, packet });
    if (!this.isTyping) this.flush();
  }

  flush() {
    if (this.queue.length === 0) {
      this.isTyping = false;
      return;
    }

    this.isTyping = true;
    const item = this.queue.shift();
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0')}`;

    const entry = document.createElement('div');
    entry.className = "border-l border-white/20 pl-2 text-[10.5px] font-mono leading-tight";

    const line = document.createElement('div');
    line.innerHTML = `<span class="text-slate-500">[${time}]</span> <span class="font-bold uppercase ${item.color}">[${item.tag}]</span> <span></span>`;
    entry.appendChild(line);

    if (item.packet) {
      const pre = document.createElement('pre');
      pre.className = "text-[9.5px] text-tele-cyan/85 bg-tele-black p-1.5 rounded border border-white/10 overflow-x-auto my-1";
      pre.innerText = JSON.stringify(item.packet, null, 2);
      entry.appendChild(pre);
    }

    this.container.appendChild(entry);
    this.container.scrollTop = this.container.scrollHeight;

    const target = line.querySelector('span:last-child');
    const text = item.msg;
    let idx = 0;

    const timer = setInterval(() => {
      if (idx < text.length) {
        target.textContent += text.charAt(idx++);
        this.container.scrollTop = this.container.scrollHeight;
      } else {
        clearInterval(timer);
        setTimeout(() => this.flush(), 90);
      }
    }, 10);
  }
}

// ================= ORCHESTRATION CONTROLLER =================

class TelemetryOrchestrator {
  constructor() {
    this.sim = new SpaceXFieldSimulator();
    this.console = new SpaceXConsole('terminal-stream');

    this.console.post("MISSION-INIT", "Field-OS telemetry downlink lock acquired on QPSK transponder.", "text-tele-cyan", {
      stage: "PRE-LAUNCH",
      downlink_freq_ghz: 28.5,
      telemetry_bus: "MIL-STD-1553B"
    });

    this.console.post("FIDO", "Stage 1 Genesis flight dynamics verified. Grid stabilized.", "text-white");

    const loop = () => {
      this.sim.update();
      this.sim.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  setAct(act) {
    for (let i = 1; i <= 4; i++) {
      const btn = document.getElementById(`act-btn-${i}`);
      if (i === act) {
        btn.className = "w-full text-left p-2.5 rounded bg-white/10 border-l-4 border-tele-cyan border-white/20 text-white transition-all duration-150 flex flex-col gap-0.5";
      } else {
        btn.className = "w-full text-left p-2.5 rounded bg-tele-dark/60 hover:bg-white/5 border-l-4 border-transparent border-white/10 text-slate-300 transition-all duration-150 flex flex-col gap-0.5";
      }
    }

    const modeText = document.getElementById('flight-mode-text');

    switch (act) {
      case 1:
        this.sim.buildAct1();
        modeText.innerText = "STAGE 1 // ORBITAL EQUILIBRIUM";
        modeText.className = "text-tele-cyan font-bold";
        this.console.post("STAGE-CTRL", "Act 1: Re-established ground state baseline orbit.", "text-tele-cyan", {
          entropy_level: "NOMINAL",
          attitude: "LOCKED",
          active_seeds: this.sim.nodes.length
        });
        break;

      case 2:
        this.sim.buildAct2();
        modeText.innerText = "MAX-Q // ENTROPY SURGE ANOMALY";
        modeText.className = "text-tele-red font-bold";
        this.console.post("ABORT-ALERT", "Act 2 Injected: Severe aerodynamic report entropy spike. CriticalNode shear stress high.", "text-tele-red", {
          alert_code: "MAX_Q_OVERTENSION",
          strain_s: "0.94 S",
          critical_entities: ["CRIT-ABORT-01", "CRIT-ABORT-02"]
        });
        break;

      case 3:
        this.sim.buildAct3();
        modeText.innerText = "CLOSED-LOOP // GEODESIC VECTORING";
        modeText.className = "text-tele-amber font-bold";
        this.console.post("GIMBAL-CORR", "Act 3 Active: Anti-collision repulsion active. Gravitational geodesic trajectory re-routed.", "text-tele-amber", {
          guidance_algorithm: "BARNES_HUT_REPULSION",
          kappa_curvature: "0.58 rad",
          reroute_status: "SUCCESS"
        });
        break;

      case 4:
        this.sim.buildAct4();
        modeText.innerText = "ORBITAL CAPTURE // SINGULARITY HORIZON";
        modeText.className = "text-tele-green font-bold";
        this.console.post("INJECTION", "Act 4 Achieved: Spacecraft successfully captured by MatureCircle Gravity Well.", "text-tele-green", {
          capture_velocity_kms: 7.82,
          mass_index: 18.0,
          loop_condition: "STABLE_CIRCULAR_ORBIT"
        });
        break;
    }
  }
}

// Initialize system on window load
let telemetrySys;
window.addEventListener('DOMContentLoaded', () => {
  telemetrySys = new TelemetryOrchestrator();
});