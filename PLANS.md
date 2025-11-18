# Codex Execution Plans (ExecPlans): 実行計画

この文書は、実行計画（"ExecPlan"）の要件を説明しています。ExecPlanは、コーディングエージェントが機能やシステム変更を実装する際に従う設計文書です。読者はこのリポジトリの完全な初心者として扱ってください：彼らは現在の作業ツリーと提供する単一のExecPlanファイルしか持っていません。以前の計画の記憶はなく、外部コンテキストもありません。

## ExecPlansとPLANS.mdの使用方法

実行可能な仕様（ExecPlan）を作成する際は、PLANS.mdを_文字通り_に従ってください。コンテキストに含まれていない場合は、PLANS.mdファイル全体を読んで記憶を更新してください。正確な仕様を作成するために、ソース資料を徹底的に読み（再読）してください。仕様を作成する際は、スケルトンから始めて、調査しながら肉付けしていきます。

実行可能な仕様（ExecPlan）を実装する際は、ユーザーに「次のステップ」を尋ねないでください。単に次のマイルストーンに進んでください。すべてのセクションを最新の状態に保ち、停止ポイントごとにリストのエントリを追加または分割して、達成した進捗と次のステップを明確に述べてください。曖昧さを自律的に解決し、頻繁にコミットしてください。

実行可能な仕様（ExecPlan）を議論する際は、将来のために仕様のログに決定事項を記録してください。仕様への変更が行われた理由が明確である必要があります。ExecPlanは生きている文書であり、ExecPlanのみから、他の作業なしに再開できる必要があります。

困難な要件や重大な未知の要素がある設計を調査する際は、マイルストーンを使用して概念実証、「おもちゃの実装」などを実装し、ユーザーの提案が実現可能かどうかを検証できるようにしてください。ライブラリのソースコードを見つけるか取得して読み、深く調査し、より完全な実装を導くためのプロトタイプを含めてください。

## 要件

交渉不可の要件：

* すべてのExecPlanは完全に自己完結型でなければなりません。自己完結型とは、現在の形式で初心者が成功するために必要なすべての知識と指示が含まれていることを意味します。
* すべてのExecPlanは生きている文書です。貢献者は、進捗が進み、発見が発生し、設計決定が確定されるにつれて、それを修正する必要があります。各修正は完全に自己完結型のままでなければなりません。
* すべてのExecPlanは、このリポジトリの事前知識なしに、完全な初心者が機能を最初から最後まで実装できるようにする必要があります。
* すべてのExecPlanは、単に「定義を満たす」ためのコード変更ではなく、実証可能な動作を生成する必要があります。
* すべてのExecPlanは、専門用語を平易な言葉で定義するか、使用しないようにする必要があります。

目的と意図が最優先です。まず、ユーザーの視点から、この作業がなぜ重要かを数文で説明してください：この変更の後、誰かが以前はできなかったことができるようになること、そしてそれがどのように動作するかを確認する方法。次に、その結果を達成するための正確なステップを読者に案内してください。編集する内容、実行する内容、観察すべき内容を含めてください。

計画を実行するエージェントは、ファイルをリストアップし、ファイルを読み、検索し、プロジェクトを実行し、テストを実行できます。以前のコンテキストは知らず、以前のマイルストーンからあなたの意図を推測することはできません。依存する仮定は繰り返してください。外部のブログやドキュメントを指し示さないでください。知識が必要な場合は、計画自体に自分の言葉で埋め込んでください。ExecPlanが以前のExecPlanに基づいており、そのファイルがチェックインされている場合は、参照によって組み込んでください。そうでない場合は、その計画から関連するすべてのコンテキストを含める必要があります。

## フォーマット

フォーマットとエンベロープはシンプルで厳格です。各ExecPlanは、三重のバッククォートで始まり終わる`md`とラベル付けされた単一のフェンスされたコードブロックでなければなりません。内部に追加の三重バッククォートコードフェンスをネストしないでください。コマンド、トランスクリプト、差分、またはコードを示す必要がある場合は、その単一のフェンス内でインデントされたブロックとして提示してください。ExecPlanのコードフェンスを早期に閉じるのを避けるために、ExecPlan内でコードフェンスではなくインデントを使用して明確にします。すべての見出しの後に2つの改行を使用し、#と##などを使用し、順序付きリストと順序なしリストの正しい構文を使用してください。

ファイルの内容が*単一のExecPlanのみ*であるMarkdown（.md）ファイルにExecPlanを記述する場合、三重のバッククォートを省略する必要があります。

平易な散文で記述してください。リストよりも文を優先してください。簡潔さが意味を曖昧にする場合を除き、チェックリスト、テーブル、長い列挙を避けてください。チェックリストは`Progress`セクションでのみ許可され、そこでは必須です。物語のセクションは散文優先のままでなければなりません。

## ガイドライン

自己完結性と平易な言葉が最重要です。通常の英語ではないフレーズ（"daemon"、"middleware"、"RPC gateway"、"filter graph"）を導入する場合は、すぐに定義し、このリポジトリでどのように現れるかを読者に思い出させてください（たとえば、それが現れるファイルやコマンドの名前を付けることによって）。「以前に定義された通り」や「アーキテクチャドキュメントによると」と言わないでください。必要な説明をここに含めてください。たとえ自分自身を繰り返すことになっても。

一般的な失敗モードを避けてください。未定義の専門用語に依存しないでください。機能の「文字通りの定義」を狭く記述して、結果として得られるコードがコンパイルされるが意味のあることを何もしないようにしないでください。重要な決定を読者に委ねないでください。曖昧さが存在する場合、計画自体で解決し、そのパスを選択した理由を説明してください。ユーザーに見える効果を過剰に説明し、偶発的な実装の詳細を過少に指定する側に誤りを犯してください。

観察可能な結果で計画を固定してください。実装後にユーザーができること、実行するコマンド、見るべき出力を述べてください。受け入れは、内部属性（"HealthCheck structを追加"）ではなく、人間が検証できる動作として表現する必要があります（"サーバーを起動した後、[http://localhost:8080/health](http://localhost:8080/health)に移動するとHTTP 200とボディOKが返される"）。変更が内部的な場合は、その影響をどのように実証できるかを説明してください（たとえば、変更前に失敗し、変更後に合格するテストを実行し、新しい動作を使用するシナリオを示すことによって）。

リポジトリのコンテキストを明示的に指定してください。完全なリポジトリ相対パスでファイルに名前を付け、関数とモジュールを正確に名前を付け、新しいファイルを作成する場所を説明してください。複数の領域に触れる場合は、初心者が自信を持ってナビゲートできるように、それらの部分がどのように組み合わされるかを説明する短い方向性の段落を含めてください。コマンドを実行する際は、作業ディレクトリと正確なコマンドラインを示してください。結果が環境に依存する場合、仮定を述べ、合理的な場合は代替案を提供してください。

冪等性と安全性を確保してください。ステップを複数回実行しても損害やドリフトが発生しないように記述してください。ステップが途中で失敗する可能性がある場合は、再試行または適応する方法を含めてください。マイグレーションや破壊的な操作が必要な場合は、バックアップまたは安全なフォールバックを明確に述べてください。進めながら検証できる加算的でテスト可能な変更を優先してください。

検証は必須です。テストを実行する手順、該当する場合はシステムを起動する手順、有用なことを観察する手順を含めてください。新しい機能や機能に対する包括的なテストを説明してください。初心者が成功と失敗を区別できるように、期待される出力とエラーメッセージを含めてください。可能な場合は、コンパイルを超えて変更が効果的であることを証明する方法を示してください（たとえば、小さなエンドツーエンドシナリオ、CLI呼び出し、またはHTTPリクエスト/レスポンストランスクリプトを通じて）。プロジェクトのツールチェーンに適した正確なテストコマンドと、その結果を解釈する方法を述べてください。

証拠を記録してください。ステップがターミナル出力、短い差分、またはログを生成する場合、それらをインデントされた例として単一のフェンスされたブロック内に含めてください。それらを簡潔に保ち、成功を証明するものに焦点を当ててください。パッチを含める必要がある場合は、大きなブロブを貼り付けるのではなく、読者が指示に従って再現できるファイルスコープの差分または小さな抜粋を優先してください。

## マイルストーン

