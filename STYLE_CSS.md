# Field-OS :: Dynamic Indicator Tokens (`STYLE_CSS.md`)

## 1. 스타일 설계 규칙
* **프로브 타깃 록온 상태 (`.is-locked`)**: 노드나 엣지를 록온했을 때 아크 게이지가 사이언-네온 글로우로 전환됩니다.
* **위기 모드 (`.state-crisis`)**: Act 2 또는 고위험 노드 호버 시 테슬라 비상 레드로 점등됩니다.

---

## 2. 소스 코드 (`style.css`)

\`\`\`css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  user-select: none;
}

body {
  width: 100vw;
  height: 100vh;
  background-color: #000000;
  color: #ffffff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
  position: relative;
  cursor: crosshair;
}

#field-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: block;
}

/* ================= TOP HUD ================= */
.top-hud {
  position: absolute;
  top: 24px;
  left: 28px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 24px;
  pointer-events: none;
}

.act-selector {
  display: flex;
  gap: 8px;
  pointer-events: auto;
}

.act-btn {
  background: transparent;
  border: none;
  color: #52525b;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 6px;
  transition: color 0.15s ease;
}

.act-btn:hover { color: #d4d4d8; }
.act-btn.active {
  color: #ffffff;
  font-weight: 800;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
}

.telemetry-ticker {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  color: #71717a;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ticker-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px #22c55e;
}

body.state-crisis .ticker-dot {
  background: #ff1a3c;
  box-shadow: 0 0 8px #ff1a3c;
  animation: pulse-red 1s infinite alternate ease-in-out;
}

/* ================= BOTTOM CLUSTERS ================= */
.telemetry-cluster {
  position: absolute;
  bottom: 28px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 16px;
  pointer-events: none;
}

.cluster-left { left: 36px; }
.cluster-right { right: 36px; }

/* ================= SIGNATURE PARENTHESIS ARC DIAL ================= */
.arc-gauge {
  position: relative;
  width: 136px;
  height: 136px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arc-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.arc-path {
  fill: none;
  stroke: #ffffff;
  stroke-width: 3.2;
  stroke-linecap: round;
  transition: stroke 0.2s ease, filter 0.2s ease;
}

/* Target Lock-on Glow */
body.is-locked .arc-path {
  stroke: #00f0ff;
  filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.5));
}

body.is-locked .gauge-value {
  color: #00f0ff;
  text-shadow: 0 0 12px rgba(0, 240, 255, 0.4);
}

.gauge-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 2;
  line-height: 1;
}

.gauge-label {
  font-size: 10px;
  font-weight: 700;
  color: #a1a1aa;
  letter-spacing: 0.12em;
  margin-bottom: 5px;
}

.gauge-value {
  font-size: 32px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  margin-bottom: 5px;
  transition: color 0.2s ease;
}

.gauge-unit {
  font-size: 10px;
  font-weight: 700;
  color: #a1a1aa;
  letter-spacing: 0.14em;
}

/* ================= 3D GYRO CLUSTER ================= */
.gyro-cluster {
  width: 136px;
  height: 136px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#gyro-canvas {
  width: 136px;
  height: 136px;
  display: block;
}

/* ================= EMERGENCY RED STATE ================= */
body.state-crisis .arc-path {
  stroke: #ff1a3c;
  filter: drop-shadow(0 0 6px rgba(255, 26, 60, 0.6));
}

body.state-crisis .gauge-value {
  color: #ff1a3c;
  text-shadow: 0 0 10px rgba(255, 26, 60, 0.5);
}

@keyframes pulse-red {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

@media (max-width: 900px) {
  .cluster-left { left: 16px; bottom: 16px; gap: 8px; }
  .cluster-right { right: 16px; bottom: 16px; gap: 8px; }
  .arc-gauge, .gyro-cluster, #gyro-canvas { width: 110px; height: 110px; }
  .gauge-value { font-size: 24px; }
}
\`\`\`