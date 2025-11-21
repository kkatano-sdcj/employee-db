## 2025-11-19: 従業員詳細ページの型エラー

### 分析
Vercel の `next build` で `apps/nextjs/src/app/employees/[id]/page.tsx` の `resolvedSearchParams?.view` 参照が型エラーになっていました。`searchParams` が未設定のときに `{}` を代入しており、このリテラルが `{}（プロパティなし）` と推論されるため `view` プロパティが存在しないと判断されます。ローカル開発では型チェックが通っていたものの、Vercel の本番ビルドは `tsc` を実行するためコンパイル時に失敗していました。

### 修正内容
- `searchParams` 解決結果に型注釈を追加し、`{ view?: string } | undefined` として扱うよう変更。
- これにより fallback で `undefined` を渡しても `resolvedSearchParams?.view` が型安全に評価され、`next build` が成功するようになりました。

## 2025-11-19: 契約配列の `isRenewable` 欠落

### 分析
`apps/nextjs/src/server/queries/employees.ts` の `fetchEmployeeDetail` が返す `contracts` 配列の型には `isRenewable: boolean` が必須として定義されている一方、実際の `contracts.map` で `isRenewable` を設定していませんでした。また、SQLクエリ後の行型定義にも `isRenewable` が存在せず、`contract.isRenewable` を参照した際に型エラーが発生していました。

### 修正内容
- SQLのSelectで `is_renewable as "isRenewable"` を含め、行型にも `isRenewable: boolean` を追加。
- `return` オブジェクトで `isRenewable: Boolean(contract.isRenewable)` を設定。
- これにより `fetchEmployeeDetail` の戻り値が型定義と一致し、`next build` が通過するようになりました。

## 2025-11-20: 従業員編集画面の仕様反映

### 分析
`specs/008-comprehensive-spec/spec.md` の User Story 6 / 6-1 では、従業員管理から遷移した場合は基本情報のみ編集可、契約管理から遷移した場合は勤務条件・契約・書類を編集でき、どちらのパスでも契約番号入力欄を統合ウィジェット先頭に表示することが求められていました。既存実装は経路による権限制御や契約番号欄が未整備だったため、PLANS.md の目的・手順・進捗を最新仕様へ合わせる必要がありました。

### 修正内容
- PLANS.md（「従業員編集画面」Plan）を更新し、従業員管理経路と契約管理経路での権限制御・契約番号欄・コンテキスト引き回し手順を明文化。
- これにより開発者が `specs/008` の要件（FR-085〜FR-087、UI-024/026）を参照しながら実装/検証できるようになりました。

## 2025-11-20: 契約番号単位での編集機能実装

### 分析
同仕様に従い「従業員情報を編集」ページで契約番号を入力・管理できる必要がありましたが、フォームとサーバー処理では契約番号を扱っておらず、契約管理から遷移しても契約番号を付け替えられない状態でした。また、勤務条件・契約・書類のウィジェットが契約番号単位で管理されるべき要件（FR-085〜FR-087, UI-024/026）にも未対応でした。

### 修正内容
- `employeeFormSchema` / `defaultEmployeeFormValues` / `mapEmployeeDetailToFormValues` に `contractNumber` を追加し、UI から契約番号を入力・編集できるようにした。
- `EmployeeForm` に契約番号入力欄を追加し、文脈（従業員管理 or 契約管理）に応じて各セクションの編集可否を切り替えられるようにした。
- `updateEmployee` で契約番号を受け取り、既存契約のID変更や新規発行に対応。`employee_admin_records` も契約番号単位の入力値で更新する。
- 契約管理ページの3点メニューから `?source=contract` を付与して編集ページを開くようにし、契約管理経路では勤務条件/契約/書類ウィジェットが編集モードとして動作するようにした。

## 2025-11-20: 契約書PDF/誓約書PDF出力

### 分析
User Story 2（契約書PDF・誓約書PDF）、FR-006〜FR-007、UI-015 では契約書と誓約書をPDF形式で生成することが必須でしたが、アプリにはPDF生成処理やダウンロード導線が存在せず、契約管理フローを完結できない状態でした。

### 修正内容
- `PLANS.md` にPDF実装のExecPlanを追加し、PDFビルダー・データ取得・API・UXのタスクを整理。
- 依存追加が難しいため `apps/nextjs/src/server/pdf/pdf-builder.ts` に独自のテキストベースPDFビルダーを実装し、複数ページにも対応。
- `apps/nextjs/src/server/pdf/documents.ts` で契約書・誓約書のテンプレートを定義し、従業員/契約/勤務条件/書類情報を差し込んで `Buffer` を返す関数を作成。
- `fetchContractDocumentData`（`apps/nextjs/src/server/queries/contracts.ts`）で契約番号から従業員詳細を取得。
- 新しいAPI Route `/api/pdf/contracts/[contractId]` を追加し、`type=contract|pledge` でPDFをレスポンスとして返却。
- 従業員詳細ページのヘッダーと契約履歴カードに「契約書PDF」「誓約書PDF」ボタンを追加し、契約管理ページの操作メニューからもPDFを出力できる導線を用意。

## 2025-11-20: PDFプレビューの文字化け修正

### 分析
既存のPDFビルダーは標準フォントに依存していたため、日本語（CJK）文字がすべて`?`として出力され、契約書・誓約書のプレビューが文字化けしていました。

