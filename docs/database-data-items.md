# データベース データ項目リスト

**作成日**: 2025-01-15  
**最終更新**: 2025-01-15  
**参照元**: `database/supabase_schema.sql`, `specs/008-comprehensive-spec/spec.md`

---

## 概要

本ドキュメントは、従業員データベースシステムで使用するデータベーステーブルとそのデータ項目を一覧化したものです。各テーブルのカラム名、データ型、日本語表示名、説明、制約を記載しています。

---

## 1. employees テーブル（従業員マスター）

従業員の基本情報を管理するマスターテーブル。

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---------|---------|-------------|------|------|
| id | TEXT | ID | 従業員の一意識別子 | PRIMARY KEY |
| employee_number | TEXT | 社員番号 | 従業員番号（部門コード + 4桁番号、例: BPS0001） | UNIQUE, NOT NULL |
| branch_number | INTEGER | 枝番 | 契約更新時に付与される枝番号 | NOT NULL, DEFAULT 0 |
| name | TEXT | 氏名 | 従業員の氏名 | NOT NULL |
| name_kana | TEXT | 氏名（カナ） | 従業員の氏名（フリガナ） | NOT NULL |
| sticker_item | TEXT | フセン項目 | 入社時登録必須項目のフセン | - |
| gender | TEXT | 性別 | 性別（MALE/FEMALE/OTHER） | NOT NULL, CHECK |
| birth_date | DATE | 生年月日 | 従業員の生年月日 | NOT NULL |
| nationality | TEXT | 国籍 | 従業員の国籍 | - |
| hired_at | DATE | 入社日 | 雇用開始日 | NOT NULL |
| retired_at | DATE | 退社日 | 雇用終了日（退職日） | - |
| employment_type | TEXT | 雇用区分 | 雇用形態（FULL_TIME/PART_TIME/CONTRACT） | NOT NULL, CHECK |
| employment_status | TEXT | 雇用ステータス | 在籍状況（ACTIVE/RETIRED/ON_LEAVE） | NOT NULL, CHECK |
| department_code | TEXT | 部門コード | 所属部門（BPS課/オンサイト課/CC課/PS課） | NOT NULL, CHECK |
| my_number | TEXT | 個人番号 | マイナンバー（権限制限あり） | - |
| created_at | TIMESTAMP WITH TIME ZONE | 作成日時 | レコード作成日時 | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP WITH TIME ZONE | 更新日時 | レコード最終更新日時 | NOT NULL, DEFAULT NOW() |
| updated_by | TEXT | 更新者 | 最終更新者のユーザーID | NOT NULL |

### 雇用区分の表示対応

| データベース値 | 日本語表示名 |
|--------------|-------------|
| FULL_TIME | 常勤 |
| PART_TIME | パートタイム |
| CONTRACT | 契約社員 |

### 性別の表示対応

| データベース値 | 日本語表示名 |
|--------------|-------------|
| MALE | 男性 |
| FEMALE | 女性 |
| OTHER | その他 |

### 雇用ステータスの表示対応

| データベース値 | 日本語表示名 |
|--------------|-------------|
| ACTIVE | 在籍中 |
| RETIRED | 退職 |
| ON_LEAVE | 休職中 |

---

## 2. work_conditions テーブル（勤務条件）

