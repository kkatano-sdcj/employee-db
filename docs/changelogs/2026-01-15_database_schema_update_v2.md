# 変更ログ: データベーススキーマ更新 v2

---

## 1. メタデータブロック

| 項目 | 内容 |
|------|------|
| **変更日時** | 2026-01-15 |
| **変更番号** | CHANGELOG-001 |
| **編集者** | AI Assistant |
| **変更種別** | データベーススキーマ拡張 |
| **参照元** | `docs/database-data-items.md` → `docs/part_db_schema_updated.md` |

---

## 2. ユーザーストーリーの変化

### ユーザーストーリーの変更点

| 変更前 | 変更後 |
|--------|--------|
| 従業員の基本情報のみ管理 | 連絡先・銀行口座情報も一元管理可能に |
| 部門コードはCHECK制約のみ | 部門マスターテーブルで正規化管理 |
| 再入社履歴は`employment_history`のみで管理 | `employees.rehired_at`で直近の再入社日を即座に参照可能 |
| 賃金体系は時給のみ想定 | 出来高制（PIECEWORK）にも対応 |
| 手当情報は備考欄で管理 | サブリーダー手当・精勤手当を専用カラムで管理 |

### ユーザビリティの変化

- **連絡先情報の分離**: 個人情報（住所・電話番号・メール）を別テーブルに分離し、権限制御が容易に
- **銀行口座の複数管理**: 従業員ごとに複数の振込口座を優先順位付きで管理可能
- **休日情報の追加**: 勤務条件に休日情報を追加し、シフト管理が容易に
- **通勤方法の拡張**: 車通勤の距離（km）も記録可能に

### UXに与える影響

- 従業員登録時の入力項目が増加するが、必須項目は最小限に抑制
- 部門選択がマスター参照となり、入力ミスが減少
- 給与計算に必要な手当情報が明確化され、CSV抽出の精度が向上

---

## 3. 技術的な変更点

### ソースコードの変更点

| ファイル | 変更内容 |
|----------|----------|
| `database/supabase_schema.sql` | スキーマ定義を v2 に更新 |
| `database/migrations/001_schema_update.sql` | 新規テーブル・カラム追加用マイグレーション |
| `database/migrations/002_sample_data.sql` | サンプルデータ投入用SQL |
| `database/scripts/run-migration.ts` | マイグレーション実行スクリプト |
| `database/scripts/run-sample-data.ts` | サンプルデータ投入スクリプト |
| `database/scripts/check-schema.ts` | スキーマ確認スクリプト |
| `database/scripts/verify-data.ts` | データ確認スクリプト |

### モジュール単位の変更点

- `database/migrations/`: 新規ディレクトリ追加（マイグレーションファイル格納）
- `database/scripts/`: 新規スクリプト4件追加

### その他、機能に影響する変更点

- `employees.department_code` の CHECK 制約を削除し、FK 制約に変更
- `employment_history.department_code` の CHECK 制約を削除し、FK 制約に変更（任意）
- `user` テーブルの `role` 制約に `SYSTEM_ADMIN`, `GENERAL_AFFAIRS` を追加

---

## 4. プロジェクトの構造的な変化

### ディレクトリ構成

```
database/
├── migrations/              # 【新規】マイグレーションファイル
│   ├── 001_schema_update.sql
│   └── 002_sample_data.sql
├── scripts/
│   ├── run-migration.ts     # 【新規】マイグレーション実行
│   ├── run-sample-data.ts   # 【新規】サンプルデータ投入
│   ├── check-schema.ts      # 【新規】スキーマ確認
│   ├── verify-data.ts       # 【新規】データ確認
│   ├── update-user-roles.ts
│   ├── update-user-roles.sql
│   └── reset-password.ts
└── supabase_schema.sql      # 【更新】v2 に更新
```

### ワークフローの変化

- スキーマ変更時は `database/migrations/` にマイグレーションファイルを作成
- `pnpm --filter @acme/nextjs exec tsx ../../database/scripts/run-migration.ts` でマイグレーション実行

---

## 5. データベースの変更点

### スキーマの変更点

#### 新規テーブル（3件）

| テーブル名 | 日本語名 | 説明 |
|-----------|---------|------|
| `departments` | 部門マスター | 部門コードと部門名を管理 |
| `employee_contacts` | 住所・連絡先 | 郵便番号、住所、電話番号、メールアドレス |
| `employee_bank_accounts` | 振込口座・支払情報 | 銀行口座、支払順位、預金種目など |

#### 既存テーブルの拡張

