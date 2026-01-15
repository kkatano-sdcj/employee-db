# データベース データ項目リスト（不足分を追加した更新版）

**最終更新日**: 2026-01-15  
**目的**: 「【各課マージ】パート管理システム_必要データ項目」で必須（1課以上が必須）だが、現行DBに不足していた項目を追加し、統合したスキーマ情報を1ファイルにまとめる。

---

## 変更点サマリ（不足分の追加）

### 追加（新規テーブル）
- `departments`（部門マスター：部門名の保持）
- `employee_contacts`（住所・連絡先：郵便番号/住所/TEL/メール等）
- `employee_bank_accounts`（振込口座・支払情報：支払順位/口座/銀行・支店/預金種目等）

### 追加（既存テーブルの拡張）
- `employees.rehired_at`（再入社日）
- `work_conditions.holidays_jsonb`, `work_conditions.holidays_note`（休日）
- `work_conditions.transportation_routes_jsonb` のJSON仕様拡張（`commute_type`, `distance_km`）
- `contracts.wage_type`（賃金体系：時給/出来高）
- `contracts.sub_leader_allowance_amount`（サブリーダー手当）
- `contracts.perfect_attendance_allowance_eligible`（精勤手当対象）
- `employee_admin_records.web_salary_book_enabled`（003 web給金帳）
- `employee_admin_records.health_insurance_card_type`（004 健康保険証の種類）

---

## テーブル定義

### 1. departments（部門マスター）【追加】

部門コードと部門名のマスタ。Excel要件の「部門名」をマスタ参照で提供する。

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---|---|---|---|---|
| code | TEXT | 部門コード | 部門コード（`employees.department_code` と対応） | PRIMARY KEY |
| name | TEXT | 部門名 | 部門名（例：BPS課、オンサイト課） | NOT NULL |
| is_active | BOOLEAN | 有効フラグ | 過去部門の論理削除用 | NOT NULL, DEFAULT true |
| created_at | TIMESTAMPTZ | 作成日時 | レコード作成日時 | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | 更新日時 | レコード最終更新日時 | NOT NULL, DEFAULT NOW() |
| updated_by | TEXT | 更新者 | 最終更新者のユーザーID | NOT NULL |

---

### 2. employees（従業員マスター）【更新】

従業員の基本情報を管理するマスタテーブル。

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---|---|---|---|---|
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
| rehired_at | DATE | 再入社日 | 再雇用（再入社）した日付。直近の再入社日を保持（詳細履歴は`employment_history`で管理） | - |
| retired_at | DATE | 退社日 | 雇用終了日（退職日） | - |
| employment_type | TEXT | 雇用区分 | 雇用形態（FULL_TIME/PART_TIME/CONTRACT） | NOT NULL, CHECK |
| employment_status | TEXT | 雇用ステータス | 在籍状況（ACTIVE/RETIRED/ON_LEAVE） | NOT NULL, CHECK |
| department_code | TEXT | 部門コード | 所属部門コード | NOT NULL, FK → departments.code |
| my_number | TEXT | 個人番号 | マイナンバー（権限制限あり） | - |
| created_at | TIMESTAMPTZ | 作成日時 | レコード作成日時 | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | 更新日時 | レコード最終更新日時 | NOT NULL, DEFAULT NOW() |
| updated_by | TEXT | 更新者 | 最終更新者のユーザーID | NOT NULL |

#### 表示対応（例）
- 性別：MALE=男性 / FEMALE=女性 / OTHER=その他  
- 雇用ステータス：ACTIVE=在籍中 / RETIRED=退職 / ON_LEAVE=休職中  

---

### 3. employee_contacts（住所・連絡先）【追加】