従業員の勤務条件を管理するテーブル。複数の勤務時間帯、休憩時間帯、勤務場所、交通費情報をJSONB形式で保存。

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---------|---------|-------------|------|------|
| id | TEXT | ID | 勤務条件の一意識別子 | PRIMARY KEY |
| employee_id | TEXT | 従業員ID | 関連する従業員のID | NOT NULL, FK |
| effective_from | DATE | 適用開始日 | 勤務条件の適用開始日 | NOT NULL |
| effective_to | DATE | 適用終了日 | 勤務条件の適用終了日 | - |
| work_days_type | TEXT | 勤務日数タイプ | 勤務日数の計算方式（WEEKLY/MONTHLY/SHIFT） | NOT NULL, CHECK |
| work_days_count | INTEGER | 勤務日数 | 週または月あたりの勤務日数 | NOT NULL |
| work_days_count_note | TEXT | 勤務日数備考 | 勤務日数に関する補足説明 | - |
| paid_leave_base_date | DATE | 有給休暇付与基準日 | 有給休暇の付与基準となる日付 | - |
| working_hours_jsonb | JSONB | 勤務時間帯 | 複数の勤務時間帯（配列形式） | NOT NULL, DEFAULT '[]' |
| break_hours_jsonb | JSONB | 休憩時間帯 | 複数の休憩時間帯（配列形式、任意） | NOT NULL, DEFAULT '[]' |
| work_locations_jsonb | JSONB | 勤務場所 | 複数の勤務場所（配列形式） | NOT NULL, DEFAULT '[]' |
| transportation_routes_jsonb | JSONB | 交通費情報 | 複数の交通費ルート情報（配列形式、任意） | NOT NULL, DEFAULT '[]' |
| created_at | TIMESTAMP WITH TIME ZONE | 作成日時 | レコード作成日時 | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP WITH TIME ZONE | 更新日時 | レコード最終更新日時 | NOT NULL, DEFAULT NOW() |
| updated_by | TEXT | 更新者 | 最終更新者のユーザーID | NOT NULL |

### 勤務日数タイプの表示対応

| データベース値 | 日本語表示名 |
|--------------|-------------|
| WEEKLY | 週単位 |
| MONTHLY | 月単位 |
| SHIFT | シフト制 |

### JSONBカラムの構造

#### working_hours_jsonb（勤務時間帯）
```json
[
  { "id": "string", "start_time": "HH:MM", "end_time": "HH:MM" }
]
```

#### break_hours_jsonb（休憩時間帯）
```json
[
  { "id": "string", "start_time": "HH:MM", "end_time": "HH:MM" }
]
```

#### work_locations_jsonb（勤務場所）
```json
[
  { "id": "string", "location": "勤務場所名" }
]
```

#### transportation_routes_jsonb（交通費情報）
```json
[
  {
    "id": "string",
    "route": "ルート名",
    "round_trip_amount": 1000,
    "monthly_pass_amount": 15000,
    "max_amount": 20000,
    "nearest_station": "最寄り駅名"
  }
]
```

---

## 3. contracts テーブル（雇用契約）

従業員の雇用契約情報を管理するテーブル。

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---------|---------|-------------|------|------|
| id | TEXT | ID / 契約番号 | 契約の一意識別子（従業員番号-CON+4桁番号） | PRIMARY KEY |
| employee_id | TEXT | 従業員ID | 関連する従業員のID | NOT NULL, FK |
| contract_type | TEXT | 契約種別 | 契約の種類（INDEFINITE/FIXED_TERM） | NOT NULL, CHECK |
| contract_start_date | DATE | 契約開始日 | 雇用契約の開始日 | NOT NULL |
| contract_end_date | DATE | 契約終了日 | 後方互換性のため保持（段階的移行後削除予定） | - |
| employment_expiry_scheduled_date | DATE | 雇用満了予定日 | 契約時に設定する予定の満了日 | CHECK |
| employment_expiry_date | DATE | 雇用満了日 | 実際の雇用終了日（任意項目） | CHECK |
| is_renewable | BOOLEAN | 更新可能フラグ | 契約更新可能かどうか | NOT NULL, DEFAULT false |
| fixed_term_base_date | DATE | 有期契約基準日 | 有期契約の基準日 | - |
| job_description | TEXT | 業務内容 | 契約上の業務内容 | - |
| hourly_wage | DECIMAL(10,2) | 時給 | 基本時給 | NOT NULL |
| hourly_wage_note | TEXT | 時給備考 | 時給に関する補足説明 | - |
| overtime_hourly_wage | DECIMAL(10,2) | 残業時給 | 残業時の時給 | - |
| paid_leave_clause | TEXT | 有給休暇条項 | 契約書の有給休暇に関する条項 | - |
| termination_alert_flag | BOOLEAN | 雇用終了アラートフラグ | 契約終了アラートの有効/無効 | NOT NULL, DEFAULT false |
| status | TEXT | ステータス | 契約の状態（DRAFT/AWAITING_APPROVAL/SUBMITTED/RETURNED） | NOT NULL, CHECK |
| created_at | TIMESTAMP WITH TIME ZONE | 作成日時 | レコード作成日時 | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP WITH TIME ZONE | 更新日時 | レコード最終更新日時 | NOT NULL, DEFAULT NOW() |
| updated_by | TEXT | 更新者 | 最終更新者のユーザーID | NOT NULL |

