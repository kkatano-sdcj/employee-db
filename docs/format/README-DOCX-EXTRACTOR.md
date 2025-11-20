# Word文書抽出ツール (TypeScript版)

## 概要
`extract-docx.ts`は、Word文書(.docx)からテキストコンテンツを抽出するTypeScript製のユーティリティツールです。

このツールは、従来のPython版（`extract_docx.py`）を置き換えるために開発され、より多くの機能と柔軟性を提供します。

## インストール

### 必要なパッケージ

必要なパッケージは既に`apps/nextjs`にインストールされています：

- `mammoth`: Word文書を解析するためのライブラリ
- `tsx`: TypeScriptを直接実行するためのツール

新しい環境でセットアップする場合：

```bash
# Next.jsアプリにパッケージを追加
pnpm add mammoth tsx --filter @acme/nextjs
```

## 使用方法

### 1. コマンドラインツールとして

```bash
# プロジェクトルートから実行する場合
cd apps/nextjs
pnpm exec tsx ../../docs/format/extract-docx.ts "../../docs/format/パート雇入通知書見本ver_A2025.09.docx"

# HTML形式で出力（テーブル構造を保持）
pnpm exec tsx ../../docs/format/extract-docx.ts "../../docs/format/パート雇入通知書見本ver_A2025.09.docx" --html

# 構造化データとして出力（JSON形式）
pnpm exec tsx ../../docs/format/extract-docx.ts "../../docs/format/パート雇入通知書見本ver_A2025.09.docx" --structured

# 契約書フォーマットとして出力
pnpm exec tsx ../../docs/format/extract-docx.ts "../../docs/format/パート雇入通知書見本ver_A2025.09.docx" --contract
```

### 2. モジュールとしてインポート

```typescript
import {
  extractDocxContent,
  extractDocxAsHtml,
  extractDocxStructured,
  extractContractData
} from './extract-docx';

// プレーンテキストの抽出
async function getPlainText() {
  const text = await extractDocxContent('contract.docx');
  console.log(text);
}

// HTML形式での抽出
async function getHtml() {
  const result = await extractDocxAsHtml('contract.docx');
  console.log(result.html);

  // 警告メッセージの確認
  if (result.messages.length > 0) {
    console.warn('Messages:', result.messages);
  }
}

// 構造化データの抽出
async function getStructuredData() {
  const data = await extractDocxStructured('contract.docx');

  console.log('段落:', data.paragraphs);
  console.log('テーブル:', data.tables);
  console.log('リスト:', data.lists);
}

// 契約書データの抽出
async function getContractData() {
  const contract = await extractContractData('contract.docx');

  console.log('タイトル:', contract.title);
  console.log('セクション数:', contract.sections.length);

  contract.sections.forEach(section => {
    console.log(`- ${section.heading}: ${section.content.substring(0, 50)}...`);
  });
}
```

### 3. Next.js APIルートでの使用例

```typescript
// pages/api/extract-docx.ts または app/api/extract-docx/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractContractData } from '@/docs/format/extract-docx';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが指定されていません' },
        { status: 400 }
      );
    }

    // ファイルを一時的に保存
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempPath = path.join(process.cwd(), 'temp', `${Date.now()}_${file.name}`);

    // Note: 実際の実装では、bufferから直接読み取る方が良い
    // mammothはbufferを直接受け付けるため、ファイル保存は不要

    const result = await extractContractData(tempPath);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'エラーが発生しました' },
      { status: 500 }
    );
  }
}
```

## 機能一覧

| 機能 | 対応状況 |
|------|---------|
| プレーンテキスト抽出 | ✅ |
| テーブル抽出 | ✅ |
| HTML出力 | ✅ |
| 構造化データ出力 | ✅ |
| 契約書フォーマット | ✅ |
| バッファ直接処理 | ✅ |
| 非同期処理 | ✅ |
| CLIツールとして使用 | ✅ |
| モジュールとしてインポート | ✅ |

## 出力フォーマット

### プレーンテキスト
```
雇用契約書
2024年11月19日
山田太郎 殿
...
```

### 構造化データ (JSON)
```json
{
  "paragraphs": [
    "雇用契約書",
    "あなたを採用するに当たっての労働条件は、次のとおりです。"
  ],
  "tables": [
    [
      ["雇用期間", "期間の定め有り"],
      ["契約更新の有無", "有"]
    ]
  ],
  "lists": [
    { "level": 0, "text": "会社の許可なく所定の場所より持ち出さないこと。" }
  ]
}
```

### 契約書フォーマット
```json
{
  "title": "雇用契約書",
  "sections": [
    {
      "heading": "雇用期間",
      "content": "期間の定め有り（2024年4月1日から2025年3月31日まで）"
    }
  ],
  "metadata": {
    "extractedAt": "2024-11-19T10:30:00.000Z",
    "sourceFile": "contract.docx"
  }
}
```

## エラーハンドリング

```typescript
try {
  const content = await extractDocxContent('file.docx');
} catch (error) {
  if (error instanceof Error) {
    console.error('エラー:', error.message);

    // エラーの種類による処理分岐
    if (error.message.includes('サポートされていないファイル形式')) {
      // ファイル形式エラーの処理
    } else if (error.message.includes('ファイル読み込みエラー')) {
      // ファイルアクセスエラーの処理
    }
  }
}
```

## パフォーマンス考慮事項

1. **大きなファイル**: mammothは比較的効率的ですが、非常に大きなファイル（>10MB）の場合はストリーミング処理を検討
2. **並列処理**: 複数ファイルを処理する場合は`Promise.all()`を使用して並列化
3. **キャッシング**: 同じファイルを繰り返し処理する場合はキャッシュの実装を検討

## トラブルシューティング

### mammothがインストールできない
```bash
# npmレジストリをクリア
pnpm store prune

# 再インストール
pnpm add mammoth
```

### TypeScriptエラーが発生する
```bash
# 型定義を最新化
pnpm add -D @types/node@latest
```

### 日本語が文字化けする
- mammothは内部でUTF-8を使用するため、通常は問題ありません
- ファイルシステムのエンコーディングを確認してください

## 今後の拡張案

1. **ストリーミング対応**: 大きなファイルに対応
2. **他の形式サポート**: .doc, .odt, .rtf など
3. **画像抽出**: 文書内の画像を抽出して保存
4. **スタイル情報**: フォント、色、サイズなどのスタイル情報を保持
5. **差分検出**: 2つの文書の差分を検出

## ライセンス
このツールはプロジェクト内部での使用を目的としています。