住所・連絡先（Excel要件：郵便番号/住所/フリガナ/TEL/メール）を管理。個人情報のため `employees` から分離し、権限制御しやすくする。

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---|---|---|---|---|
| id | TEXT | ID | 連絡先レコードの一意識別子 | PRIMARY KEY |
| employee_id | TEXT | 従業員ID | 関連する従業員のID | NOT NULL, UNIQUE, FK → employees.id |
| postal_code | TEXT | 郵便番号 | 住民票住所の郵便番号（先頭ゼロ保持） | - |
| address1 | TEXT | 住所1 | 住民票住所（町名・番地など） | - |
| address2 | TEXT | 住所2 | 住民票住所（建物名・部屋番号など） | - |
| address1_kana | TEXT | 住所1フリガナ | 住所1のフリガナ | - |
| address2_kana | TEXT | 住所2フリガナ | 住所2のフリガナ | - |
| phone1 | TEXT | TEL1 | 個人用電話番号（ハイフン含め保持） | - |
| email1 | TEXT | メールアドレス1 | 個人用メールアドレス | - |
| created_at | TIMESTAMPTZ | 作成日時 | レコード作成日時 | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | 更新日時 | レコード最終更新日時 | NOT NULL, DEFAULT NOW() |
| updated_by | TEXT | 更新者 | 最終更新者のユーザーID | NOT NULL |

---

### 4. employee_bank_accounts（振込口座・支払情報）【追加】

給与振込口座と支払関連情報（Excel要件：支払順位/取扱区分/支払区分/振込機関コード/機関名/支店名/預金種目/口座番号/口座名）を管理。  
従業員ごとに複数口座を持てる（`payment_priority` で並べ替え）。

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---|---|---|---|---|
| id | TEXT | ID | 口座レコードの一意識別子 | PRIMARY KEY |
| employee_id | TEXT | 従業員ID | 関連する従業員のID | NOT NULL, FK → employees.id |
| payment_priority | INTEGER | 支払順位 | 支払の優先順位（1開始） | NOT NULL, DEFAULT 1 |
| handling_category | TEXT | 取扱区分 | 振込取扱いの区分（運用マスタ参照想定） | - |
| payment_category | TEXT | 支払区分 | 支払区分（運用マスタ参照想定） | - |
| bank_code | TEXT | 振込機関コード | 銀行コード（先頭ゼロ保持） | - |
| bank_name | TEXT | 機関名 | 銀行名 | - |
| branch_code | TEXT | 支店コード | 支店コード（先頭ゼロ保持） | - |
| branch_name | TEXT | 支店名 | 支店名 | - |
| deposit_type | TEXT | 預金種目 | 預金種目（SAVINGS/CHECKING/OTHER） | CHECK（任意） |
| account_number | TEXT | 口座番号 | 口座番号（先頭ゼロ保持） | - |
| account_holder_name | TEXT | 口座名 | 口座名義（カナ想定。要件に合わせ保持） | - |
| is_active | BOOLEAN | 有効フラグ | 現在利用中の口座か | NOT NULL, DEFAULT true |
| created_at | TIMESTAMPTZ | 作成日時 | レコード作成日時 | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | 更新日時 | レコード最終更新日時 | NOT NULL, DEFAULT NOW() |
| updated_by | TEXT | 更新者 | 最終更新者のユーザーID | NOT NULL |

**推奨制約**
- UNIQUE(employee_id, payment_priority)

---

### 5. work_conditions（勤務条件）【更新】

従業員の勤務条件を管理。複数の勤務時間帯、休憩時間帯、勤務場所、交通費情報を JSONB 形式で保存。

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---|---|---|---|---|
| id | TEXT | ID | 勤務条件の一意識別子 | PRIMARY KEY |
| employee_id | TEXT | 従業員ID | 関連する従業員のID | NOT NULL, FK → employees.id |
| effective_from | DATE | 適用開始日 | 勤務条件の適用開始日 | NOT NULL |
| effective_to | DATE | 適用終了日 | 勤務条件の適用終了日 | - |
| work_days_type | TEXT | 勤務日数タイプ | 勤務日数の計算方式（WEEKLY/MONTHLY/SHIFT） | NOT NULL, CHECK |
| work_days_count | INTEGER | 勤務日数 | 週または月あたりの勤務日数 | NOT NULL |
| work_days_count_note | TEXT | 勤務日数備考 | 勤務日数に関する補足説明 | - |
| holidays_jsonb | JSONB | 休日 | 休日情報（曜日・祝日・固定休など） | NOT NULL, DEFAULT '[]' |
| holidays_note | TEXT | 休日備考 | 休日に関する補足（自由記述） | - |
| paid_leave_base_date | DATE | 有給休暇付与基準日 | 有給休暇の付与基準となる日付 | - |
| working_hours_jsonb | JSONB | 勤務時間帯 | 複数の勤務時間帯（配列形式） | NOT NULL, DEFAULT '[]' |
| break_hours_jsonb | JSONB | 休憩時間帯 | 複数の休憩時間帯（配列形式、任意） | NOT NULL, DEFAULT '[]' |
| work_locations_jsonb | JSONB | 勤務場所 | 複数の勤務場所（配列形式） | NOT NULL, DEFAULT '[]' |
| transportation_routes_jsonb | JSONB | 交通費情報 | 複数の交通費ルート情報（配列形式、任意） | NOT NULL, DEFAULT '[]' |
| created_at | TIMESTAMPTZ | 作成日時 | レコード作成日時 | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | 更新日時 | レコード最終更新日時 | NOT NULL, DEFAULT NOW() |
| updated_by | TEXT | 更新者 | 最終更新者のユーザーID | NOT NULL |