### 契約種別の表示対応

| データベース値 | 日本語表示名 |
|--------------|-------------|
| INDEFINITE | 無期契約 |
| FIXED_TERM | 有期契約 |

### ステータスの表示対応

| データベース値 | 日本語表示名 |
|--------------|-------------|
| DRAFT | 下書き |
| AWAITING_APPROVAL | 承認待ち |
| SUBMITTED | 提出済 |
| RETURNED | 差戻し |

---

## 4. employment_history テーブル（雇用・人事履歴）

従業員の雇用・人事に関する履歴を管理するテーブル。

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---------|---------|-------------|------|------|
| id | TEXT | ID | 履歴の一意識別子 | PRIMARY KEY |
| employee_id | TEXT | 従業員ID | 関連する従業員のID | NOT NULL, FK |
| contract_id | TEXT | 契約ID | 関連する契約のID | FK |
| effective_date | DATE | 発効日 | 履歴イベントの発効日 | NOT NULL |
| event_type | TEXT | イベント種別 | 履歴イベントの種類 | NOT NULL, CHECK |
| department_code | TEXT | 部門コード | 異動先の部門コード | CHECK |
| paid_leave_days | INTEGER | 有給休暇日数 | 付与された有給休暇日数 | - |
| hourly_wage | DECIMAL(10,2) | 時給 | 変更後の時給 | - |
| work_condition_snapshot | JSONB | 勤務条件スナップショット | 時点の勤務条件を保存 | NOT NULL, DEFAULT '{}' |
| contract_terms_snapshot | JSONB | 契約条件スナップショット | 時点の契約条件を保存 | NOT NULL, DEFAULT '{}' |
| documents_snapshot | JSONB | 書類スナップショット | 時点の書類・提出状況を保存 | NOT NULL, DEFAULT '{}' |
| approval_number | TEXT | 承認番号 | 契約作成・更新時の承認番号 | - |
| remarks | TEXT | 備考 | 履歴に関する補足説明 | - |
| created_at | TIMESTAMP WITH TIME ZONE | 作成日時 | レコード作成日時 | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP WITH TIME ZONE | 更新日時 | レコード最終更新日時 | NOT NULL, DEFAULT NOW() |
| updated_by | TEXT | 更新者 | 最終更新者のユーザーID | NOT NULL |

### イベント種別の表示対応

| データベース値 | 日本語表示名 |
|--------------|-------------|
| HIRE | 入社 |
| TRANSFER | 異動 |
| PROMOTION | 昇進 |
| SALARY_INCREASE | 昇給 |
| SALARY_DECREASE | 減給 |
| CONCURRENT_POST | 兼務 |
| RETIRE | 退職 |
| REINSTATE | 復職 |
| CONTRACT_UPDATE | 契約更新 |

---

## 5. employee_admin_records テーブル（従業員事務管理）

