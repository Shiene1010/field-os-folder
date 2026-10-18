#!/bin/bash
set -e

echo "[FIELD-OS] Extracting files from Markdown..."

# 1. index.html 추출
awk '/^```html/{f=1;next} /^```/{f=0} f' INDEX_HTML.md > index.html
echo "[1/3] index.html created"

# 2. style.css 추출
awk '/^```css/{f=1;next} /^```/{f=0} f' STYLE_CSS.md > style.css
echo "[2/3] style.css created"

# 3. script.js 추출
awk '/^```javascript/{f=1;next} /^```/{f=0} f' SCRIPT_JS.md > script.js
echo "[3/3] script.js created"

echo "[SUCCESS] Extraction complete! Ready to deploy."