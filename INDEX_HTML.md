# Field-OS :: Viewport Structure (`INDEX_HTML.md`)

## 1. 개요
동적 텔레메트리 프로브(Interactive Probe)를 지원하기 위해 괄호형 아크 게이지의 라벨, 숫자, 단위 ID가 동적 모핑을 수용하도록 구성되었습니다.

---

## 2. 소스 코드 (`index.html`)

\`\`\`html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FIELD-OS // TESLA SENSOR PROBE TELEMETRY</title>
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <!-- Fullscreen Interactive Canvas -->
  <canvas id="field-canvas"></canvas>

  <!-- ================= TOP: ACT SELECTOR & TICKER ================= -->
  <header class="top-hud">
    <div class="act-selector">
      <button class="act-btn active" onclick="orchestrator.setAct(1)">[ 01 ]</button>
      <button class="act-btn" onclick="orchestrator.setAct(2)">[ 02 ]</button>
      <button class="act-btn" onclick="orchestrator.setAct(3)">[ 03 ]</button>
      <button class="act-btn" onclick="orchestrator.setAct(4)">[ 04 ]</button>
    </div>
    <div class="telemetry-ticker" id="telemetry-ticker">
      <span class="ticker-dot"></span>
      <span id="ticker-text">FIELD-OS PROBE READY // AMBIENT SENSING</span>
    </div>
  </header>

  <!-- ================= BOTTOM-LEFT CLUSTER ================= -->
  <div class="telemetry-cluster cluster-left">
    
    <!-- Dynamic Gauge 1: Tension / Density / Stress -->
    <div class="arc-gauge" id="gauge-primary">
      <svg class="arc-svg" viewBox="0 0 140 140">
        <path class="arc-path arc-left" d="M 45,18 A 58,58 0 0,0 45,122" />
        <path class="arc-path arc-right" d="M 95,18 A 58,58 0 0,1 95,122" />
      </svg>
      <div class="gauge-content">
        <span class="gauge-label" id="lbl-primary">TENSION</span>
        <span class="gauge-value" id="val-primary">3009</span>
        <span class="gauge-unit" id="unit-primary">KG</span>
      </div>
    </div>

    <!-- Gauge 2: 3D Attitude Sphere Canvas -->
    <div class="gyro-cluster">
      <canvas id="gyro-canvas" width="140" height="140"></canvas>
    </div>

  </div>

  <!-- ================= BOTTOM-RIGHT CLUSTER ================= -->
  <div class="telemetry-cluster cluster-right">

    <!-- Dynamic Gauge 3: Pitch / Stage / Geodesic Curve -->
    <div class="arc-gauge" id="gauge-secondary">
      <svg class="arc-svg" viewBox="0 0 140 140">
        <path class="arc-path arc-left" d="M 45,18 A 58,58 0 0,0 45,122" />
        <path class="arc-path arc-right" d="M 95,18 A 58,58 0 0,1 95,122" />
      </svg>
      <div class="gauge-content">
        <span class="gauge-label" id="lbl-secondary">PITCH</span>
        <span class="gauge-value" id="val-secondary">89.4</span>
        <span class="gauge-unit" id="unit-secondary">DEG</span>
      </div>
    </div>

    <!-- Dynamic Gauge 4: Altitude / Radius / Flux -->
    <div class="arc-gauge" id="gauge-tertiary">
      <svg class="arc-svg" viewBox="0 0 140 140">
        <path class="arc-path arc-left" d="M 45,18 A 58,58 0 0,0 45,122" />
        <path class="arc-path arc-right" d="M 95,18 A 58,58 0 0,1 95,122" />
      </svg>
      <div class="gauge-content">
        <span class="gauge-label" id="lbl-tertiary">ALTITUDE</span>
        <span class="gauge-value" id="val-tertiary">30.2</span>
        <span class="gauge-unit" id="unit-tertiary">FT</span>
      </div>
    </div>

  </div>

  <script src="script.js"></script>
</body>
</html>
\`\`\`