従業員の事務管理情報（社会保険、給与関連、書類提出状況など）を管理するテーブル。

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---------|---------|-------------|------|------|
| id | TEXT | ID | 事務管理レコードの一意識別子 | PRIMARY KEY |
| employee_id | TEXT | 従業員ID | 関連する従業員のID | NOT NULL, UNIQUE, FK |
| tax_withholding_category | TEXT | 源泉徴収区分 | 控除申告書の種類（甲/乙） | - |
| employment_insurance | TEXT | 雇用保険 | 雇用保険の加入状況 | - |
| employment_insurance_card_submitted | TEXT | 雇用保険被保険者証提出 | 雇用保険被保険者証の提出状況 | - |
| social_insurance | TEXT | 社会保険 | 社会保険の加入状況 | - |
| pension_book_submitted | TEXT | 年金手帳提出 | 年金手帳の提出状況 | - |
| health_insurance_card_submitted | TEXT | 健康保険証提出 | 健康保険証の提出状況 | - |
| health_insurance_category | TEXT | 健康保険加入区分 | 健康保険の加入区分（入社時登録必須） | - |
| pension_category | TEXT | 厚生年金加入区分 | 厚生年金の加入区分（入社時登録必須） | - |
| basic_pension_number | TEXT | 基礎年金番号 | 基礎年金番号（入社時登録必須） | - |
| pension_fund_category | TEXT | 厚生年金基金加入区分 | 厚生年金基金の加入区分（入社時登録必須） | - |
| employment_insurance_number | TEXT | 雇用保険被保険者番号 | 雇用保険被保険者番号（入社時登録必須） | - |
| base_salary | DECIMAL(10,2) | 基本給 | 基本給額 | - |
| commuting_expense_category | TEXT | 通勤費区分 | 通勤費の区分（入社時登録必須） | - |
| commuting_expense_payment_method | TEXT | 通勤費支払方法 | 通勤費の支払方法 | - |
| daily_payment_amount | DECIMAL(10,2) | 日払い支給額 | 日払いの支給額 | - |
| submitted_to_admin_on | DATE | 管理部門提出日 | 雇用契約書等の管理部門への提出日 | - |
| returned_to_employee | TEXT | 本人返却 | 書類の本人への返却状況 | - |
| expiration_notice_issued | TEXT | 満了通知書発行 | 契約満了通知書の発行状況 | - |
| resignation_letter_submitted | TEXT | 退職届提出 | 退職届の提出状況 | - |
| return_health_insurance_card | TEXT | 保険証返却 | 健康保険証の返却状況 | - |
| return_security_card | TEXT | セキュリティカード返却 | セキュリティカードの返却状況 | - |
| notes | TEXT | 備考 | 事務管理に関する補足説明 | - |
| created_at | TIMESTAMP WITH TIME ZONE | 作成日時 | レコード作成日時 | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP WITH TIME ZONE | 更新日時 | レコード最終更新日時 | NOT NULL, DEFAULT NOW() |
| updated_by | TEXT | 更新者 | 最終更新者のユーザーID | NOT NULL |

---

## 6. user テーブル（認証ユーザー）

システムの認証ユーザー情報を管理するテーブル。better-authが基本テーブルを作成し、追加カラムを定義。

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---------|---------|-------------|------|------|
| id | TEXT | ID | ユーザーの一意識別子 | PRIMARY KEY |
| name | TEXT | ユーザー名 | ユーザーの表示名 | NOT NULL |
| email | TEXT | メールアドレス | ログイン用メールアドレス | UNIQUE, NOT NULL |
| emailVerified | BOOLEAN | メール確認済 | メールアドレスの確認状況 | - |
| image | TEXT | プロフィール画像 | プロフィール画像のURL | - |
| role | TEXT | ロール | ユーザーの権限ロール | NOT NULL, DEFAULT 'FIELD_MANAGER', CHECK |
| department_code | TEXT | 部門コード | ユーザーの所属部門 | - |
| createdAt | TIMESTAMP WITH TIME ZONE | 作成日時 | アカウント作成日時 | NOT NULL |
| updatedAt | TIMESTAMP WITH TIME ZONE | 更新日時 | アカウント最終更新日時 | NOT NULL |

### ロールの表示対応

| データベース値 | 日本語表示名 | 説明 |
|--------------|-------------|------|
| SYSTEM_ADMIN | システム管理者 | システム全体の管理権限 |
| ADMIN | 管理者 | 統括人事管理者 |
| HR_MANAGER | 人事管理者 | 人事部門の管理者 |
| FIELD_MANAGER | 現場マネージャー | 現場部門の管理者（自部門のみアクセス可） |
| GENERAL_AFFAIRS | 総務担当 | 総務部門の担当者 |
| AUDITOR | 監査人 | 監査ログの閲覧権限 |

---

## 7. edit_locks テーブル（編集ロック）

同時編集を防止するための編集ロック情報を管理するテーブル。

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---------|---------|-------------|------|------|
| resource_id | TEXT | リソースID | ロック対象のリソースID | PRIMARY KEY |
| resource_type | TEXT | リソース種別 | ロック対象の種類（EMPLOYEE/CONTRACT/WORK_CONDITION） | NOT NULL, CHECK |
| locked_by | TEXT | ロック取得者 | ロックを取得したユーザーID | NOT NULL, FK |
| locked_at | TIMESTAMP WITH TIME ZONE | ロック取得日時 | ロックを取得した日時 | NOT NULL, DEFAULT NOW() |
| expires_at | TIMESTAMP WITH TIME ZONE | ロック有効期限 | ロックの有効期限（15分後に自動解放） | NOT NULL |

