# 要件定義の変更点

以下に要件定義の変更点を記載する

変更点: Better-Authを使用したユーザー認証機能の実装

## 実装する機能

### 認証方式
- **Email・Password認証**を実装する（1要素認証）
- 将来的にOAuth認証（Google、GitHubなど）、Email 2FA（2要素認証）、Passkey（パスキー）認証への拡張を考慮する

### 初期ユーザーの作成

開発・テスト環境用として、すべてのロールについて初期ユーザーを作成する。

#### 初期ユーザー一覧

各ロールについて、以下の形式で仮ユーザーを作成する：

| ロール | メールアドレス | パスワード | department_code |
|--------|---------------|-----------|-----------------|
| SYSTEM_ADMIN | system_admin@example.com | password | NULL |
| ADMIN | admin@example.com | password | NULL |
| HR_MANAGER | hr_manager@example.com | password | NULL |
| FIELD_MANAGER | field_manager@example.com | password | BPS（またはONS/CC/PS） |
| GENERAL_AFFAIRS | general_affairs@example.com | password | NULL |
| AUDITOR | auditor@example.com | password | NULL |

**注意事項**:
- すべてのユーザーに共通パスワード `password` を設定する（開発・テスト環境のみ）
- FIELD_MANAGERロールのユーザーは、部門コード（department_code）を設定する必要がある
- 本番環境では、初期ユーザーを作成した後、各ユーザーにパスワード変更を強制する
- 本番環境では、初期ユーザーのパスワードをランダムな強力なパスワードに変更する

### ユーザーロールと権限

現在の4つのロール（ADMIN, HR_MANAGER, FIELD_MANAGER, AUDITOR）に加えて、**General Affairs**ロールを追加する。

#### ロール一覧と権限

1. **SYSTEM_ADMIN（システム管理者）**
   - アプリに関するすべての権限を有する
   - システム設定、ユーザー管理、全データへのアクセス権限を持つ

2. **ADMIN（管理者）**
   - 従業員情報の追加と削除が可能
   - ユーザー管理権限を有する
   - すべての従業員情報へのアクセス権限を持つ

3. **HR_MANAGER（統括人事管理者）**
   - すべての従業員情報へのアクセス権限を持つ
   - 従業員情報の追加と削除が可能
   - 契約管理、給与データ抽出、PDF出力が可能

4. **FIELD_MANAGER（現場マネージャー）**
   - 従業員情報の追加と削除が可能
   - 自分の部門（department_code）に属する従業員情報のみアクセス可能
   - 契約管理、給与データ抽出、PDF出力が可能（自分の部門のみ）

5. **GENERAL_AFFAIRS（総務）**
   - 書類管理、提出状況の確認・更新が可能
   - 従業員情報の閲覧権限を有する（編集不可）
   - 契約書・誓約書のPDF出力が可能

6. **AUDITOR（監査人）**
   - 閲覧権限のみを有する
   - すべてのデータの閲覧が可能（編集不可）
   - 監査ログの閲覧が可能

### 権限マトリクス

| 機能 | SYSTEM_ADMIN | ADMIN | HR_MANAGER | FIELD_MANAGER | GENERAL_AFFAIRS | AUDITOR |
|------|--------------|-------|------------|---------------|-----------------|---------|
| 従業員情報の追加 | ✓ | ✓ | ✓ | ✓（自部門のみ） | - | - |
| 従業員情報の削除 | ✓ | ✓ | ✓ | ✓（自部門のみ） | - | - |
| 従業員情報の編集 | ✓ | ✓ | ✓ | ✓（自部門のみ） | - | - |
| 従業員情報の閲覧 | ✓ | ✓ | ✓ | ✓（自部門のみ） | ✓ | ✓ |
| 契約管理 | ✓ | ✓ | ✓ | ✓（自部門のみ） | - | - |
| 契約書PDF出力 | ✓ | ✓ | ✓ | ✓（自部門のみ） | ✓ | - |
| 給与データ抽出 | ✓ | ✓ | ✓ | ✓（自部門のみ） | - | - |
| CSV抽出 | ✓ | ✓ | ✓ | ✓（自部門のみ） | - | - |
| 書類管理 | ✓ | ✓ | ✓ | ✓（自部門のみ） | ✓ | - |
| ユーザー管理 | ✓ | ✓ | - | - | - | - |
| システム設定 | ✓ | - | - | - | - | - |
| 監査ログ閲覧 | ✓ | ✓ | ✓ | ✓（自部門のみ） | ✓ | ✓ |

## Better-Authの採用理由

### Better-Authの主な特徴

1. **TypeScriptに最適化**
   - 型安全性を重視して設計されており、TypeScript環境での開発体験が優れている

2. **フレームワーク非依存（Framework-Agnostic）**
   - Next.js、Remix、Nuxt.jsなど、特定のフロントエンドやバックエンドのフレームワークに縛られず、様々な環境で再利用可能な認証システムを構築できる

