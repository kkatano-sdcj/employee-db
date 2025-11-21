## 分析

Vercel の `next build` で `apps/nextjs/src/app/employees/[id]/page.tsx` の `resolvedSearchParams?.view` 参照が型エラーになっていました。`searchParams` が未設定のときに `{}` を代入しており、このリテラルが `{}（プロパティなし）` と推論されるため `view` プロパティが存在しないと判断されます。ローカル開発では型チェックが通っていたものの、Vercel の本番ビルドは `tsc` を実行するためコンパイル時に失敗していました。

## 修正内容

- `searchParams` 解決結果に型注釈を追加し、`{ view?: string } | undefined` として扱うよう変更。
- これにより fallback で `undefined` を渡しても `resolvedSearchParams?.view` が型安全に評価され、`next build` が成功するようになりました。
