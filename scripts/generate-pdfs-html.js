const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

async function generateHTMLs() {
  const docsDir = path.join(__dirname, '..', 'docs');
  const specsDir = path.join(__dirname, '..', 'specs', '001-employee-db-requirements');
  const plansPath = path.join(__dirname, '..', 'PLANS.md');
  const specPath = path.join(specsDir, 'spec.md');

  // 出力先ディレクトリの確認
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // HTMLテンプレート
  const htmlTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
    body {
      font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm;
    }
    h1 {
      font-size: 24pt;
      font-weight: bold;
      margin-top: 20pt;
      margin-bottom: 12pt;
      border-bottom: 2pt solid #333;
      padding-bottom: 6pt;
      page-break-after: avoid;
    }
    h2 {
      font-size: 18pt;
      font-weight: bold;
      margin-top: 16pt;
      margin-bottom: 10pt;
      border-bottom: 1pt solid #666;
      padding-bottom: 4pt;
      page-break-after: avoid;
    }
    h3 {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 12pt;
      margin-bottom: 8pt;
      page-break-after: avoid;
    }
    h4 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 10pt;
      margin-bottom: 6pt;
      page-break-after: avoid;
    }
    p {
      margin-top: 6pt;
      margin-bottom: 6pt;
    }
    ul, ol {
      margin-top: 6pt;
      margin-bottom: 6pt;
      padding-left: 20pt;
    }
    li {
      margin-top: 3pt;
      margin-bottom: 3pt;
    }
    code {
      font-family: 'Courier New', 'DejaVu Sans Mono', monospace;
      font-size: 10pt;
      background-color: #f5f5f5;
      padding: 2pt 4pt;
      border-radius: 3pt;
    }
    pre {
      background-color: #f5f5f5;
      padding: 10pt;
      border-radius: 5pt;
      overflow-x: auto;
      margin-top: 8pt;
      margin-bottom: 8pt;
      page-break-inside: avoid;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-top: 10pt;
      margin-bottom: 10pt;
      page-break-inside: avoid;
    }
    th, td {
      border: 1pt solid #ddd;
      padding: 6pt;
      text-align: left;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    blockquote {
      border-left: 4pt solid #ddd;
      padding-left: 12pt;
      margin-left: 0;
      color: #666;
      font-style: italic;
    }
    hr {
      border: none;
      border-top: 1pt solid #ddd;
      margin: 16pt 0;
    }
    .print-instructions {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      padding: 10pt;
      margin-bottom: 20pt;
      border-radius: 5pt;
    }
    .print-instructions h3 {
      margin-top: 0;
      color: #856404;
    }
  </style>
</head>
<body>
  <div class="print-instructions">
    <h3>PDFとして保存する方法</h3>
    <p>このページをブラウザで開き、<strong>Ctrl+P</strong>（Windows/Linux）または<strong>Cmd+P</strong>（Mac）で印刷ダイアログを開き、「保存先」を「PDFに保存」に設定して保存してください。</p>
  </div>
  ${content}
</body>
</html>
  `;

  try {
    // 要件定義書の生成
    if (fs.existsSync(specPath)) {
      console.log('要件定義書を生成中...');
      const mdContent = fs.readFileSync(specPath, 'utf-8');
      const htmlContent = marked(mdContent);
      const fullHtml = htmlTemplate('要件定義書', htmlContent);
      const htmlPath = path.join(docsDir, '要件定義書.html');
      fs.writeFileSync(htmlPath, fullHtml, 'utf-8');
      console.log(`✓ 要件定義書のHTMLを生成しました: ${htmlPath}`);
      console.log('  → ブラウザで開いてPDFとして保存してください');
    } else {
      console.error(`✗ spec.mdが見つかりません: ${specPath}`);
    }

    // 基本設計書の生成
    if (fs.existsSync(plansPath)) {
      console.log('基本設計書を生成中...');
      const mdContent = fs.readFileSync(plansPath, 'utf-8');
      const htmlContent = marked(mdContent);
      const fullHtml = htmlTemplate('基本設計書', htmlContent);
      const htmlPath = path.join(docsDir, '基本設計書.html');
      fs.writeFileSync(htmlPath, fullHtml, 'utf-8');
      console.log(`✓ 基本設計書のHTMLを生成しました: ${htmlPath}`);
      console.log('  → ブラウザで開いてPDFとして保存してください');
    } else {
      console.error(`✗ PLANS.mdが見つかりません: ${plansPath}`);
    }

    console.log('\nHTML生成が完了しました。');
    console.log('PDFが必要な場合は、生成されたHTMLファイルをブラウザで開いてPDFとして保存してください。');
  } catch (error) {
    console.error('HTML生成中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// markedパッケージの確認
try {
  require('marked');
  generateHTMLs();
} catch (e) {
  console.error('markedパッケージが必要です。以下のコマンドでインストールしてください:');
  console.error('  pnpm add -D -w marked');
  process.exit(1);
}

