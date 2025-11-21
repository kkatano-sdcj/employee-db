## 2025-11-19: 従業員詳細ページの型エラー

### 分析
Vercel の `next build` で `apps/nextjs/src/app/employees/[id]/page.tsx` の `resolvedSearchParams?.view` 参照が型エラーになっていました。`searchParams` が未設定のときに `{}` を代入しており、このリテラルが `{}（プロパティなし）` と推論されるため `view` プロパティが存在しないと判断されます。ローカル開発では型チェックが通っていたものの、Vercel の本番ビルドは `tsc` を実行するためコンパイル時に失敗していました。

### 修正内容
- `searchParams` 解決結果に型注釈を追加し、`{ view?: string } | undefined` として扱うよう変更。
- これにより fallback で `undefined` を渡しても `resolvedSearchParams?.view` が型安全に評価され、`next build` が成功するようになりました。

## 2025-11-19: 契約配列の `isRenewable` 欠落

### 分析
`apps/nextjs/src/server/queries/employees.ts` の `fetchEmployeeDetail` が返す `contracts` 配列の型には `isRenewable: boolean` が必須として定義されている一方、実際の `contracts.map` で `isRenewable` を設定していませんでした。そのため Vercel での `tsc` 実行時に「`isRenewable` が不足している」という型エラーが発生していました。

### 修正内容
- SQLで取得した `is_renewable` を `contract.isRenewable` として読み出していたため、`return` オブジェクトに `isRenewable: Boolean(contract.isRenewable)` を追加。
- これにより `fetchEmployeeDetail` の戻り値が型定義と一致し、`next build` が通過するようになりました。