### 修正内容
- `NotoSansJP-Regular.otf` を `apps/nextjs/src/server/pdf/fonts/` に追加し、PDF生成に使用する日本語フォントをバンドル。
- `fontkit` をベンダーとして取り込み、フォントからグリフパスを抽出できるようにした。
- `apps/nextjs/src/server/pdf/pdf-builder.ts` を改修し、テキストをフォントグリフのアウトラインとして描画する方式に変更。PDF内にフォントを埋め込まずとも日本語文字を正しく表示できるようにした。
- ESLint の `globalIgnores` に `src/server/pdf/vendor/**` を追加し、ベンダーコードがlint対象にならないように設定した。

これにより契約書・誓約書のPDFプレビューから文字化けが解消されました。

## 2025-11-20: fontkitのNamed Import対応

### 分析
`pdf-builder.ts` で `import fontkit from "./vendor/fontkit"` を使っていましたが、ベンダー化した fontkit（CommonJS ビルド）は default export を持たず、Next.js App Route から読み込む際に `default export not found` エラーが発生していました。

### 修正内容
- `pdf-builder.ts` を `import * as fontkitModule from "./vendor/fontkit/dist/main.cjs"` に変更し、型を定義した上で `fontkitModule.create` を呼び出すよう修正。
- これにより fontkit の named export を正しく参照できるようになり、契約書/誓約書PDFの生成APIで発生していたビルドエラーが解消されました。

## 2025-11-20: fontkit ESM対応

### 分析
CommonJS版 `fontkit/dist/main.cjs` を読み込んでいたため、App Router (ESM) 上で依存解決が不安定になり、`../brotli/decompress.js` や `default export not found` のエラーが発生していました。

### 修正内容
- `pdf-builder.ts` の import を `./vendor/fontkit/dist/module.mjs` に切り替え、ESM版の named export (`create`) を利用するよう変更。
- これにより Next.js の ESM バンドル内でも fontkit の依存解決が正しく行われ、契約書/誓約書PDF生成時のビルドエラーが解消されました。

## 2025-11-21: ベンダーフォント依存エラーとPDF出力の改善

### 分析
Next.js の App Router にベンダー化した fontkit を読み込む際、`@swc/helpers` の `_define_property` / `_ts_decorate` export が存在しないため `module evaluation` エラーが発生。さらに fontkit 配下の `base64-js` や `unicode-trie` といった依存を解決できず、PDF生成ルートが 500 を返していました。また、フォントパスが `process.cwd()` と一致しておらず `NotoSansJP-Regular.otf` が読めない問題、契約書・誓約書PDFのリンクが同じタブで開く問題も確認されました。最終的には fontkit のパス描画ロジックでも日本語文字が「□」になるため、フォントアウトラインの追跡を断念し、CIDフォントを利用する方針に切り替えました。

### 修正内容
- `apps/nextjs/src/server/pdf/vendor/fontkit/@swc/helpers/_/_define_property.js` と `_/_ts_decorate.js` に `_` エクスポートを追加し、CJSヘルパーを ESM から安全に import 可能にした。
- `apps/nextjs/src/server/pdf/vendor` 配下に `@swc/helpers` をはじめ `base64-js` / `unicode-trie` / `tiny-inflate` / `tslib` などの依存を配置し、`apps/nextjs/src/server/pdf/node_modules` からシンボリックリンクして解決できるようにした。
- フォントパスを `src/server/pdf/fonts` 基準に変更し、`NotoSansJP-Regular.otf` が正しく読み込まれるようにした。
- 契約アクションメニューの PDF リンクには `target="_blank"` / `rel="noreferrer"` を付与して常に新しいタブで開くようにした。
- 文字化け対策として、独自のグリフ描画を廃止し PDF 組込みの CID フォント `HeiseiKakuGo-W5` を `UniJIS-UCS2-H` で使用するテキストベース描画に刷新。`pdf-builder.ts` を全面的に書き換え、UTF-16BE でエンコードした文字列を `BT ... Tj` で描画、PDF内で日本語が確実に表示されるようにした。
- PDFタイトルも UTF-16BE でエンコードし、メタデータが日本語でも文字化けしないようにした。

これにより、契約書/誓約書 PDF が日本語で正しく表示され、リンクから新しいタブで開けるようになった。また `/api/pdf/contracts/...` のビルド・実行時エラーが解消され、安定した PDF 出力ができるようになりました。

## 2025-11-21: 契約履歴スナップショットと契約管理画面の連携

### 分析
従業員編集ページの「勤務条件」「雇用契約」「書類・提出状況」で入力した内容を契約番号単位で `employment_history` に残す仕様が未実装でした。そのため契約管理ページで最新の入力内容を確認できず、employment_history も部署や時給しか持っていませんでした。

### 修正内容
- `employment_history` に `contract_id` と3つの `*_snapshot` JSONB カラムを追加し、契約に紐づく勤務条件・契約条件・書類情報を丸ごと保持できるようにした（スキーマ / マイグレーション / サンプルデータ更新）。
- `insertEmploymentHistoryFromForm` ヘルパーを新設し、従業員作成/更新アクションから呼び出して契約番号単位の履歴レコードを自動で作成。更新時は `event_type = CONTRACT_UPDATE` として登録できるよう制約も拡張した。
- 契約管理ページのクエリを employment_history と LATERAL JOIN し、最新スナップショットを取得。テーブルに「最新入力内容」列を追加して勤務日数/勤務地/交通/書類返却状況を表示するようにした。

これにより、任意の契約番号に対する入力内容が employment_history に保存され、契約管理画面からも最新の登録状況を確認できるようになりました。
