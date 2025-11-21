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
- 契約の雇用期間は `contract_start_date`〜`employment_expiry_scheduled_date` を表示し、`employment_expiry_date` を記録・表示する（`specs/008-comprehensive-spec/spec.md` User Story 3準拠）
- 個人情報最小化（住所・電話番号・銀行口座は**保持しない**）がテストで担保
- 部門コードはBPS課、オンサイト課、CC課、PS課の4部署から選択（FR-001準拠）
- 従業員編集・契約編集画面では契約番号入力欄を統合ウィジェット先頭に配置し、`specs/008` User Story 6/6-1, FR-085〜FR-087, UI-024/026 の権限制御（従業員管理経路=基本情報のみ編集、契約管理経路=勤務条件/契約/書類編集）を順守する

## Plan: 従業員DB v1（コア要件の段階実装）
```md
# Plan3ベースWeb MVP（Next.js + Supabase 連携）

このExecPlanは生きている文書です。`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective`を随時更新し、`specs/008-comprehensive-spec/spec.md` の User Story / Success Criteria / UI要件と `designs/plan3` のUI要件を同期させます。

## 目的 / 全体像
包括仕様 `specs/008-comprehensive-spec/spec.md`（User Story 1〜14, SC-001〜SC-014, UI-001〜UI-020）と `designs/plan3` のUIモックを同期させた Next.js App Router アプリ（`apps/nextjs`）を構築します。従業員登録/勤務条件/契約/契約書PDF/CSV抽出/ダッシュボード/同時編集制御/契約履歴/通知を一貫して提供し、Supabase（`database/supabase_schema.sql`）からリアルタイムにデータを取得できるMVPを段階的に完成させます。最新仕様は `specs/008` に集約されたため、従来参照していた `specs/001`〜`specs/007` の要件は `specs/008` に内包されます。（旧specにしかない注記が必要な場合のみ補足参照とし、設計判断は常に`specs/008`優先で行うこと。）

## Progress
- [ ] (2025-11-16T11:09Z) PNPMワークスペース初期化・`apps/nextjs`作成・Lint/TS/Prettier/ Tailwind/daisyUI セットアップ
- [ ] (2025-11-16T11:09Z) Supabaseクライアント層と環境変数（`DATABASE_URL`/`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`）の整備、テスト用フェッチユーティリティ作成
- [ ] (2025-11-16T11:09Z) Plan3準拠レイアウト/共通UI（サイドバー、トップバー、ステータスカード、タブ、テーブル、フォームコンポーネント）の実装
- [ ] (2025-11-16T11:09Z) 従業員一覧/詳細/登録/契約/レポート/設定ページの構築とSupabase連携、MVP検証 (`pnpm --filter @acme/nextjs dev`)
- [x] (2025-11-19T00:26Z) `specs/004-contract-update-indicator` 準拠の「要更新」判定/表示を実装。`contracts`クエリ・従業員一覧/詳細・契約管理画面で `employment_expiry_scheduled_date < CURRENT_DATE` を起点にバッジと満了予定日を表示し、Dashboardメトリクスも同じロジックに揃えた。

## Surprises & Discoveries
- (2025-11-19) 既存実装は `termination_alert_flag` を参照していたが実データが同期されておらず、満了予定日ベースの算出が必要だった。Postgres側で `CURRENT_DATE` を使うとタイムゾーン差異を吸収できるため、各クエリでCASE/EXISTSに統一した。

## Decision Log
- 決定: Next.js App Router + Server Actions/Route HandlersでSupabase(Postgres)を直接呼び出す。  
  根拠: `spec.md` の非機能要件にあるリアルタイム性/2秒以内検索に対応しやすく、Plan3モックのUIもNext.js + Tailwindで再現しやすい。バックエンド未実装のためフロントから直接Supabaseを呼び、将来の`tRPC`層（Phase 2参照）に置き換え可能。  
  日付/作成者: 2025-11-16 / Codex
- 決定: `database/supabase_schema.sql` 準拠のビュー系APIを `apps/nextjs/src/server/supabase` 配下に配置し、RLS対策としてサーバー側から行データ取得する。  
  根拠: 個人情報（MyNumber等）を扱うため、クライアント側からの直接Anonキー取得を避け、App Routerのサーバーコンポーネント/Route Handlerで集約。  
  日付/作成者: 2025-11-16 / Codex
- 決定: 契約更新アラートは `employment_expiry_scheduled_date` を唯一のソースとし、`termination_alert_flag` は補助フラグに格下げする。  
  根拠: `specs/004-contract-update-indicator` のFR-001〜FR-005は予定日が当日以前かどうかで判定することを要求しており、手動フラグのままではSC-001〜SC-005を保証できないため。  
  日付/作成者: 2025-11-19 / Codex

## Outcomes & Retrospective
- (2025-11-19) 契約管理・従業員一覧/詳細・ダッシュボードタスクで `specs/004` SC-001〜SC-005 に該当する「要更新」バッジを実装し、満了予定日（employment_expiry_scheduled_date）を同時表示することでUI-001/003も満たした。`pnpm lint` が通ることを確認済み。
- 既知課題: 契約登録フローは依然として `contract_end_date` 入力のみのため、データ移行と入力UIの刷新が必要。暫定的には既存CSV/SQLで `employment_expiry_scheduled_date` を埋める運用が前提。

## コンテキストと方向性
- 現状: ルートには`designs/plan3` のHTMLモックと Supabase スキーマSQLのみが存在し、Next.jsアプリやPNPM設定が未作成。
- データソース: Supabase プロジェクト（`.env`の`DATABASE_URL`/`DIRECT_URL`）上に `employees` ほか8テーブルが既に作成済み。
- 仕様: `specs/008-comprehensive-spec/spec.md` を唯一のSingle Source of Truthとし、User Story 1〜14 / Success Criteria SC-001〜SC-014 / UI-001〜UI-020 / 対象外リストへ常に立ち返る。旧仕様 (`specs/001`〜`specs/007`) は補足的な背景として参照し、差分がある場合は `specs/008` を優先する。
- UI要件: `designs/plan3/*.html`（ダッシュボード、従業員一覧/詳細/登録、契約管理、レポート、設定）。

## 作業計画
1. **基盤セットアップ（US全体の共通土台）**  
   - `package.json`/`pnpm-workspace.yaml`/`apps/nextjs` scaffold を整備し、Node 22.16 + PNPM 10.19 環境で `pnpm lint`/`pnpm dev` を共通化。  
   - ESLint/Prettier/Tailwind/daisyUI/heroicons等を導入し、Plan3 UIライブラリを `components/ui` に集約。  
   - `.env.example` に `DATABASE_URL` / `AUTH_SECRET` / `NEXT_PUBLIC_SUPABASE_*` を明示、`apps/nextjs/src/env.ts` で型安全に読み取る。
2. **従業員 & 勤務条件コア（User Story 1, Success Criteria SC-001, UI-001〜010）**  
   - CRUD/API/サーバーアクションを `apps/nextjs/src/server/queries|actions` に集約。`work_conditions` JSONB カラムへ `working_hours`/`break_hours`/`work_locations`/`transportation_routes` を統合し、`employees` とトランザクションで保存。  
   - 従業員詳細タブ（雇用情報/勤務情報/給与・手当/書類）に spec 008 の表示項目をすべて実装し、契約番号・残業時給・提出物の表示を保証。  
   - CRUDフォームでは Enter 非保存・最終更新者/更新日時の記録を維持。
3. **契約ライフサイクル & UI制御（User Story 3〜8, 14, UI-011〜019）**  
   - 契約期間（`contract_start_date`/`employment_expiry_scheduled_date`/`employment_expiry_date`）の入力・フィルタリング・履歴連携を Phase 4 に統合。  
   - 契約管理テーブルで「要更新」バッジ／3点ドロップダウン（プレビュー/更新/新規/削除）を実装し、従業員一覧/詳細との表示連動を確認。  
   - 契約作成・更新時に employment_history へ自動追記し、従業員詳細の契約履歴タブで最新→過去順に表示。  
   - 雇用期間開始日時が未来の契約は「予約」状態として表示のみ、開始日を過ぎたら自動で有効化。  
   - 契約削除・更新時の承認番号や枝番は Phase 6 で扱う。
4. **書類出力 & PDFテンプレート（User Story 2, SC-002, UI-015）**  
   - `docs/format` にある「パート雇入通知書」「誓約書」HTMLテンプレートを元にPDF出力パイプラインを実装。`/reports/contracts/[id]/pdf` のような Route Handler で従業員/契約情報を注入し、赤字領域と可変フィールドを差し込み。  
   - 契約と誓約書を同時生成するAPIと、書類ステータス更新（作成→承認→返却）を `documents` テーブルで管理。  
   - PDF生成完了時に契約アラートの自動解除・承認番号の履歴保存を行う。
5. **ダッシュボード / CSV / アラート（User Story 4, 9, 10, 11, SC-002〜010, UI-017〜020）**  
   - `apps/nextjs/src/server/queries/dashboard.ts` で重要タスク優先度計算、統計カード（従業員数/今月契約処理/契約更新予定）とクリックハンドリングを実装。  
   - 給与計算用CSV・指定日時点抽出APIを `app/api/reports/*` に配置し、100~500件規模での目標性能（30秒/10秒以内）を測定。  
   - 契約更新アラートテーブルを作成し、30/14/7日前の通知・雇用終了時の自動解除・受信者ロール（統括人事/現場マネージャー）を行う。  
   - 「要更新」タスクは赤色表示・優先度「高」とし、ダッシュボードの本日の重要タスクに組み込む。
6. **検索・同時編集・監査体制（User Story 12, 13, 14, SC-006〜008, UI-002, UI-017）**  
   - 従業員検索（氏名/ステータス/勤務場所）+一覧のステータス一括更新を `apps/nextjs/src/app/(dashboard)/employees/page.tsx` で実装し、ロールによる表示制限を Phase 10 に連携。  
   - 編集ロック(`edit_locks`)で15分のロック/保存時即解放/退出時フォールバックを実装（Phase 3）。  
   - 契約変更履歴の監査と書類提出状況を含む「契約履歴タブ」を拡充し、SC-007/SC-008を満たすトレーサビリティを担保。  
   - Phase 9〜11で包括テスト・RBAC・パフォーマンス最適化を実施し、SC-011〜SC-014を検証。

## `specs/008` User Story ↔ Phase 対応
- **US1 従業員登録/勤務条件** → Phase 2（CRUD）  
- **US2 契約書・誓約書PDF** → Phase 5（契約書PDF）  
- **US3 契約期間管理**, **US4 要更新バッジ**, **US5 契約操作**, **US6 契約入力UI**, **US7 契約履歴自動追記**, **US11 契約更新アラート**, **US14 契約履歴表示** → Phase 4（契約・アラート）  
- **US8 契約表示制御** → Phase 2（従業員詳細タブ） + Phase 4（契約リスト）  
- **US9 ダッシュボード/統計カード** → Phase 8（ダッシュボード/ステータス）  
- **US10 給与/CSV抽出** → Phase 6（CSV指定日時点）と Phase 7（給与支払データ）  
- **US12 従業員検索** → Phase 2（一覧/検索）  
- **US13 同時編集制御** → Phase 3（編集ロック）  
- **SC-001〜SC-014 / UI-001〜UI-020** → 各PhaseのDoDに落とし込み済み（該当Phaseに記載）。優先度P1（US1〜10）はPhase 2〜8でMVPに含め、P2/P3（US11〜14）はPhase 3/4/6/8で段階的に実装する。

## 実行と検証
- コマンド: `pnpm install`, `pnpm --filter @acme/nextjs dev`, `pnpm lint`, `pnpm format`,（後日`pnpm test`）。  
- 確認方法: ブラウザで `http://localhost:3000` を開き、Plan3デザインに近しいUI/データ表示/登録フォーム送信/Contractリスト/CSV抽出ボタンが機能することを確認。テーブル/フォーム submit でSupabaseにINSERTされ、一覧へ即反映されること。

## リスクとMitigation
- **Supabaseへの直接接続制限**: Server Components経由で行い、client側にはAnonキーを渡さない。フェール時はMockデータ fallback (Plan3).  
- **データモデル複雑性**: `table.sql` 参照 & Prisma導入前のSQL `WITH` 句 helper で flatten.  
- **時間不足**: MVPでは閲覧/簡易登録を優先し、PDF/CSV/ロック/RBACは既存Phaseで追認。  
- **UIとの乖離**: Plan3 HTML のクラス/配色をTailwindテーマに落とし込み、Storybook的 `components/demo` page で検証。
```

## Plan: 従業員編集画面（Next.js App Router）
```md
# 従業員編集フォームと更新APIを整備する

このExecPlanは生きている文書です。`specs/008-comprehensive-spec/spec.md` の User Story 1 / FR-050 / SC-038 / UI-001 / UI-010 / UI-016 節と `designs/plan3/employee-detail.html` のモックを常に参照しながら進め、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を最新に保ちます。

## 目的 / 全体像
統括人事管理者が従業員詳細ページから「編集モード」を開いた場合は `specs/008` User Story 6-1 に従って「基本情報のみ編集可能」「勤務条件/契約/書類は表示のみ（契約番号を表示）」とし、契約管理ページから「契約更新」「新規契約作成」を選択した場合は User Story 6 に従って「勤務条件・契約・書類を統合ウィジェットとして編集」「基本情報は表示のみ」「先頭に契約番号欄を配置」できるようにします。どちらの遷移パターンでも `/employees/[id]/edit` でコンテキストを判別し、`pnpm --filter @acme/nextjs dev` 上で動作確認できる状態をゴールとします。

## Progress
- [x] (2025-11-19T13:24Z) `fetchEmployeeDetail` に `is_renewable` を追加し、`mapEmployeeDetailToFormValues` ユーティリティで `EmployeeFormValues` へ射影
- [x] (2025-11-19T13:28Z) `apps/nextjs/src/server/actions/update-employee.ts` + `/api/employees/[id]` を追加し、従業員・勤務条件・契約の更新処理とトランザクションを実装
- [x] (2025-11-19T13:34Z) `EmployeeForm` を編集モード対応にリファクタし、`apps/nextjs/src/app/employees/[id]/edit/page.tsx` から初期値とメタデータを受け渡す
- [x] (2025-11-19T13:40Z) `pnpm --filter @acme/nextjs lint` を実行し、UI要件の手動検証手順を整理（ブラウザ確認は後続作業で実施）
- [x] (2025-11-19T14:30Z) 書類タブの入力セクションをフォームに追加し、`employee_admin_records` の更新処理（UPSERT）を組み込んだ
- [x] (2025-11-20T00:10Z) `specs/008` の User Story 6/6-1・FR-085〜FR-087・UI-024/026 に合わせ、経路別の編集権限と契約番号入力欄をフォームに実装した

## 驚きと発見
- 観察: `create-employee` は依然として `working_hours` 系の旧テーブルにINSERTしている一方、詳細画面は `work_conditions.*_jsonb` から値を読み出している。  
  証拠: `apps/nextjs/src/server/actions/create-employee.ts` と `apps/nextjs/src/server/queries/employees.ts` の実装差異。今回の `updateEmployee` ではJSONBを直接更新し、将来的に登録処理も同じ構造へ寄せる必要がある。

## 決定ログ
- 決定: 更新リクエストは `PUT /api/employees/[employeeId]` に集約し、サーバーアクション `updateEmployee` を介してPostgresトランザクションを張る。  
  根拠: 従業員・勤務条件・契約の3テーブルを同時に更新するため、1か所にまとめてロールバック可能にする必要がある。  
  日付/作成者: 2025-11-19 / Codex
- 決定: 編集フォームは既存 `EmployeeForm` を拡張し、`mode`（"create" | "edit"）と `initialValues` + `resourceIds` をpropsで受ける。  
  根拠: 新規登録とのUI一貫性を維持し、UI-001/010で求められる配置/ラベルを単一コンポーネントから保証する。  
  日付/作成者: 2025-11-19 / Codex

## 結果と振り返り
- 着手前のため未記入。完了時に実装内容・問題・次のアクションをまとめます。

## コンテキストと方向性
- `apps/nextjs/src/components/employees/EmployeeForm.tsx`: React Hook Form + Zod で新規登録専用のUIを提供中。編集モードは未対応。
- `apps/nextjs/src/app/employees/[id]/page.tsx`: 詳細ページに「編集モード」リンクが存在するが、遷移先は未実装。
- `apps/nextjs/src/server/actions/create-employee.ts`: INSERT専用のトランザクション。
- `apps/nextjs/src/server/queries/employees.ts`: 詳細取得に `fetchEmployeeDetail` を提供。これを編集フォーム初期値へマップする。
- `specs/008-comprehensive-spec/spec.md`: 従業員管理ページの表示項目、UI-001/010/016、FR-050/FR-067〜073、SC-038を本タスクの受入基準とする。

## 作業計画
1. `apps/nextjs/src/lib/schemas/employee.ts` に編集で必要なIDフィールド（employeeId, workConditionId, contractIdなど）を追加するか、別の型を導入してAPIリクエストボディに含められるようにする。`defaultEmployeeFormValues` は変わらないが、初期値を外部から差し込めるよう `EmployeeForm` の `useForm` 初期化を props 経由に変更する。
2. `fetchEmployeeDetail` の戻り値をフォーム値へ変換する `mapEmployeeDetailToFormValues` ユーティリティを `apps/nextjs/src/lib/mappers/employee-form.ts`（新規）として作成。複数勤務条件のうち最新(0番目)を編集対象にし、`workConditions[0]` が無い場合は既定値を使用するロジックを記述。
3. `apps/nextjs/src/server/actions/update-employee.ts` を追加し、従業員情報・勤務条件・契約テーブルを `db.begin` で更新。`workConditionId` が存在する場合は関連の `working_hours` 等を一旦DELETE→INSERTで差し替える。存在しない場合は `createEmployee` と同じように新規作成。`contracts` も同様に `contractId` を更新し、未指定の場合は新規発行。
4. API ルート `apps/nextjs/src/app/api/employees/[id]/route.ts` を作り、`PUT` で `updateEmployee` を呼び出す。エラー時は `400` + message、成功時は JSON `{ ok: true }`。
5. `EmployeeForm` を `mode`, `context`, `initialValues`, `employeeId`, `workConditionId`, `contractId`, `onSuccessRedirect` などのpropsに対応させ、`fetch` 先を `mode` で切り替える。コンテキストに応じて各ウィジェットの編集可否を制御し、契約番号入力欄を合同ウィジェットに追加する。成功後は `onSuccessRedirect ?? "/employees"` へ `router.push`。失敗メッセージやボタンラベルを編集/登録で分岐。
6. `apps/nextjs/src/app/employees/[id]/edit/page.tsx` を作成し、Server Componentで `fetchEmployeeDetail` を呼んで `EmployeeForm` に初期値・ID・コンテキストを渡す。`source=contract` クエリがある場合は契約管理モードとみなし、従業員管理からの場合は基本情報のみ編集できるようにする。ページヘッダーやパンくず、キャンセルボタンなどPlan3準拠のUIを追加。
7. `apps/nextjs/src/app/employees/[id]/page.tsx` の「編集モード」リンクおよび下部ボタンが新ページに遷移することを確認し、必要なら `Link` 先を `/employees/${id}/edit` に統一する。
8. 契約管理ページの「契約更新」「新規契約作成」アクションからは `?source=contract`（+必要に応じて`mode=new-contract`）を付与し、契約ウィジェットが編集モードで開くことを保証する。

## 具体的なステップ
1. `pnpm --filter @acme/nextjs lint` — 既存状態がLintグリーンであることを確認。成功時は `Done in <time>` が表示される。
2. 実装後に `pnpm --filter @acme/nextjs lint` を再実行して静的チェックを通す。
3. 必要に応じて `pnpm --filter @acme/nextjs dev` を起動し、`http://localhost:3000/employees/<id>/edit` をブラウザで動作確認。

## 検証と受け入れ
- 手動: 既存の従業員を開き「編集モード」→フォームの各タブで値が初期表示され、雇用開始/終了日が隣接(UI-001)し、雇用区分が表示ラベル「常勤/パートタイム/契約社員」(UI-010)で選択できる。保存成功後は `/employees/<id>` に戻り、表示値が更新される。
- コマンド: `pnpm --filter @acme/nextjs lint` が成功すること。

## 冪等性と回復
- `updateEmployee` は単一トランザクション内でDELETE→INSERTを行うため、途中失敗時はロールバックされ、再送信しても整合性が保たれる。`PUT` APIは冪等：同じペイロードを再実行すると同じレコード状態に収束する。

## 成果物とメモ
- 主要変更ファイル:  
  - `apps/nextjs/src/app/employees/[id]/edit/page.tsx`（新規）  
  - `apps/nextjs/src/components/employees/EmployeeForm.tsx`（編集対応）  
  - `apps/nextjs/src/server/actions/update-employee.ts` / `apps/nextjs/src/app/api/employees/[id]/route.ts`（更新処理）  
  - `apps/nextjs/src/lib/mappers/employee-form.ts`（詳細→フォームのマッピング）

## インターフェースと依存関係
- `updateEmployee({
    employeeId,
    workConditionId?,
    contractId?,
    values: EmployeeFormValues
  }): Promise<{ employeeId: string; contractId: string; workConditionId: string }>` を `apps/nextjs/src/server/actions/update-employee.ts` に定義。
- `mapEmployeeDetailToFormValues(detail: EmployeeDetail): { values: EmployeeFormValues; ids: { workConditionId?: string; contractId?: string } }` を `apps/nextjs/src/lib/mappers/employee-form.ts` に定義。
- フロントは `EmployeeForm` コンポーネントで `mode` prop に応じて `POST /api/employees` か `PUT /api/employees/[id]` を呼び分ける。
```

## Plan: 契約管理ページをspec 008に整合
```md
# 契約管理一覧の列 / アラート / 操作列を `specs/008` に合わせる

このExecPlanは `specs/008-comprehensive-spec/spec.md` の User Story 3〜5、FR-043 / FR-057、UI-007 / UI-012 / UI-013 / UI-017 に従って進め、更新が必要な契約の可視化と操作導線を提供します。`designs/plan3/contract-management.html` のUIモックも参照しながら進捗・決定事項を記録します。

## 目的 / 全体像
契約一覧において「契約番号」「開始日」「終了予定日」「要更新アラート」「操作（3点メニュー）」を表示し、満了超過の契約を視覚的に強調します。利用者は契約プレビュー/更新/新規/削除メニューへ最短でアクセスでき、UI-012/013の配置要求（アラート列の右側に操作列）を満たした状態で `pnpm --filter @acme/nextjs dev` 上で確認できるようにします。

## 進捗
- [x] (2025-11-19T13:58Z) 現状の契約一覧と仕様との差分を洗い出し、必要な列/アクション/スタイルを特定
- [x] (2025-11-19T14:05Z) `fetchContractSummaries` のレスポンスを列構成に合わせて拡張し、「要更新」ロジックを再確認
- [x] (2025-11-19T14:12Z) 契約行・アラートバッジ・3点メニューのUIコンポーネントを実装し、`apps/nextjs/src/app/contracts/page.tsx` のテーブルを差し替え
- [x] (2025-11-19T14:15Z) `pnpm --filter @acme/nextjs lint` を実行し、UI-007/UI-012/UI-013/UI-017の要件確認手順を整理（ブラウザ確認は後続対応）

## 驚きと発見
- 観察: 契約ID（例: `contract-EMP001`）がそのまま人間可読な契約番号として利用できるため、新たな採番をせずに `contractNumber` として再利用できた。  
  証拠: `database/data/insert_sample_data.sql` の `INSERT INTO contracts` で `id` が `contract-<employee_number>` 形式になっている。

## 決定ログ
- 決定: 3点メニューはクライアントコンポーネント（ボタン+ポップメニュー）で実装し、既存ページ（従業員詳細/編集/CSV）への遷移リンクを暫定で割り当てる。  
  根拠: Next.js App RouterのServer Component上でのインタラクション要件（UI-013）に対応するため。将来的なAPI/モーダル導入にも拡張しやすい。  
  日付/作成者: 2025-11-19 / Codex

## 結果と振り返り
- 未記入（完了時に追加）。

## コンテキストと方向性
- 現在の `apps/nextjs/src/app/contracts/page.tsx` では列が「従業員 / 契約タイプ / 期間 / 時給 / 状態 / アラート」のみで、契約番号・操作列・チェックボックス等が不足している。
- `fetchContractSummaries` (`apps/nextjs/src/server/queries/contracts.ts`) は `needsUpdate` を返すが、UI-007/012/013を満たす視覚設計と操作列が未対応。
- 遷移先候補は `employees/[id]`（契約プレビュー）と `employees/[id]/edit`（更新/新規）しか存在しないため、メニューは既存画面への遷移リンクを暫定実装とする。

## 作業計画
1. 仕様再確認: spec 008 の FR-043, FR-057, UI-007/012/013/017 を読み、必要な列/スタイル/メニュー項目をリスト化。
2. クエリ整備: `fetchContractSummaries` に表示用契約番号を追加し、`needsUpdate` 判定を仕様に沿って二重チェック。返却型を列で使いやすい形へ整備。
3. UI実装:
   - 契約行の型整備 (`type ContractSummary` へ contractNumber, alert info, statusラベル)。
   - `ContractAlertBadge`（赤バッジ + 満了予定日）と `ContractActionMenu`（3点メニュー + 4項目）を `apps/nextjs/src/components/contracts/` 以下に追加。
   - `contracts/page.tsx` のテーブルをPlan3準拠の列構成に置き換え（チェックボックス列、契約番号、従業員、契約タイプ、開始/終了日、ステータス、アラート、操作）。
4. 検証: `pnpm --filter @acme/nextjs lint` を実行し、ローカルで `/contracts` を表示してアラート/操作列が仕様通りであることを確認。

## 具体的なステップ
1. `pnpm --filter @acme/nextjs lint`（事前健全性チェック）。
2. 実装後、同コマンドでLintを再実行。
3. optional: `pnpm --filter @acme/nextjs dev` でブラウザ検証。

## 検証と受け入れ
- UI確認: `/contracts` で満了超過契約に赤バッジ・満了日が表示され、アラート列の右隣に3点メニュー（4項目）が表示される。
- `pnpm --filter @acme/nextjs lint` が成功。

## 冪等性と回復
- UIのみの変更でDBへ影響なし。再読み込みすれば同じ状態になる。

## 成果物とメモ
- 主要変更ファイル:  
  - `apps/nextjs/src/app/contracts/page.tsx`  
  - `apps/nextjs/src/server/queries/contracts.ts`  
  - `apps/nextjs/src/components/contracts/*`（新規）

## インターフェースと依存関係
- `ContractSummary` 型に `contractNumber`, `needsUpdate`, `employmentExpiryScheduledDate`, `employmentExpiryDate`, `status` を保持し、UIへ直接渡す。
- `ContractActionMenu` props: `{ contractId, employeeId, employeeName, employeeNumber }`。メニュー項目は `Link` か `button` を返し、後続実装でAPI接続可能にする。
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

**詳細スキーマ定義**: `table.md` を参照（8テーブルの完全定義、フィールド、制約、インデックス、Prismaスキーマ例を含む）

**Steps**
1. `table.md` のスキーマ定義に基づいて `packages/db/prisma/schema.prisma` にモデル定義
   - 8テーブル: employees, work_conditions, contracts, employment_history, employee_admin_records, users, edit_locks, audit_logs
   - 注記: work_conditionsテーブルは、working_hours、break_hours、work_locations、transportation_routesをJSONBカラムで統合した構造
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

- Prisma マイグレーションファイル生成済み（`prisma/migrations/`）
- Supabaseにスキーマ適用済み
- Prisma Studioで全テーブル確認可能
- `table.md` 記載の全8テーブルが存在（フィールド数、インデックス数が一致）
- work_conditionsテーブルがJSONB統合構造に移行済み（旧 working_hours/break_hours/work_locations/transportation_routes テーブルは廃止）
- 主要外部キー制約、UNIQUE制約、CHECK制約、インデックス定義済み（JSONB用GINインデックス含む）
- `pnpm db:migrate reset` でロールバック可能
- シードデータ（`prisma/seed.ts`）実行可能

**Risk & Mitigation**
- パフォーマンス低下 → `EXPLAIN ANALYZE` で実行計画確認、インデックス追加
- N+1問題 → Prismaの `include` を適切に使用、クエリ数をモニタリング
- マイグレーション失敗 → トランザクション内実行、失敗時は自動ロールバック
- スキーマの齟齬 → `table.md` を単一の真実の源 (SoT) として維持

---

## Phase 2: CRUD（User Story 1 & 12 の骨格）
**目的**: 従業員登録〜勤務条件〜一覧検索までを `specs/008` User Story 1/8/12 と UI-001〜UI-015 に準拠して実装し、SC-001/SC-004/SC-013 の下地を作る  
**仕様リンク**: `specs/008-comprehensive-spec/spec.md` の「User Story 1（従業員情報の登録と管理）」「User Story 8（契約情報の表示制御）」「User Story 12（従業員検索と一覧表示）」「従業員管理ページの表示データ項目」  
**技術実装**: Next.js App Router + Server Actions (`apps/nextjs/src/server/actions/*.ts`) + `postgres` クライアント + Zod + React Hook Form

**Steps**
1. 従業員マスター CRUD（`apps/nextjs/src/server/actions/create-employee.ts` / `apps/nextjs/src/server/queries/employees.ts`）  
   - `create`/`update`/`delete` を Server Action + SQL クエリで実装し、部門コード（BPS課/オンサイト課/CC課/PS課）を Zod Enum で強制。  
   - `bulkUpdateStatus` を従業員一覧のチェックボックス操作から呼び出し、UI-002（一覧からのステータス一括変更）を満たす。  
   - `search` は氏名/社員番号/勤務場所/雇用区分/ステータスを filter し、最大50件/ページ、p95 2秒以内を計測。
2. 勤務条件 CRUD + JSONB統合（`apps/nextjs/src/server/actions/upsert-work-condition.ts` / `apps/nextjs/src/server/queries/work-conditions.ts`）  
   - `work_conditions` テーブルの JSONB カラム（`working_hours_jsonb` など）に複数の勤務時間・休憩・勤務地・交通費ルートをまとめて保存。  
   - 入力フォームは複数行のAdd/Remove UI + Zodでバリデーション（重複時間や異常値を弾く）。  
   - 既存子テーブルからの移行スクリプトを Phase 1 で準備済みとし、ここでは読み書きレイヤーを統合後の構造に合わせる。
3. 従業員詳細タブ実装（`apps/nextjs/src/app/(dashboard)/employees/[id]/page.tsx`）  
   - 雇用情報/勤務情報/給与・手当/書類タブの表示項目を spec 008 どおりに配置し、契約番号・雇用期間・交通費・書類状況などを `InfoRow` で表現。  
   - 有効契約の判定は `contract_start_date <= today < employment_expiry_scheduled_date OR employment_expiry_scheduled_date IS NULL` を用い、未来開始の契約は「予約」扱いで別表示。  
   - 最終更新日時と更新者（`employees.updated_at`/`updated_by`）をヘッダーに表示して SC-013 を満たす。
4. 従業員一覧 + フィルター（`apps/nextjs/src/app/(dashboard)/employees/page.tsx`）  
   - サーバーコンポーネントで `fetchEmployees` を呼び、検索フォーム（氏名/社員番号/部門/雇用区分/ステータス/勤務場所）を実装。  
   - チェックボックス列 + 一括変更ドロップダウン + `bulkUpdateStatus` 呼び出しで UI-002 を達成。  
   - ロール制御は Phase 10 実装予定だが、現段階で `EmploymentTypeLabel` などの表示ラベルを spec 008 UI-014に沿って実装。
5. シード＆検証  
   - `database/data/*.csv` を使ったシードで JSONB・契約データを投入し、`pnpm lint` / `pnpm --filter @acme/nextjs dev` で手動E2Eを確認。  
   - `apps/nextjs/src/lib/schemas/employee.ts` のZod schemaに spec 008 の必須項目（勤務時間複数/交通費/提出物）を追加。

**DoD**
- `pnpm lint` / `pnpm --filter @acme/nextjs dev` が成功
- 従業員登録フローで基本情報＋勤務条件を 1 人あたり 5 分以内に完了できる（SC-001 の手動検証手順を記載）
- 従業員詳細タブで spec 008 の全項目が表示されるスクリーンショットを残す
- 検索/フィルター/一括更新がUI-002の要件通りに動作し、p95<2秒（1000件のフェイクデータで計測）

**Risk & Mitigation**
- JSONB構造のデータ不整合 → Zodで型チェックを厳格化し、Server Action側でも`jsonb_build_object`のバリデーションを行う  
- 検索性能低下 → `employees(name text_pattern_ops)` などのインデックスを追加し、`EXPLAIN ANALYZE`で監視  
- UI複雑化 → Storybook的`/components/demo`で勤務条件フォームのパターンを先に固め、再利用


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

## Phase 4: 契約・アラート（User Story 3〜8, 11, 14）
**目的**: 契約期間管理・「要更新」バッジ・契約操作メニュー・契約入力UI・契約履歴自動追記・契約更新アラートを `specs/008` User Story 3/4/5/6/7/8/11/14 に沿って実装し、SC-002/SC-005/SC-007/SC-008 を満たす。雇用満了予定日（`employment_expiry_scheduled_date`）を唯一の源泉とし、PDF出力時にアラートを自動解除する。  
**仕様リンク**: `specs/008-comprehensive-spec/spec.md` 「User Story 3〜8,11,14」「Key Entities: Contract/Contract Alert/Contract Change History」「成功基準 SC-002〜SC-008」「UI-011〜UI-019」  
**技術実装**: Next.js Server Actions + `apps/nextjs/src/server/queries/contracts.ts` + React Table/Actions + Postgres スケジューラ（cron） + UIバッジ
**Steps**
1. スケジューラで `employment_expiry_scheduled_date` を監視し、30/14/7 日前に通知（FR-004, FR-008）
   - `employment_expiry_scheduled_date` 更新時に通知テーブルの対象日を再計算
   - 実際の雇用満了日 `employment_expiry_date` を登録しても、予定日ベースのアラートロジックは変更しない
   - PDF出力 Success をフックにアラート解除（既存要件を維持）
2. 「要更新」判定ロジックの実装（`apps/nextjs/src/server/queries/contracts.ts`）
   - ヘルパー関数 `isContractExpired(employmentExpiryScheduledDate: Date | null): boolean` を作成
   - 判定基準: `employment_expiry_scheduled_date` が当日の日付（00:00:00）より前の日付である場合に `true` を返す
   - 当日の日付は「要更新」の対象としない（FR-004準拠）
   - NULL（未設定）の場合は `false` を返す（FR-005準拠）
   - タイムゾーンはサーバーのタイムゾーン設定に基づいて判定（すべてサーバ TZ で正規化）
3. 契約管理画面での「要更新」表示（`apps/nextjs/src/app/(dashboard)/contracts/page.tsx`）
   - 契約一覧取得時に各契約の `employment_expiry_scheduled_date` をチェック
   - `isContractExpired` が `true` の場合、契約行に「要更新」バッジを表示（UI-001準拠）
   - 視覚的に目立つ形式（例：赤色のバッジ、警告アイコン、強調表示）で表示（FR-006準拠）
   - 契約満了予定日も同時に表示（UI-003準拠）
   - 「要更新」バッジをクリックすると契約詳細画面に遷移（UI-002, FR-007準拠）
4. 従業員詳細ページでの「要更新」表示（`apps/nextjs/src/app/(dashboard)/employees/[id]/page.tsx`）
   - 従業員詳細ページの契約履歴タブで、各契約の `employment_expiry_scheduled_date` をチェック
   - `isContractExpired` が `true` の場合、該当契約に「要更新」バッジを表示（FR-002準拠）
   - 複数の契約が存在する場合、満了予定日を過ぎている契約のみに「要更新」を表示
   - 視覚的に目立つ形式で表示（FR-006準拠）
   - 契約満了予定日も同時に表示（UI-003準拠）
5. 従業員管理ページ（一覧）での「要更新」表示（`apps/nextjs/src/app/(dashboard)/employees/page.tsx`）
   - 従業員一覧取得時に、各従業員の関連契約をチェック
   - 少なくとも1つの契約の `employment_expiry_scheduled_date` が当日を過ぎている場合、従業員行に「要更新」バッジを表示（FR-003準拠）
   - 視覚的に目立つ形式で表示（FR-006準拠）
   - 「要更新」バッジをクリックすると従業員詳細ページに遷移（UI-002, FR-007準拠）
6. クエリ/Server Actionの拡張（`apps/nextjs/src/server/queries/contracts.ts` / `apps/nextjs/src/server/actions/upsert-contract.ts`）
   - `findAll` または `search` メソッドで、各契約に `needsUpdate: boolean` フィールドを追加
   - `needsUpdate` は `isContractExpired` の結果を返す
   - 従業員関連の契約取得時も同様に `needsUpdate` フィールドを追加
7. パフォーマンス最適化
   - 契約一覧取得時に、`employment_expiry_scheduled_date < CURRENT_DATE` の条件でフィルタリング可能にする
   - インデックス `idx_contracts_expiry_scheduled_date` を活用（既存のインデックス）
   - 大量データでの表示遅延を防ぐため、クライアント側での判定も検討（サーバー側判定を優先）
- **DoD**
- 境界ケース（日跨ぎ・月跨ぎ）で期待動作（spec 008 User Story 4, Acceptance 1〜4）
- `employment_expiry_scheduled_date` のみを参照してアラートが発火し、`employment_expiry_date` 入力後も予定日基準で継続（spec 008 User Story 3/11）
- 契約管理画面/従業員詳細/従業員一覧で、契約満了予定日が当日を過ぎている契約に対して100%の精度で「要更新」表示（SC-005, UI-017）
- 契約満了予定日が当日または未来の日付、または未設定の契約に対して、「要更新」表示が出ない（SC-005, Acceptance Scenario 4）
- 契約管理画面で更新すべき契約を3秒以内に特定できる（SC-006）
- 契約更新アラートが統括人事管理者/現場マネージャーへ100%の精度で配信（SC-005, SC-014）
- 契約更新/削除/再作成時に employment_history と書類履歴へ自動追記される（User Story 7, 14）
**Risk**
- タイムゾーン差異 → すべてサーバ TZ で正規化
- 大量データでのパフォーマンス低下 → インデックス活用、クライアント側判定の検討
- 視覚的識別性の不足 → ユーザビリティテストで検証し、必要に応じてUI改善

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
   - 統合テーブル: work_conditions（JSONBカラムで統合）
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
   - 通勤費: work_conditions.transportation_routes_jsonb から取得（route, roundTripAmount, monthlyPassAmount, maxAmount）
   - 社会保険加入フラグ（将来拡張: contracts テーブルに追加予定）
   - 各種手当（将来拡張: contracts テーブルまたは別テーブルに追加予定）
   - 勤務日数: work_conditions（workDaysType + workDaysCount）
   - 勤務時間: work_conditions.working_hours_jsonb から算出（SUM(endTime - startTime)）
2. Prisma クエリでのデータ取得（`packages/api/src/router/export.ts`）
   - 在籍中の従業員を抽出（employmentStatus = 'ACTIVE'）
   - 現在有効な契約（最新1件）を結合
   - 現在有効な勤務条件（最新1件）を結合（JSONBカラム含む）
3. データ変換処理
   - 勤務時間の合計計算（work_conditions.working_hours_jsonb から算出）
   - 交通費の集計（work_conditions.transportation_routes_jsonb から月額定期を優先）
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
   - 全8テーブルのフィールド定義を明示（employees, work_conditions, contracts, employment_history, employee_admin_records, users, edit_locks, audit_logs）
   - 注記: work_conditionsテーブルは、working_hours、break_hours、work_locations、transportation_routesをJSONBカラムで統合した構造
    - 外部キー制約、CHECK制約、インデックスの詳細を追加
    - アクセスパターンの最適化指針を追加
  - Phase 4: リポジトリ層実装詳細を反映
    - 従業員CRUD: findByEmployeeNumber, 検索条件の詳細化、ページネーション（50件/ページ）
    - 勤務条件CRUD: work_conditionsテーブルのJSONBカラム（working_hours, break_hours, locations, transportation_routes）への統合保存ロジック（`specs/003-work-conditions-consolidation/spec.md` 準拠）
    - 雇用契約CRUD: findExpiringContracts の実装詳細
    - 雇用履歴: eventType の8種類（HIRE/TRANSFER/PROMOTION等）を明示
  - Phase 6: 枝番管理の詳細を反映
    - employees.branchNumber フィールドの使用
    - 雇用契約書出力ごとに増加する仕様を明示
  - Phase 7: CSV抽出項目選択の詳細を反映
   - 選択可能フィールドの明示（`table.md` の employees テーブル定義）
    - myNumber の権限チェック
  - Phase 8: 給与支払データ抽出の詳細を反映
    - work_conditions.transportation_routes_jsonb からの交通費取得
    - work_conditions.working_hours_jsonb からの勤務時間算出
  - すべてのフェーズでスキーマ定義を単一の真実の源 (SoT) として統一
  - 外部ドキュメント参照を削除し、PLANS.md を自己完結型の実行可能仕様書として完成
- 2025-11-04 (final): ドキュメント分割によるPLANS.mdの文字数削減
   - データベーススキーマ詳細を table.md に分離（8テーブルの完全定義、Prismaスキーマ例、インデックス戦略、マイグレーション手順）
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
   - これに伴いテーブル総数は8件（work_conditionsテーブルにJSONB統合構造を採用）、関連RBACとアクセスパターン記述を更新
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
- 2025-11-18: 契約満了予定日超過時の「要更新」表示機能をPhase 4に追加
  - Phase 4: `specs/004-contract-update-indicator/spec.md` で定義された「要更新」表示機能を実装計画に追加
  - Phase 4: 契約管理画面、従業員詳細ページ、従業員管理ページ（一覧）での「要更新」表示機能を追加
  - Phase 4: 判定ロジック（employment_expiry_scheduled_dateが当日より前）の実装手順を追加
  - Phase 4: UI要件（視覚的に目立つ形式、バッジ、警告アイコン）の実装手順を追加
  - Phase 4: 成功基準（SC-001〜SC-007）をDoDに追加
