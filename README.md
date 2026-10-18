# ⚡️ Field-OS :: Entanglement Field Telemetry System
> **Tesla Extreme Demonstration Monitor Edition**  
> 시공간 얽힘장(Entanglement Field) 기반 노드 성숙도 그래프 및 초정밀 오토모티브 텔레메트리 HUD

![License: MIT](https://img.shields.io/badge/License-MIT-white?style=flat-square)
![Platform: HTML5 Canvas](https://img.shields.io/badge/Platform-HTML5%20Canvas2D-00f0ff?style=flat-square)
![Architecture: Pure Markdown Driven](https://img.shields.io/badge/Architecture-Literate%20Markdown-10b981?style=flat-square)
![Deployment: GitHub Actions CI/CD](https://img.shields.io/badge/Deployment-GitHub%20Pages-ff1a3c?style=flat-square)

---

## 1. 프로젝트 개요 (Overview)

**Field-OS**는 정적 노드-링크 다이어그램의 한계를 극복하기 위해 **시공간 왜곡 텐서(Space-time Metric Warp)**와 **동적 지식 성숙도 수명주기(Lifecycle Ontology)**를 결합한 차세대 정보 시각화(InfoVis) 시스템입니다.

본 에디션은 **테슬라(Tesla) 극한 수직 트랙 시연 중계 모니터**의 그래픽 언어를 1:1 완벽 이식하여, **OLED Void Black(`#000000`)** 배경 위에 **시그니처 괄호형 아크 게이지(Parenthesis Arc Dial)**와 **실시간 3D 자이로스코프 자세계 구(Attitude Sphere)**를 배치하고, 전 화면에 걸쳐 부드러운 측지선(Geodesic Line) 굴절과 얽힘장 센서 프로빙을 제공합니다.

---

## 2. 핵심 아키텍처 및 비주얼 스펙 (Key Features)

### 🪐 5단계 노드 성숙도 개체 (Maturity Lifecycle)
| 단계 | 노드 개체 | 시각화 형상 | 물리적 특성 및 역할 |
| :---: | :--- | :--- | :--- |
| **01** | `SeedNode` | 점 (Pulsing Spark) | 미성숙 관측 데이터. 최소 질량($M=1.2$)과 기저 얽힘장 형성 |
| **02** | `CriticalNode` | 오목-화살표 비대칭 구조 | 병목 및 위기 상태. 국소 시어 스트레스(전단 응력) 및 척력 유발 |
| **03** | `SplitNode` | 정삼각형 (Tri-Phase) | 다중 경로 의사결정 트리거. 3-상 대칭 완충 구조 형성 |
| **04** | `PolyhedronNode` | 3D 회전 투영 다면체 | 복합 지식 구조화 단계. 3D 큐브 아이소메트릭 와이어프레임 투영 |
| **05** | `MatureCircleNode`| 마스터 원형 + 중력 우물 | 완결 수렴 싱귤래리티 코어. 동심원 중력파 링으로 주변 궤도 안정화 |

### 🏎️ 테슬라 시연 모니터 인디케이터 (Cockpit HUD)
* **시그니처 괄호형 아크 게이지 (`( 3009 )`)**:
  * 상하가 개방된 $58\text{px}$ 반경의 면도날 같은 초정밀 화이트 벡터 아크.
  * `[LABEL]` - `[LARGE DIGIT]` - `[UNIT]`의 3단 수직 계층 타이포그래피.
* **3D 자이로스코프 자세계 구체 (3D Attitude Sphere)**:
  * 외곽 수평선 링, 피치(Pitch)에 따라 회전하는 적도 타원선, 자오선 링 투영.
  * 중앙에 실시간 틸트되는 **테슬라 섀시 3D 실루엣**이 배치되어 Act 2 위기 돌입 시 수직 $89.4^\circ$로 기립.
* **비상 레드 점등 모드 (`.state-crisis`)**:
  * Act 2 위기 돌입 시 아크와 디지털 숫자가 테슬라 비상 레드(`#FF1A3C`)로 국소 점등 및 맥동.

### 🎯 인터랙티브 센서 프로브 (Interactive Target Lock-on)
* **공간 호버링 (Ambient Space)**: 마우스 좌표의 국소 얽힘장력($T_{\text{local}}$), 왜곡 기울기(%), 중력 퍼텐셜($G$) 실시간 측정.
* **노드 록온 (Node Hover/Click)**: 테슬라 사이언 브래킷(`[ + ]`) 록온, 노드 고유 밀도($\rho$), 성숙도 레벨, 영향 반경 측정 및 3D 자세계가 해당 노드를 자동 조준.
* **엣지 록온 (Link Hover/Click)**: 측지선 인장 응력($N$), 굴절 곡률($\kappa$), 정보 유속($\text{MB/S}$) 측정.
* **핀 고정 (Target Pinning)**: 클릭 시 해당 표적이 록온 고정되어 지속 추적.

---

## 3. 4단계 시연 시나리오 (Act 1 ~ Act 4)

상단 미니멀 셀렉터 `[ 01 ]` `[ 02 ]` `[ 03 ]` `[ 04 ]`를 눌러 실시간 위상 전이를 관측할 수 있습니다.

* **ACT 1: Genesis (평온한 초기 기저 상태)**
  * 잔잔한 시공간 격자 위 저밀도 SeedNode 루프 형성 (`PITCH 0.4°`, `TENSION 1024 KG`).
* **ACT 2: Entropy Surge (위기 주입 & 얽힘장 왜곡)**
  * 비정형 결과보고서 데이터 폭증 ➔ CriticalNode 붉은 화살표 폭발 변이, 격자 시어 스트레스 왜곡, 엣지 고장력 펄스 점등, 3D 차체 $89.4^\circ$ 수직벽 등반 자세 돌입.
* **ACT 3: Self-Healing & Geodesic Refraction (자가 치유 & 측지선 우회)**
  * 안티 콜리전 척력 필드 전개, PolyhedronNode 구조화, 중력 렌즈 효과를 받아 장애물을 부드럽게 우회하는 측지선 곡선 굴절.
* **ACT 4: Singularity & Convergence (초중력 우물 최종 수렴)**
  * MatureCircleNode 코어 중심의 초중력 우물 형성, 공전 궤도 포획 및 안정화 닫힌 루프 완성.

---

## 4. 프로젝트 구조 및 마크다운 주도 아키텍처 (Literate Architecture)

본 프로젝트는 번들러(Webpack/Vite) 없이 **오직 마크다운 문서 자체가 원천 소스코드**로 동작하는 하이브리드 아키텍처를 채택하고 있습니다.

```text
field-os/
├── INDEX_HTML.md             # 마크업 온톨로지, DOM 레이아웃, 인라인 SVG 규격
├── STYLE_CSS.md              # 테슬라 인디케이터 디자인 토큰, 트루 블랙 렌더링 규격
├── SCRIPT_JS.md              # 얽힘장 물리 엔진, 3D 자이로 삼각함수, 오케스트레이터
├── index.html                # [로컬 전용] 마크다운 실시간 동적 마운트 런타임
├── .github/
│   └── workflows/
│       └── deploy.yml        # [클라우드 전용] 깃허브 무인 정적 컴파일 & 배포 워크플로
└── README.md                 # 시스템 전체 아키텍처 기술 명세서

⚡️ 하이브리드 듀얼 구동 원리
로컬 개발 (Method 2 런타임):
index.html이 브라우저에서 INDEX_HTML.md, STYLE_CSS.md, SCRIPT_JS.md를 비동기(fetch)로 읽어와 메모리 상에 동적 주입합니다. 마크다운 파일만 고치고 새로고침(F5)하면 즉시 반영됩니다.

원격 배포 (Method 1 CI/CD):
git push 시 GitHub Actions 가상 환경에서 마크다운 속 코드를 번개처럼 추출하여 최적화된 독립 정적 파일로 조립한 후 GitHub Pages로 무인 배포합니다.

5. 빠른 시작 및 로컬 실행 (Quick Start)
별도의 npm install이나 빌드 명령어가 필요하지 않습니다.

로컬 서버 구동
code
Bash
# 1. 저장소 클론
git clone https://github.com/[YOUR-USERNAME]/field-os.git
cd field-os

# 2. 로컬 웹서버 실행 (Python 내장 서버)
python3 -m http.server 8080
브라우저에서 **http://localhost:8080**으로 접속하면 마크다운 스펙이 실시간 구동됩니다.

6. GitHub Pages 배포 가이드 (Deploy to Cloud)
깃허브 저장소의 Settings ➔ Pages로 이동합니다.

Build and deployment ➔ Source를 **GitHub Actions**로 선택합니다.

로컬에서 마크다운 파일을 수정한 후 평소처럼 푸시합니다:

code
Bash
git add .
git commit -m "feat: upgrade geodesic refraction physics"
git push origin main
깃허브 액션이 백그라운드에서 빌드를 완료하면 **https://[YOUR-USERNAME].github.io/field-os/**로 즉각 라이브 배포됩니다.

7. 조작 가이드 (Controls)
Act 전환: 상단 [ 01 ], [ 02 ], [ 03 ], [ 04 ] 버튼 클릭

공간 센서 프로브: 빈 캔버스에 마우스 커서 호버링

노드 / 엣지 록온: 원하는 노드 또는 곡선 엣지 위에 마우스 호버링

표적 고정 (Pin Lock): 노드 또는 엣지 클릭 (재클릭 또는 빈 공간 클릭 시 해제)

8. 라이선스 (License)
본 프로젝트는 MIT License에 따라 자유롭게 수정, 배포, 상업적 활용이 가능합니다.

⚡️ 하이브리드 듀얼 구동 원리
로컬 개발 (Method 2 런타임):
index.html이 브라우저에서 INDEX_HTML.md, STYLE_CSS.md, SCRIPT_JS.md를 비동기(fetch)로 읽어와 메모리 상에 동적 주입합니다. 마크다운 파일만 고치고 새로고침(F5)하면 즉시 반영됩니다.

원격 배포 (Method 1 CI/CD):
git push 시 GitHub Actions 가상 환경에서 마크다운 속 코드를 번개처럼 추출하여 최적화된 독립 정적 파일로 조립한 후 GitHub Pages로 무인 배포합니다.

5. 빠른 시작 및 로컬 실행 (Quick Start)
별도의 npm install이나 빌드 명령어가 필요하지 않습니다.

로컬 서버 구동
code
Bash
# 1. 저장소 클론
git clone https://github.com/[YOUR-USERNAME]/field-os.git
cd field-os

# 2. 로컬 웹서버 실행 (Python 내장 서버)
python3 -m http.server 8080
브라우저에서 **http://localhost:8080**으로 접속하면 마크다운 스펙이 실시간 구동됩니다.

6. GitHub Pages 배포 가이드 (Deploy to Cloud)
깃허브 저장소의 Settings ➔ Pages로 이동합니다.

Build and deployment ➔ Source를 **GitHub Actions**로 선택합니다.

로컬에서 마크다운 파일을 수정한 후 평소처럼 푸시합니다:

code
Bash
git add .
git commit -m "feat: upgrade geodesic refraction physics"
git push origin main
깃허브 액션이 백그라운드에서 빌드를 완료하면 **https://[YOUR-USERNAME].github.io/field-os/**로 즉각 라이브 배포됩니다.

7. 조작 가이드 (Controls)
Act 전환: 상단 [ 01 ], [ 02 ], [ 03 ], [ 04 ] 버튼 클릭

공간 센서 프로브: 빈 캔버스에 마우스 커서 호버링

노드 / 엣지 록온: 원하는 노드 또는 곡선 엣지 위에 마우스 호버링

표적 고정 (Pin Lock): 노드 또는 엣지 클릭 (재클릭 또는 빈 공간 클릭 시 해제)

8. 라이선스 (License)
본 프로젝트는 MIT License에 따라 자유롭게 수정, 배포, 상업적 활용이 가능합니다.
⚡️ 하이브리드 듀얼 구동 원리
로컬 개발 (Method 2 런타임):
index.html이 브라우저에서 INDEX_HTML.md, STYLE_CSS.md, SCRIPT_JS.md를 비동기(fetch)로 읽어와 메모리 상에 동적 주입합니다. 마크다운 파일만 고치고 새로고침(F5)하면 즉시 반영됩니다.

원격 배포 (Method 1 CI/CD):
git push 시 GitHub Actions 가상 환경에서 마크다운 속 코드를 번개처럼 추출하여 최적화된 독립 정적 파일로 조립한 후 GitHub Pages로 무인 배포합니다.

5. 빠른 시작 및 로컬 실행 (Quick Start)
별도의 npm install이나 빌드 명령어가 필요하지 않습니다.

로컬 서버 구동
code
Bash
# 1. 저장소 클론
git clone https://github.com/[YOUR-USERNAME]/field-os.git
cd field-os

# 2. 로컬 웹서버 실행 (Python 내장 서버)
python3 -m http.server 8080
브라우저에서 **http://localhost:8080**으로 접속하면 마크다운 스펙이 실시간 구동됩니다.

6. GitHub Pages 배포 가이드 (Deploy to Cloud)
깃허브 저장소의 Settings ➔ Pages로 이동합니다.

Build and deployment ➔ Source를 **GitHub Actions**로 선택합니다.

로컬에서 마크다운 파일을 수정한 후 평소처럼 푸시합니다:

code
Bash
git add .
git commit -m "feat: upgrade geodesic refraction physics"
git push origin main
깃허브 액션이 백그라운드에서 빌드를 완료하면 **https://[YOUR-USERNAME].github.io/field-os/**로 즉각 라이브 배포됩니다.

7. 조작 가이드 (Controls)
Act 전환: 상단 [ 01 ], [ 02 ], [ 03 ], [ 04 ] 버튼 클릭

공간 센서 프로브: 빈 캔버스에 마우스 커서 호버링

노드 / 엣지 록온: 원하는 노드 또는 곡선 엣지 위에 마우스 호버링

표적 고정 (Pin Lock): 노드 또는 엣지 클릭 (재클릭 또는 빈 공간 클릭 시 해제)

8. 라이선스 (License)
본 프로젝트는 MIT License에 따라 자유롭게 수정, 배포, 상업적 활용이 가능합니다.