3. **最新の認証標準への対応**
   - 従来のメール/パスワード認証やOAuth認証（Google、GitHubなど）に加え、セキュリティが高いPasskey（パスキー）認証や2要素認証（2FA）などの最新標準にも対応している

4. **導入の容易さ**
   - 認証に必要なデータベーススキーマの自動生成（CLI機能による）や、シンプルなAPIクライアントの提供により、認証機能の主要部分を短期間で実装できる

5. **Auth.js（NextAuth）との比較**
   - 既存の認証ライブラリであるAuth.js（NextAuth）と比較して、特にパスキー認証の本番環境での使用を推奨している点や、設定ファイル（config）が肥大化しにくいアーキテクチャになっている点がメリット

### 実装できる主な機能の例

Better-Authを使って簡単に実装できる代表的な認証機能には、以下のようなものがあります。

- Email・Password認証
- OAuth認証（Google、GitHubなど）
- Email 2FA（2要素認証）
- Passkey（パスキー）認証

## データベーススキーマの変更

### usersテーブルの拡張

`database/supabase_schema.sql`に定義されている`users`テーブルに以下の変更を加える：

1. **roleカラムの拡張**
   - 現在の値: `ADMIN`, `HR_MANAGER`, `FIELD_MANAGER`, `AUDITOR`
   - 追加する値: `SYSTEM_ADMIN`, `GENERAL_AFFAIRS`
   - 制約: `CHECK (role IN ('SYSTEM_ADMIN', 'ADMIN', 'HR_MANAGER', 'FIELD_MANAGER', 'GENERAL_AFFAIRS', 'AUDITOR'))`

2. **department_codeカラム**
   - FIELD_MANAGERロールのユーザーは必須
   - その他のロールでは任意（NULL可）

### スキーマ変更のSQL

```sql
-- roleカラムの制約を更新
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_role;
ALTER TABLE users ADD CONSTRAINT chk_role 
  CHECK (role IN ('SYSTEM_ADMIN', 'ADMIN', 'HR_MANAGER', 'FIELD_MANAGER', 'GENERAL_AFFAIRS', 'AUDITOR'));

-- 既存のADMINロールを確認し、必要に応じてSYSTEM_ADMINに移行する処理を検討
-- （既存データへの影響を最小限にするため）
```

### Better-Auth用データベーススキーマの作成

Better-Authが使用するデータベーステーブルをSupabaseに作成する必要がある。

#### Better-Authが作成するテーブル

Better-Authは以下のテーブルを自動的に作成する：

- `user` - ユーザー基本情報
- `session` - セッション情報
- `account` - アカウント情報（Email/Password、OAuthなど）
- `verification` - メール認証、パスワードリセットなど

#### マイグレーションファイルの作成

1. **Better-Auth CLIを使用したスキーマ生成**
   ```bash
   # Better-Auth CLIでスキーマを生成
   pnpm auth:generate
   ```

2. **手動でのスキーマ作成（オプション）**
   Better-Auth CLIが使用できない場合は、`database/migrations/`ディレクトリに以下のマイグレーションファイルを作成する：
   - `YYYYMMDDHHMMSS_create_better_auth_tables.sql`

#### 初期ユーザー作成用のシードスクリプト

`database/seed/`ディレクトリに初期ユーザー作成用のシードスクリプトを作成する：

**ファイル名**: `database/seed/create_initial_users.sql`

```sql
-- 初期ユーザー作成スクリプト
-- Better-Authのパスワードハッシュ化機能を使用してパスワードを設定する必要がある
-- 実際の実装では、Better-AuthのAPIまたはCLIを使用してユーザーを作成する

-- 注意: 以下のSQLは例示であり、実際の実装ではBetter-AuthのAPIを使用すること
-- Better-Authはパスワードをハッシュ化して保存するため、直接SQLでINSERTすることは推奨されない

-- 初期ユーザー作成は、以下のいずれかの方法で行う：
-- 1. Better-Authの管理APIを使用
-- 2. シードスクリプト（Node.js/TypeScript）を作成してBetter-AuthのAPIを呼び出す
-- 3. アプリケーションの初期セットアップ画面から作成

-- 推奨: database/seed/create_initial_users.ts を作成し、Better-AuthのAPIを使用してユーザーを作成する
```

**推奨実装方法**: `database/seed/create_initial_users.ts`を作成し、Better-AuthのAPIを使用してユーザーを作成する。

#### マイグレーションファイルの配置

以下のディレクトリ構造でマイグレーションファイルを管理する：

```
database/
├── migrations/
│   ├── YYYYMMDDHHMMSS_create_better_auth_tables.sql
│   └── YYYYMMDDHHMMSS_update_users_table_roles.sql
├── seed/
│   ├── create_initial_users.ts
│   └── create_initial_users.sql (参考用)
└── supabase_schema.sql (全体スキーマの参照用)
```