#### JSONB構造例

**working_hours_jsonb（勤務時間帯）**
```json
[
  { "id": "string", "start_time": "HH:MM", "end_time": "HH:MM" }
]
```

**break_hours_jsonb（休憩時間帯）**
```json
[
  { "id": "string", "start_time": "HH:MM", "end_time": "HH:MM" }
]
```

**work_locations_jsonb（勤務場所）**
```json
[
  { "id": "string", "location": "勤務場所名" }
]
```

**transportation_routes_jsonb（交通費情報）【車通勤距離に対応】**
```json
[
  {
    "id": "string",
    "commute_type": "PUBLIC_TRANSPORT",
    "route": "ルート名（電車・バスなど）",
    "round_trip_amount": 1000,
    "monthly_pass_amount": 15000,
    "max_amount": 20000,
    "nearest_station": "最寄り駅名",

    "distance_km": 12.3
  }
]
```

- commute_type: PUBLIC_TRANSPORT / CAR / OTHER
- distance_km: 車通勤の通勤距離（km）。公共交通のみの場合は省略可。

---

### 6. contracts（雇用契約）【更新】

従業員の雇用契約情報を管理。

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---|---|---|---|---|
| id | TEXT | ID / 契約番号 | 契約の一意識別子（従業員番号-CON+4桁番号） | PRIMARY KEY |
| employee_id | TEXT | 従業員ID | 関連する従業員のID | NOT NULL, FK → employees.id |
| contract_type | TEXT | 契約種別 | 契約の種類（INDEFINITE/FIXED_TERM） | NOT NULL, CHECK |
| wage_type | TEXT | 賃金体系 | 賃金の体系（HOURLY/PIECEWORK） | NOT NULL, DEFAULT 'HOURLY', CHECK |
| contract_start_date | DATE | 契約開始日 | 雇用契約の開始日 | NOT NULL |
| contract_end_date | DATE | 契約終了日 | 後方互換性のため保持（段階的移行後削除予定） | - |
| employment_expiry_scheduled_date | DATE | 雇用満了予定日 | 契約時に設定する予定の満了日 | CHECK |
| employment_expiry_date | DATE | 雇用満了日 | 実際の雇用終了日（任意） | CHECK |
| is_renewable | BOOLEAN | 更新可能フラグ | 契約更新可能かどうか | NOT NULL, DEFAULT false |
| fixed_term_base_date | DATE | 有期契約基準日 | 有期契約の基準日 | - |
| job_description | TEXT | 業務内容 | 契約上の業務内容 | - |
| hourly_wage | DECIMAL(10,2) | 時給 | 基本時給 | NOT NULL |
| sub_leader_allowance_amount | DECIMAL(10,2) | サブリーダー手当 | サブリーダー手当（現場追加必須） | - |
| perfect_attendance_allowance_eligible | BOOLEAN | 精勤手当対象 | 精勤手当の対象者か（現場追加必須） | NOT NULL, DEFAULT false |
| hourly_wage_note | TEXT | 時給備考 | 時給に関する補足説明 | - |
| overtime_hourly_wage | DECIMAL(10,2) | 残業時給 | 残業時の時給 | - |
| paid_leave_clause | TEXT | 有給休暇条項 | 契約書の有給休暇に関する条項 | - |
| termination_alert_flag | BOOLEAN | 雇用終了アラートフラグ | 契約終了アラートの有効/無効 | NOT NULL, DEFAULT false |
| status | TEXT | ステータス | 契約の状態（DRAFT/AWAITING_APPROVAL/SUBMITTED/RETURNED） | NOT NULL, CHECK |
| created_at | TIMESTAMPTZ | 作成日時 | レコード作成日時 | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | 更新日時 | レコード最終更新日時 | NOT NULL, DEFAULT NOW() |
| updated_by | TEXT | 更新者 | 最終更新者のユーザーID | NOT NULL |

