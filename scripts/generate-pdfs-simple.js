const fs = require('fs');
const path = require('path');
const markdownpdf = require('markdown-pdf');

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
  const pdfOptions = {
    paperFormat: 'A4',
    paperOrientation: 'portrait',
    paperBorder: '20mm',
    renderDelay: 1000,
    cssPath: path.join(__dirname, 'pdf-styles.css'),
  };

  return new Promise((resolve, reject) => {
    let completed = 0;
    const total = 2;

    const checkComplete = () => {
      completed++;
      if (completed === total) {
        console.log('\nPDF生成が完了しました。');
        resolve();
      }
    };

    // 要件定義書の生成
    if (fs.existsSync(specPath)) {
      console.log('要件定義書を生成中...');
      const outputPath = path.join(docsDir, '要件定義書.pdf');
      markdownpdf(pdfOptions)
        .from(specPath)
        .to(outputPath, (err) => {
          if (err) {
            console.error(`✗ 要件定義書の生成に失敗しました: ${err.message}`);
          } else {
            console.log(`✓ 要件定義書を生成しました: ${outputPath}`);
          }
          checkComplete();
        });
    } else {
      console.error(`✗ spec.mdが見つかりません: ${specPath}`);
      checkComplete();
    }

    // 基本設計書の生成
    if (fs.existsSync(plansPath)) {
      console.log('基本設計書を生成中...');
      const outputPath = path.join(docsDir, '基本設計書.pdf');
      markdownpdf(pdfOptions)
        .from(plansPath)
        .to(outputPath, (err) => {
          if (err) {
            console.error(`✗ 基本設計書の生成に失敗しました: ${err.message}`);
          } else {
            console.log(`✓ 基本設計書を生成しました: ${outputPath}`);
          }
          checkComplete();
        });
    } else {
      console.error(`✗ PLANS.mdが見つかりません: ${plansPath}`);
      checkComplete();
    }
  });
}

generatePDFs().catch((err) => {
  console.error('PDF生成中にエラーが発生しました:', err);
  process.exit(1);
});