### リソース種別の表示対応

| データベース値 | 日本語表示名 |
|--------------|-------------|
| EMPLOYEE | 従業員 |
| CONTRACT | 契約 |
| WORK_CONDITION | 勤務条件 |

---

## 8. audit_logs テーブル（監査ログ）

システム操作の監査ログを管理するテーブル。7年間保持。

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---------|---------|-------------|------|------|
| id | TEXT | ID | 監査ログの一意識別子 | PRIMARY KEY |
| user_id | TEXT | ユーザーID | 操作を行ったユーザーのID | NOT NULL, FK |
| action | TEXT | アクション | 実行された操作の種類 | NOT NULL |
| resource_type | TEXT | リソース種別 | 操作対象のリソース種類 | NOT NULL |
| resource_id | TEXT | リソースID | 操作対象のリソースID | NOT NULL |
| old_values | JSONB | 変更前の値 | 変更前のデータ（JSON形式） | - |
| new_values | JSONB | 変更後の値 | 変更後のデータ（JSON形式） | - |
| ip_address | TEXT | IPアドレス | 操作元のIPアドレス | - |
| user_agent | TEXT | ユーザーエージェント | 操作元のブラウザ情報 | - |
| created_at | TIMESTAMP WITH TIME ZONE | 作成日時 | ログ記録日時 | NOT NULL, DEFAULT NOW() |

---

## テーブル間のリレーション

```
employees (1) ─────────< (N) work_conditions
    │                         │
    │                         │ employee_id → employees.id
    │
    ├─────────< (N) contracts
    │                │
    │                │ employee_id → employees.id
    │
    ├─────────< (N) employment_history
    │                │
    │                │ employee_id → employees.id
    │                │ contract_id → contracts.id
    │
    └─────────< (1) employee_admin_records
                     │
                     │ employee_id → employees.id (UNIQUE)

user (1) ─────────< (N) edit_locks
    │                   │
    │                   │ locked_by → user.id
    │
    └─────────< (N) audit_logs
                    │
                    │ user_id → user.id
```

---

## インデックス一覧

### employees テーブル
- `idx_employees_employee_number`: employee_number
- `idx_employees_department_code`: department_code, employment_status
- `idx_employees_employment_status`: employment_status

### work_conditions テーブル
- `idx_work_conditions_employee_id`: employee_id, effective_from DESC
- `idx_work_conditions_working_hours_jsonb`: working_hours_jsonb (GIN)
- `idx_work_conditions_break_hours_jsonb`: break_hours_jsonb (GIN)
- `idx_work_conditions_work_locations_jsonb`: work_locations_jsonb (GIN)
- `idx_work_conditions_transportation_routes_jsonb`: transportation_routes_jsonb (GIN)

### contracts テーブル
- `idx_contracts_employee_id`: employee_id, contract_start_date DESC
- `idx_contracts_expiry_scheduled_date`: employment_expiry_scheduled_date (WHERE termination_alert_flag = true)
- `idx_contracts_status_expiry_scheduled`: status, employment_expiry_scheduled_date (WHERE termination_alert_flag = true)
- `idx_contracts_status_end_date`: status, contract_end_date (WHERE termination_alert_flag = true)

### employment_history テーブル
- `idx_employment_history_employee_id`: employee_id, effective_date DESC
- `idx_employment_history_contract_id`: contract_id, effective_date DESC
- `idx_employment_history_approval_number`: approval_number (WHERE approval_number IS NOT NULL)

### employee_admin_records テーブル
- `idx_employee_admin_updated_at`: updated_at DESC

### user テーブル
- `idx_users_role`: role
- `idx_users_department_code`: department_code

### edit_locks テーブル
- `idx_edit_locks_expires_at`: expires_at

### audit_logs テーブル
- `idx_audit_logs_user_id`: user_id, created_at DESC
- `idx_audit_logs_resource`: resource_type, resource_id, created_at DESC
- `idx_audit_logs_created_at`: created_at DESC

