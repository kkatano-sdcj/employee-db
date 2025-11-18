-- ==========================================
-- 従業員データベース スキーマ定義
-- Supabase (PostgreSQL) 用 SQL
-- table.md に基づく完全なスキーマ定義
-- 実行方法: Supabase Dashboard > SQL Editor で実行
-- ==========================================

-- ==========================================
-- 1. employees テーブル（従業員マスター）
-- ==========================================
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  employee_number TEXT UNIQUE NOT NULL,
  branch_number INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  name_kana TEXT NOT NULL,
  gender TEXT NOT NULL,
  birth_date DATE NOT NULL,
  nationality TEXT,
  hired_at DATE NOT NULL,
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
  CONSTRAINT chk_department_code CHECK (department_code IN ('BPS課', 'オンサイト課', 'CC課', 'PS課'))
);

CREATE INDEX IF NOT EXISTS idx_employees_employee_number ON employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_employees_department_code ON employees(department_code, employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_employment_status ON employees(employment_status);

-- ==========================================
-- 2. work_conditions テーブル（勤務条件）
-- ==========================================
CREATE TABLE IF NOT EXISTS work_conditions (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  work_days_type TEXT NOT NULL,
  work_days_count INTEGER NOT NULL,
  work_days_count_note TEXT,
  paid_leave_base_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL,
  
  CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT chk_work_days_type CHECK (work_days_type IN ('WEEKLY', 'MONTHLY', 'SHIFT'))
);

CREATE INDEX IF NOT EXISTS idx_work_conditions_employee_id ON work_conditions(employee_id, effective_from DESC);

-- ==========================================
-- 3. working_hours テーブル（勤務時間帯）
-- ==========================================
CREATE TABLE IF NOT EXISTS working_hours (
  id TEXT PRIMARY KEY,
  work_condition_id TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  CONSTRAINT fk_work_condition FOREIGN KEY (work_condition_id) REFERENCES work_conditions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_working_hours_work_condition_id ON working_hours(work_condition_id);

-- ==========================================
-- 4. break_hours テーブル（休憩時間帯）
-- ==========================================
CREATE TABLE IF NOT EXISTS break_hours (
  id TEXT PRIMARY KEY,
  work_condition_id TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  CONSTRAINT fk_work_condition FOREIGN KEY (work_condition_id) REFERENCES work_conditions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_break_hours_work_condition_id ON break_hours(work_condition_id);

-- ==========================================
-- 5. work_locations テーブル（勤務場所）
-- ==========================================
CREATE TABLE IF NOT EXISTS work_locations (
  id TEXT PRIMARY KEY,
  work_condition_id TEXT NOT NULL,
  location TEXT NOT NULL,
  
  CONSTRAINT fk_work_condition FOREIGN KEY (work_condition_id) REFERENCES work_conditions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_work_locations_work_condition_id ON work_locations(work_condition_id);

-- ==========================================
-- 6. transportation_routes テーブル（交通費情報）
-- ==========================================
CREATE TABLE IF NOT EXISTS transportation_routes (
  id TEXT PRIMARY KEY,
  work_condition_id TEXT NOT NULL,
  route TEXT NOT NULL,
  round_trip_amount DECIMAL(10, 2) NOT NULL,
  monthly_pass_amount DECIMAL(10, 2),
  max_amount DECIMAL(10, 2),
  nearest_station TEXT,
  
  CONSTRAINT fk_work_condition FOREIGN KEY (work_condition_id) REFERENCES work_conditions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transportation_routes_work_condition_id ON transportation_routes(work_condition_id);

-- ==========================================
-- 7. contracts テーブル（雇用契約）
-- ==========================================
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  contract_start_date DATE NOT NULL,
  contract_end_date DATE,
  is_renewable BOOLEAN NOT NULL DEFAULT false,
  fixed_term_base_date DATE,
  job_description TEXT,
  hourly_wage DECIMAL(10, 2) NOT NULL,
  hourly_wage_note TEXT,
  overtime_hourly_wage DECIMAL(10, 2),
  paid_leave_clause TEXT,
  termination_alert_flag BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL,
  
  CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT chk_contract_type CHECK (contract_type IN ('INDEFINITE', 'FIXED_TERM')),
  CONSTRAINT chk_status CHECK (status IN ('DRAFT', 'AWAITING_APPROVAL', 'SUBMITTED', 'RETURNED'))
);

CREATE INDEX IF NOT EXISTS idx_contracts_employee_id ON contracts(employee_id, contract_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_contracts_status_end_date ON contracts(status, contract_end_date) WHERE termination_alert_flag = true;

-- ==========================================
-- 8. employment_history テーブル（雇用・人事履歴）
-- ==========================================
CREATE TABLE IF NOT EXISTS employment_history (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  effective_date DATE NOT NULL,
  event_type TEXT NOT NULL,
  department_code TEXT,
  paid_leave_days INTEGER,
  hourly_wage DECIMAL(10, 2),
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL,
  
  CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT chk_event_type CHECK (event_type IN (
    'HIRE', 'TRANSFER', 'PROMOTION', 'SALARY_INCREASE', 
    'SALARY_DECREASE', 'CONCURRENT_POST', 'RETIRE', 'REINSTATE'
  )),
  CONSTRAINT chk_employment_history_department_code CHECK (department_code IS NULL OR department_code IN ('BPS課', 'オンサイト課', 'CC課', 'PS課'))
);

CREATE INDEX IF NOT EXISTS idx_employment_history_employee_id ON employment_history(employee_id, effective_date DESC);

-- ==========================================
-- 9. employee_admin_records テーブル（従業員事務管理）
-- ==========================================
CREATE TABLE IF NOT EXISTS employee_admin_records (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  tax_withholding_category TEXT,
  employment_insurance TEXT,
  employment_insurance_card_submitted TEXT,
  social_insurance TEXT,
  pension_book_submitted TEXT,
  health_insurance_card_submitted TEXT,
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

  CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_employee_admin_updated_at ON employee_admin_records(updated_at DESC);

-- ==========================================
-- 10. users テーブル（認証ユーザー）
-- 注意: better-auth が基本テーブルを作成するため、追加カラムのみ定義
-- ==========================================
-- users テーブルは better-auth が作成するため、存在確認後にカラムを追加
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
    -- role カラムの追加（存在しない場合のみ）
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
      ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'FIELD_MANAGER';
    END IF;
    
    -- department_code カラムの追加（存在しない場合のみ）
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'department_code') THEN
      ALTER TABLE users ADD COLUMN department_code TEXT;
    END IF;
    
    -- 制約の追加（存在しない場合のみ）
    IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name = 'chk_role') THEN
      ALTER TABLE users ADD CONSTRAINT chk_role CHECK (role IN ('ADMIN', 'HR_MANAGER', 'FIELD_MANAGER', 'AUDITOR'));
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department_code ON users(department_code);

-- ==========================================
-- 11. edit_locks テーブル（編集ロック）
-- ==========================================
CREATE TABLE IF NOT EXISTS edit_locks (
  resource_id TEXT PRIMARY KEY,
  resource_type TEXT NOT NULL,
  locked_by TEXT NOT NULL,
  locked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  CONSTRAINT chk_resource_type CHECK (resource_type IN ('EMPLOYEE', 'CONTRACT', 'WORK_CONDITION'))
);

-- users テーブルが存在する場合のみ外部キー制約を追加
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
    IF NOT EXISTS (
      SELECT FROM information_schema.table_constraints 
      WHERE constraint_name = 'edit_locks_locked_by_fkey'
    ) THEN
      ALTER TABLE edit_locks 
      ADD CONSTRAINT edit_locks_locked_by_fkey 
      FOREIGN KEY (locked_by) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_edit_locks_expires_at ON edit_locks(expires_at);

-- ==========================================
-- 12. audit_logs テーブル（監査ログ）
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

-- users テーブルが存在する場合のみ外部キー制約を追加
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
    IF NOT EXISTS (
      SELECT FROM information_schema.table_constraints 
      WHERE constraint_name = 'audit_logs_user_id_fkey'
    ) THEN
      ALTER TABLE audit_logs 
      ADD CONSTRAINT audit_logs_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
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
  RAISE NOTICE 'スキーマ作成が完了しました。全12テーブルが作成されました。';
END $$;

