# Savepoint: 2025-11-17

このドキュメントは、2025年11月17日時点での作業内容を記録したsavepointです。

## 作業日時
- **作成日時**: 2025-11-17 12:56:52 JST
- **作業範囲**: Vercelデプロイ設定、TypeScript型エラー修正、ビルドエラー解決

---

## 実施した作業内容

### 1. Vercelデプロイ設定の追加

**目的**: employee-dbアプリケーションをVercelにデプロイするための設定を追加

**変更内容**:

#### 1.1 `.nvmrc`ファイルの作成
- Node.jsバージョン22.16.0を明示的に指定
- Vercelが自動的に適切なNode.jsバージョンを使用するように設定

#### 1.2 `vercel.json`の作成
```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "corepack enable && corepack prepare pnpm@10.19.0 --activate && corepack pnpm install",
  "framework": "nextjs"
}
```

**重要なポイント**:
- `rootDirectory`は`vercel.json`には含めない（Vercelのスキーマに含まれていないため）
- Root DirectoryはVercelダッシュボードで`apps/nextjs`に設定する必要がある
- `corepack pnpm install`を使用することで、確実に正しいバージョンのpnpm（10.19.0）が使用される

#### 1.3 `package.json`に`engines`フィールドを追加
```json
{
  "engines": {
    "node": ">=22.16.0",
    "pnpm": ">=10.19.0"
  }
}
```

#### 1.4 `docs/deploy_setting.md`の作成
- Vercelデプロイ設定の詳細なドキュメントを作成
- Install Command、Build Command、Output Directory、Root Directoryの設定方法を記載
- トラブルシューティングセクションを追加

**影響範囲**:
- プロジェクトルート: `.nvmrc`, `vercel.json`, `package.json`
- ドキュメント: `docs/deploy_setting.md`

**解決した問題**:
- `ERR_INVALID_THIS`エラー（pnpmバージョンの不一致）
- `ERR_PNPM_UNSUPPORTED_ENGINE`エラー（engines.pnpmフィールドの要件不満足）
- Next.jsバージョン検出エラー

---

### 2. TypeScript型エラーの修正

**目的**: ビルド時のTypeScript型エラーを解消

#### 2.1 `import-employees.ts`の型エラー修正

**問題**: `postgres`ライブラリのSQLクエリ結果の型が推論されない

**修正内容**:
```typescript
// 変更前
const existingEmployees = await sql`
  SELECT employee_number FROM employees
`;
const existingNumbers = new Set(
  existingEmployees.map((e: { employee_number: string }) => e.employee_number)
);

// 変更後
const existingEmployees = (await sql`
  SELECT employee_number FROM employees
`) as Array<{ employee_number: string }>;
const existingNumbers = new Set(
  existingEmployees.map((e) => e.employee_number)
);
```

**ファイル**: `apps/nextjs/scripts/import-employees.ts`

#### 2.2 `test-db-connection.ts`の型エラー修正

**問題**: `tables`と`samples`のクエリ結果の型が推論されない

**修正内容**:
- `tables`と`samples`のクエリ結果に型アサーションを追加
- `Array<{ table_name: string }>`と`Array<{ employee_number: string; name: string; employment_status: string }>`を指定

**ファイル**: `apps/nextjs/scripts/test-db-connection.ts`

#### 2.3 `@types/papaparse`の追加

**問題**: `papaparse`モジュールの型定義ファイルが見つからない

**修正内容**:
- `apps/nextjs/package.json`の`devDependencies`に`@types/papaparse: ^5.3.15`を追加

**ファイル**: `apps/nextjs/package.json`

---

### 3. 存在しないemployeeプロパティへの参照削除

**目的**: `EmployeeDetail`型に存在しないプロパティへの参照を削除

**削除したプロパティ**:
- `email`, `phoneNumber`, `extensionNumber`
- `postalCode`, `prefecture`, `city`, `streetAddress`, `personalEmail`
- `emergencyContactName`, `emergencyContactRelation`, `emergencyContactPhone`, `emergencyContactAddress`
- `lastName`, `firstName`
- `position`, `supervisorName`
- `isManager`, `canWorkRemote`

**修正内容**:
- `/employees/[id]/page.tsx`: 存在しないプロパティへの参照を削除し、存在するプロパティのみを使用
- `/employees/page.tsx`: `employee.email`を`employee.departmentCode`に変更

**ファイル**:
- `apps/nextjs/src/app/employees/[id]/page.tsx`
- `apps/nextjs/src/app/employees/page.tsx`

---

### 4. `fetchEmployeeDetail`の型エラー修正

**目的**: `fetchEmployeeDetail`関数の型エラーを解消

#### 4.1 `employee`オブジェクトの型アサーション追加

**問題**: `db`クエリの結果の型が推論されず、スプレッド演算子使用時に型エラーが発生

**修正内容**:
```typescript
const [employee] = (await db`
  SELECT ...
`) as Array<{
  id: string;
  employeeNumber: string;
  branchNumber: number;
  name: string;
  nameKana: string;
  gender: string;
  birthDate: Date | string | null;
  nationality: string | null;
  hiredAt: Date | string | null;
  retiredAt: Date | string | null;
  employmentType: string;
  employmentStatus: string;
  departmentCode: string;
  myNumber: string | null;
  updatedAt: Date | string | null;
} | undefined>;
```

#### 4.2 `null`を`undefined`に変換

**問題**: データベースから取得した`null`値が`EmployeeDetail`型の`undefined`と互換性がない

