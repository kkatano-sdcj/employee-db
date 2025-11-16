# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) が本リポジトリで作業する際の指針を示す。

## プロジェクト概要（背景）

本プロジェクトは、パート従業員を中心とした従業員情報・契約・勤務条件管理の効率化と正確性向上を目的とした従業員データベースシステムである。

- **What**: 従業員データベースシステム（Supabase + Prisma版）
- **Why**: 雇用契約書からの手入力作業を廃止し、給与支払データ作成の効率化を実現
- **Who**: アウトソーシング事業部統括課（統括人事管理者、現場マネージャー）

**主要機能：**
- 従業員マスター管理（基本情報、勤務条件、給与情報）
- 雇用契約書の作成とPDF出力（枝番自動付与、承認番号管理）
- 給与計算用データのCSV抽出（時給、通勤費、社会保険フラグ、各種手当）
- 同時編集制御（EditLockによる競合防止）
- 契約更新アラート機能（期限30日前、14日前、7日前に自動通知）
- 監査ログ（7年間保持、変更履歴の記録）

**設計・実装時の留意点：**
- データベースはSupabase (PostgreSQL) + Prisma ORMを使用
- 個人情報保護のため、個人番号・給与情報へのアクセスは権限制御を厳格に実施
- データベース操作時は必ずトランザクションを使用し、データ整合性を確保
- 法的文書（雇用契約書PDF）の出力ロジック変更は慎重に実施
- `spec.md` の非機能要求（同時編集制御、最終更新日時表示、CSV抽出）は優先度高

## ExecPlans / PLANS.mdの使用タイミング

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

## プロジェクト構成とモジュール組織

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

## 技術スタック
- Next.js App Router (v16.0.0)
- React 19
- TypeScript 5.x
- Tailwind CSS
- Node.js (^22.21.0)
- Supabase（PostgreSQL,既存API経由で利用）

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


## プロンプト設計指針

### 目的  
この指針は、モデル（例：Claude 等）に対して**一貫した高品質な応答**を得るためのプロンプト作成時に守るべきルール・フォーマット・構成を定めたものです。プロンプトを作る／修正するチームメンバー全員がこの指針を参照してください。

### 基本原則  
1. **役割付与（Role Definition）**  
   - プロンプト冒頭で「あなたは〇〇専門家です」「あなたは〇〇の役割を担ってください」と明記してください。  
2. **背景・目的・文脈の明示（Context & Goal）**  
   - なぜこのタスクを行うのか、誰に向けているのか、何を目的としているのかを説明してください。  
3. **明示性（Explicitness）**  
   - 出力形式・言語・トーン・制約などを具体的に記述してください。曖昧さを避けてください。  
4. **思考段階・分解（Decomposition／Chain-of-Thought）**  
   - 複雑なタスクの場合、「①～」「②～」「③～」というステップを設け、それぞれに指示を与えてください。  
5. **例示（Examples／Few-Shot）**  
   - 良い出力例（可能なら悪い出力例も）を提示してください。これによりモデルが期待されるパターンを理解しやすくなります。  
6. **情報源・根拠の限定（Source Limitation／Justification）**  
   - 「以下の情報のみを使ってください」「不明な場合は『確認が必要です』と記載してください」など、範囲・根拠の提示を促してください。  
7. **出力フォーマット・制約（Output Format／Constraints）**  
   - 言語、字数、形式（見出し・箇条書き・表）などを明記してください。  
   - 例：「Markdown形式で」「各項目200字以内で」「箇条書き ‘‐’ を使用」など。

### 出力制約
- 出力言語：必ず**日本語**。必要に応じて補足で英語を併記してもよい。  
- トーン：フォーマルかつ明瞭。専門用語には可能な限り短い補足説明を添える。  
- 出力形式：  
  - 見出しには Markdown の `##` を使用する。  
  - 箇条書きは `-` を用い、1行で簡潔にまとめる。  
  - 必要に応じて Markdown テーブルを活用する。  
- 指示は肯定形で記述し、「〜してください」を用いる。

## ビルド、テスト、開発コマンド

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

## コーディングスタイルと命名規則

- すべてのコードはESモジュールを使用したTypeScriptファーストです。
- Prettier（`tooling/prettier`を参照）は2スペースのインデント、Tailwindクラスの順序、インポートのソートを強制します。
- コミット前に`pnpm format:fix`を実行してください。`tooling/eslint`のESLint設定では、直接`process.env`へのアクセスを禁止しています。代わりに専用モジュールから`env`をインポートしてください。
- 命名規則：
  - コンポーネントは PascalCase
  - フックは `useCamelCase`
  - インスタンス／変数は camelCase を用いる
  - 再利用可能な定数は SCREAMING_SNAKE_CASE で定義し、共有モジュールへ集約する
- ハードコーディング禁止：接続URL、表示文言、閾値などの設定値は環境変数または設定ファイルで管理し、テストから差し替え可能な形で注入する
- UI文言とバリデーションメッセージは専用の設定レイヤーにまとめ、重複定義を避ける
- TypeScript: strict、ESLint + Prettier（CIで強制）
- コミット: Conventional Commits（feat、fix、chore...）
- ブランチ戦略：`feat/*`, `bugfix/*`, `hotfix/*` を使用する

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

## テストガイドライン

このテンプレートにはデフォルトの`test`スクリプトは含まれていません。自動チェックを導入する際は、パッケージごとに追加してください。コンポーネントテストは同一箇所に配置し（例：`apps/nextjs/src/.../__tests__`）、Testing LibraryまたはPlaywrightを推奨します（どちらも既にlockfileに含まれています）。各パッケージの`package.json`にスクリプトを追加し（例：`"test": "vitest run"`）、コントリビューターが`pnpm --filter @acme/nextjs test`を実行できるようにしてください。新しいフィクスチャは影響を受けるパッケージのREADMEに記載してください。

## コミットとプルリクエストガイドライン

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



## その他設定
- 応答メッセージは日本語で返す