#### 表示対応（例）
- 契約種別：INDEFINITE=無期 / FIXED_TERM=有期  
- 賃金体系：HOURLY=時給 / PIECEWORK=出来高  

---

### 7. employment_history（雇用・人事履歴）

従業員の雇用・人事に関する履歴を管理。

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---|---|---|---|---|
| id | TEXT | ID | 履歴の一意識別子 | PRIMARY KEY |
| employee_id | TEXT | 従業員ID | 関連する従業員のID | NOT NULL, FK → employees.id |
| contract_id | TEXT | 契約ID | 関連する契約のID | FK → contracts.id |
| effective_date | DATE | 発効日 | 履歴イベントの発効日 | NOT NULL |
| event_type | TEXT | イベント種別 | 履歴イベントの種類 | NOT NULL, CHECK |
| department_code | TEXT | 部門コード | 異動先の部門コード | FK（任意）→ departments.code |
| paid_leave_days | INTEGER | 有給休暇日数 | 付与された有給休暇日数 | - |
| hourly_wage | DECIMAL(10,2) | 時給 | 変更後の時給 | - |
| work_condition_snapshot | JSONB | 勤務条件スナップショット | 時点の勤務条件を保存 | NOT NULL, DEFAULT '{}' |
| contract_terms_snapshot | JSONB | 契約条件スナップショット | 時点の契約条件を保存 | NOT NULL, DEFAULT '{}' |
| documents_snapshot | JSONB | 書類スナップショット | 時点の書類・提出状況を保存 | NOT NULL, DEFAULT '{}' |
| approval_number | TEXT | 承認番号 | 契約作成・更新時の承認番号 | - |
| remarks | TEXT | 備考 | 履歴に関する補足説明 | - |
| created_at | TIMESTAMPTZ | 作成日時 | レコード作成日時 | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | 更新日時 | レコード最終更新日時 | NOT NULL, DEFAULT NOW() |
| updated_by | TEXT | 更新者 | 最終更新者のユーザーID | NOT NULL |

---

### 8. employee_admin_records（従業員事務管理）【更新】

社会保険、給与関連、書類提出状況などを管理（従業員ごとに1レコード想定）。

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---|---|---|---|---|
| id | TEXT | ID | 事務管理レコードの一意識別子 | PRIMARY KEY |
| employee_id | TEXT | 従業員ID | 関連する従業員のID | NOT NULL, UNIQUE, FK → employees.id |
| tax_withholding_category | TEXT | 源泉徴収区分 | 控除申告書の種類（甲/乙） | - |
| web_salary_book_enabled | BOOLEAN | web給金帳 | web給金帳の利用有無（入社時登録必須 003） | NOT NULL, DEFAULT false |
| employment_insurance | TEXT | 雇用保険 | 雇用保険の加入状況 | - |
| employment_insurance_card_submitted | TEXT | 雇用保険被保険者証提出 | 提出状況 | - |
| social_insurance | TEXT | 社会保険 | 加入状況 | - |
| pension_book_submitted | TEXT | 年金手帳提出 | 提出状況 | - |
| health_insurance_card_submitted | TEXT | 健康保険証提出 | 提出状況 | - |
| health_insurance_card_type | TEXT | 健康保険証の種類 | 種類（入社時登録必須 004） | - |
| health_insurance_category | TEXT | 健康保険加入区分 | 入社時登録必須 | - |
| pension_category | TEXT | 厚生年金加入区分 | 入社時登録必須 | - |
| basic_pension_number | TEXT | 基礎年金番号 | 入社時登録必須 | - |
| pension_fund_category | TEXT | 厚生年金基金加入区分 | 入社時登録必須 | - |
| employment_insurance_number | TEXT | 雇用保険被保険者番号 | 入社時登録必須 | - |
| commuting_expense_category | TEXT | 通勤費区分 | 入社時登録必須 | - |
| notes | TEXT | 備考 | 事務管理に関する補足 | - |
| created_at | TIMESTAMPTZ | 作成日時 | レコード作成日時 | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | 更新日時 | レコード最終更新日時 | NOT NULL, DEFAULT NOW() |
| updated_by | TEXT | 更新者 | 最終更新者のユーザーID | NOT NULL |

