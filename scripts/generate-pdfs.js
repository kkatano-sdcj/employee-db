const { mdToPdf } = require('md-to-pdf');
const fs = require('fs');
const path = require('path');

async function generatePDFs() {
  const docsDir = path.join(__dirname, '..', 'docs');
  const specsDir = path.join(__dirname, '..', 'specs', '001-employee-db-requirements');
  const plansPath = path.join(__dirname, '..', 'PLANS.md');
  const specPath = path.join(specsDir, 'spec.md');

  // 出力先ディレクトリの確認
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // PDF設定
  const pdfConfig = {
    pdf_options: {
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      printBackground: true,
    },
    stylesheet: `
      @page {
        margin: 20mm;
      }
      body {
        font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
        font-size: 11pt;
        line-height: 1.6;
        color: #333;
      }
      h1 {
        font-size: 24pt;
        font-weight: bold;
        margin-top: 20pt;
        margin-bottom: 12pt;
        border-bottom: 2pt solid #333;
        padding-bottom: 6pt;
      }
      h2 {
        font-size: 18pt;
        font-weight: bold;
        margin-top: 16pt;
        margin-bottom: 10pt;
        border-bottom: 1pt solid #666;
        padding-bottom: 4pt;
      }
      h3 {
        font-size: 14pt;
        font-weight: bold;
        margin-top: 12pt;
        margin-bottom: 8pt;
      }
      h4 {
        font-size: 12pt;
        font-weight: bold;
        margin-top: 10pt;
        margin-bottom: 6pt;
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
        font-family: 'Courier New', monospace;
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
    `,
  };

  try {
    // 要件定義書の生成
    console.log('要件定義書を生成中...');
    if (fs.existsSync(specPath)) {
      const specPdf = await mdToPdf(
        { path: specPath },
        {
          ...pdfConfig,
          as_html: false,
          launch_options: {
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
          },
        }
      );

      if (specPdf) {
        const outputPath = path.join(docsDir, '要件定義書.pdf');
        fs.writeFileSync(outputPath, specPdf.content);
        console.log(`✓ 要件定義書を生成しました: ${outputPath}`);
      } else {
        console.error('✗ 要件定義書の生成に失敗しました');
      }
    } else {
      console.error(`✗ spec.mdが見つかりません: ${specPath}`);
    }

    // 基本設計書の生成
    console.log('基本設計書を生成中...');
    if (fs.existsSync(plansPath)) {
      const plansPdf = await mdToPdf(
        { path: plansPath },
        {
          ...pdfConfig,
          as_html: false,
          launch_options: {
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
          },
        }
      );

      if (plansPdf) {
        const outputPath = path.join(docsDir, '基本設計書.pdf');
        fs.writeFileSync(outputPath, plansPdf.content);
        console.log(`✓ 基本設計書を生成しました: ${outputPath}`);
      } else {
        console.error('✗ 基本設計書の生成に失敗しました');
      }
    } else {
      console.error(`✗ PLANS.mdが見つかりません: ${plansPath}`);
    }

    console.log('\nPDF生成が完了しました。');
  } catch (error) {
    console.error('PDF生成中にエラーが発生しました:', error);
    process.exit(1);
  }
}

generatePDFs();

