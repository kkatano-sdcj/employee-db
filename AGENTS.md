# リポジトリガイドライン

## ExecPlans / PLANS.mdの使用タイミング: いつPlansを参照するかを規定
複雑な機能や大規模なリファクタリングを実装する際は、設計から実装までExecPlan（`./PLANS.md`に記載されている形式）を使用してください。

「exec plan」という言葉を使ったときは、 plans.md を参照し、以下を実行してください：

1. 全体像を理解する
2. 進捗状況を確認する
3. 作業後に plans.md を更新する
4. 発見事項と決定事項を記録する

plans.md はあなたの長期記憶であり、 プロジェクトの羅針盤です。

（閾値の明文化）
- 実装や調査が 2 ステップ以上になりそうなとき、または 30 分を超える見込みの作業では PLANS.md を参照してください。ファイルが無ければ作成し、目的・手順・担当を明記してください。
- ステークホルダーが 2 名以上関与する場合や、ロールアウトを段階化する必要がある場合も作成義務があります。
- 単純なコピー修正や 1 ファイル修正は免除対象ですが、判断に迷ったら作るのが原則です。

## 原則
- `PLANS.md`を編集する際は、必ず`./specs`ディレクトリ内の最新版の`spec.md`を参照して行うこととする。

## 目的
この文書は `employee-db` に貢献する全エージェント開発者向けの実務ガイドであり、AIエージェントが安全・一貫・再現可能に開発するためのルールと手順を示したものです。
レポジトリ構造、作業手順、品質基準、優先順位を一望できるようにし、指示の衝突を減らします。新規参加者が 1 スプリント以内に成果を出せるよう、意思決定の背後にある背景も端的に記しています。既存メンバーにとっても、判断が迷いやすいポイントを素早く参照するカタログとして機能します。

**プロジェクト概要：従業員データベースシステム（Supabase + Prisma版）**
- 目的：パート従業員を中心とした従業員情報・契約・勤務条件管理の効率化と正確性向上
- 主要機能：従業員マスター、雇用契約書PDF出力、給与支払データ抽出、同時編集制御
- 対象組織：アウトソーシング事業部統括課
- データベース：Supabase (PostgreSQL) + Prisma ORM
- 仕様書：`spec.md` を参照

## プロジェクト構成とモジュール組織: プロジェクト構成
このPNPMワークスペースモノレポでは、実行時アプリケーションを`apps/`配下（`nextjs`、`expo`、`tanstack-start`）に配置し、共有ロジックを`packages/`配下に配置します。コアAPI、認証フロー、UIプリミティブは`packages/api`、`packages/auth`、`packages/db`、`packages/ui`に配置され、再利用可能なツール設定は`tooling/`内（ESLint、Prettier、Tailwind、TS設定）にあります。新しいコードを追加する際は、機能を実行時アプリケーションと同一箇所に配置し、横断的なユーティリティのみを専用パッケージで共有してください。

**従業員データベースSupabaseプロジェクト構成:**
- `apps/nextjs`: 従業員管理UI用のNext.js Webアプリケーション
- `apps/expo`: 従業員ディレクトリ用のReact Nativeモバイルアプリ
- `apps/tanstack-start`: TanStack Startを使用した代替Webフロントエンド
- `packages/api`: tRPC API定義とルーター
- `packages/auth`: better-authを使用した認証
- `packages/db`: データベーススキーマとクライアント（Prisma + Supabase）
  - `prisma/schema.prisma`: Prismaスキーマ定義
  - `prisma/migrations/`: データベースマイグレーション
  - `src/client.ts`: Prisma Clientシングルトン
- `packages/ui`: 共有UIコンポーネント（shadcn-uiベース）
- `packages/validators`: 共有バリデーションスキーマ

