#!/usr/bin/env tsx
/**
 * Word文書(.docx)からテキストコンテンツを抽出するユーティリティ
 *
 * 使用方法:
 * 1. 必要なパッケージをインストール: pnpm add mammoth
 * 2. 実行: tsx extract-docx.ts <file.docx>
 *
 * または、モジュールとしてインポート:
 * import { extractDocxContent } from './extract-docx';
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import mammoth from 'mammoth';

/**
 * Docxファイルからテキストコンテンツを抽出
 * @param filePath Docxファイルのパス
 * @returns 抽出されたテキストコンテンツ
 */
export async function extractDocxContent(filePath: string): Promise<string> {
  try {
    // ファイルの存在確認
    await fs.access(filePath);

    // ファイル拡張子の確認
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.docx') {
      throw new Error(`サポートされていないファイル形式です: ${ext}. .docxファイルを指定してください。`);
    }

    // Docxファイルをバッファとして読み込み
    const buffer = await fs.readFile(filePath);

    // mammothを使用してテキストを抽出
    const result = await mammoth.extractRawText({ buffer });

    if (result.messages.length > 0) {
      console.error('警告/エラーメッセージ:');
      result.messages.forEach(message => {
        console.error(`  - ${message.type}: ${message.message}`);
      });
    }

    return result.value;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`ファイル読み込みエラー (${filePath}): ${error.message}`);
    }
    throw error;
  }
}

/**
 * Docxファイルから構造化されたHTMLを抽出
 * @param filePath Docxファイルのパス
 * @returns HTMLコンテンツと関連情報
 */
export async function extractDocxAsHtml(filePath: string): Promise<{
  html: string;
  messages: Array<{ type: string; message: string }>;
}> {
  try {
    await fs.access(filePath);

    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.docx') {
      throw new Error(`サポートされていないファイル形式です: ${ext}`);
    }

    const buffer = await fs.readFile(filePath);

    // HTMLとして抽出（テーブルなどの構造を保持）
    const result = await mammoth.convertToHtml({ buffer });

    return {
      html: result.value,
      messages: result.messages.map(msg => ({
        type: msg.type,
        message: msg.message
      }))
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`HTML変換エラー (${filePath}): ${error.message}`);
    }
    throw error;
  }
}

/**
 * Docxファイルから構造化されたデータを抽出
 * テーブル、段落、リストを個別に処理
 */
export async function extractDocxStructured(filePath: string): Promise<{
  paragraphs: string[];
  tables: Array<Array<Array<string>>>;
  lists: Array<{ level: number; text: string }>;
}> {
  try {
    const htmlContent = await extractDocxAsHtml(filePath);

    // 簡易的なHTML解析（実際の実装では適切なHTMLパーサーを使用することを推奨）
    const paragraphs: string[] = [];
    const tables: Array<Array<Array<string>>> = [];
    const lists: Array<{ level: number; text: string }> = [];

    // 段落の抽出
    const paragraphMatches = htmlContent.html.match(/<p[^>]*>(.*?)<\/p>/gi);
    if (paragraphMatches) {
      paragraphs.push(...paragraphMatches.map(p =>
        p.replace(/<[^>]*>/g, '').trim()
      ).filter(text => text.length > 0));
    }

    // テーブルの抽出
    const tableMatches = htmlContent.html.match(/<table[^>]*>(.*?)<\/table>/gis);
    if (tableMatches) {
      tableMatches.forEach(tableHtml => {
        const table: Array<Array<string>> = [];
        const rowMatches = tableHtml.match(/<tr[^>]*>(.*?)<\/tr>/gis);

        if (rowMatches) {
          rowMatches.forEach(rowHtml => {
            const row: string[] = [];
            const cellMatches = rowHtml.match(/<t[dh][^>]*>(.*?)<\/t[dh]>/gis);

            if (cellMatches) {
              cellMatches.forEach(cellHtml => {
                row.push(cellHtml.replace(/<[^>]*>/g, '').trim());
              });
            }

            if (row.length > 0) {
              table.push(row);
            }
          });
        }

        if (table.length > 0) {
          tables.push(table);
        }
      });
    }

    // リストの抽出
    const listItemMatches = htmlContent.html.match(/<li[^>]*>(.*?)<\/li>/gi);
    if (listItemMatches) {
      lists.push(...listItemMatches.map(li => ({
        level: 0, // 簡易実装のため、レベルは0固定
        text: li.replace(/<[^>]*>/g, '').trim()
      })).filter(item => item.text.length > 0));
    }

    return { paragraphs, tables, lists };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`構造化データ抽出エラー: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 契約書テンプレート用にフォーマットされたデータを抽出
 */
export async function extractContractData(filePath: string): Promise<{
  title: string;
  sections: Array<{
    heading: string;
    content: string;
  }>;
  metadata: {
    extractedAt: string;
    sourceFile: string;
  };
}> {
  try {
    const text = await extractDocxContent(filePath);
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const result = {
      title: '',
      sections: [] as Array<{ heading: string; content: string }>,
      metadata: {
        extractedAt: new Date().toISOString(),
        sourceFile: path.basename(filePath)
      }
    };

    // タイトルの検出（最初の行または「契約書」「誓約書」を含む行）
    const titleIndex = lines.findIndex(line =>
      line.includes('契約書') || line.includes('誓約書') || line.includes('通知書')
    );

    if (titleIndex >= 0) {
      result.title = lines[titleIndex];
    } else if (lines.length > 0) {
      result.title = lines[0];
    }

    // セクションの抽出（見出しと思われる行を基準に分割）
    let currentSection: { heading: string; content: string } | null = null;

    for (const line of lines) {
      // 見出しパターン（例：「雇用期間」「就業の場所」など）
      const isHeading = /^[一-龥ぁ-ゔァ-ヴー\s]{2,10}$/.test(line) ||
                       /^[0-9０-９][．.、]/.test(line) ||
                       /^[(（][0-9０-９][)）]/.test(line);

      if (isHeading) {
        if (currentSection) {
          result.sections.push(currentSection);
        }
        currentSection = {
          heading: line,
          content: ''
        };
      } else if (currentSection) {
        currentSection.content += (currentSection.content ? '\n' : '') + line;
      }
    }

    if (currentSection) {
      result.sections.push(currentSection);
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`契約書データ抽出エラー: ${error.message}`);
    }
    throw error;
  }
}

// CLIとして実行される場合
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法: tsx extract-docx.ts <file.docx> [--html|--structured|--contract]');
    console.log('');
    console.log('オプション:');
    console.log('  --html        HTML形式で出力');
    console.log('  --structured  構造化データとして出力');
    console.log('  --contract    契約書フォーマットとして出力');
    console.log('  (デフォルト)   プレーンテキストとして出力');
    process.exit(1);
  }

  const filePath = args[0];
  const outputFormat = args[1];

  (async () => {
    try {
      if (outputFormat === '--html') {
        const result = await extractDocxAsHtml(filePath);
        console.log(result.html);
        if (result.messages.length > 0) {
          console.error('\n--- メッセージ ---');
          result.messages.forEach(msg => {
            console.error(`${msg.type}: ${msg.message}`);
          });
        }
      } else if (outputFormat === '--structured') {
        const result = await extractDocxStructured(filePath);
        console.log(JSON.stringify(result, null, 2));
      } else if (outputFormat === '--contract') {
        const result = await extractContractData(filePath);
        console.log(JSON.stringify(result, null, 2));
      } else {
        const content = await extractDocxContent(filePath);
        console.log(content);
      }
    } catch (error) {
      console.error(`エラー: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  })();
}