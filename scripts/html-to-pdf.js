const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function htmlToPdf(htmlPath, pdfPath) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      printBackground: true,
    });
    console.log(`✓ PDFを生成しました: ${pdfPath}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  const docsDir = path.join(__dirname, '..', 'docs');
  const specHtmlPath = path.join(docsDir, '要件定義書.html');
  const plansHtmlPath = path.join(docsDir, '基本設計書.html');
  const specPdfPath = path.join(docsDir, '要件定義書.pdf');
  const plansPdfPath = path.join(docsDir, '基本設計書.pdf');

  try {
    if (fs.existsSync(specHtmlPath)) {
      console.log('要件定義書をPDFに変換中...');
      await htmlToPdf(specHtmlPath, specPdfPath);
    } else {
      console.error(`✗ HTMLファイルが見つかりません: ${specHtmlPath}`);
    }

    if (fs.existsSync(plansHtmlPath)) {
      console.log('基本設計書をPDFに変換中...');
      await htmlToPdf(plansHtmlPath, plansPdfPath);
    } else {
      console.error(`✗ HTMLファイルが見つかりません: ${plansHtmlPath}`);
    }

    console.log('\nPDF生成が完了しました。');
  } catch (error) {
    console.error('PDF生成中にエラーが発生しました:', error.message);
    if (error.message.includes('libasound')) {
      console.error('\n必要なライブラリをインストールしてください:');
      console.error('  sudo apt-get update');
      console.error('  sudo apt-get install -y libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libdrm2 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 libxkbcommon0 libxshmfence1');
    }
    process.exit(1);
  }
}

main();

