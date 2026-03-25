# 別タスク: 既存従業員へ「契約だけ追加」するAPI/フロー

## 概要

既存の従業員に対して、新規契約（＋勤務条件）のみを追加するための専用フローを整備する。
現在は `/contracts/new?employeeId=xxx` で部分的に対応しているが、専用のサーバーアクションとUIフローが必要。

## 現状の動線

- `apps/nextjs/src/app/(main)/contracts/new/page.tsx` で `employeeId` パラメータを受け取り、`EmployeeForm` を `context="contract-management"` で表示
- `apps/nextjs/src/server/actions/update-employee.ts` 内に `contractId=null` 時の新規契約INSERT処理あり
- `ContractActionMenu` の「新規契約作成」メニューから遷移可能

## 必要な実装

### 1. 専用サーバーアクション

**ファイル**: `apps/nextjs/src/server/actions/add-contract-to-employee.ts`（新規）

```typescript
type AddContractInput = {
  employeeId: string;
  contractValues: ContractFormValues;  // 契約情報 + 勤務条件
};
```

**処理フロー**:
1. 従業員の存在確認
2. ステータスチェック（ARCHIVED は契約追加不可）
3. `generateContractNumber(employeeNumber)` で契約番号自動生成
4. トランザクション内で:
   - `contracts` INSERT（全21新規フィールド含む）
   - `work_conditions` INSERT
   - `employment_history` INSERT（eventType: 'CONTRACT_UPDATE' or 'REINSTATE'）
5. 再雇用フロー（RETIRED/STANDBY → ACTIVE）:
   - `employees.rehire_count` をインクリメント
   - `employees.current_hire_date` を更新
   - `employees.employment_status` を 'ACTIVE' に変更
   - `employees.rehired_at` を更新

### 2. UIフロー整備

- **従業員詳細ページ** (`/employees/[id]/page.tsx`):
  - 「新規契約追加」ボタン追加
  - RETIRED/STANDBY時は「再雇用」ボタンとして表示
  - クリック時に `/contracts/new?employeeId=xxx` へ遷移

- **契約作成ページ** (`/contracts/new/page.tsx`):
  - 既存従業員の基本情報を読み取り専用で表示
  - 勤務条件・契約情報のみ入力可能
  - 保存時は `addContractToEmployee` アクションを呼び出し

### 3. バリデーション

- 契約期間の重複チェック（同一従業員の既存契約と開始日〜終了日が重複しないこと）
- ARCHIVED ステータスの従業員は契約追加不可（エラー表示）
- STANDBY → ACTIVE への自動遷移確認ダイアログ
- 再雇用時: 基本情報・社保情報は引継ぎ表示、勤務条件・契約は新規入力

### 4. APIルート

既存の `/api/employees/[id]` PUT を拡張するか、`/api/employees/[id]/contracts` POST を新設。

## 優先度

高（spec v2 の FR-134, FR-135, FR-136 に該当）

## 関連ファイル

- `apps/nextjs/src/server/actions/contracts.ts` - generateContractNumber 関数
- `apps/nextjs/src/server/employment-history.ts` - insertEmploymentHistoryFromForm 関数
- `apps/nextjs/src/lib/schemas/employee.ts` - contract-management コンテキスト
- `apps/nextjs/src/components/employees/EmployeeForm.tsx` - フォームUI