## セットアップコマンド
- **システム要件**: Node.js ^22.16.0
- プロジェクトセットアップ: `pnpm install`
- 環境変数セットアップ: `.env.example`を`.env`にコピーして変数を設定
- 認証スキーマ: `pnpm auth:generate`  
- データベースセットアップ:
  - `pnpm db:generate`: Prisma Clientを生成
  - `pnpm db:push`: スキーマをSupabaseにプッシュ（開発環境）
  - `pnpm db:migrate dev`: マイグレーションを作成して適用
  - `pnpm db:studio`: Prisma Studioを開く（データベースGUI）
- 開発（全アプリ）: `pnpm dev`
- 開発（Next.jsのみ）: `pnpm dev:next`
- テスト: `pnpm test`（注意：テストスクリプトは各パッケージで個別設定が必要）
- リントとフォーマット: `pnpm lint && pnpm format`

**必要な環境変数:**
- `DATABASE_URL`: Supabase PostgreSQL接続文字列
- `AUTH_SECRET`: Better-authシークレットキー
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトURL（オプション）
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase匿名キー（オプション）

**注意事項:**
- Node.js v22.16.0以上が必須（--experimental-strip-typesサポートのため）
- 古いバージョンではlintコマンドが失敗する可能性があります

## ビルド、テスト、開発コマンド: 開発・実行コマンド
すべての場所でPNPMを使用してください。`pnpm dev`は各アプリの`dev`タスクを実行する開発サーバーを起動します。単一ターゲットにスコープするには`pnpm --filter @acme/nextjs dev`を使用します。`pnpm build`、`pnpm lint`、`pnpm typecheck`はそれぞれPNPMワークスペースの仕組みを通じてワークスペース全体に展開されます。データベースマイグレーションはPrismaに依存します：スキーマ更新後は`pnpm db:push`を実行（開発環境）、または本番対応のマイグレーションには`pnpm db:migrate dev`を実行し、Prisma Studioでのローカル確認には`pnpm db:studio`を使用します。認証テーブルは`pnpm auth:generate`（`pnpm --filter @acme/auth generate`のエイリアス）で同期を維持する必要があります。

**従業員データベース固有のコマンド:**
- `pnpm db:generate`: スキーマ変更後にPrisma Clientを生成
- `pnpm db:push`: スキーマをSupabaseにプッシュ（開発環境、マイグレーションファイルなし）
- `pnpm db:migrate dev`: マイグレーションを作成して適用（本番対応）
- `pnpm db:studio`: Prisma Studioを開く（データベースGUI）
- `pnpm db:seed`: 従業員データをシード（`prisma/seed.ts`を実行）
- `pnpm ui-add`: shadcn-ui CLIを使用して新しいUIコンポーネントを追加

**API開発:**
`packages/api/src/router/`内で利用可能なtRPCルーター:
- `employee.ts`: 従業員マスター管理
- `contract.ts`: 雇用契約管理
- `employmentHistory.ts`: 雇用・人事履歴
- `workCondition.ts`: 勤務条件管理
- `editLock.ts`: 同時編集制御
- `export.ts`: CSV抽出・PDF出力
- `auditLog.ts`: 監査ログ
- `notification.ts`: アラート・通知機能

## リポジトリ規約
- ディレクトリ（例・変更可）
  - `apps/web/` : フロント（画面定義・入力制御・PDF/CSV トリガ）
  - `apps/api/` : API・権限・編集ロック・監査ログ
  - `db/`       : マイグレーション・DDL・シード
  - `docs/`     : 画面定義・API 定義・ER 図・権限マトリクス
  - `spec/`     : 仕様書（本件の SoT）
  - `tests/`    : 単体・結合・E2E・セキュリティ・負荷
- 主要ブランチ運用
  - `main`: 安定版のみ
  - `feat/*`: 機能単位
  - `hotfix/*`: 重大不具合