**修正内容**:
```typescript
employee: employee
  ? {
      ...employee,
      birthDate: toDateString(employee.birthDate as unknown as Date),
      nationality: employee.nationality ?? undefined,
      hiredAt: toDateString(employee.hiredAt as unknown as Date),
      retiredAt: toDateString(employee.retiredAt as unknown as Date),
      myNumber: employee.myNumber ?? undefined,
      updatedAt: toDateTimeString(employee.updatedAt as unknown as Date),
    }
  : null,
```

#### 4.3 `contracts`と`employmentHistory`の型アサーション追加

**問題**: `contracts`と`employmentHistory`のクエリ結果の型が推論されない

**修正内容**:
- `contracts`と`employmentHistory`のクエリ結果に型アサーションを追加
- `null`を`undefined`に変換（`hourlyWageNote`, `jobDescription`, `paidLeaveClause`, `departmentCode`, `grade`, `remarks`）
- スプレッド演算子の代わりに、明示的にプロパティを指定

**ファイル**: `apps/nextjs/src/server/queries/employees.ts`

---

## 解決した問題のまとめ

### Vercelデプロイ関連
1. ✅ `ERR_INVALID_THIS`エラー（pnpmバージョンの不一致）
2. ✅ `ERR_PNPM_UNSUPPORTED_ENGINE`エラー（engines.pnpmフィールドの要件不満足）
3. ✅ Next.jsバージョン検出エラー
4. ✅ `vercel.json`のスキーマバリデーションエラー（`rootDirectory`プロパティ）

### TypeScript型エラー
1. ✅ `postgres`ライブラリのSQLクエリ結果の型推論エラー
2. ✅ `papaparse`モジュールの型定義ファイルが見つからないエラー
3. ✅ 存在しないプロパティへの参照エラー
4. ✅ `null`と`undefined`の型不一致エラー

---

## 技術的な学び

### 1. Vercelデプロイ設定
- Root Directoryが`apps/nextjs`に設定されている場合、`installCommand`はプロジェクトルートから実行される
- `buildCommand`はRoot Directoryから実行される
- `corepack pnpm install`を使用することで、確実に正しいバージョンのpnpmが使用される
- `vercel.json`には`rootDirectory`フィールドを含めない（Vercelのスキーマに含まれていない）

### 2. TypeScript型エラー対応
- `postgres`ライブラリのSQLクエリ結果には型アサーションが必要
- データベースから取得した`null`値は`undefined`に変換する必要がある（`?? undefined`を使用）
- スプレッド演算子の代わりに明示的にプロパティを指定することで、型の整合性を確保できる

### 3. モノレポ構成でのデプロイ
- Root Directoryを適切に設定することで、モノレポ構成でも正しくビルドできる
- `package.json`の`packageManager`フィールドと`engines`フィールドを適切に設定することで、依存関係のバージョン管理ができる

---

## 次のステップ

1. ✅ Vercelでのデプロイが成功することを確認
2. ✅ ビルドエラーが解消されることを確認
3. ⏳ 本番環境での動作確認
4. ⏳ パフォーマンステスト
5. ⏳ セキュリティチェック

---

## 関連ファイル

### 新規作成
- `.nvmrc`
- `vercel.json`
- `docs/deploy_setting.md`

### 修正
- `package.json`（enginesフィールド追加）
- `apps/nextjs/package.json`（@types/papaparse追加）
- `apps/nextjs/scripts/import-employees.ts`
- `apps/nextjs/scripts/test-db-connection.ts`
- `apps/nextjs/src/app/employees/[id]/page.tsx`
- `apps/nextjs/src/app/employees/page.tsx`
- `apps/nextjs/src/server/queries/employees.ts`

---

## コミット履歴

主要なコミット:
- `fix(vercel): Vercelデプロイ時のERR_INVALID_THISエラーを修正`
- `fix(vercel): vercel.jsonからrootDirectoryプロパティを削除`
- `fix(vercel): corepack useをnpm install -gに変更`
- `fix(vercel): pnpmコマンドをnpxで明示的にバージョン指定`
- `fix(vercel): Root Directory設定に合わせてbuildCommandとoutputDirectoryを修正`
- `fix(vercel): installCommandを削除してVercelの自動検出に任せる`
- `fix(vercel): installCommandにcorepack enableを追加してpnpmバージョン問題を解決`
- `fix(vercel): corepack prepareを追加してpnpmバージョンを明示的に有効化`
- `fix(vercel): corepack pnpmを使用して確実に正しいバージョンを実行`
- `fix: import-employees.tsのTypeScript型エラーを修正`
- `fix: postgresの型指定方法を修正`
- `fix: test-db-connection.tsのTypeScript型エラーを修正`
- `fix: @types/papaparseを追加してTypeScript型エラーを修正`
- `fix: employee.emailプロパティが存在しないエラーを修正`
- `fix: 存在しないemployeeプロパティへの参照を削除`
- `fix: fetchEmployeeDetailのemployee型エラーを修正`
- `fix: nationalityとmyNumberのnullをundefinedに変換`
- `fix: contractsとemploymentHistoryの型エラーを修正`

---

## 備考

- Vercelのデプロイ設定は、モノレポ構成でのデプロイに最適化されている
- TypeScriptの型エラーは、主に`postgres`ライブラリの型推論の問題と、データベースの`null`値とTypeScriptの`undefined`の不一致が原因だった
- 今後の開発では、型アサーションを適切に使用し、`null`と`undefined`の変換を意識する必要がある

