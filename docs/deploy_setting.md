# Vercelデプロイ設定

このドキュメントでは、employee-dbアプリケーションをVercelにデプロイする際の設定値を記載しています。

## Vercel設定値

### Install Command
```
pnpm install
```

### Build Command
Root Directoryが`apps/nextjs`に設定されている場合：
```
next build
```

Root Directoryが設定されていない場合（ルートから実行）：
```
npx pnpm@10.19.0 --filter @acme/nextjs build
```

**注意**: Root Directoryが`apps/nextjs`に設定されている場合、`buildCommand`はそのディレクトリから実行されるため、`next build`だけで十分です。Vercelが自動的にNext.jsを検出します。

### Output Directory
Next.jsは自動検出されるため、通常は設定不要です。明示的に設定する場合：

Root Directoryが`apps/nextjs`に設定されている場合：
```
.next
```

Root Directoryが設定されていない場合：
```
apps/nextjs/.next
```

### Root Directory（重要）
モノレポ構成の場合、以下の設定が必須です：
```
apps/nextjs
```

## 補足事項

### 環境変数の設定
以下の環境変数をVercelの環境変数設定で追加してください：
- `DATABASE_URL`: Supabase PostgreSQL接続文字列
- `AUTH_SECRET`: Better-authシークレットキー
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトURL（オプション）
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase匿名キー（オプション）

### Node.jsバージョン
プロジェクト要件に合わせて設定してください：
- 推奨バージョン: `22.16.0`以上
- `.nvmrc`ファイルがある場合は、そのバージョンを使用

### Framework Preset
Vercelの設定で`Next.js`を選択してください。

## Vercel設定ファイル（オプション）

プロジェクトルートに`vercel.json`を作成して設定を管理することもできます：

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm install -g pnpm@10.19.0 && npx pnpm@10.19.0 install",
  "framework": "nextjs"
}
```

**重要**: 
- `rootDirectory`は`vercel.json`には含めません。Vercelのダッシュボードで`Root Directory`を`apps/nextjs`に設定してください。
- Root Directoryが`apps/nextjs`に設定されている場合、`buildCommand`はそのディレクトリから実行されるため、`next build`だけで十分です。
- `outputDirectory`も`apps/nextjs`ディレクトリからの相対パス（`.next`）を指定します。
- `installCommand`はプロジェクトルートから実行されるため、モノレポ全体の依存関係をインストールできます。

## Vercelダッシュボードでの設定手順

1. プロジェクト設定 → **General**
2. **Root Directory** を `apps/nextjs` に設定
3. **Framework Preset** を `Next.js` に設定
4. **Build and Output Settings** は自動検出されることを確認
5. **Environment Variables** に必要な環境変数を追加

これでデプロイが可能になります。

## トラブルシューティング

### ERR_INVALID_THIS エラーが発生する場合

`ERR_INVALID_THIS`や`Value of "this" must be of type URLSearchParams`というエラーが発生する場合、以下の原因が考えられます：

1. **pnpmのバージョンが正しく認識されていない**
2. **Node.jsのバージョンが不適切**
3. **Vercelのビルド環境での互換性の問題**

#### 解決策1: `.nvmrc`ファイルの作成

プロジェクトルートに`.nvmrc`ファイルを作成して、Node.jsのバージョンを明示的に指定してください：

```
22.16.0
```

#### 解決策2: `vercel.json`の作成と設定

プロジェクトルートに`vercel.json`を作成し、以下の設定を追加してください：

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm install -g pnpm@10.19.0 && npx pnpm@10.19.0 install",
  "framework": "nextjs"
}
```

**注意**: `rootDirectory`は`vercel.json`には含めません。Vercelのダッシュボードの設定で指定してください。

`installCommand`で`npx pnpm@10.19.0`を使用することで、Vercelのビルド環境で確実に正しいバージョンのpnpmが使用されます。`npm install -g`でインストールしてもシェルのキャッシュの問題で古いバージョンが使われる可能性があるため、`npx`を使用して明示的にバージョンを指定します。

`buildCommand`はRoot Directoryが`apps/nextjs`に設定されている場合、そのディレクトリから実行されるため、`next build`だけで十分です。Vercelが自動的にNext.jsのバージョンを検出します。

#### 解決策3: `package.json`に`engines`フィールドを追加

ルートの`package.json`に以下のフィールドを追加してください：

```json
{
  "engines": {
    "node": ">=22.16.0",
    "pnpm": ">=10.19.0"
  }
}
```

#### 解決策4: Vercelの環境変数設定

Vercelのダッシュボードで以下の環境変数を設定してください：

- `NODE_VERSION`: `22.16.0`
- `PNPM_VERSION`: `10.19.0`（オプション、`packageManager`フィールドで指定されている場合は不要）

#### 解決策5: `.npmrc`ファイルの作成（オプション）

プロジェクトルートに`.npmrc`ファイルを作成して、pnpmの設定を明示的に指定することもできます：

```
auto-install-peers=true
strict-peer-dependencies=false
```

### 推奨される設定手順

1. プロジェクトルートに`.nvmrc`ファイルを作成（Node.js 22.16.0を指定）
2. プロジェクトルートに`vercel.json`を作成（上記の設定を使用）
3. Vercelのダッシュボードで`Root Directory`を`apps/nextjs`に設定
4. Vercelの環境変数で`NODE_VERSION`を`22.16.0`に設定

これらの設定により、`ERR_INVALID_THIS`エラーが解消されるはずです。