#### マイグレーション実行手順

1. **開発環境での実行**
   ```bash
   # Supabaseにマイグレーションを適用
   pnpm db:migrate dev
   ```

2. **初期ユーザーの作成**
   ```bash
   # シードスクリプトを実行
   pnpm db:seed:users
   ```

3. **本番環境での実行**
   - マイグレーションファイルを本番環境のSupabaseに適用
   - 初期ユーザーは手動で作成するか、管理画面から作成
   - 各ユーザーのパスワードを強力なパスワードに変更

## 実装計画

### Phase 1: 基本認証機能の実装
1. Better-Authのセットアップ
   - `packages/auth`パッケージの作成
   - Better-Authのインストールと設定
   - Prisma Adapterの設定

2. データベーススキーマの作成
   - Better-Auth用テーブルの作成（マイグレーションファイル）
   - `users`テーブルの`role`カラム制約の更新
   - マイグレーションファイルの作成と適用

3. 初期ユーザーの作成
   - シードスクリプト（`database/seed/create_initial_users.ts`）の作成
   - 各ロールの初期ユーザー作成
   - パスワード設定（共通パスワード `password`）

4. ログイン/ログアウト機能
   - ログインページの実装
   - セッション管理
   - ログアウト機能

5. 保護されたルートの実装
   - Next.js Middlewareによる認証チェック
   - 未認証ユーザーのリダイレクト

### Phase 2: 権限制御の実装
1. ロールベースアクセス制御（RBAC）
   - 権限チェックヘルパー関数の実装
   - Server Componentでの権限チェック
   - API Routeでの権限チェック

2. データアクセス制御
   - FIELD_MANAGERの部門別フィルタリング
   - 個人番号（myNumber）へのアクセス制御
   - 給与情報へのアクセス制御

### Phase 3: 既存機能との統合
1. 編集ロック機能との統合
   - Phase 3で実装済みの編集ロック機能を認証システムと統合
   - 仮のユーザーIDから実際のユーザーIDへの移行

2. 監査ログへの統合
   - 監査ログにユーザーIDを記録
   - ロール情報の記録

3. UI統合
   - ナビゲーションバーにユーザー情報表示
   - 権限に応じたUI表示制御

## 環境変数

以下の環境変数を追加する必要がある：

```env
# Better-Auth設定
AUTH_SECRET=<ランダムな文字列（32文字以上推奨）>
AUTH_URL=http://localhost:3000  # 本番環境では実際のURLに変更

# データベース接続（既存）
DATABASE_URL=<Supabase PostgreSQL接続文字列>
DIRECT_URL=<Supabase PostgreSQL直接接続文字列（マイグレーション用）>
```

## データベースマイグレーションとシード

### マイグレーションファイルの作成

1. **Better-Authテーブル作成用マイグレーション**
   - ファイル名: `database/migrations/YYYYMMDDHHMMSS_create_better_auth_tables.sql`
   - Better-Auth CLIで生成するか、手動で作成する

2. **usersテーブル更新用マイグレーション**
   - ファイル名: `database/migrations/YYYYMMDDHHMMSS_update_users_table_roles.sql`
   - `role`カラムの制約を更新するSQLを含める

### シードスクリプトの作成

**ファイル名**: `database/seed/create_initial_users.ts`

以下の機能を実装する：

1. Better-AuthのAPIを使用してユーザーを作成
2. 各ロールの初期ユーザーを作成
3. パスワードを `password` に設定（Better-Authがハッシュ化）
4. FIELD_MANAGERロールのユーザーには`department_code`を設定

**実行方法**:
```bash
# シードスクリプトを実行
pnpm db:seed:users
```

**注意事項**:
- 本番環境では、初期ユーザー作成後に各ユーザーのパスワードを変更する
- 本番環境では、強力なパスワードポリシーを適用する

## 注意事項

1. **既存データへの影響**
   - 既存の仮ユーザーIDを使用している編集ロック機能を、実際のユーザーIDに移行する必要がある
   - 既存の監査ログにユーザーIDが記録されていない場合は、移行時に適切な処理を検討する

2. **セキュリティ**
   - パスワードはハッシュ化して保存する（Better-Authが自動的に処理）
   - セッション管理は安全に行う（Better-Authが自動的に処理）
   - CSRF保護を有効にする（Better-Authが自動的に処理）

3. **テスト**
   - 各ロールでの動作確認を実施する
   - 権限のない操作が適切にブロックされることを確認する
   - 部門別フィルタリングが正しく動作することを確認する

4. **将来の拡張**
   - OAuth認証（Google、GitHubなど）の追加を検討する
   - 2要素認証（2FA）の追加を検討する
   - Passkey認証の追加を検討する

5. **既存仕様との整合性**
   - `specs/008-comprehensive-spec/spec.md`の権限要件と整合性を保つ
   - `PLANS.md`のPhase 10の実装計画と整合性を保つ