#### 健康保険証の種類（health_insurance_card_type）
| DB値 | 日本語 |
|---|---|
| MYNUMBER_CARD | マイナ保険証（マイナンバーカード） |
| PHYSICAL_CARD | 従来の健康保険証 |
| ELIGIBILITY_CERT | 資格確認書 |

---

### 9. user（認証ユーザー）
（現行定義を踏襲。部門FKを明確化。）

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---|---|---|---|---|
| id | TEXT | ID | ユーザーの一意識別子 | PRIMARY KEY |
| name | TEXT | ユーザー名 | 表示名 | NOT NULL |
| email | TEXT | メールアドレス | ログイン用 | UNIQUE, NOT NULL |
| role | TEXT | ロール | 権限ロール | NOT NULL, DEFAULT 'FIELD_MANAGER', CHECK |
| department_code | TEXT | 部門コード | 所属部門（任意） | FK → departments.code |
| createdAt | TIMESTAMPTZ | 作成日時 | 作成日時 | NOT NULL |
| updatedAt | TIMESTAMPTZ | 更新日時 | 更新日時 | NOT NULL |

---

### 10. edit_locks（編集ロック）
（現行定義を踏襲。）

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---|---|---|---|---|
| resource_id | TEXT | リソースID | ロック対象のリソースID | PRIMARY KEY |
| resource_type | TEXT | リソース種別 | EMPLOYEE/CONTRACT/WORK_CONDITION | NOT NULL, CHECK |
| locked_by | TEXT | ロック取得者 | ロックを取得したユーザーID | NOT NULL, FK → user.id |
| locked_at | TIMESTAMPTZ | ロック取得日時 | ロック取得日時 | NOT NULL, DEFAULT NOW() |
| expires_at | TIMESTAMPTZ | ロック有効期限 | ロックの有効期限 | NOT NULL |

---

### 11. audit_logs（監査ログ）
（現行定義を踏襲。保持要件：7年。）

| カラム名 | データ型 | 日本語表示名 | 説明 | 制約 |
|---|---|---|---|---|
| id | TEXT | ID | 監査ログの一意識別子 | PRIMARY KEY |
| user_id | TEXT | ユーザーID | 操作を行ったユーザー | NOT NULL, FK → user.id |
| action | TEXT | アクション | 実行された操作の種類 | NOT NULL |
| resource_type | TEXT | リソース種別 | 操作対象のリソース種類 | NOT NULL |
| resource_id | TEXT | リソースID | 操作対象のリソースID | NOT NULL |
| old_values | JSONB | 変更前 | 変更前データ | - |
| new_values | JSONB | 変更後 | 変更後データ | - |
| ip_address | TEXT | IPアドレス | 操作元IP | - |
| user_agent | TEXT | UA | 操作元ブラウザ情報 | - |
| created_at | TIMESTAMPTZ | 作成日時 | ログ記録日時 | NOT NULL, DEFAULT NOW() |

---

## リレーション（テーブル間の関係）

### 外部キー（FK）一覧（要点）
- employees.department_code → departments.code
- user.department_code → departments.code（任意）
- work_conditions.employee_id → employees.id
- contracts.employee_id → employees.id
- employment_history.employee_id → employees.id
- employment_history.contract_id → contracts.id（任意）
- employment_history.department_code → departments.code（任意）
- employee_admin_records.employee_id → employees.id（UNIQUE：1従業員=1レコード）
- employee_contacts.employee_id → employees.id（UNIQUE：1従業員=0..1レコード）
- employee_bank_accounts.employee_id → employees.id（1従業員=複数可）
- edit_locks.locked_by → user.id
- audit_logs.user_id → user.id

