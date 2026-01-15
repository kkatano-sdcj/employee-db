-- ==========================================
-- マイグレーション: スキーマ更新 v2
-- 目的: part_db_schema_updated.md に基づくスキーマ変更
-- 実行方法: Supabase Dashboard > SQL Editor で実行
-- ==========================================

-- ==========================================
-- 1. departments テーブル（部門マスター）【新規追加】
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
-- 2. employees テーブル拡張【rehired_at追加】
-- ==========================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'rehired_at'
  ) THEN
    ALTER TABLE employees ADD COLUMN rehired_at DATE;
    COMMENT ON COLUMN employees.rehired_at IS '再入社日：再雇用（再入社）した日付';
  END IF;
END $$;

-- ==========================================
-- 3. employee_contacts テーブル（住所・連絡先）【新規追加】
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
-- 4. employee_bank_accounts テーブル（振込口座・支払情報）【新規追加】
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
-- 5. work_conditions テーブル拡張【holidays_jsonb, holidays_note追加】
-- ==========================================
DO $$
BEGIN
  -- holidays_jsonb カラム追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'work_conditions' AND column_name = 'holidays_jsonb'
  ) THEN
    ALTER TABLE work_conditions ADD COLUMN holidays_jsonb JSONB NOT NULL DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN work_conditions.holidays_jsonb IS '休日情報（曜日・祝日・固定休など）';
  END IF;
  
  -- holidays_note カラム追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'work_conditions' AND column_name = 'holidays_note'
  ) THEN
    ALTER TABLE work_conditions ADD COLUMN holidays_note TEXT;
    COMMENT ON COLUMN work_conditions.holidays_note IS '休日に関する補足（自由記述）';
  END IF;
END $$;

-- ==========================================
-- 6. contracts テーブル拡張【wage_type, sub_leader_allowance_amount, perfect_attendance_allowance_eligible追加】
-- ==========================================
DO $$
BEGIN
  -- wage_type カラム追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'wage_type'
  ) THEN
    ALTER TABLE contracts ADD COLUMN wage_type TEXT NOT NULL DEFAULT 'HOURLY';
    ALTER TABLE contracts ADD CONSTRAINT chk_wage_type CHECK (wage_type IN ('HOURLY', 'PIECEWORK'));
    COMMENT ON COLUMN contracts.wage_type IS '賃金体系（HOURLY=時給 / PIECEWORK=出来高）';
  END IF;
  
  -- sub_leader_allowance_amount カラム追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'sub_leader_allowance_amount'
  ) THEN
    ALTER TABLE contracts ADD COLUMN sub_leader_allowance_amount DECIMAL(10, 2);
    COMMENT ON COLUMN contracts.sub_leader_allowance_amount IS 'サブリーダー手当';
  END IF;
  
  -- perfect_attendance_allowance_eligible カラム追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'perfect_attendance_allowance_eligible'
  ) THEN
    ALTER TABLE contracts ADD COLUMN perfect_attendance_allowance_eligible BOOLEAN NOT NULL DEFAULT false;
    COMMENT ON COLUMN contracts.perfect_attendance_allowance_eligible IS '精勤手当対象';
  END IF;
END $$;

-- ==========================================
-- 7. employee_admin_records テーブル拡張【web_salary_book_enabled, health_insurance_card_type追加】
-- ==========================================
DO $$
BEGIN
  -- web_salary_book_enabled カラム追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'employee_admin_records' AND column_name = 'web_salary_book_enabled'
  ) THEN
    ALTER TABLE employee_admin_records ADD COLUMN web_salary_book_enabled BOOLEAN NOT NULL DEFAULT false;
    COMMENT ON COLUMN employee_admin_records.web_salary_book_enabled IS 'web給金帳の利用有無（入社時登録必須 003）';
  END IF;
  
  -- health_insurance_card_type カラム追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'employee_admin_records' AND column_name = 'health_insurance_card_type'
  ) THEN
    ALTER TABLE employee_admin_records ADD COLUMN health_insurance_card_type TEXT;
    ALTER TABLE employee_admin_records ADD CONSTRAINT chk_health_insurance_card_type 
      CHECK (health_insurance_card_type IS NULL OR health_insurance_card_type IN ('MYNUMBER_CARD', 'PHYSICAL_CARD', 'ELIGIBILITY_CERT'));
    COMMENT ON COLUMN employee_admin_records.health_insurance_card_type IS '健康保険証の種類（入社時登録必須 004）';
  END IF;
END $$;

-- ==========================================
-- 8. user テーブル拡張【department_code FK、role制約更新】
-- ==========================================
DO $$
BEGIN
  -- SYSTEM_ADMIN と GENERAL_AFFAIRS ロールを追加するため、制約を更新
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user') THEN
    -- 既存の制約を削除（存在する場合）
    IF EXISTS (
      SELECT FROM information_schema.table_constraints 
      WHERE constraint_name = 'chk_role' AND table_name = 'user'
    ) THEN
      ALTER TABLE "user" DROP CONSTRAINT chk_role;
    END IF;
    
    -- 新しい制約を追加
    ALTER TABLE "user" ADD CONSTRAINT chk_role 
      CHECK (role IN ('SYSTEM_ADMIN', 'ADMIN', 'HR_MANAGER', 'FIELD_MANAGER', 'GENERAL_AFFAIRS', 'AUDITOR'));
  END IF;
END $$;

-- ==========================================
-- 9. employment_history テーブルの部門コード制約を削除（マスタ参照に変更）
-- ==========================================
DO $$
BEGIN
  -- 既存の制約を削除（存在する場合）
  IF EXISTS (
    SELECT FROM information_schema.table_constraints 
    WHERE constraint_name = 'chk_employment_history_department_code' AND table_name = 'employment_history'
  ) THEN
    ALTER TABLE employment_history DROP CONSTRAINT chk_employment_history_department_code;
  END IF;
END $$;

-- ==========================================
-- 10. employees テーブルの部門コード制約を削除（マスタ参照に変更）
-- ==========================================
DO $$
BEGIN
  -- 既存の制約を削除（存在する場合）
  IF EXISTS (
    SELECT FROM information_schema.table_constraints 
    WHERE constraint_name = 'chk_department_code' AND table_name = 'employees'
  ) THEN
    ALTER TABLE employees DROP CONSTRAINT chk_department_code;
  END IF;
END $$;

-- ==========================================
-- 完了メッセージ
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'マイグレーション完了: スキーマ更新 v2';
  RAISE NOTICE '追加テーブル: departments, employee_contacts, employee_bank_accounts';
  RAISE NOTICE '拡張テーブル: employees, work_conditions, contracts, employee_admin_records, user';
END $$;