マイルストーンは物語であり、官僚主義ではありません。作業をマイルストーンに分割する場合、各マイルストーンを、範囲、マイルストーンの終わりに以前は存在しなかったものが存在すること、実行するコマンド、観察することを期待する受け入れを説明する短い段落で紹介してください。物語として読みやすく保ってください：目標、作業、結果、証明。進捗とマイルストーンは別物です：マイルストーンは物語を語り、進捗は細かい作業を追跡します。両方が存在する必要があります。簡潔さのためにマイルストーンを省略しないでください。将来の実装に重要になる可能性のある詳細を省略しないでください。

各マイルストーンは独立して検証可能であり、実行計画の全体的な目標を段階的に実装する必要があります。

## 生きている計画と設計決定

* ExecPlanは生きている文書です。重要な設計決定を行う際は、決定とその背後にある思考の両方を記録するために計画を更新してください。すべての決定を`Decision Log`セクションに記録してください。
* ExecPlanは、`Progress`セクション、`Surprises & Discoveries`セクション、`Decision Log`、および`Outcomes & Retrospective`セクションを含み、維持する必要があります。これらは必須です。
* オプティマイザーの動作、パフォーマンスのトレードオフ、予期しないバグ、またはアプローチを形成した逆/非適用セマンティクスを発見した場合、短い証拠スニペット（テスト出力が理想的）とともに`Surprises & Discoveries`セクションにそれらの観察を記録してください。
* 実装の途中でコースを変更する場合、`Decision Log`に理由を文書化し、`Progress`に影響を反映してください。計画は、あなたのチェックリストと同じくらい、次の貢献者のためのガイドです。
* 主要なタスクまたは完全な計画の完了時に、達成されたこと、残っていること、学んだ教訓を要約する`Outcomes & Retrospective`エントリを記述してください。

# プロトタイピングマイルストーンと並列実装

より大きな変更のリスクを軽減する場合、明示的なプロトタイピングマイルストーンを含めることは許容され、しばしば推奨されます。例：実現可能性を検証するために依存関係に低レベル演算子を追加する、またはオプティマイザーの効果を測定しながら2つの合成順序を探索する。プロトタイプを加算的でテスト可能に保ってください。スコープを「プロトタイピング」として明確にラベル付けしてください。実行方法と結果の観察方法を説明してください。プロトタイプを昇格または破棄する基準を述べてください。

テストが合格し続ける減算が続く加算的なコード変更を優先してください。並列実装（たとえば、移行中に古いパスと並行してアダプターを保持する）は、リスクを軽減するか、大規模な移行中にテストが合格し続けることを可能にする場合に適切です。両方のパスを検証する方法と、テストで安全に1つを廃止する方法を説明してください。複数の新しいライブラリや機能領域で作業する場合、これらの機能の実現可能性を_互いに独立して_評価するスパイクを作成することを検討してください。外部ライブラリが期待どおりに動作し、必要な機能を分離して実装することを証明します。

## 良いExecPlanのスケルトン

```md
# <短い、行動指向の説明>

このExecPlanは生きている文書です。`Progress`、`Surprises & Discoveries`、`Decision Log`、および`Outcomes & Retrospective`のセクションは、作業が進むにつれて最新の状態に保つ必要があります。

PLANS.mdファイルがリポジトリにチェックインされている場合、リポジトリルートからそのファイルへのパスをここで参照し、この文書がPLANS.mdに従って維持される必要があることを注意してください。

## 目的 / 全体像

この変更の後、誰かが何を得るか、そしてそれがどのように動作するかを確認する方法を数文で説明してください。有効にするユーザーに見える動作を述べてください。

## 進捗

チェックボックス付きのリストを使用して、細かいステップを要約してください。停止ポイントごとに、ここに文書化する必要があります。部分的に完了したタスクを2つ（「完了」と「残り」）に分割する必要がある場合でもです。このセクションは、作業の実際の現在の状態を常に反映する必要があります。

- [x] (2025-10-01 13:00Z) 完了したステップの例。
- [ ] 未完了のステップの例。
- [ ] 部分的に完了したステップの例（完了: X; 残り: Y）。

タイムスタンプを使用して進捗率を測定してください。

## 驚きと発見

実装中に発見された予期しない動作、バグ、最適化、または洞察を文書化してください。簡潔な証拠を提供してください。

- 観察: …
  証拠: …

## 決定ログ

計画に取り組んでいる間に行われたすべての決定を次の形式で記録してください：

- 決定: …
  根拠: …
  日付/作成者: …

## 結果と振り返り

主要なマイルストーンまたは完了時に、結果、ギャップ、学んだ教訓を要約してください。結果を元の目的と比較してください。

## コンテキストと方向性

読者が何も知らないかのように、このタスクに関連する現在の状態を説明してください。完全なパスで主要なファイルとモジュールに名前を付けます。使用する非自明な用語を定義してください。以前の計画を参照しないでください。

## 作業計画

散文で、編集と追加のシーケンスを説明してください。各編集について、ファイルと場所（関数、モジュール）に名前を付け、挿入または変更する内容を指定してください。具体的で最小限に保ってください。

## 具体的なステップ

実行する正確なコマンドと、それらを実行する場所（作業ディレクトリ）を述べてください。コマンドが出力を生成する場合、読者が比較できるように短い期待されるトランスクリプトを示してください。このセクションは、作業が進むにつれて更新する必要があります。

## 検証と受け入れ

システムを起動または実行する方法と、観察する内容を説明してください。受け入れを、特定の入力と出力を持つ動作として表現してください。テストが含まれる場合、「<プロジェクトのテストコマンド>を実行し、<N>が合格することを期待する。新しいテスト<名前>は変更前に失敗し、変更後に合格する」と言ってください。

## 冪等性と回復

ステップを安全に繰り返すことができる場合は、そう言ってください。ステップが危険な場合は、安全な再試行またはロールバックパスを提供してください。完了後は環境をクリーンに保ってください。

## 成果物とメモ

最も重要なトランスクリプト、差分、またはスニペットをインデントされた例として含めてください。それらを簡潔に保ち、成功を証明するものに焦点を当ててください。

## インターフェースと依存関係

規範的にしてください。使用するライブラリ、モジュール、サービスに名前を付け、その理由を説明してください。マイルストーンの終わりに存在する必要がある型、特性/インターフェース、関数シグネチャを指定してください。`crate::module::function`や`package.submodule.Interface`などの安定した名前とパスを優先してください。例：

crates/foo/planner.rsで、以下を定義：

    pub trait Planner {
        fn plan(&self, observed: &Observed) -> Vec<Action>;
    }
```

上記のガイダンスに従うと、単一のステートレスエージェント、または人間の初心者が、ExecPlanを最初から最後まで読み、動作する観察可能な結果を生成できます。それが基準です：自己完結型、自己完結型、初心者向け、結果重視。

計画を修正する際は、生きている文書セクションを含むすべてのセクションに変更が包括的に反映されていることを確認し、計画の下部に変更とその理由を説明するメモを記述する必要があります。ExecPlanは、何をだけでなく、ほぼすべてについてなぜを説明する必要があります。


## Global Goal (DoD): 目的
- UC-01〜UC-12 の**最低実装**を揃え、PDF/CSV/給与抽出/編集ロック/監査/RBAC/アラートが動作
- 仕様の非機能（検索2秒目標、Enter非保存、最終更新日時表示）を満たす
- UI要件（UI-001: 雇用開始日と雇用終了日を近い場所に配置、UI-002: 一覧画面からのステータス一括変更）を実装
- 契約の雇用期間は `contract_start_date`〜`employment_expiry_scheduled_date` を表示し、`employment_expiry_date` を記録・表示する（`specs/002-contract-expiry-date/spec.md` 準拠）
- 個人情報最小化（住所・電話番号・銀行口座は**保持しない**）がテストで担保
- 部門コードはBPS課、オンサイト課、CC課、PS課の4部署から選択（FR-001準拠）