**テストの手順**
- CI（継続的インテグレーション）の計画は .github/workflows フォルダ内にあります。
- `pnpm --filter <project_name> test` を実行して、そのパッケージに定義されている全てのチェックを実行してください。
- パッケージのルートディレクトリからは、単に `pnpm test` を呼び出すだけでテストが実行できます。マージする前に、コミットが全てのテストに合格している必要があります。
- 特定の一つのステップに集中したい場合は、`pnpm vitest run -t "<test name>"` のようにVitestのパターンを追加してください。
- テストスイート全体が成功（グリーン）になるまで、テストや型のエラーを修正してください。
- ファイルを移動したり、インポート文を変更した後は、`pnpm --filter <project_name> lint` を実行して、ESLintとTypeScriptのルールに違反していないか確認してください。
- 誰かに頼まれなくても、変更したコードに対応するテストを追加または更新してください。

**プルリクエストの手順**
- タイトルのフォーマット: [<project_name>] <タイトル>
- コミットする前には、必ず pnpm lint と pnpm test を実行してください。

## コーディングスタイルと命名規則: コード規約・リンタ・命名規則
- すべてのコードはESモジュールを使用したTypeScriptファーストです。
- Prettier（`tooling/prettier`を参照）は2スペースのインデント、Tailwindクラスの順序、インポートのソートを強制します。
- コミット前に`pnpm format:fix`を実行してください。`tooling/eslint`のESLint設定では、直接`process.env`へのアクセスを禁止しています。代わりに専用モジュールから`env`をインポートしてください。ReactコンポーネントにはPascalCase、ユーティリティにはcamelCaseを推奨し、組織が代替プレフィックスを決定するまで`@acme/*`ワークスペース命名を維持してください。
- TypeScript: strict、ESLint + Prettier（CIで強制）
- コミット: Conventional Commits（feat、fix、chore...）

## 技術スタック
- Next.js App Router (v16.0.0)
- React 19
- TypeScript 5.x
- Tailwind CSS
- Node.js (^22.21.0)
- supabase（PostgreSQL,既存API経由で利用）

## 主要な依存関係

### フレームワーク・プラットフォーム
- **Next.js**: `^16.0.0`
- **React**: `catalog:react19`

### データベース・ORM
- **Prisma**: `^5.12.0`
- **@prisma/client**: `^5.12.0`

### 認証・API・状態管理
- **better-auth** ファミリー (`catalog:`)
- **tRPC** (`catalog:`)
- **TanStack React Query** (`catalog:`)
- **TanStack React Form** (`catalog:`)

### バリデーション・型安全
- **Zod** (`catalog:`)
- **zod-prisma**: Prismaスキーマから自動生成されたZodバリデーター
- **superjson**: `2.2.3`

### 開発ツール
- **TypeScript** (`catalog:`)
- **ESLint** (`catalog:`)
- **Prettier** (`catalog:`)

### UI・スタイリング
- **Tailwind CSS** (`catalog:`)
- **Radix UI**: `^1.0.0`

### UIコンポーネント関連（追加設定）

- **daisyUI**: `^4.x`
  - Tailwind CSSに統合されたコンポーネントライブラリです。`tailwind.config.js`にて`plugins: [require('daisyui')]`を追加してください。
  - 標準テーマまたはチームカスタムテーマ（`daisyui.themes`）の明示的指定を推奨します。
  - daisyUIのコンポーネントは直接`className`で利用可能です。冗長なラップや独自CSSの上書きを避け、公式UI設計ガイドに従ってください。

- **Heroicons**: `^2.0.18`
  - React公式コンポーネント（`@heroicons/react/24/...`など）形式でアイコン利用が可能です。
  - アイコンは再利用性を考慮し、`components/Icon/...`配下に必要最小限のラッパー/カスタムセットを作成してください。
  - 使用例:
    ```tsx
    import { CheckIcon } from '@heroicons/react/24/solid'
    <CheckIcon className="w-5 h-5 text-success" />
    ```
  - アイコンの利用統一・命名規約はPascalCaseを採用し、用途ごとにわかりやすい命名とすること。
  - 必要なアイコンのみインポート（ツリーシェイキング）し、バンドルサイズに留意してください。

## タスクポリシー（非常に重要）
- 小さく安全に: Issue 単位で PR を分割。影響範囲が広い場合は必ず `PLANS.md` を作成・更新し段階実行。
- テスト必須: 既存テスト維持 + 変更差分に対する追加テスト。
- 破壊的変更禁止: 互換性リスクは先に提案を `PLANS.md` に起票して承認待ち。

