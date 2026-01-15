-- ==========================================
-- 従業員データベース スキーマ定義 v2
-- Supabase (PostgreSQL) 用 SQL
-- part_db_schema_updated.md に基づく完全なスキーマ定義
-- 実行方法: Supabase Dashboard > SQL Editor で実行
-- ==========================================

-- ==========================================
-- 1. departments テーブル（部門マスター）
-- ==========================================
CREATE TABLE IF NOT EXISTS departments (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL DEFAULT 'system'
);

-- 初期データ投入（部門マスター）
INSERT INTO departments (code, name, is_active, updated_by) VALUES
  ('BPS課', 'BPS課', true, 'system'),
  ('オンサイト課', 'オンサイト課', true, 'system'),
  ('CC課', 'CC課', true, 'system'),
  ('PS課', 'PS課', true, 'system')
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 2. employees テーブル（従業員マスター）
-- ==========================================
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  employee_number TEXT UNIQUE NOT NULL,
  branch_number INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  name_kana TEXT NOT NULL,
  sticker_item TEXT, -- フセン項目（入社時登録必須項目）
  gender TEXT NOT NULL,
  birth_date DATE NOT NULL,
  nationality TEXT,
  hired_at DATE NOT NULL,
  rehired_at DATE, -- 再入社日
  retired_at DATE,
  employment_type TEXT NOT NULL,
  employment_status TEXT NOT NULL,
  department_code TEXT NOT NULL,
  my_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL,
  
  CONSTRAINT chk_gender CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
  CONSTRAINT chk_employment_type CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT')),
  CONSTRAINT chk_employment_status CHECK (employment_status IN ('ACTIVE', 'RETIRED', 'ON_LEAVE')),
  CONSTRAINT fk_employees_department FOREIGN KEY (department_code) REFERENCES departments(code)
);