| テーブル名 | 追加カラム | データ型 | 説明 |
|-----------|-----------|---------|------|
| `employees` | `rehired_at` | DATE | 再入社日 |
| `work_conditions` | `holidays_jsonb` | JSONB | 休日情報（曜日・祝日・固定休など） |
| `work_conditions` | `holidays_note` | TEXT | 休日に関する補足（自由記述） |
| `contracts` | `wage_type` | TEXT | 賃金体系（HOURLY/PIECEWORK） |
| `contracts` | `sub_leader_allowance_amount` | DECIMAL(10,2) | サブリーダー手当 |
| `contracts` | `perfect_attendance_allowance_eligible` | BOOLEAN | 精勤手当対象 |
| `employee_admin_records` | `web_salary_book_enabled` | BOOLEAN | web給金帳の利用有無 |
| `employee_admin_records` | `health_insurance_card_type` | TEXT | 健康保険証の種類 |

#### JSONB構造の拡張

**transportation_routes_jsonb（交通費情報）**

| 変更前 | 変更後 |
|--------|--------|
| `id`, `route`, `round_trip_amount`, `monthly_pass_amount`, `max_amount`, `nearest_station` | 上記 + `commute_type`（通勤方法）, `distance_km`（車通勤距離） |

### マイグレーションファイルの変更点

| ファイル | 内容 |
|----------|------|
| `001_schema_update.sql` | 新規テーブル作成、既存テーブルへのカラム追加、制約変更 |
| `002_sample_data.sql` | サンプルデータ投入（従業員5名分） |

### テーブルデータの変更点

#### サンプルデータ投入件数

| テーブル | 件数 |
|----------|------|
| departments | 4件（BPS課、オンサイト課、CC課、PS課） |
| employees | 5件 |
| employee_contacts | 3件 |
| employee_bank_accounts | 4件 |
| work_conditions | 3件 |
| contracts | 4件 |
| employment_history | 6件 |
| employee_admin_records | 4件 |

### リレーションの変更点

#### 新規外部キー

| 親テーブル | 子テーブル | カラム | カーディナリティ |
|-----------|-----------|--------|-----------------|
| `departments` | `employees` | `department_code` | 1:N |
| `departments` | `user` | `department_code` | 1:N（任意） |
| `departments` | `employment_history` | `department_code` | 1:N（任意） |
| `employees` | `employee_contacts` | `employee_id` | 1:0..1 |
| `employees` | `employee_bank_accounts` | `employee_id` | 1:N |

#### 制約変更

| テーブル | 変更前 | 変更後 |
|----------|--------|--------|
| `employees.department_code` | CHECK制約 | FK → departments.code |
| `employment_history.department_code` | CHECK制約 | FK → departments.code（任意） |
| `user.role` | 4種類 | 6種類（SYSTEM_ADMIN, GENERAL_AFFAIRS 追加） |

### その他の変更点

- `employee_bank_accounts` に UNIQUE制約追加: `(employee_id, payment_priority)`
- `health_insurance_card_type` に CHECK制約追加: `MYNUMBER_CARD`, `PHYSICAL_CARD`, `ELIGIBILITY_CERT`
- `wage_type` に CHECK制約追加: `HOURLY`, `PIECEWORK`

---

## 6. フレームワークおよびライブラリの変更

### 使用するフレームワークの変更点

- 変更なし

### 使用するライブラリの変更

- 変更なし

### MCPの追加・変更・削除

- 変更なし

---

## 7. デザインの変更点

### 変更したデザイン

- 該当なし（バックエンドのみの変更）

### 変更の説明

- データベーススキーマの変更のみで、フロントエンドのUIには影響なし
- 今後、追加されたテーブル（連絡先、銀行口座）に対応するUI実装が必要

---

## 8. その他の変更点

### 削除されたカラム（employee_admin_records）

以下のカラムは `part_db_schema_updated.md` の設計では不要とされたが、後方互換性のため残存：

- `base_salary`
- `commuting_expense_payment_method`
- `daily_payment_amount`
- `submitted_to_admin_on`
- `returned_to_employee`
- `expiration_notice_issued`
- `resignation_letter_submitted`
- `return_health_insurance_card`
- `return_security_card`

### 注意事項

- Prismaスキーマとの同期が必要（`employment_history` テーブルのスナップショットカラムが未反映）
- フロントエンドの従業員登録フォームに新規項目の追加が必要
- 権限制御の実装（連絡先・銀行口座情報へのアクセス制限）

---

## 9. 更新履歴

| 日時 | 変更者 | 内容 |
|------|--------|------|
| 2026-01-15 | AI Assistant | 初版作成 |

