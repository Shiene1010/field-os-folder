# Field-OS

> Entanglement Field Telemetry System

시공간 얽힘장 기반의 실시간 시각화 데모로, 노드-링크 구조와 HUD 스타일의 오토모티브 텔레메트리 인터페이스를 결합한 정적 웹 프로젝트입니다.

![License: MIT](https://img.shields.io/badge/License-MIT-white?style=flat-square)
![Platform: HTML5 Canvas](https://img.shields.io/badge/Platform-HTML5%20Canvas-00f0ff?style=flat-square)
![Architecture: Markdown Driven](https://img.shields.io/badge/Architecture-Markdown%20Driven-10b981?style=flat-square)

---

## 프로젝트 개요

Field-OS는 마크다운으로 정의된 구조와 스타일을 브라우저에서 동적으로 조합해 화면을 렌더링하는 데모 프로젝트입니다. 핵심 아이디어는 다음과 같습니다.

- 정적 HTML/CSS/JS를 단순한 파일 조립이 아니라, 마크다운 스펙으로 설계하는 방식
- 노드와 링크를 기반으로 한 지식 구조 시각화
- 실시간 센서 HUD처럼 보이는 인터랙티브 텔레메트리 UI
- 로컬 개발과 GitHub Pages 배포를 모두 고려한 단순 구조

---

## 구성 파일

```text
field-os-folder/
├── index.html                # Markdown 기반 런타임 진입점
├── INDEX_HTML.md             # DOM 구조 스펙
├── STYLE_CSS.md              # 시각 스타일 정의
├── SCRIPT_JS.md              # 인터랙티브 엔진/오케스트레이터
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Pages 자동 배포 설정
├── README.md                 # 프로젝트 정리 문서
├── github-public-deploy.md    # 공개 배포 관련 메모
├── 배ᅡᅩᅳᅩᅡᅧ...            # 배포 로그
└── .gitignore
```

---

## 동작 방식

이 프로젝트는 별도의 번들러 없이 브라우저에서 다음 과정을 수행합니다.

1. `index.html`이 `INDEX_HTML.md`, `STYLE_CSS.md`, `SCRIPT_JS.md`를 로드합니다.
2. 마크다운 내부의 코드 블록을 추출해 HTML/CSS/JS로 변환합니다.
3. 브라우저에 주입해 인터랙티브 시각화 데모를 실행합니다.

이 방식은 문서를 수정하면 즉시 반영되기 때문에 빠른 실험과 스펙 관리에 적합합니다.

---

## 로컬 실행

```bash
cd /Volumes/Crucial X6/Development/workspaces/field-os-folder
python3 -m http.server 8080
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:8080
```

---

## 배포

GitHub Actions 기반 정적 배포가 구성되어 있으며, 저장소에 푸시하면 자동으로 배포 흐름이 동작하도록 설계되어 있습니다.

```bash
git add .
git commit -m "docs: clean project overview"
git push origin main
```

배포 설정은 [.github/workflows/deploy.yml](.github/workflows/deploy.yml)에 포함되어 있습니다.

---

## 사용 목적

- 지식 구조 및 네트워크 상태를 시각화하는 데모
- 대시보드/텔레메트리 HUD 스타일 표현 실험
- 마크다운 중심 문서 아키텍처 학습 및 프로토타이핑

---

## 라이선스

MIT License
