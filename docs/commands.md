# コマンドリファレンス

このドキュメントは、従業員データベースシステム（employee-db）で使用可能なすべてのコマンドをまとめたものです。

## 目次

- [セットアップコマンド](#セットアップコマンド)
- [開発コマンド](#開発コマンド)
- [ビルド・デプロイコマンド](#ビルドデプロイコマンド)
- [データベースコマンド](#データベースコマンド)
- [認証コマンド](#認証コマンド)
- [コード品質コマンド](#コード品質コマンド)
- [テストコマンド](#テストコマンド)
- [サーバー停止方法](#サーバー停止方法)
- [その他のコマンド](#その他のコマンド)

---

## セットアップコマンド

### 依存関係のインストール

```bash
pnpm install
```

プロジェクトのすべての依存関係をインストールします。初回セットアップ時や、`package.json`に新しい依存関係が追加された後に実行してください。

**システム要件:**
- Node.js ^22.16.0以上
- pnpm ^10.19.0以上

### 環境変数のセットアップ

```bash
cp .env.example .env
```

`.env.example`を`.env`にコピーして、必要な環境変数を設定してください。

**必要な環境変数:**
- `DATABASE_URL`: Supabase PostgreSQL接続文字列
- `AUTH_SECRET`: Better-authシークレットキー
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトURL（オプション）
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase匿名キー（オプション）

---

## 開発コマンド

### 開発サーバーの起動

```bash
pnpm dev
```

または

```bash
pnpm dev:next
```

Next.jsアプリケーションを開発モードで起動します。通常は `http://localhost:3000` でアクセスできます。

**動作:**
- ホットリロードが有効
- ファイル変更時に自動的に再コンパイル
- 開発用のエラーメッセージが表示される

### 特定パッケージのみ起動

```bash
pnpm --filter @acme/nextjs dev
```

特定のパッケージ（この場合はNext.jsアプリ）のみを起動します。

---

## ビルド・デプロイコマンド

### プロダクションビルド

```bash
pnpm build
```

アプリケーションをプロダクション用にビルドします。最適化されたバンドルが生成されます。

### プロダクションサーバーの起動

```bash
pnpm start
```

ビルド済みのアプリケーションをプロダクションモードで起動します。`pnpm build`を実行した後に使用してください。

---

## データベースコマンド

### Prisma Clientの生成

```bash
pnpm db:generate
```

Prismaスキーマ（`prisma/schema.prisma`）を変更した後に、Prisma Clientを再生成します。スキーマ変更後は必ず実行してください。

### スキーマをSupabaseにプッシュ（開発環境）

```bash
pnpm db:push
```

PrismaスキーマをSupabaseデータベースに直接プッシュします。開発環境でのみ使用してください。マイグレーションファイルは作成されません。

**注意:** 本番環境では使用しないでください。

### マイグレーションの作成と適用

```bash
pnpm db:migrate dev
```

本番対応のマイグレーションを作成して適用します。マイグレーションファイルが`prisma/migrations/`ディレクトリに作成されます。

**使用タイミング:**
- 本番環境に適用するスキーマ変更を行う場合
- マイグレーション履歴を管理したい場合

### Prisma Studioの起動

```bash
pnpm db:studio
```

Prisma Studio（データベースGUI）を起動します。ブラウザでデータベースの内容を視覚的に確認・編集できます。

### シードデータの投入

```bash
pnpm db:seed
```

`prisma/seed.ts`を実行して、テスト用のシードデータをデータベースに投入します。

---

## 認証コマンド

### 認証スキーマの生成

```bash
pnpm auth:generate
```

Better-authの認証スキーマを生成します。認証テーブルの同期を維持するために使用します。

**エイリアス:** `pnpm --filter @acme/auth generate`

---

## コード品質コマンド

### リントチェック

```bash
pnpm lint
```

ESLintを使用してコードの品質をチェックします。エラーや警告が表示されます。

### 型チェック

```bash
pnpm typecheck
```

TypeScriptの型チェックを実行します。型エラーがないか確認できます。

**注意:** 現在は`pnpm lint`のエイリアスになっています。

### フォーマットチェック

```bash
pnpm format
```

Prettierを使用してコードフォーマットをチェックします。フォーマットの問題があるかどうかを確認します（修正はしません）。

### フォーマットの自動修正

```bash
pnpm format:fix
```

Prettierを使用してコードフォーマットを自動修正します。コミット前に実行することを推奨します。

**対象ファイル:**
- `apps/**/*.{ts,tsx,js,jsx,css,md}`
- `prettier.config.mjs`

---

## テストコマンド

### テストの実行

```bash
pnpm test
```

プロジェクトのテストスイートを実行します。

**注意:** テストスクリプトは各パッケージで個別に設定が必要です。

### 特定パッケージのテスト

```bash
pnpm --filter <package_name> test
```

特定のパッケージのテストのみを実行します。

**例:**
```bash
pnpm --filter @acme/nextjs test
```

### 特定テストの実行

```bash
pnpm vitest run -t "<test name>"
```

特定のテスト名にマッチするテストのみを実行します。

---

## サーバー停止方法

### 開発サーバーの停止

開発サーバー（`pnpm dev`）を実行しているターミナルで:

**Ctrl + C** を押してください

これで開発サーバーが正常に停止します。

### プロダクションサーバーの停止

プロダクションサーバー（`pnpm start`）を実行しているターミナルで:

**Ctrl + C** を押してください

### バックグラウンドプロセスの停止

プロセスがバックグラウンドで実行されている場合:

#### 実行中のNode.jsプロセスを確認

```bash
ps aux | grep node
```

または、ポート3000を使用しているプロセスを確認:

```bash
lsof -i :3000
```

#### プロセスを停止

プロセスIDを確認したら:

```bash
kill <プロセスID>
```

強制終了が必要な場合:

```bash
kill -9 <プロセスID>
```

#### ポート3000を使用しているプロセスを直接停止

```bash
kill $(lsof -t -i:3000)
```

**注意事項:**
- 通常は `Ctrl + C` で正常に停止できます
- データベース接続や未保存の変更がある場合は、正常に停止するまで少し待ってください
- 強制終了（`kill -9`）は最後の手段として使用してください

---

## その他のコマンド

### UIコンポーネントの追加

```bash
pnpm ui-add
```

shadcn-ui CLIを使用して新しいUIコンポーネントを追加します。

### ワークスペース全体のコマンド実行

```bash
pnpm --filter <package_name> <command>
```

特定のパッケージに対してコマンドを実行します。

**例:**
```bash
pnpm --filter @acme/nextjs lint
pnpm --filter @acme/nextjs build
```

---

## よく使用するコマンドの組み合わせ

### 開発開始前のチェックリスト

```bash
# 1. 依存関係のインストール
pnpm install

# 2. 環境変数の確認
# .envファイルが存在し、必要な変数が設定されているか確認

# 3. データベースのセットアップ（初回のみ）
pnpm db:generate
pnpm db:push  # 開発環境の場合

# 4. 開発サーバーの起動
pnpm dev
```

### コミット前のチェック

```bash
# 1. フォーマットの自動修正
pnpm format:fix

# 2. リントチェック
pnpm lint

# 3. 型チェック
pnpm typecheck

# 4. テストの実行
pnpm test
```

### スキーマ変更時のワークフロー

```bash
# 1. prisma/schema.prismaを編集

# 2. Prisma Clientを再生成
pnpm db:generate

# 3. 開発環境にプッシュ（開発環境の場合）
pnpm db:push

# または、マイグレーションを作成（本番対応の場合）
pnpm db:migrate dev
```

---

## トラブルシューティング

### Node.jsのバージョン確認

```bash
node --version
```

Node.js ^22.16.0以上が必要です。

### pnpmのバージョン確認

```bash
pnpm --version
```

pnpm ^10.19.0以上が必要です。

### ポートが使用中の場合

```bash
# ポート3000を使用しているプロセスを確認
lsof -i :3000

# プロセスを停止
kill $(lsof -t -i:3000)
```

### 依存関係の問題

```bash
# node_modulesを削除して再インストール
rm -rf node_modules
pnpm install
```

---

## 参考資料

- [プロジェクトガイドライン](./AGENTS.md)
- [プロジェクト仕様書](../specs/spec.md)
- [Prisma公式ドキュメント](https://www.prisma.io/docs)
- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [pnpm公式ドキュメント](https://pnpm.io/)