## Plan: 従業員DB v1（コア要件の段階実装）
```md
# Plan3ベースWeb MVP（Next.js + Supabase 連携）

このExecPlanは生きている文書です。`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective`を随時更新し、`specs/001-employee-db-requirements/spec.md` の FR-001〜FR-009 と `specs/002-contract-expiry-date/spec.md` の FR-001〜FR-009（契約の雇用満了予定日/雇用満了日の管理）に準拠した実装内容と `designs/plan3` のUI要件を同期させます。

## 目的 / 全体像
最新仕様（従業員登録/勤務条件/契約/CSV抽出のFR-001〜FR-009および契約雇用満了日管理仕様 `specs/002-contract-expiry-date/spec.md`）と Plan3 のUIモックに沿った Next.js App Router アプリ（`apps/nextjs`）を構築し、Supabase上の既存テーブル（`database/supabase_schema.sql`）からデータを取得できるMVPを提供します。サイドバー付きのダッシュボード、従業員一覧・詳細・登録、契約管理、レポート、システム設定画面を提供し、最低限のCRUD/閲覧が動作することを確認します。

## Progress
- [ ] (2025-11-16T11:09Z) PNPMワークスペース初期化・`apps/nextjs`作成・Lint/TS/Prettier/ Tailwind/daisyUI セットアップ
- [ ] (2025-11-16T11:09Z) Supabaseクライアント層と環境変数（`DATABASE_URL`/`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`）の整備、テスト用フェッチユーティリティ作成
- [ ] (2025-11-16T11:09Z) Plan3準拠レイアウト/共通UI（サイドバー、トップバー、ステータスカード、タブ、テーブル、フォームコンポーネント）の実装
- [ ] (2025-11-16T11:09Z) 従業員一覧/詳細/登録/契約/レポート/設定ページの構築とSupabase連携、MVP検証 (`pnpm --filter @acme/nextjs dev`)

## Surprises & Discoveries
- 着手前のため未記入。実装中に得られた知見（例: Supabase API制約、データ整形の注意点など）をここに追記する。

## Decision Log
- 決定: Next.js App Router + Server Actions/Route HandlersでSupabase(Postgres)を直接呼び出す。  
  根拠: `spec.md` の非機能要件にあるリアルタイム性/2秒以内検索に対応しやすく、Plan3モックのUIもNext.js + Tailwindで再現しやすい。バックエンド未実装のためフロントから直接Supabaseを呼び、将来の`tRPC`層（Phase 2参照）に置き換え可能。  
  日付/作成者: 2025-11-16 / Codex
- 決定: `database/supabase_schema.sql` 準拠のビュー系APIを `apps/nextjs/src/server/supabase` 配下に配置し、RLS対策としてサーバー側から行データ取得する。  
  根拠: 個人情報（MyNumber等）を扱うため、クライアント側からの直接Anonキー取得を避け、App Routerのサーバーコンポーネント/Route Handlerで集約。  
  日付/作成者: 2025-11-16 / Codex

## Outcomes & Retrospective
- 着手前。ページ実装完了後に、満たしたFR/残課題、Plan3との差分、Supabase接続確認ログを記載する。

## コンテキストと方向性
- 現状: ルートには`designs/plan3` のHTMLモックと Supabase スキーマSQLのみが存在し、Next.jsアプリやPNPM設定が未作成。
- データソース: Supabase プロジェクト（`.env`の`DATABASE_URL`/`DIRECT_URL`）上に `employees` ほか12テーブルが既に作成済み。
- 仕様: `specs/001-employee-db-requirements/spec.md` のFR-001〜FR-009と `specs/002-contract-expiry-date/spec.md` のFR-001〜FR-009（契約開始日/雇用満了予定日/雇用満了日、アラート再計算）を参照。非機能（最終更新日時表示、同時編集制御は将来Phase）を順守。
- UI要件: `designs/plan3/*.html`（ダッシュボード、従業員一覧/詳細/登録、契約管理、レポート、設定）。

## 作業計画
1. **ワークスペース初期化**  
   - ルート `package.json` と `pnpm-workspace.yaml` を作成し、共通スクリプト（`lint`,`format`,`typecheck`）を追加。  
   - Next.js 16, React 19, TypeScript 5, Tailwind, daisyUI, shadcn ベースUI、Heroiconsを依存としてインストール。  
   - ESLint/Prettier/Tailwind設定を `tooling/` がないため簡易版として `apps/nextjs` 直下に配置し、2スペース・import sort・Tailwindクラスオーダーを設定。
2. **アプリスキャフォールド**  
   - `apps/nextjs` に App Router 構成（`app/(dashboard)/...`）を作成し、Plan3に合わせた `layout.tsx`（サイドバー/トップバー/アクセントカード）と `globals.css`（Tailwind + カスタムCSS変数）を定義。  
   - 共通UI: ステータスカード、表、タブ、タイムライン、フォームセクション、モーダルなどを `apps/nextjs/src/components/ui/` に配置。
3. **Supabaseアクセス層**  
   - `apps/nextjs/src/server/supabase/client.ts` にサーバー専用クライアントを作成し、`DATABASE_URL`でPostgresに接続する `postgres` ドライバ or `@supabase/postgrest-js`? Actually plan: use `pg` for server fetch? But restful? We'll decide soon (maybe `@supabase/supabase-js` server). maintain typed helper to fetch employees with includes.  
   - Queryユーティリティ: `apps/nextjs/src/server/queries/employees.ts` など 3枚: employee一覧, employee詳細+関連, 契約, 集計カード, CSV stub.  
   - APIルート: `app/api/employees/route.ts` (一覧/検索), `app/api/employees/[id]/route.ts` (詳細/更新), `app/api/contracts/route.ts`, `app/api/reports/payroll/route.ts` などMVP API stub.
4. **ページ実装（Plan3反映）**  
   - `app/(dashboard)/page.tsx`: カード/チャート/アラート/進行状況 (ダミーデータ→Supabase集計).  
   - `app/(dashboard)/employees/page.tsx`: 検索フォーム+テーブル+ページネーション, Supabaseから `employees` join `contracts`.  
   - `app/(dashboard)/employees/[id]/page.tsx`: タブUI (雇用情報/勤務情報/給与・手当/書類) + `WorkConditionTimeline`.
     - 雇用情報タブに契約番号（contractsテーブルのid）を表示  
   - `app/(dashboard)/employees/new/page.tsx`: multi-stepフォーム, inline validation (Zod).  
   - `app/(dashboard)/contracts/page.tsx`: 契約一覧+PDF出力CTA(placeholder).  
   - `app/(dashboard)/reports/page.tsx`: CSV・給与データ抽出フォーム.  
   - `app/(dashboard)/settings/page.tsx`: システム設定・通知設定UI.  
   - 主要フォームは spec のエラーメッセージ要件 (FR-025) に沿ってフィールド直下へ表示。
5. **データ取得/保存ロジック**  
   - 暫定: Supabase SQLビュー or `pg`クエリ (server actions) で employees, work_conditions,... 12テーブル join.  
   - 従業員登録: サーバーアクション `createEmployeeAction` で employees + work_conditions + child tables + transactions (FR-002〜FR-005).  
   - 契約保存: `contracts` insert + branch number increment stub (Phase6 detail).  
   - 集計: Dashboard KPI (Active employees count, expiring contracts, pending alerts).  
6. **検証/整備**  
   - `pnpm install`, `pnpm lint`, `pnpm format --check`, `pnpm --filter @acme/nextjs test`（Vitest placeholder or skip with "No tests yet" comment).  
   - `pnpm --filter @acme/nextjs dev` で起動し、主要ページ遷移・Supabaseデータ取得 log  screenshots?  
   - README/ENV更新: `.env.example` へ `NEXT_PUBLIC_SUPABASE_URL` など追記。

## 実行と検証
- コマンド: `pnpm install`, `pnpm --filter @acme/nextjs dev`, `pnpm lint`, `pnpm format`,（後日`pnpm test`）。  
- 確認方法: ブラウザで `http://localhost:3000` を開き、Plan3デザインに近しいUI/データ表示/登録フォーム送信/Contractリスト/CSV抽出ボタンが機能することを確認。テーブル/フォーム submit でSupabaseにINSERTされ、一覧へ即反映されること。

## リスクとMitigation
- **Supabaseへの直接接続制限**: Server Components経由で行い、client側にはAnonキーを渡さない。フェール時はMockデータ fallback (Plan3).  
- **データモデル複雑性**: `table.sql` 参照 & Prisma導入前のSQL `WITH` 句 helper で flatten.  
- **時間不足**: MVPでは閲覧/簡易登録を優先し、PDF/CSV/ロック/RBACは既存Phaseで追認。  
- **UIとの乖離**: Plan3 HTML のクラス/配色をTailwindテーマに落とし込み、Storybook的 `components/demo` page で検証。
```
---

## Phase 0: 既存フォーム保存不具合の修正（前提）
**目的**: spec.mdに定められた「勤務条件保存機能（仕様の前提）」及び「フォーム保存動作不具合の早期修正」要件を最優先で実装し、システムの基盤機能を確実に動作させる  
**Steps**
1. 再現手順の E2E を先に作成（Red）
2. サーバ/クライアントの保存フロー修正（Enter 非保存仕様の確認）
3. E2E 緑化 & 回帰
**DoD**
- 既知ケースで保存が 100% 成功、回帰なし
**Risk/Mitigation**
- 原因が複合 → ログ/トレース強化、暫定的に保存リトライ

---

## Phase 1: スキーマ & マイグレーション（ER/制約）
**目的**: 論理モデルをSupabase (PostgreSQL) + Prismaで物理化し、将来の権限制御（Phase 10）に対応可能なスキーマを確定  

**技術スタック**
- データベース: Supabase (PostgreSQL)
- ORM: Prisma
- マイグレーション: Prisma Migrate

**詳細スキーマ定義**: `table.md` を参照（12テーブルの完全定義、フィールド、制約、インデックス、Prismaスキーマ例を含む）

**Steps**
1. `table.md` のスキーマ定義に基づいて `packages/db/prisma/schema.prisma` にモデル定義
   - 12テーブル: employees, work_conditions, working_hours, break_hours, work_locations, transportation_routes, contracts, employment_history, employee_admin_records, users, edit_locks, audit_logs
   - すべての外部キー制約、CHECK制約、インデックスをPrismaで表現
   - カスケード削除は `@relation(onDelete: Cascade)` で定義
   - 複合インデックスは `@@index([field1, field2])` で定義
   - UNIQUE制約は `@unique` で定義
2. 列レベルセキュリティ
   - `myNumber` (個人番号) フィールドへのアクセス制御（アプリケーションレベルで実装）
   - 将来的にSupabase Row Level Security (RLS) で強化可能
3. Prisma マイグレーション生成・適用
   - `pnpm db:generate`: Prisma Client生成
   - `pnpm db:migrate dev`: 開発環境マイグレーション
   - `pnpm db:push`: Supabaseへのスキーマ同期
4. 監査ログテーブル
   - `createdAt` インデックス、JSON型で変更前後の値を保存
   - 不可改ざんハッシュ/連番/署名などの方式は Phase 10 で強化
5. アクセスパターンの最適化
   - `table.md` の「アクセスパターン最適化」セクションを参照
   - 主要クエリパターンと対応インデックスを確認

**DoD**
- Prisma マイグレーションファイル生成済み（`prisma/migrations/`）
- Supabaseにスキーマ適用済み
- Prisma Studioで全テーブル確認可能
- `table.md` 記載の全12テーブルが存在（フィールド数、インデックス数が一致）
- 主要外部キー制約、UNIQUE制約、CHECK制約、インデックス定義済み
- `pnpm db:migrate reset` でロールバック可能
- シードデータ（`prisma/seed.ts`）実行可能

**Risk & Mitigation**
- パフォーマンス低下 → `EXPLAIN ANALYZE` で実行計画確認、インデックス追加
- N+1問題 → Prismaの `include` を適切に使用、クエリ数をモニタリング
- マイグレーション失敗 → トランザクション内実行、失敗時は自動ロールバック
- スキーマの齟齬 → `table.md` を単一の真実の源 (SoT) として維持

---

## Phase 2: CRUD（UC-01〜UC-06 の骨格）
**目的**: 従業員登録・履歴・退復職・検索/一覧（認証機能なしで実装）  
**技術実装**: tRPC + Prisma + TanStack Query (React Query)

**スキーマ参照**: `table.md` の各テーブル定義を参照（フィールド詳細、制約、インデックス、Prismaスキーマ例を含む）

**Steps**
1. 従業員マスター CRUD（`packages/api/src/router/employee.ts`）
   - `create`: Prisma の `create` で新規登録（`table.md` の employees テーブル定義に準拠）
     - 部門コードはBPS課、オンサイト課、CC課、PS課の4部署から選択（FR-001準拠）
     - 部門コードのバリデーション（Zod スキーマで4部署のいずれかを強制）
   - `update`: Prisma の `update` + 楽観的ロック（`updatedAt` チェック）
   - `delete`: 論理削除（`employmentStatus = 'RETIRED'`, `retiredAt` 設定）
   - `findById`: Prisma の `findUnique` + `include` で関連データ取得
   - `findByEmployeeNumber`: インデックス活用（`idx_employees_employee_number`）
   - `search`: Prisma の `findMany` + フィルタリング
     - 検索条件: employeeNumber, name, departmentCode, employmentType, employmentStatus
     - ページネーション: 50件/ページ
     - インデックス活用: `table.md` のアクセスパターンを参照
   - `bulkUpdateStatus`: 一覧画面からのステータス一括変更（FR-026準拠）
     - 複数選択した従業員の書類ステータスを一括更新
     - チェックボックスと一括操作コントロールを使用
2. 勤務条件 CRUD（`packages/api/src/router/workCondition.ts`）
   - `create`: Prisma トランザクションで親子レコードを一括保存（正規化テーブル構造）
   - 子テーブル: working_hours, break_hours, work_locations, transportation_routes（`table.md` 参照）
   - `get`: `findUnique` + `include` で子レコードを一括取得
   - `update`: 既存の子レコードを全削除して再作成（差分更新は Phase 11 で検討）
   - `delete`: CASCADE削除で子レコードも自動削除
   - `findByEmployeeId`: インデックス活用（`idx_work_conditions_employee_id`）
   - `getCurrentWorkCondition`: 有効期間による絞り込み + ソート
   - 時刻帯の重複/境界バリデーション（Zod スキーマ）
3. 雇用契約 CRUD（`packages/api/src/router/contract.ts`）
   - `create`: Prisma の `create`（`table.md` および `specs/002-contract-expiry-date/spec.md` の contracts テーブル定義に準拠）
     - 必須: `contract_start_date`, `employment_expiry_scheduled_date`（雇用満了予定日）
     - 任意: `employment_expiry_date`（実際の雇用満了日）。設定時は `employment_expiry_date >= contract_start_date` をバリデーション
   - `update`: Prisma の `update` + 楽観的ロック
     - 雇用満了予定日を更新したら契約更新アラートを再計算（specs/002 FR-008）
     - `employment_expiry_scheduled_date` は `contract_start_date` より後の日付のみ許容（FR-005）
   - `delete`: 論理削除またはステータス変更
   - マイグレーション: 既存の `contract_end_date` を `employment_expiry_scheduled_date` に移行し、実フィールドを削除（specs/002 FR-009）。移行スクリプトで `UPDATE contracts SET employment_expiry_scheduled_date = contract_end_date WHERE employment_expiry_scheduled_date IS NULL`
   - `update`: Prisma の `update` + 楽観的ロック
   - `delete`: 論理削除またはステータス変更
   - `findById`: `findUnique` + `include: { employee: true }`
    - `findByEmployeeId`: インデックス活用（`idx_contracts_employee_id`）
    - `findExpiringContracts`: `employment_expiry_scheduled_date` を使用した部分インデックス（例: `idx_contracts_expiry_schedule`）で 30/14/7 日前のレコードを取得
   - 契約更新時は新規レコード作成（履歴として保持）
4. 雇用履歴管理（`packages/api/src/router/employmentHistory.ts`）
   - `create`: 履歴レコード作成（更新・削除不可）
   - eventType: 8種類（`table.md` の employment_history テーブル定義を参照）
   - 部門フィールド: BPS課、オンサイト課、CC課、PS課のいずれか（spec.md準拠）
   - 注記: 役職（position）と等級（grade）はパート従業員には不要なため含まれない（spec.md準拠）
   - `findByEmployeeId`: インデックス活用（`idx_employment_history_employee_id`）
5. フロントエンド実装（`apps/nextjs/src/app/(dashboard)/employees/`）
   - 従業員一覧画面: TanStack Query + Server Components
     - チェックボックスと一括操作コントロールでステータス一括変更機能（UI-002, FR-026準拠）
  - 従業員詳細画面: タブ UI（雇用情報/勤務情報/給与・手当/契約履歴/書類/備考）
    - 雇用情報タブ: 社員番号、氏名、部門、契約番号（contracts.id）、入社日、雇用期間（`contract_start_date`〜`employment_expiry_scheduled_date`）、実際の雇用満了日（`employment_expiry_date`、未設定時は「未設定」）と退社日を表示（specs/002 FR-001〜FR-007準拠）
    - 勤務情報タブ: 契約書有給、勤務時間、休憩時間、勤務日数/週、勤務場所、業務内容を表示
    - 給与・手当タブ: 時給、残業時給（overtime_hourly_wage）、最寄り駅（transportation_routes.nearest_station）、交通費（片道/往復）（transportation_routes.round_trip_amount）、控除申告書（甲乙）（employee_admin_records.tax_withholding_category）、雇用保険（加入/未加入）（employee_admin_records.employment_insurance）、雇用保険書提出（employee_admin_records.employment_insurance_card_submitted）、社会保険（加入/未加入）（employee_admin_records.social_insurance）、社会保険関連書類の提出状況（年金手帳、健康保険証）（employee_admin_records.pension_book_submitted, employee_admin_records.health_insurance_card_submitted）を表示（spec.mdの「従業員管理ページの表示データ項目」セクションに準拠）
    - 契約履歴タブ: 契約開始日、雇用満了予定日（employment_expiry_scheduled_date）、実際の雇用満了日（employment_expiry_date）、契約タイプ、業務内容を時系列で表示（specs/002 FR-007準拠）
    - 書類タブ: 保険証授（employee_admin_records.health_insurance_card_submitted）、雇用契約書他管理へ提出（日付）（employee_admin_records.submitted_to_admin_on）、本人へ返却（employee_admin_records.returned_to_employee）、満了通知書発効（employee_admin_records.expiration_notice_issued）、退職届提出（employee_admin_records.resignation_letter_submitted）、返却（保険証: employee_admin_records.return_health_insurance_card、セキュリティカード: employee_admin_records.return_security_card）を表示（spec.mdの「従業員管理ページの表示データ項目」セクションに準拠）
    - 備考タブ: 契約メモ（hourly_wage_note など）の抜粋と任意メモ欄を表示（Plan3 UIの要件。必要に応じて評価・スキル情報を追記）
   - 従業員編集画面: TanStack Form + Zod バリデーション
     - 雇用開始日と雇用終了日を近い場所に配置（UI-001準拠）
     - 部門コード選択: BPS課、オンサイト課、CC課、PS課の4部署から選択（FR-001準拠）
   - 勤務条件入力: 動的フォーム（時間帯追加/削除ボタン）
   - 最終更新日時・更新者を全画面に表示（認証実装前は仮のユーザーIDを使用）
6. バリデーション（`packages/validators/src/`）
   - Zod スキーマでの厳密なバリデーション
   - 部門コードのバリデーション: BPS課、オンサイト課、CC課、PS課の4部署のいずれかを強制（FR-001準拠）
   - 時刻帯の重複チェック、必須項目チェック
**DoD**
- 従業員の新規登録・編集・削除が動作
- 部門コードはBPS課、オンサイト課、CC課、PS課の4部署から選択可能（FR-001準拠）
- 雇用開始日と雇用終了日が近い場所に配置されている（UI-001準拠）
- 一覧画面から複数選択した従業員のステータスを一括変更できる（UI-002, FR-026準拠）
- 従業員詳細画面のタブUI（雇用情報/勤務情報/給与・手当/契約履歴/書類/備考）が正しく表示され、各タブが指定データ項目を満たしている
- 雇用情報タブに契約番号（contractsテーブルのid）と雇用満了予定日/雇用満了日が表示される（specs/002準拠）
- 勤務条件の複数時間帯入力が動作（重複バリデーション含む）
- 従業員検索が 2 秒以内に完了（目標）
- ページネーションが動作（1ページ50件）
- 最終更新日時・更新者が全画面に表示（認証実装前は仮のユーザーID）
- 雇用履歴に役職・等級フィールドが含まれていない（spec.md準拠）
- 単体テスト、統合テストが合格
**Risk & Mitigation**
- 検索 2 秒未達 → `EXPLAIN ANALYZE` でクエリ最適化、インデックス追加
- N+1問題 → Prisma の `include` を使用、`dataloader` パターン検討
- 大量データでのページネーション遅延 → カーソルベースページネーション検討

---

## Phase 3: 編集ロック（UC-12）
**目的**: 最初のアクセス者以外の編集禁止（認証実装前は仮のユーザーIDを使用）  
**技術実装**: Prismaトランザクション + EditLock テーブル
**Steps**
1. `EditLock` モデルの実装（`schema.prisma`）
   - `resourceId` (PK): ロック対象のリソースID（従業員ID等）
   - `resourceType`: リソースタイプ (EMPLOYEE/CONTRACT/WORK_CONDITION)
   - `lockedBy`: ロック取得者のユーザーID（認証実装前は仮のユーザーIDまたはセッションIDを使用）
   - `lockedAt`: ロック取得時刻
   - `expiresAt`: ロック有効期限（15分）、インデックス設定
2. tRPC router の実装（`packages/api/src/router/editLock.ts`）
   - `acquireLock`: ロック取得（既存ロックがあれば失敗）
   - `checkLock`: ロック状態確認
   - `releaseLock`: ロック解放（特定リソースのロックを解放）
   - `releaseLockByUser`: ユーザーが保持しているすべてのロックを一括解放（認証実装後にログアウト時用）
   - `extendLock`: ロック延長（編集中の自動延長用）
   - **認証実装前**: 仮のユーザーIDまたはセッションIDを使用（例: `temp-user-${sessionId}`）
   - **開発環境での無効化**: `NODE_ENV=development` または `SKIP_LOCK_CHECK=true` の場合はロックチェックをスキップ
     ```typescript
     const isLockEnabled = process.env.NODE_ENV !== 'development' && process.env.SKIP_LOCK_CHECK !== 'true';
     if (!isLockEnabled) {
       return; // 開発環境ではロック機能を無効化
     }
     ```
3. Prisma トランザクションでのロック制御
   ```typescript
   const LOCK_TIMEOUT_MS = 15 * 60 * 1000; // 15分
   const userId = getCurrentUserId() || `temp-user-${sessionId}`; // 認証実装前は仮のユーザーID
   await prisma.$transaction(async (tx) => {
     const existing = await tx.editLock.findUnique({ where: { resourceId } });
     if (existing && existing.expiresAt > new Date()) {
       throw new Error('Resource is locked by another user');
     }
     await tx.editLock.upsert({
       where: { resourceId },
       update: { lockedBy: userId, lockedAt: new Date(), expiresAt: new Date(Date.now() + LOCK_TIMEOUT_MS) },
       create: { resourceId, resourceType, lockedBy: userId, lockedAt: new Date(), expiresAt: new Date(Date.now() + LOCK_TIMEOUT_MS) }
     });
   });
   ```
4. ロック解放のタイミング
   - **編集確定時**: 保存処理が成功したら即座にロックを解放
     - tRPC router の `update` や `create` 処理の成功時に `releaseLock` を呼び出す
     - 保存失敗時はロックを維持（ユーザーが再編集できるように）
   - **認証実装後**: ログアウト時にユーザーが保持しているすべてのロックを解放
   - **画面離脱時**: ブラウザの `beforeunload` イベントでロック解放を試行（フォールバック）
     - ネットワークエラー時でも期限切れ（15分）で自動解放されるため、必須ではない
5. 期限切れロックの自動解放
   - PostgreSQL の定期ジョブ（pg_cron）または Next.js API Route の cron job
   - `DELETE FROM edit_locks WHERE expires_at < NOW()`
   - 編集確定で解放されなかったロック（ブラウザクラッシュ等）を自動的にクリーンアップ
6. フロントエンド実装（`apps/nextjs/src/`）
   - 編集画面アクセス時にロック取得を試行（開発環境ではスキップ）
   - ロック失敗時は「他のユーザーが編集中」と表示、閲覧モードに
   - 編集確定（保存成功）時にロック解放APIを呼び出す
   - 画面離脱時にロック解放を試行（beforeunload イベント、フォールバック）
**DoD**
- 2人が同時に同じ従業員を編集しようとした場合、2人目はブロック（本番環境のみ）
- 統合テストで競合アクセスシナリオが 100% 合格
- 編集確定（保存成功）時に即座にロックが解放される
- ロックタイムアウト（15分）後に自動解放（フォールバック）
- ロック中のリソースには「編集中」バッジ表示
- 開発環境（`NODE_ENV=development`）ではロック機能が無効化され、テストや新機能実装が妨げられない
- 認証実装前でも動作（仮のユーザーIDを使用）
**Risk & Mitigation**
- ロック残留（ブラウザクラッシュ等） → 期限切れジョブで自動解放
- 不必要なロック競合 → ロック粒度を適切に設定（従業員単位、契約単位等）
- デッドロック → Prisma のトランザクションタイムアウト設定
- 認証実装前のユーザー識別 → セッションIDまたは仮のユーザーIDを使用、認証実装後に移行

---

## Phase 4: 契約・アラート（UC-05）
**目的**: 契約更新/破棄、期限/基準日、雇用終了アラート（契約書出力で自動解除）。`specs/002-contract-expiry-date/spec.md` で定義された「雇用満了予定日（employment_expiry_scheduled_date）」ベースでアラートを正確に運用し、実際の雇用満了日（employment_expiry_date）は履歴表示/監査用途に保持する。  
**Steps**
- スケジューラで `employment_expiry_scheduled_date` を監視し、30/14/7 日前に通知（FR-004, FR-008）
- `employment_expiry_scheduled_date` 更新時に通知テーブルの対象日を再計算
- 実際の雇用満了日 `employment_expiry_date` を登録しても、予定日ベースのアラートロジックは変更しない
- PDF出力 Success をフックにアラート解除（既存要件を維持）
**DoD**
- 境界ケース（日跨ぎ・月跨ぎ）で期待動作
- `employment_expiry_scheduled_date` のみを参照してアラートが発火し、`employment_expiry_date` 入力後も予定日基準で継続（specs/002 FR-004）
**Risk**
- タイムゾーン差異 → すべてサーバ TZ で正規化

---

## Phase 5: 契約書 PDF（UC-09）
**目的**: 枝番・交通費（ルート別/往復/定期/月上限）を含む PDF  
**技術実装**: @react-pdf/renderer + Next.js API Route
**Steps**
1. PDF生成ライブラリのセットアップ
   - `@react-pdf/renderer` のインストール
   - 日本語フォント（Noto Sans JP）の追加
2. 枝番の自動付与（`packages/api/src/router/contract.ts`）
   - employees テーブルの branchNumber フィールドを使用（`table.md` 参照）
   - Prisma トランザクション + 行ロックで枝番インクリメント
   - 雇用契約書出力ごとに増加（初期値: 0）
   - 並行2ユーザーでも枝番重複なし（PostgreSQLの行ロック機能）
3. PDF テンプレート作成（`apps/nextjs/src/components/pdf/ContractTemplate.tsx`）
   - 雇用契約書レイアウト
   - 従業員情報、契約期間、勤務条件、交通費（ルート別表示）
   - 承認番号の表示
4. PDF生成 API（`apps/nextjs/src/app/api/pdf/contracts/[contractId]/route.ts`）
   - tRPC router から契約データ取得（`include` で関連データ）
   - @react-pdf/renderer で PDF生成
   - ストリーミングレスポンス（Content-Type: application/pdf）
5. 契約書出力時の処理
   - 枝番インクリメント
   - 雇用終了アラート自動解除（`terminationAlertFlag = false`）
   - 監査ログ記録（PDF出力イベント、認証実装前は仮のユーザーID）
6. フロントエンド実装
   - 契約詳細画面に「PDF出力」ボタン
   - ダウンロードまたはプレビュー表示
7. 権限制御（Phase 10で実装）
   - PDF出力は統括人事管理者・管理者のみ
   - 認証実装前は全ユーザーがアクセス可能
**DoD**
- 並行 2 ユーザーが同時にPDF出力しても枝番の重複ゼロ
- 日本語が正しく表示される
- 交通費がルート別に表示される
- 承認番号が表示される
- PDF出力成功時に雇用終了アラートが自動解除
- 監査ログに記録される
**Risk & Mitigation**
- 日本語フォント埋め込み失敗 → Noto Sans JP を静的ファイルとして同梱
- 枝番の競合 → Prisma トランザクション + 行ロックで防止
- PDF生成の遅延 → 大量生成時はバックグラウンドジョブ化（Phase 11で検討）

---

## Phase 6: CSV 指定日時点抽出（UC-10）
**目的**: 任意項目・指定日時点のスナップショット抽出  
**技術実装**: Prisma クエリ + CSV生成（papaparse）
**Steps**
1. 指定日時点のデータ抽出ロジック（`packages/api/src/router/export.ts`）
   - 従業員マスター: employees テーブル（`table.md` の定義を参照）
   - 勤務条件: 指定日時点で有効な勤務条件（有効期間による絞り込み）
   - 正規化テーブル: work_conditions + working_hours + break_hours + work_locations + transportation_routes
   - 契約: 指定日時点で有効な契約（契約期間による絞り込み）
2. 抽出項目選択機能
   - フロントエンドで項目選択UI（チェックボックス）
   - 選択可能フィールド: `table.md` の employees テーブル定義を参照
   - myNumber は統括/管理者のみアクセス可能（権限チェック）
   - バックエンドで動的に `select` 句を構築
3. CSV生成（`apps/nextjs/src/app/api/export/employees/route.ts`）
   - papaparse でCSV変換
   - ストリーミングレスポンス（Content-Type: text/csv）
   - 日本語のエンコーディング（UTF-8 BOM付き）
4. フロントエンド実装（`apps/nextjs/src/app/(dashboard)/export/`）
   - 指定日時点の日付選択（DatePicker）
   - 抽出項目選択（チェックボックス）
   - プレビュー機能（最初の10件を表示）
   - ダウンロードボタン
5. 権限制御（Phase 10で実装）
   - CSV抽出は統括人事管理者・管理者のみ
   - tRPC の `hrManagerProcedure` で制御
   - 認証実装前は全ユーザーがアクセス可能
**DoD**
- 指定日時点（例: 2024-01-01）のデータが正確に抽出される
- 抽出項目を選択できる（従業員番号、氏名、部門等）
- CSV形式でダウンロード可能
- 日本語が正しく表示される（Excel で開ける）
- 再現性テスト: 同じ日時点で複数回抽出しても同じ結果
- 認証実装後は権限のないユーザーは403エラー（Phase 10で実装）
**Risk & Mitigation**
- 大量データで遅延 → ストリーミング出力、分割ダウンロード（10,000件単位）
- メモリ不足 → Prisma の `cursor` ベースページネーション + ストリーミング
- 履歴データの不整合 → テストデータで検証、履歴テーブルの整合性チェック

---

## Phase 7: 給与支払データ抽出（UC-11）
**目的**: 時給・勤務条件・社保フラグ・各種手当を含む給与計算用データ出力  
**技術実装**: Prisma + CSV生成（papaparse）
**Steps**
1. 給与計算用データの抽出仕様定義
   - 従業員情報: employees テーブル（employeeNumber, name）
   - 時給情報: contracts.hourlyWage（`table.md` の contracts テーブル定義を参照）
   - 通勤費: transportation_routes テーブル（route, roundTripAmount, monthlyPassAmount, maxAmount）
   - 社会保険加入フラグ（将来拡張: contracts テーブルに追加予定）
   - 各種手当（将来拡張: contracts テーブルまたは別テーブルに追加予定）
   - 勤務日数: work_conditions（workDaysType + workDaysCount）
   - 勤務時間: working_hours から算出（SUM(endTime - startTime)）
2. Prisma クエリでのデータ取得（`packages/api/src/router/export.ts`）
   - 在籍中の従業員を抽出（employmentStatus = 'ACTIVE'）
   - 現在有効な契約（最新1件）を結合
   - 現在有効な勤務条件（最新1件）を結合（正規化テーブル含む）
3. データ変換処理
   - 勤務時間の合計計算（working_hours から算出）
   - 交通費の集計（transportation_routes から月額定期を優先）
   - 各種手当の集計
4. CSV生成 API（`apps/nextjs/src/app/api/export/payroll/route.ts`）
   - CSV形式での出力（UTF-8 BOM付き）
   - ヘッダー行の定義
5. フロントエンド実装（`apps/nextjs/src/app/(dashboard)/export/payroll/`）
   - 抽出対象期間の選択
   - プレビュー機能（最初の10件）
   - ダウンロードボタン
6. 権限制御（Phase 10で実装）
   - 統括人事管理者・管理者のみ
   - 認証実装前は全ユーザーがアクセス可能
**DoD**
- 在籍中の従業員の給与計算用データが正確に抽出される
- 時給、通勤費、社保フラグ、各種手当が含まれる
- CSV形式でダウンロード可能
- 外部給与システムへの取込テスト（擬似ケース）が合格
- 認証実装後は権限のないユーザーは403エラー（Phase 10で実装）
**Risk & Mitigation**
- 仕様の将来変更 → データ変換レイヤ（`transformPayrollData` 関数）で吸収
- 複数レート対応の複雑さ → 最新の契約情報を優先、履歴は考慮しない（Phase 1）
- 外部システムとの連携 → CSVフォーマットの柔軟性確保、設定ファイルで列順変更可能に

---

## Phase 8: ダッシュボード/ステータス（UC-07）
**目的**: 進捗・ステータスの可視化  
**DoD**
- 指標: 契約期限接近件数/アラート未解除/ロック滞留/検索p95

---

## Phase 9: MVP完成後のテスト実施
**目的**: MVP完成後の包括的なテスト実施と品質保証  
**技術実装**: Vitest (単体), Playwright (E2E), k6 (負荷)

**Steps**
1. 単体テスト（Vitest）
   - バリデーション・ロック・枝番・PDF/CSV生成ロジックのテスト
   - Prisma クエリのモックテスト
   - Zod スキーマのバリデーションテスト
   - ビジネスロジックの単体テスト
2. 統合テスト（Vitest + テストDB）
   - 契約→PDF→アラート解除のフロー
   - 指定日時点抽出の正確性
   - Prisma トランザクションのテスト
   - tRPC router の統合テスト
   - データベースとの統合テスト（テストDB使用）
3. E2Eテスト（Playwright）
   - 従業員登録・編集・削除のシナリオ
   - Enter キーで保存されないことの確認
   - 最終更新日時の表示確認
   - 編集ロックの競合シナリオ
   - PDF出力・CSV抽出の動作確認
4. パフォーマンステスト（k6）
   - 検索・一覧のp95レイテンシ測定
   - 同時100ユーザー、1000リクエストでのレイテンシ測定
   - Prisma クエリのパフォーマンス測定
   - 目標: p95 < 2秒
5. 回帰テスト
   - Phase 0〜Phase 8 で実装した全機能の動作確認
   - 既知の不具合が再発していないことの確認
**DoD**
- 単体テスト: 全テストが合格
- 統合テスト: 全テストが合格
- E2Eテスト: 主要シナリオが合格
- パフォーマンステスト: 検索・一覧のp95レイテンシが2秒以内
- 回帰テスト: 既存機能の動作確認が完了
- テスト結果レポートの作成
**Risk & Mitigation**
- テスト失敗 → バグ修正、再テスト
- パフォーマンス目標未達 → Phase 11で最適化を実施

---

## Phase 10: RBAC（列/行/機能）と監査ログ
**目的**: 仕様の権限マトリクスと監査要件の実装（MVP完成後の認証機能実装）  
**技術実装**
- 認証: better-auth (Prisma Adapter)
- 権限管理: User モデルの role フィールド + tRPC middleware
**Steps**
1. User モデルの拡張（`schema.prisma`）
   - `role` enum (ADMIN/HR_MANAGER/FIELD_MANAGER/AUDITOR)
   - `departmentCode` フィールド（現場マネージャー用）
2. better-auth のセットアップ（`packages/auth/`）
   - Prisma Adapter の設定
   - ログイン・ログアウト・セッション管理の実装
3. tRPC middleware の実装（`packages/api/src/middleware/`）
   - `checkRole.ts`: ロールベースアクセス制御
   - `checkDepartment.ts`: 部門ベースアクセス制御（行レベル）
   - `adminProcedure`, `hrManagerProcedure`, `fieldManagerProcedure` の定義
4. 既存APIの権限チェック追加
   - Phase 2〜Phase 8 で実装した全APIに権限チェックを追加
   - CSV抽出: `hrManagerProcedure` or `adminProcedure`
   - 契約書PDF出力: `hrManagerProcedure` or `adminProcedure`
   - 給与抽出: `hrManagerProcedure` or `adminProcedure`
5. 列レベル制御
   - `myNumber` (個人番号), `hourlyWage` (給与情報) は統括/管理者のみ取得可能
   - 注記: `overtimeHourlyWage`（残業時給）は必要である（spec.md準拠、従業員管理情報.mdに記載、給与・手当タブに表示）
   - `employee_admin_records` の税務・保険・書類管理項目は HR/ADMIN のみ編集可（閲覧は役割に応じて制限）
   - tRPC resolver で条件付き `select` を使用
6. 行レベル制御
   - 現場マネージャーは `departmentCode` でフィルタリング
   - Prismaクエリに `where: { departmentCode: user.departmentCode }` を追加
7. 編集ロックの認証統合
   - Phase 3 で実装した編集ロック機能を認証システムと統合
   - 仮のユーザーIDから実際のユーザーIDに移行
   - ログアウト時のロック解放機能を有効化
8. 監査ログ実装（`packages/api/src/router/auditLog.ts`）
   - 全CRUD操作をインターセプト
   - `AuditLog` モデルに記録（action, resourceType, resourceId, oldValues, newValues, userId, ipAddress）
   - Prisma middleware で自動記録
9. フロントエンド実装（`apps/nextjs/src/`）
   - ログイン・ログアウト画面
   - 権限に応じたUI表示制御
   - 認証状態の管理（TanStack Query）
**DoD**
- ロール別 E2E テストが通る（禁止操作は 403 Forbidden）
- 監査イベントが `audit_logs` テーブルに保存
- JSON型フィールドで変更前後の値を記録
- 編集ロックが認証システムと統合され、実際のユーザーIDで動作
- ログアウト時にユーザーが保持しているすべてのロックが解放される
- 改ざん検知フィールド（将来拡張: ハッシュチェーン）
**Risk & Mitigation**
- 監査量増による I/O 圧 → Prisma の `createMany` でバッチ書き込み
- パフォーマンス影響 → 監査ログ記録を非同期化（バックグラウンドジョブ）
- 既存APIへの権限チェック追加による影響 → 段階的に追加、テストで検証

---

## Phase 11: 非機能最適化 & 監査/コンプライアンス仕上げ
**目的**: p95<2s、監査耐改ざん、個人情報保護  
**技術実装**: Prisma クエリ最適化、Supabase インデックス、監査ログ強化
**Steps**
1. パフォーマンス最適化
   - `EXPLAIN ANALYZE` でスロークエリの特定
   - 不足しているインデックスの追加（Prisma schema の `@@index`）
   - N+1問題の解消（`include` の適切な使用、`dataloader` 導入）
   - Prisma クエリのバッチ処理（`findMany` の活用）
   - Supabase Connection Pooling の設定確認
2. キャッシング戦略
   - TanStack Query のキャッシュ設定（staleTime, cacheTime）
   - よく使われるマスターデータ（部門コード等）のキャッシュ
   - Redis キャッシュの導入検討（将来拡張）
3. 負荷テスト
   - k6 または Artillery でのシナリオテスト
   - 同時100ユーザー、検索・一覧のp95レイテンシ測定
   - 目標: p95 < 2秒
4. 監査ログの耐改ざん強化
   - ハッシュチェーンの実装
   ```typescript
   const previousHash = await getLastAuditLogHash();
   const newHash = sha256(previousHash + JSON.stringify(auditData));
   await prisma.auditLog.create({
     data: { ...auditData, hash: newHash, previousHash }
   });
   ```
   - 定期的な整合性チェックジョブ
5. 個人情報保護
   - `myNumber` フィールドへのアクセス制御（アプリケーションレベル、Phase 10で実装済み）
   - Supabase Row Level Security (RLS) の設定（将来拡張）
   - フィールドレベル暗号化の検討（透過的暗号化）
6. 監査エクスポート機能
   - 監査ログのCSV/JSON出力
   - 期間指定、フィルタ機能
   - 管理者・監査ロールのみアクセス可能
**DoD**
- 検索・一覧のp95レイテンシが2秒以内
- 負荷テスト（同時100ユーザー）合格
- 監査ログがハッシュチェーンで保護
- 監査ログエクスポート機能が動作
- 個人番号フィールドへのアクセスが統括/管理者のみ（Phase 10で実装済み）
- セキュリティ監査（ペンテスト）合格
**Risk & Mitigation**
- パフォーマンス目標未達 → インデックス追加、クエリ最適化、キャッシング強化
- 監査ログの肥大化 → アーカイブ戦略（古いログの圧縮保存）
- 暗号化のオーバーヘッド → 必要最小限のフィールドのみ暗号化

---

## Test & Verification (全体)
**技術実装**: Vitest (単体), Playwright (E2E), k6 (負荷)

**テスト実施タイミング**:
- Phase 9: MVP完成後の包括的なテスト実施
- Phase 10: 認証機能実装後の権限関連テスト
- Phase 11: パフォーマンス最適化後の負荷テスト

**テスト種別**:
- **Unit**: バリデーション・ロック・枝番・PDF/CSV（Phase 9で実施）
  - Prisma クエリのモックテスト
  - Zod スキーマのバリデーションテスト
  - ビジネスロジックの単体テスト
- **Integration**: 契約→PDF→アラート解除、時点抽出（Phase 9で実施）
  - Prisma トランザクションのテスト
  - tRPC router の統合テスト
  - データベースとの統合テスト（テストDB使用）
- **E2E**: Enter 非保存、最終更新日時表示、編集ロック（Phase 9で実施）
  - Playwright でのシナリオテスト
  - フォーム動作テスト（Enter キーで保存されないこと）
  - 最終更新日時の表示確認
  - 編集ロックの競合シナリオ
- **E2E (認証後)**: ロール別操作（Phase 10で実施）
  - ロール別のアクセス制御テスト
  - 権限のない操作の403エラーテスト
- **Perf**: 検索/一覧 p95<2s（Phase 9, Phase 11で実施）
  - k6 での負荷テスト
  - 同時100ユーザー、1000リクエストでのレイテンシ測定
  - Prisma クエリのパフォーマンス測定
- **Security/Privacy**: 列/行/機能レベル権限、機微列の保護、監査改ざん検知（Phase 10, Phase 11で実施）
  - ロールベースアクセス制御のテスト
  - 個人番号フィールドへのアクセステスト
  - 監査ログのハッシュ検証テスト
  - SQLインジェクション対策テスト（Prisma による自動防御）

## Status Log
- 2025-10-30: 初版作成、レビュー依頼
- 2025-11-04: DynamoDB から Supabase (PostgreSQL) + Prisma に変更
  - Phase 1: Prisma スキーマ定義、マイグレーション手順の追加
  - Phase 2: Prisma クエリでの CRUD、N+1問題対策（認証なしで実装）
  - Phase 3: Prisma トランザクションでの編集ロック実装（認証実装前は仮のユーザーIDを使用）
  - Phase 4〜Phase 8: MVP機能の実装
  - Phase 9: MVP完成後のテスト実施
  - Phase 10: better-auth + Prisma Adapter の統合、tRPC middleware での権限制御（認証機能実装）
  - Phase 11: Prisma クエリ最適化、監査ログのハッシュチェーン
  - Test: Vitest, Playwright, k6 の使用
- 2025-11-04 (later): スキーマ整合性確保とドキュメント整理
  - Phase 1: 詳細なテーブル定義（SQL CREATE TABLE）を反映
   - 全12テーブルのフィールド定義を明示（employees, work_conditions, working_hours, break_hours, work_locations, transportation_routes, contracts, employment_history, employee_admin_records, users, edit_locks, audit_logs）
    - 外部キー制約、CHECK制約、インデックスの詳細を追加
    - アクセスパターンの最適化指針を追加
  - Phase 4: リポジトリ層実装詳細を反映
    - 従業員CRUD: findByEmployeeNumber, 検索条件の詳細化、ページネーション（50件/ページ）
    - 勤務条件CRUD: 正規化テーブル（working_hours, break_hours, work_locations, transportation_routes）の一括保存ロジック
    - 雇用契約CRUD: findExpiringContracts の実装詳細
    - 雇用履歴: eventType の8種類（HIRE/TRANSFER/PROMOTION等）を明示
  - Phase 6: 枝番管理の詳細を反映
    - employees.branchNumber フィールドの使用
    - 雇用契約書出力ごとに増加する仕様を明示
  - Phase 7: CSV抽出項目選択の詳細を反映
   - 選択可能フィールドの明示（`table.md` の employees テーブル定義）
    - myNumber の権限チェック
  - Phase 8: 給与支払データ抽出の詳細を反映
    - transportation_routes テーブルの使用
    - working_hours からの勤務時間算出
  - すべてのフェーズでスキーマ定義を単一の真実の源 (SoT) として統一
  - 外部ドキュメント参照を削除し、PLANS.md を自己完結型の実行可能仕様書として完成
- 2025-11-04 (final): ドキュメント分割によるPLANS.mdの文字数削減
   - データベーススキーマ詳細を table.md に分離（12テーブルの完全定義、Prismaスキーマ例、インデックス戦略、マイグレーション手順）
  - Phase 1: table.md への参照を追加、スキーマ詳細を削除（Steps 1の詳細なフィールド定義を簡略化）
  - Phase 4: table.md への参照を追加、フィールド詳細を削除（従業員CRUD、勤務条件CRUD、雇用契約CRUD、雇用履歴の詳細説明を簡略化）
  - Phase 6: 枝番管理の実装コード例を削除、概要のみ保持
  - Phase 7: CSV抽出の詳細なクエリ例とフィールドリストを削除、table.md参照に置き換え
  - Phase 8: 給与データ抽出の詳細なクエリ例を削除、table.md参照に置き換え
  - PLANS.md は実装計画のみに集中、table.md はスキーマ仕様のリファレンスとして機能
  - ドキュメント構成: PLANS.md（実行可能仕様） + table.md（スキーマリファレンス） + spec.md（システム仕様） + AGENTS.md（AI エージェントガイド）
- 2025-11-05: スキーマ更新（docs/part_employee_detailed_schema.json に準拠）
   - `employee_admin_records` テーブルを追加（税務・保険・書類管理・返却物・備考）
   - `contracts` に `hourly_wage_note`（原文メモ）, `overtime_hourly_wage`（残業時給）, `paid_leave_clause`（有休条項）を追加、`job_description` を任意項目に変更
   - `work_conditions` に `work_days_count_note` を追加（例: 2～3）
   - `transportation_routes` に `nearest_station` を追加、往復単価の扱いを明確化
   - これに伴いテーブル総数は12件に増加、関連RBACとアクセスパターン記述を更新
- 2025-11-05 (later): 認証機能の実装タイミングを変更
  - Phase 2のRBAC実装を削除し、Phase 10に移動（MVP完成後に実装）
  - Phase 2をCRUD機能に変更（認証なしで実装）
  - Phase 3の編集ロックを認証実装前でも動作するように調整（仮のユーザーIDを使用）
  - Phase 9を追加: MVP完成後の包括的なテスト実施
  - Phase 10を追加: RBAC（列/行/機能）と監査ログの実装（認証機能）
  - Phase 11に変更: 非機能最適化 & 監査/コンプライアンス仕上げ
  - 工程: Phase 0 → Phase 1 → Phase 2 (CRUD) → Phase 3 (編集ロック) → Phase 4〜8 (MVP機能) → Phase 9 (テスト) → Phase 10 (認証) → Phase 11 (最適化)
- 2025-01-28: spec.mdの最新要件をPLANS.mdに反映
  - Global Goal: UI要件（UI-001, UI-002）と部門コード4部署の要件を追加
  - Phase 2: 部門コードはBPS課、オンサイト課、CC課、PS課の4部署から選択（FR-001準拠）
  - Phase 2: UI-001（雇用開始日と雇用終了日を近い場所に配置）をフロントエンド実装に追加
  - Phase 2: UI-002（一覧画面からのステータス一括変更、FR-026）を追加
  - Phase 2: 雇用履歴に役職・等級フィールドが不要であることを明記（spec.md準拠）
  - Phase 10: 残業時給は必要であることを確認（spec.md準拠、従業員管理情報.mdに記載）
- 2025-01-28 (later): spec.mdの従業員管理ページ表示データ項目の明確化をPLANS.mdに反映
  - Phase 2: 従業員詳細画面のタブUIを「雇用情報/勤務情報/給与・手当/書類」に更新
  - Phase 2: 雇用情報タブに契約番号（contractsテーブルのid）を表示する要件を追加
  - Phase 2: 各タブの表示データ項目を明確化（spec.mdの「従業員管理ページの表示データ項目」セクションに準拠）
- 2025-01-28 (final): spec.mdの最新要件をPLANS.mdに完全反映
  - Global Goal: 部門コード4部署（BPS課、オンサイト課、CC課、PS課）の要件を確認
  - Phase 2: 従業員管理ページの4つのタブ（雇用情報/勤務情報/給与・手当/書類）の表示項目をspec.mdに完全準拠
  - Phase 2: 給与・手当タブに残業時給（overtime_hourly_wage）の表示を追加
  - Phase 2: 書類タブの表示項目をspec.mdに完全準拠（保険証授、雇用契約書提出、本人へ返却、満了通知書発効、退職届提出、返却状況）
  - Phase 10: 残業時給（overtime_hourly_wage）は必要であることを確認（spec.md準拠、従業員管理情報.mdに記載）
