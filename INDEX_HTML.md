# Field-OS :: Viewport Structure (`INDEX_HTML.md`)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>FIELD-OS // TESLA SENSOR PROBE TELEMETRY</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <!-- 메인 캔버스 (필수) -->
  <canvas id="field-canvas"></canvas>

  <!-- 상단 Act 셀렉터 -->
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

  <!-- 하단 좌측 클러스터 -->
  <div class="telemetry-cluster cluster-left">
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
    <div class="gyro-cluster">
      <canvas id="gyro-canvas" width="140" height="140"></canvas>
    </div>
  </div>

  <!-- 하단 우측 클러스터 -->
  <div class="telemetry-cluster cluster-right">
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