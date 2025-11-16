# Vercelデプロイ設定

このドキュメントでは、employee-dbアプリケーションをVercelにデプロイする際の設定値を記載しています。

## Vercel設定値

### Install Command
Root Directoryが`apps/nextjs`に設定されている場合でも、`installCommand`はプロジェクトルートから実行されます。

**推奨設定**:
```
corepack enable && corepack prepare pnpm@10.19.0 --activate && pnpm install
```

**動作の仕組み**:
1. `corepack enable`: Node.jsのcorepackを有効化します
2. `corepack prepare pnpm@10.19.0 --activate`: 指定したバージョンのpnpm（10.19.0）を準備して有効化します
3. `pnpm install`: 有効化されたpnpmを使用して依存関係をインストールします

**注意**: `corepack enable`だけでは、Vercelのビルド環境で古いバージョンのpnpmが使われる場合があります。`corepack prepare`を明示的に実行することで、確実に正しいバージョンのpnpmが使用されます。

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

**Root Directoryの動作について**:
- Root Directoryが`apps/nextjs`に設定されている場合、Vercelは`apps/nextjs`ディレクトリをプロジェクトのルートとして扱います
- **Install Command**: プロジェクトルート（`/vercel/path0`）から実行されます。モノレポ全体の依存関係をインストールするため、ルートの`package.json`と`pnpm-workspace.yaml`が使用されます
- **Build Command**: `apps/nextjs`ディレクトリから実行されます。そのため、`next build`だけでNext.jsアプリをビルドできます
- **Output Directory**: `apps/nextjs`ディレクトリからの相対パス（`.next`）を指定します

**設定方法**:
- Vercelダッシュボード → プロジェクト設定 → **General** → **Root Directory** に `apps/nextjs` を設定
- **注意**: `vercel.json`には`rootDirectory`フィールドを含めません（Vercelのスキーマに含まれていないため）

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
  "installCommand": "corepack enable && corepack prepare pnpm@10.19.0 --activate && pnpm install",
  "framework": "nextjs"
}
```

**重要**: 
- `rootDirectory`は`vercel.json`には含めません。Vercelのダッシュボードで`Root Directory`を`apps/nextjs`に設定してください。
- Root Directoryが`apps/nextjs`に設定されている場合、`buildCommand`はそのディレクトリから実行されるため、`next build`だけで十分です。
- `outputDirectory`も`apps/nextjs`ディレクトリからの相対パス（`.next`）を指定します。
- `installCommand`は`corepack enable && corepack prepare pnpm@10.19.0 --activate && pnpm install`を指定します。`corepack enable`でcorepackを有効化し、`corepack prepare`で明示的にpnpm@10.19.0を準備して有効化します。これにより、`engines.pnpm`フィールドの要件（`>=10.19.0`）も満たされます。

## Vercelダッシュボードでの設定手順

1. プロジェクト設定 → **General**
   - **Root Directory** を `apps/nextjs` に設定
   - **Framework Preset** を `Next.js` に設定
2. プロジェクト設定 → **Build and Output Settings**
   - **Install Command**: `corepack enable && corepack prepare pnpm@10.19.0 --activate && pnpm install` を設定（`vercel.json`で指定している場合は自動検出されます）
   - **Build Command**: `next build` を設定（`vercel.json`で指定している場合は自動検出されます）
   - **Output Directory**: `.next` を設定（`vercel.json`で指定している場合は自動検出されます）
3. プロジェクト設定 → **Environment Variables**
   - 必要な環境変数を追加（`DATABASE_URL`、`AUTH_SECRET`など）

**注意**: `vercel.json`で設定を指定している場合、Vercelダッシュボードの設定は自動的に上書きされます。ただし、**Root Directory**は`vercel.json`には含めないため、必ずダッシュボードで設定してください。

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
  "installCommand": "corepack enable && corepack prepare pnpm@10.19.0 --activate && pnpm install",
  "framework": "nextjs"
}
```

**注意**: `rootDirectory`は`vercel.json`には含めません。Vercelのダッシュボードの設定で指定してください。

**`installCommand`について**: `corepack enable && corepack prepare pnpm@10.19.0 --activate && pnpm install`を指定することで、明示的にpnpm@10.19.0を準備して有効化します。`corepack enable`だけではVercelのビルド環境で古いバージョンのpnpmが使われる場合があるため、`corepack prepare`を明示的に実行することで、確実に正しいバージョンのpnpmが使用されます。これにより、`engines.pnpm`フィールドの要件（`>=10.19.0`）も満たされます。

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