**従業員データベース固有のポリシー:**
- 個人情報保護: 個人情報を扱うため、セキュリティに特に注意。個人番号・給与情報の権限制御を必ず維持。
- データ整合性: データベース操作時は必ずトランザクションを使用し、バックアップとロールバック計画を策定。
  - Prismaトランザクション（`prisma.$transaction`）を活用
  - Supabaseの自動バックアップ機能を利用
- 同時編集制御: EditLockの仕組みを破壊しないよう注意。
- 契約書PDF出力: 法的文書のため、出力ロジックの変更は慎重に。
- 必須実装：`spec.md` の非機能要求（同時編集制御、最終更新日時表示、CSV抽出）は優先度高。

## テストガイドライン: テストのガイドライン
このテンプレートにはデフォルトの`test`スクリプトは含まれていません。自動チェックを導入する際は、パッケージごとに追加してください。コンポーネントテストは同一箇所に配置し（例：`apps/nextjs/src/.../__tests__`）、Testing LibraryまたはPlaywrightを推奨します（どちらも既にlockfileに含まれています）。各パッケージの`package.json`にスクリプトを追加し（例：`"test": "vitest run"`）、コントリビューターが`pnpm --filter @acme/nextjs test`を実行できるようにしてください。新しいフィクスチャは影響を受けるパッケージのREADMEに記載してください。

## コミットとプルリクエストガイドライン: コミット&プルリクガイドライン
最近の履歴ではConventional Commits（`feat:`、`fix:`、`docs:`）を使用し、オプションでスコープを追加します（`feat(nextjs): ...`）。このスタイルに合わせ、コミットを焦点を絞ったものにし、影響を説明してください。プルリクエストには、簡潔な要約、リンクされたIssueまたは仕様（`spec.md`）、検証ノート（`pnpm lint`、`pnpm typecheck`、関連する開発サーバーのチェック）、該当する場合はUIスクリーンショットまたはAPIドキュメントの差分を含めてください。CIパイプラインが成功した後にのみレビューを依頼してください。

## 検証
- 環境要件確認: `node --version` (^22.21.0必須) / `pnpm --version` (^10.19.0必須)
- コード変更後は `pnpm test` / `pnpm typecheck` を必ず実行。
- 失敗時はロールバック指針を PLANS.md に従う。

## Priority / Tie-breakers（指示衝突時の優先順位）

**エージェントが最初に読むべきファイル**
- `PLANS.md`（存在すれば）→ 次に `spec.md`（プロジェクト仕様書）→ `README.md` → `package.json`
- プロジェクト固有ファイル：
  - `spec.md`: 従業員データベースシステムの詳細仕様
  - `packages/db/prisma/schema.prisma`: Prismaスキーマ定義
  - `packages/db/src/client.ts`: Prisma Clientシングルトン
  - `packages/api/src/router/`: tRPC APIルーター定義

指示の優先順は「最新チャット指示 > カレントディレクトリの AGENTS.md > ルート AGENTS.md > リポジトリ既定（README 等）」です。競合する場合は必ず上位の指示に従い、不明点は Issue またはチャットで必ず確認してください。

## 禁止事項
- 秘密情報のハードコード、CI 秘密の出力貼付
- 直接 main に push（PR 必須）
- 大規模リファクタ一括着手（PLANS.md に分割計画を定義）
- プロジェクトの挙動を乱すような破壊的変更は決して行わない

**従業員データベース固有の禁止事項:**
- 個人情報のハードコード（社員番号、個人番号等）
- Supabase本番データベースでの直接テスト実行（必ずテスト環境を使用）
- 権限制御（@acme/auth）のバイパス
- EditLockを使わない同時編集対応
- 雇用契約書PDF出力フォーマットの非互換変更
- `spec.md` の要件を満たさない実装
- Prismaトランザクションを使わない複数テーブルの同時更新

# その他設定
- 応答メッセージは日本語で返す
