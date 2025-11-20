#!/usr/bin/env tsx
/**
 * extract-docx.tsのモジュールインポート機能をテストするスクリプト
 */

import { extractDocxContent, extractDocxAsHtml, extractDocxStructured, extractContractData } from './extract-docx';
import * as path from 'path';

async function testImports() {
  console.log('=== extract-docx.ts モジュールインポートテスト ===\n');

  const testFile = path.join(__dirname, '(SDPMS-M-07-R03-12)誓約書.docx');

  try {
    // Test 1: Plain text extraction
    console.log('1. プレーンテキスト抽出テスト');
    const text = await extractDocxContent(testFile);
    console.log(`✅ 成功: ${text.split('\n').length}行のテキストを抽出\n`);

    // Test 2: HTML extraction
    console.log('2. HTML抽出テスト');
    const htmlResult = await extractDocxAsHtml(testFile);
    console.log(`✅ 成功: ${htmlResult.html.length}文字のHTMLを抽出`);
    console.log(`   警告: ${htmlResult.messages.length}件\n`);

    // Test 3: Structured extraction
    console.log('3. 構造化データ抽出テスト');
    const structured = await extractDocxStructured(testFile);
    console.log(`✅ 成功:`);
    console.log(`   - 段落: ${structured.paragraphs.length}個`);
    console.log(`   - テーブル: ${structured.tables.length}個`);
    console.log(`   - リスト: ${structured.lists.length}個\n`);

    // Test 4: Contract data extraction
    console.log('4. 契約書データ抽出テスト');
    const contract = await extractContractData(testFile);
    console.log(`✅ 成功:`);
    console.log(`   - タイトル: ${contract.title}`);
    console.log(`   - セクション数: ${contract.sections.length}個`);
    console.log(`   - 抽出日時: ${contract.metadata.extractedAt}\n`);

    console.log('=== すべてのテストが成功しました ===');
  } catch (error) {
    console.error('❌ テスト失敗:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testImports();