### カーディナリティ（概念）
- departments (1) ── (N) employees
- employees (1) ── (N) work_conditions
- employees (1) ── (N) contracts
- employees (1) ── (N) employment_history
- employees (1) ── (1) employee_admin_records
- employees (1) ── (0..1) employee_contacts
- employees (1) ── (N) employee_bank_accounts
- user (1) ── (N) edit_locks
- user (1) ── (N) audit_logs

---

## ER図（Mermaid）

```mermaid
erDiagram
  DEPARTMENTS ||--o{ EMPLOYEES : "has"
  DEPARTMENTS ||--o{ USER : "assigned"

  EMPLOYEES ||--o{ WORK_CONDITIONS : "has"
  EMPLOYEES ||--o{ CONTRACTS : "has"
  EMPLOYEES ||--o{ EMPLOYMENT_HISTORY : "has"
  EMPLOYEES ||--|| EMPLOYEE_ADMIN_RECORDS : "admin"
  EMPLOYEES ||--o| EMPLOYEE_CONTACTS : "contact"
  EMPLOYEES ||--o{ EMPLOYEE_BANK_ACCOUNTS : "bank_accounts"

  CONTRACTS ||--o{ EMPLOYMENT_HISTORY : "referenced"

  USER ||--o{ EDIT_LOCKS : "locks"
  USER ||--o{ AUDIT_LOGS : "writes"

  DEPARTMENTS {
    TEXT code PK
    TEXT name
    BOOLEAN is_active
  }

  EMPLOYEES {
    TEXT id PK
    TEXT employee_number UK
    INTEGER branch_number
    TEXT name
    TEXT name_kana
    TEXT gender
    DATE birth_date
    DATE hired_at
    DATE rehired_at
    DATE retired_at
    TEXT employment_type
    TEXT employment_status
    TEXT department_code FK
  }

  EMPLOYEE_CONTACTS {
    TEXT id PK
    TEXT employee_id UK_FK
    TEXT postal_code
    TEXT address1
    TEXT address2
    TEXT address1_kana
    TEXT address2_kana
    TEXT phone1
    TEXT email1
  }

  EMPLOYEE_BANK_ACCOUNTS {
    TEXT id PK
    TEXT employee_id FK
    INTEGER payment_priority
    TEXT handling_category
    TEXT payment_category
    TEXT bank_code
    TEXT bank_name
    TEXT branch_code
    TEXT branch_name
    TEXT deposit_type
    TEXT account_number
    TEXT account_holder_name
    BOOLEAN is_active
  }

  WORK_CONDITIONS {
    TEXT id PK
    TEXT employee_id FK
    DATE effective_from
    DATE effective_to
    JSONB holidays_jsonb
    JSONB transportation_routes_jsonb
  }

  CONTRACTS {
    TEXT id PK
    TEXT employee_id FK
    TEXT contract_type
    TEXT wage_type
    DECIMAL hourly_wage
    DECIMAL sub_leader_allowance_amount
    BOOLEAN perfect_attendance_allowance_eligible
  }

  EMPLOYMENT_HISTORY {
    TEXT id PK
    TEXT employee_id FK
    TEXT contract_id FK
    DATE effective_date
    TEXT event_type
    TEXT department_code FK
  }

  EMPLOYEE_ADMIN_RECORDS {
    TEXT id PK
    TEXT employee_id UK_FK
    BOOLEAN web_salary_book_enabled
    TEXT health_insurance_card_type
  }

  USER {
    TEXT id PK
    TEXT email UK
    TEXT role
    TEXT department_code FK
  }

  EDIT_LOCKS {
    TEXT resource_id PK
    TEXT locked_by FK
    TIMESTAMPTZ expires_at
  }

  AUDIT_LOGS {
    TEXT id PK
    TEXT user_id FK
    TEXT action
    TEXT resource_type
    TEXT resource_id
    TIMESTAMPTZ created_at
  }
```
