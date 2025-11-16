# Vercelデプロイガイド

このドキュメントでは、従業員データベースシステムをVercelにデプロイする手順を説明します。

## 前提条件

- Vercelアカウント
- Supabaseプロジェクト（PostgreSQLデータベース）
- GitHubリポジトリ

## デプロイ手順

### 1. Vercelプロジェクトの作成

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. **Add New... → Project** をクリック
3. GitHubリポジトリを選択してインポート

### 2. プロジェクト設定

**重要**: Vercel Dashboardの**Root Directoryは必ず空欄（=リポジトリルート）**に戻してください。プロジェクトルート直下の`vercel.json`が読み込まれ、`apps/nextjs`のビルド設定を一元管理します。

#### `vercel.json` の設定内容
```json
{
  "buildCommand": "pnpm turbo run build --filter=@acme/nextjs",
  "outputDirectory": "apps/nextjs/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

**注意**: `rootDirectory`は`vercel.json`ではサポートされていません。DashboardでRoot Directoryを`apps/nextjs`にすると、`routes-manifest.json`を`apps/nextjs/apps/nextjs/.next`のような誤ったパスで探してしまいます。

#### フレームワーク設定（vercel.jsonで自動設定されます）
- **Framework Preset**: Next.js
- **Root Directory**: `./`（空欄でも可。必ずリポジトリルートを指す）
- **Build Command**: `pnpm turbo run build --filter=@acme/nextjs`
- **Output Directory**: `apps/nextjs/.next`
- **Install Command**: `pnpm install`

**補足**: ルートの`package.json`に`next`を追加しているのは、Root Directoryをモノレポルートに戻した際にVercelのNext.js検出を確実に通すためです。実際のアプリコードは`apps/nextjs`配下にあります。

**注意**: Vercel Dashboardで手動設定する場合は、上記の設定と一致させる必要があります。`vercel.json`が存在する場合、そちらが優先されます。

#### Node.jsバージョン
- **Settings → General → Node.js Version**: `22.x` を選択

### 3. 環境変数の設定

**Settings → Environment Variables** で以下の環境変数を設定してください：

#### 必須の環境変数

```bash
# データベース接続（Supabase）
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true

# 認証
AUTH_SECRET=<ランダムな文字列32文字以上>

# ポート（オプション、デフォルト3000）
PORT=3000
```

#### オプションの環境変数

```bash
# Discord OAuth（使用する場合）
AUTH_DISCORD_ID=<Discord Application ID>
AUTH_DISCORD_SECRET=<Discord Application Secret>

# リダイレクトプロキシ（必要に応じて）
AUTH_REDIRECT_PROXY_URL=https://your-domain.vercel.app
```

#### Supabase接続文字列の取得方法

1. [Supabase Dashboard](https://app.supabase.com/)にアクセス
2. プロジェクトを選択
3. **Settings → Database** に移動
4. **Connection String** セクションで：
   - **Transaction モード（推奨）**: `?pgbouncer=true` が含まれる接続文字列
   - パスワードを `[YOUR-PASSWORD]` 部分に挿入

#### AUTH_SECRETの生成方法

```bash
# OpenSSLを使用
openssl rand -base64 32

# Node.jsを使用
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. 環境変数の適用範囲

各環境変数は以下の環境で有効にしてください：

- ✅ **Production** （本番環境）
- ✅ **Preview** （プレビュー環境）
- ✅ **Development** （開発環境、オプション）

### 5. デプロイの実行

1. 環境変数を設定後、**Deployments** タブに移動
2. **Redeploy** をクリックして再デプロイ
3. ビルドログを確認して、エラーがないことを確認

## トラブルシューティング

### エラー: `Missing required environment variable: DATABASE_URL`

**原因**: 環境変数が正しく設定されていない

**解決策**:
1. Vercel Dashboard → Settings → Environment Variables を確認
2. `DATABASE_URL` が設定されていることを確認
3. 環境（Production/Preview/Development）が正しく選択されているか確認
4. 再デプロイを実行

### エラー: `@acme/db#build` が失敗する

**原因**: Prisma Clientが正しく生成されていない

**解決策**:
1. `DATABASE_URL` 環境変数が設定されていることを確認
2. Supabaseの接続文字列が正しいことを確認
3. ビルドログで詳細なエラーメッセージを確認

### エラー: `WARN - environment variables are set on your Vercel project, but missing from "turbo.json"`

**原因**: `turbo.json` に環境変数が宣言されていない

**解決策**: 
- 使用していない環境変数（例: `DIRECT_URL`）はVercel Dashboardから削除することを推奨
- 必要な環境変数は `turbo.json` の `globalEnv` に追加する
- すでに `turbo.json` に `DATABASE_URL` が追加されているため、このエラーは解決済みです

### エラー: `The file "/vercel/path0/apps/nextjs/apps/nextjs/.next/routes-manifest.json" couldn't be found`

**原因**: Vercelの設定でRoot DirectoryとOutput Directoryの組み合わせが誤っている

**解決策**:
1. **vercel.jsonが存在する場合**: プロジェクトルートの`vercel.json`の設定が正しいことを確認
   ```json
   {
     "outputDirectory": "apps/nextjs/.next",
     "buildCommand": "pnpm turbo run build --filter=@acme/nextjs"
   }
   ```
   
   **重要**: `rootDirectory`は`vercel.json`に含めないでください。Vercel Dashboardでのみ設定可能です。

2. **Vercel Dashboardで手動設定する場合**:
   - **Root Directory**: `./`（空欄でもOK。必ずリポジトリルートにする）
   - **Output Directory**: `apps/nextjs/.next`
   - **Build Command**: `pnpm turbo run build --filter=@acme/nextjs`

3. **next.config.jsの確認**: `distDir: ".next"`が設定されていることを確認（既に設定済み）

4. **再デプロイ**: 設定変更後、ビルドキャッシュをクリアして再デプロイ

### データベース接続エラー

**原因**: 
- Supabaseの接続文字列が間違っている
- データベースがアクセスできない状態

**解決策**:
1. Supabaseダッシュボードでデータベースの状態を確認
2. 接続文字列のパスワード部分が正しいことを確認
3. IPアドレス制限がある場合は、Vercelのアドレスを許可

## ローカルでのビルドテスト

Vercelにデプロイする前に、ローカルでビルドをテストすることをお勧めします：

```bash
# 環境変数を設定（.envファイル）
# DATABASE_URL=postgresql://...

# 依存関係をインストール
pnpm install

# Prisma Clientを生成
pnpm --filter @acme/db generate

# ビルドテスト
pnpm build --filter=@acme/nextjs

# ローカルで実行
pnpm dev
```

## セキュリティに関する注意事項

⚠️ **重要**: 
- 環境変数（特に `DATABASE_URL` と `AUTH_SECRET`）は絶対にGitにコミットしないでください
- `.env` ファイルは `.gitignore` に含まれています
- 本番環境の認証情報は慎重に管理してください

## データベースマイグレーション

Vercelデプロイ後、必要に応じてデータベースマイグレーションを実行：

```bash
# ローカルから本番データベースに接続してマイグレーション
DATABASE_URL="<本番環境のDATABASE_URL>" pnpm --filter @acme/db migrate deploy
```

**注意**: 本番環境でのマイグレーションは慎重に行ってください。

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Supabase Documentation](https://supabase.com/docs)

## サポート

問題が発生した場合は、以下を確認してください：
1. Vercelのビルドログ
2. Supabaseのログ
3. このリポジトリの `spec.md` で要件を確認
4. GitHubのIssuesで既知の問題を確認