CREATE INDEX IF NOT EXISTS idx_employees_employee_number ON employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_employees_department_code ON employees(department_code, employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_employment_status ON employees(employment_status);

-- ==========================================
-- 3. employee_contacts テーブル（住所・連絡先）
-- ==========================================
CREATE TABLE IF NOT EXISTS employee_contacts (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  postal_code TEXT,
  address1 TEXT,
  address2 TEXT,
  address1_kana TEXT,
  address2_kana TEXT,
  phone1 TEXT,
  email1 TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL,
  
  CONSTRAINT fk_employee_contacts_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_employee_contacts_employee_id ON employee_contacts(employee_id);

-- ==========================================
-- 4. employee_bank_accounts テーブル（振込口座・支払情報）
-- ==========================================
CREATE TABLE IF NOT EXISTS employee_bank_accounts (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  payment_priority INTEGER NOT NULL DEFAULT 1,
  handling_category TEXT,
  payment_category TEXT,
  bank_code TEXT,
  bank_name TEXT,
  branch_code TEXT,
  branch_name TEXT,
  deposit_type TEXT,
  account_number TEXT,
  account_holder_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL,
  
  CONSTRAINT fk_employee_bank_accounts_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT chk_deposit_type CHECK (deposit_type IS NULL OR deposit_type IN ('SAVINGS', 'CHECKING', 'OTHER')),
  CONSTRAINT uq_employee_payment_priority UNIQUE (employee_id, payment_priority)
);

CREATE INDEX IF NOT EXISTS idx_employee_bank_accounts_employee_id ON employee_bank_accounts(employee_id);

-- ==========================================
-- 5. work_conditions テーブル（勤務条件）
-- ==========================================
CREATE TABLE IF NOT EXISTS work_conditions (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  work_days_type TEXT NOT NULL,
  work_days_count INTEGER NOT NULL,
  work_days_count_note TEXT,
  holidays_jsonb JSONB NOT NULL DEFAULT '[]'::jsonb, -- 休日情報
  holidays_note TEXT, -- 休日備考
  paid_leave_base_date DATE,
  -- 統合構造: JSONBカラムで勤務時間帯、休憩時間帯、勤務場所、交通費情報を保存
  working_hours_jsonb JSONB NOT NULL DEFAULT '[]'::jsonb, -- 勤務時間帯（複数）
  break_hours_jsonb JSONB NOT NULL DEFAULT '[]'::jsonb, -- 休憩時間帯（複数、任意）
  work_locations_jsonb JSONB NOT NULL DEFAULT '[]'::jsonb, -- 勤務場所（複数）
  transportation_routes_jsonb JSONB NOT NULL DEFAULT '[]'::jsonb, -- 交通費情報（複数、任意）
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL,
  
  CONSTRAINT fk_work_conditions_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT chk_work_days_type CHECK (work_days_type IN ('WEEKLY', 'MONTHLY', 'SHIFT'))
);

CREATE INDEX IF NOT EXISTS idx_work_conditions_employee_id ON work_conditions(employee_id, effective_from DESC);
CREATE INDEX IF NOT EXISTS idx_work_conditions_working_hours_jsonb ON work_conditions USING GIN (working_hours_jsonb);
CREATE INDEX IF NOT EXISTS idx_work_conditions_break_hours_jsonb ON work_conditions USING GIN (break_hours_jsonb);
CREATE INDEX IF NOT EXISTS idx_work_conditions_work_locations_jsonb ON work_conditions USING GIN (work_locations_jsonb);
CREATE INDEX IF NOT EXISTS idx_work_conditions_transportation_routes_jsonb ON work_conditions USING GIN (transportation_routes_jsonb);

-- ==========================================
-- 6. contracts テーブル（雇用契約）
-- ==========================================
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  wage_type TEXT NOT NULL DEFAULT 'HOURLY', -- 賃金体系（HOURLY/PIECEWORK）
  contract_start_date DATE NOT NULL,
  contract_end_date DATE, -- 後方互換性のため保持
  employment_expiry_scheduled_date DATE, -- 雇用満了予定日
  employment_expiry_date DATE, -- 雇用満了日（実際）
  is_renewable BOOLEAN NOT NULL DEFAULT false,
  fixed_term_base_date DATE,
  job_description TEXT,
  hourly_wage DECIMAL(10, 2) NOT NULL,
  sub_leader_allowance_amount DECIMAL(10, 2), -- サブリーダー手当
  perfect_attendance_allowance_eligible BOOLEAN NOT NULL DEFAULT false, -- 精勤手当対象
  hourly_wage_note TEXT,
  overtime_hourly_wage DECIMAL(10, 2),
  paid_leave_clause TEXT,
  termination_alert_flag BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL,
  
  CONSTRAINT fk_contracts_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT chk_contract_type CHECK (contract_type IN ('INDEFINITE', 'FIXED_TERM')),
  CONSTRAINT chk_wage_type CHECK (wage_type IN ('HOURLY', 'PIECEWORK')),
  CONSTRAINT chk_status CHECK (status IN ('DRAFT', 'AWAITING_APPROVAL', 'SUBMITTED', 'RETURNED')),
  CONSTRAINT chk_contract_expiry_scheduled_date CHECK (
    employment_expiry_scheduled_date IS NULL 
    OR employment_expiry_scheduled_date > contract_start_date
  ),
  CONSTRAINT chk_contract_expiry_date CHECK (
    employment_expiry_date IS NULL 
    OR employment_expiry_date >= contract_start_date
  )
);

CREATE INDEX IF NOT EXISTS idx_contracts_employee_id ON contracts(employee_id, contract_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_contracts_expiry_scheduled_date ON contracts(employment_expiry_scheduled_date) 
  WHERE termination_alert_flag = true AND employment_expiry_scheduled_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_status_expiry_scheduled ON contracts(status, employment_expiry_scheduled_date) 
  WHERE termination_alert_flag = true AND employment_expiry_scheduled_date IS NOT NULL;

-- ==========================================
-- 7. employment_history テーブル（雇用・人事履歴）
-- ==========================================
CREATE TABLE IF NOT EXISTS employment_history (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  contract_id TEXT,
  effective_date DATE NOT NULL,
  event_type TEXT NOT NULL,
  department_code TEXT,
  paid_leave_days INTEGER,
  hourly_wage DECIMAL(10, 2),
  work_condition_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  contract_terms_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  documents_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  approval_number TEXT, -- 承認番号
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL,
  
  CONSTRAINT fk_employment_history_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_employment_history_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
  CONSTRAINT fk_employment_history_department FOREIGN KEY (department_code) REFERENCES departments(code),
  CONSTRAINT chk_event_type CHECK (event_type IN (
    'HIRE', 'TRANSFER', 'PROMOTION', 'SALARY_INCREASE', 
    'SALARY_DECREASE', 'CONCURRENT_POST', 'RETIRE', 'REINSTATE',
    'CONTRACT_UPDATE'
  ))
);

CREATE INDEX IF NOT EXISTS idx_employment_history_employee_id ON employment_history(employee_id, effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_employment_history_contract_id ON employment_history(contract_id, effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_employment_history_approval_number ON employment_history(approval_number) WHERE approval_number IS NOT NULL;

-- ==========================================
-- 8. employee_admin_records テーブル（従業員事務管理）
-- ==========================================
CREATE TABLE IF NOT EXISTS employee_admin_records (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  tax_withholding_category TEXT,
  web_salary_book_enabled BOOLEAN NOT NULL DEFAULT false, -- web給金帳
  employment_insurance TEXT,
  employment_insurance_card_submitted TEXT,
  social_insurance TEXT,
  pension_book_submitted TEXT,
  health_insurance_card_submitted TEXT,
  health_insurance_card_type TEXT, -- 健康保険証の種類
  health_insurance_category TEXT,
  pension_category TEXT,
  basic_pension_number TEXT,
  pension_fund_category TEXT,
  employment_insurance_number TEXT,
  base_salary DECIMAL(10, 2),
  commuting_expense_category TEXT,
  commuting_expense_payment_method TEXT,
  daily_payment_amount DECIMAL(10, 2),
  submitted_to_admin_on DATE,
  returned_to_employee TEXT,
  expiration_notice_issued TEXT,
  resignation_letter_submitted TEXT,
  return_health_insurance_card TEXT,
  return_security_card TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL,

  CONSTRAINT fk_employee_admin_records_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT chk_health_insurance_card_type CHECK (
    health_insurance_card_type IS NULL OR 
    health_insurance_card_type IN ('MYNUMBER_CARD', 'PHYSICAL_CARD', 'ELIGIBILITY_CERT')
  )
);

CREATE INDEX IF NOT EXISTS idx_employee_admin_updated_at ON employee_admin_records(updated_at DESC);

-- ==========================================
-- 9. user テーブル（認証ユーザー）
-- 注意: better-auth が基本テーブルを作成するため、追加カラムのみ定義
-- ==========================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user') THEN
    -- role カラムの追加（存在しない場合のみ）
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'role') THEN
      ALTER TABLE "user" ADD COLUMN role TEXT NOT NULL DEFAULT 'FIELD_MANAGER';
    END IF;
    
    -- department_code カラムの追加（存在しない場合のみ）
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'department_code') THEN
      ALTER TABLE "user" ADD COLUMN department_code TEXT;
    END IF;
    
    -- 既存の制約を削除して新しい制約を追加
    IF EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'chk_role' AND table_name = 'user') THEN
      ALTER TABLE "user" DROP CONSTRAINT chk_role;
    END IF;
    ALTER TABLE "user" ADD CONSTRAINT chk_role CHECK (
      role IN ('SYSTEM_ADMIN', 'ADMIN', 'HR_MANAGER', 'FIELD_MANAGER', 'GENERAL_AFFAIRS', 'AUDITOR')
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_role ON "user"(role);
CREATE INDEX IF NOT EXISTS idx_users_department_code ON "user"(department_code);

-- ==========================================
-- 10. edit_locks テーブル（編集ロック）
-- ==========================================
CREATE TABLE IF NOT EXISTS edit_locks (
  resource_id TEXT PRIMARY KEY,
  resource_type TEXT NOT NULL,
  locked_by TEXT NOT NULL,
  locked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  CONSTRAINT chk_resource_type CHECK (resource_type IN ('EMPLOYEE', 'CONTRACT', 'WORK_CONDITION'))
);

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user') THEN
    IF NOT EXISTS (
      SELECT FROM information_schema.table_constraints 
      WHERE constraint_name = 'edit_locks_locked_by_fkey'
    ) THEN
      ALTER TABLE edit_locks 
      ADD CONSTRAINT edit_locks_locked_by_fkey 
      FOREIGN KEY (locked_by) REFERENCES "user"(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_edit_locks_expires_at ON edit_locks(expires_at);

-- ==========================================
-- 11. audit_logs テーブル（監査ログ）
-- ==========================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user') THEN
    IF NOT EXISTS (
      SELECT FROM information_schema.table_constraints 
      WHERE constraint_name = 'audit_logs_user_id_fkey'
    ) THEN
      ALTER TABLE audit_logs 
      ADD CONSTRAINT audit_logs_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ==========================================
-- 完了メッセージ
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'スキーマ作成が完了しました。全11テーブルが作成されました。';
  RAISE NOTICE '追加テーブル: departments, employee_contacts, employee_bank_accounts';
  RAISE NOTICE '拡張カラム: employees.rehired_at, work_conditions.holidays_jsonb/holidays_note';
  RAISE NOTICE '拡張カラム: contracts.wage_type/sub_leader_allowance_amount/perfect_attendance_allowance_eligible';
  RAISE NOTICE '拡張カラム: employee_admin_records.web_salary_book_enabled/health_insurance_card_type';
END $$;
