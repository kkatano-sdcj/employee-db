# Supabase スキーマセットアップガイド

このドキュメントでは、Supabaseに従業員データベースのスキーマを作成する方法を説明します。

## 方法1: SQL Editor を使用（推奨）

### 手順

1. **Supabase Dashboard にアクセス**
   - [https://supabase.com/dashboard](https://supabase.com/dashboard) にログイン
   - プロジェクトを選択

2. **SQL Editor を開く**
   - 左サイドバーから「SQL Editor」を選択
   - 「New query」をクリック

3. **SQLファイルを実行**
   - `supabase_schema.sql` の内容をコピー
   - SQL Editor に貼り付け
   - 「Run」ボタンをクリックして実行

4. **実行結果の確認**
   - エラーがないことを確認
   - 左サイドバーの「Table Editor」でテーブルが作成されていることを確認

### 注意事項

- `users` テーブルは better-auth が作成するため、先に認証機能をセットアップする必要があります
- `edit_locks` と `audit_logs` の外部キー制約は、`users` テーブルが存在する場合のみ追加されます
- 既存のテーブルがある場合は、`CREATE TABLE IF NOT EXISTS` によりエラーになりません

## 方法2: Prisma Migrate を使用

### 前提条件

- Node.js ^22.21.0 がインストールされていること
- pnpm ^10.19.0 がインストールされていること
- `.env` ファイルに `DATABASE_URL` が設定されていること

### 手順

1. **環境変数の設定**
   ```bash
   # .env ファイルに Supabase の接続URLを設定
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

2. **Prisma Client の生成**
   ```bash
   pnpm db:generate
   ```

3. **マイグレーションの作成**
   ```bash
   pnpm db:migrate dev --name init_schema
   ```

4. **マイグレーションの適用（本番環境の場合）**
   ```bash
   pnpm db:migrate deploy
   ```

### 注意事項

- Prisma Migrate は既存のスキーマ定義（`packages/db/prisma/schema.prisma`）を使用します
- マイグレーションファイルは `packages/db/prisma/migrations/` に作成されます
- 開発環境では `pnpm db:push` を使用することもできます（マイグレーションファイルは作成されません）

## 方法3: Supabase CLI を使用

### 前提条件

- Supabase CLI がインストールされていること
- プロジェクトが Supabase CLI でリンクされていること

### 手順

1. **プロジェクトのリンク**
   ```bash
   supabase link --project-ref [YOUR-PROJECT-REF]
   ```

2. **SQLファイルの実行**
   ```bash
   supabase db execute -f supabase_schema.sql
   ```

## テーブル一覧

以下の8テーブルが作成されます：

1. `employees` - 従業員マスター
2. `work_conditions` - 勤務条件（勤務時間帯、休憩時間帯、勤務場所、交通費情報をJSONBで統合）
3. `contracts` - 雇用契約
4. `employment_history` - 雇用・人事履歴
5. `employee_admin_records` - 従業員事務管理
6. `users` - 認証ユーザー（better-auth が作成）
7. `edit_locks` - 編集ロック
8. `audit_logs` - 監査ログ

**注意**: `work_conditions` テーブルは、以前の `working_hours`、`break_hours`、`work_locations`、`transportation_routes` テーブルを統合した構造です。これらの情報はJSONBカラムで管理されます。

## トラブルシューティング

### エラー: "relation 'users' does not exist"

**原因**: `users` テーブルがまだ作成されていない（better-auth が作成する）

**対処法**:
1. 先に better-auth のセットアップを完了させる
2. または、`supabase_schema.sql` の `users` 関連の部分をスキップして実行

### エラー: "duplicate key value violates unique constraint"

**原因**: 既にテーブルが存在している

**対処法**:
- `CREATE TABLE IF NOT EXISTS` を使用しているため、通常は発生しません
- 既存のテーブルを削除してから再実行する場合は、`DROP TABLE` を使用

### 外部キー制約エラー

**原因**: 参照先のテーブルが存在しない

**対処法**:
- テーブルを作成する順序を確認
- `employees` テーブルを最初に作成する必要があります

## 次のステップ

スキーマ作成後は、以下を実行してください：

1. **Prisma Client の生成**
   ```bash
   pnpm db:generate
   ```

2. **シードデータの投入（オプション）**
   ```bash
   pnpm db:seed
   ```

3. **Prisma Studio で確認**
   ```bash
   pnpm db:studio
   ```

## 参考資料

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [table.md](./table.md) - 詳細なスキーマ定義

