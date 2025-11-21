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
