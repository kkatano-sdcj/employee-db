-- ==========================================
-- マイグレーション: spec v2 新規データ項目追加
-- 作成日: 2026-03-25
-- 説明: specs/001-update-spec-v2/spec.md および要望メモ20260319.xlsx に基づく
--       新規カラム追加、CHECK制約拡張、新規テーブル作成
-- ==========================================

-- ==========================================
-- 1. employees テーブル拡張（FR-001, FR-130, FR-131）
-- ==========================================
DO $$
BEGIN
  -- site_code: 所属コード（拠点略称）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'site_code'
  ) THEN
    ALTER TABLE employees ADD COLUMN site_code TEXT;
    COMMENT ON COLUMN employees.site_code IS '所属コード（拠点略称、例: ITS）FR-001';
  END IF;

  -- rehire_count: 再雇用回数
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'rehire_count'
  ) THEN
    ALTER TABLE employees ADD COLUMN rehire_count INTEGER NOT NULL DEFAULT 0;
    COMMENT ON COLUMN employees.rehire_count IS '再雇用回数 FR-131';
  END IF;

  -- original_hire_date: 初回入社日
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'original_hire_date'
  ) THEN
    ALTER TABLE employees ADD COLUMN original_hire_date DATE;
    COMMENT ON COLUMN employees.original_hire_date IS '初回入社日 FR-131';
  END IF;

  -- current_hire_date: 現在雇用開始日
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'current_hire_date'
  ) THEN
    ALTER TABLE employees ADD COLUMN current_hire_date DATE;
    COMMENT ON COLUMN employees.current_hire_date IS '現在雇用開始日 FR-131';
  END IF;

END $$;

-- employment_status ENUM拡張: STANDBY, ARCHIVED 追加（FR-130）
-- 注意: 実DBは TEXT+CHECK ではなく PostgreSQL ENUM型 "EmploymentStatus" を使用
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'STANDBY' AND enumtypid = '"EmploymentStatus"'::regtype) THEN
    ALTER TYPE "EmploymentStatus" ADD VALUE 'STANDBY';
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ARCHIVED' AND enumtypid = '"EmploymentStatus"'::regtype) THEN
    ALTER TYPE "EmploymentStatus" ADD VALUE 'ARCHIVED';
  END IF;
END $$;

-- site_code インデックス
CREATE INDEX IF NOT EXISTS idx_employees_site_code ON employees(site_code) WHERE site_code IS NOT NULL;

-- ==========================================
-- 2. contracts テーブル拡張（xlsx カテゴリ・項目分け）
-- ==========================================
-- contract_type ENUM拡張: REHIRED, DISABILITY 追加
-- 注意: 実DBは TEXT+CHECK ではなく PostgreSQL ENUM型 "ContractType" を使用
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'REHIRED' AND enumtypid = '"ContractType"'::regtype) THEN
    ALTER TYPE "ContractType" ADD VALUE 'REHIRED';
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'DISABILITY' AND enumtypid = '"ContractType"'::regtype) THEN
    ALTER TYPE "ContractType" ADD VALUE 'DISABILITY';
  END IF;
END $$;

DO $$
BEGIN
  -- job_description_change_scope: 業務変更の範囲
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'job_description_change_scope'
  ) THEN
    ALTER TABLE contracts ADD COLUMN job_description_change_scope TEXT DEFAULT '会社の定める業務';
    COMMENT ON COLUMN contracts.job_description_change_scope IS '業務変更の範囲';
  END IF;

  -- work_location_change_scope: 就業場所変更の範囲
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'work_location_change_scope'
  ) THEN
    ALTER TABLE contracts ADD COLUMN work_location_change_scope TEXT DEFAULT '会社の定める事業所';
    COMMENT ON COLUMN contracts.work_location_change_scope IS '就業場所変更の範囲';
  END IF;

  -- overtime_work: 所定外労働の有無
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'overtime_work'
  ) THEN
    ALTER TABLE contracts ADD COLUMN overtime_work BOOLEAN NOT NULL DEFAULT true;
    COMMENT ON COLUMN contracts.overtime_work IS '所定外労働の有無';
  END IF;

  -- holiday_work: 休日労働の有無
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'holiday_work'
  ) THEN
    ALTER TABLE contracts ADD COLUMN holiday_work BOOLEAN NOT NULL DEFAULT true;
    COMMENT ON COLUMN contracts.holiday_work IS '休日労働の有無';
  END IF;

  -- paid_leave_days: 年次有給休暇日数
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'paid_leave_days'
  ) THEN
    ALTER TABLE contracts ADD COLUMN paid_leave_days INTEGER;
    COMMENT ON COLUMN contracts.paid_leave_days IS '年次有給休暇日数';
  END IF;

  -- paid_leave_base_date_type: 基準日タイプ
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'paid_leave_base_date_type'
  ) THEN
    ALTER TABLE contracts ADD COLUMN paid_leave_base_date_type TEXT;
    COMMENT ON COLUMN contracts.paid_leave_base_date_type IS '有休基準日タイプ（SIX_MONTHS_AFTER_HIRE / OTHER）';
  END IF;

  -- paid_leave_base_date: 有休基準日
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'paid_leave_base_date'
  ) THEN
    ALTER TABLE contracts ADD COLUMN paid_leave_base_date DATE;
    COMMENT ON COLUMN contracts.paid_leave_base_date IS '有休基準日';
  END IF;

  -- disability_leave_frequency: 障がい者通院休暇
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'disability_leave_frequency'
  ) THEN
    ALTER TABLE contracts ADD COLUMN disability_leave_frequency TEXT;
    COMMENT ON COLUMN contracts.disability_leave_frequency IS '障がい者通院休暇（例: 月2回）';
  END IF;

  -- commuting_allowance_max: 通勤手当月限度額
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'commuting_allowance_max'
  ) THEN
    ALTER TABLE contracts ADD COLUMN commuting_allowance_max DECIMAL(10, 2) DEFAULT 15000;
    COMMENT ON COLUMN contracts.commuting_allowance_max IS '通勤手当月限度額（デフォルト15,000円）';
  END IF;

  -- retirement_age: 定年年齢
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'retirement_age'
  ) THEN
    ALTER TABLE contracts ADD COLUMN retirement_age INTEGER;
    COMMENT ON COLUMN contracts.retirement_age IS '定年年齢（60 or 65、無期のみ）';
  END IF;

  -- retirement_date: 定年日
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'retirement_date'
  ) THEN
    ALTER TABLE contracts ADD COLUMN retirement_date DATE;
    COMMENT ON COLUMN contracts.retirement_date IS '定年日（生年月日＋定年年齢から算出）';
  END IF;

  -- client_holiday_follow: 客先休日に合わせる
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'client_holiday_follow'
  ) THEN
    ALTER TABLE contracts ADD COLUMN client_holiday_follow BOOLEAN NOT NULL DEFAULT false;
    COMMENT ON COLUMN contracts.client_holiday_follow IS '客先休日に合わせる（true=客先カレンダーに準ずる）';
  END IF;

  -- holidays_note: 休日補足
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'holidays_note'
  ) THEN
    ALTER TABLE contracts ADD COLUMN holidays_note TEXT;
    COMMENT ON COLUMN contracts.holidays_note IS '休日補足';
  END IF;

  -- working_hours_note: 勤務時間補足
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'working_hours_note'
  ) THEN
    ALTER TABLE contracts ADD COLUMN working_hours_note TEXT;
    COMMENT ON COLUMN contracts.working_hours_note IS '勤務時間補足';
  END IF;

  -- piecework_shift_pattern: 出来高制勤務パターン
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'piecework_shift_pattern'
  ) THEN
    ALTER TABLE contracts ADD COLUMN piecework_shift_pattern TEXT;
    COMMENT ON COLUMN contracts.piecework_shift_pattern IS '出来高制勤務パターン（1部/2部/3部-1/3部-2/上記以外）';
  END IF;

  -- bonus_clause: 賞与条項
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'bonus_clause'
  ) THEN
    ALTER TABLE contracts ADD COLUMN bonus_clause TEXT DEFAULT '支給する。額については、個人の業務内容、業務の責任の範囲、会社・組織の業績などに基づき、個人ごとに個別に決定する。';
    COMMENT ON COLUMN contracts.bonus_clause IS '賞与条項';
  END IF;

  -- employment_insurance_enrolled: 雇用保険加入（契約単位）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'employment_insurance_enrolled'
  ) THEN
    ALTER TABLE contracts ADD COLUMN employment_insurance_enrolled BOOLEAN NOT NULL DEFAULT false;
    COMMENT ON COLUMN contracts.employment_insurance_enrolled IS '雇用保険加入（契約単位）';
  END IF;

  -- health_insurance_enrolled: 健康保険加入（契約単位）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'health_insurance_enrolled'
  ) THEN
    ALTER TABLE contracts ADD COLUMN health_insurance_enrolled BOOLEAN NOT NULL DEFAULT false;
    COMMENT ON COLUMN contracts.health_insurance_enrolled IS '健康保険加入（契約単位）';
  END IF;

  -- pension_enrolled: 厚生年金加入（契約単位）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'pension_enrolled'
  ) THEN
    ALTER TABLE contracts ADD COLUMN pension_enrolled BOOLEAN NOT NULL DEFAULT false;
    COMMENT ON COLUMN contracts.pension_enrolled IS '厚生年金加入（契約単位）';
  END IF;

  -- pension_fund_enrolled: 厚生年金基金加入（契約単位）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'pension_fund_enrolled'
  ) THEN
    ALTER TABLE contracts ADD COLUMN pension_fund_enrolled BOOLEAN NOT NULL DEFAULT false;
    COMMENT ON COLUMN contracts.pension_fund_enrolled IS '厚生年金基金加入（契約単位）';
  END IF;

  -- eligibility_cert_required: 資格確認書要不要
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'eligibility_cert_required'
  ) THEN
    ALTER TABLE contracts ADD COLUMN eligibility_cert_required BOOLEAN NOT NULL DEFAULT false;
    COMMENT ON COLUMN contracts.eligibility_cert_required IS '資格確認書（紙）要不要';
  END IF;
END $$;

-- ==========================================
-- 3. employee_contacts テーブル拡張（住民票住所）
-- ==========================================
DO $$
BEGIN
  -- resident_address_same: 住民票住所が現住所と同じか
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'employee_contacts' AND column_name = 'resident_address_same'
  ) THEN
    ALTER TABLE employee_contacts ADD COLUMN resident_address_same BOOLEAN NOT NULL DEFAULT true;
    COMMENT ON COLUMN employee_contacts.resident_address_same IS '住民票住所が現住所と同じか';
  END IF;

  -- resident_postal_code
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'employee_contacts' AND column_name = 'resident_postal_code'
  ) THEN
    ALTER TABLE employee_contacts ADD COLUMN resident_postal_code TEXT;
    COMMENT ON COLUMN employee_contacts.resident_postal_code IS '住民票郵便番号';
  END IF;

  -- resident_address1
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'employee_contacts' AND column_name = 'resident_address1'
  ) THEN
    ALTER TABLE employee_contacts ADD COLUMN resident_address1 TEXT;
    COMMENT ON COLUMN employee_contacts.resident_address1 IS '住民票住所1';
  END IF;

  -- resident_address2
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'employee_contacts' AND column_name = 'resident_address2'
  ) THEN
    ALTER TABLE employee_contacts ADD COLUMN resident_address2 TEXT;
    COMMENT ON COLUMN employee_contacts.resident_address2 IS '住民票住所2';
  END IF;

  -- resident_address1_kana
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'employee_contacts' AND column_name = 'resident_address1_kana'
  ) THEN
    ALTER TABLE employee_contacts ADD COLUMN resident_address1_kana TEXT;
    COMMENT ON COLUMN employee_contacts.resident_address1_kana IS '住民票住所1フリガナ';
  END IF;

  -- resident_address2_kana
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'employee_contacts' AND column_name = 'resident_address2_kana'
  ) THEN
    ALTER TABLE employee_contacts ADD COLUMN resident_address2_kana TEXT;
    COMMENT ON COLUMN employee_contacts.resident_address2_kana IS '住民票住所2フリガナ';
  END IF;
END $$;

-- ==========================================
-- 4. export_verification テーブル新規作成（FR-140）
-- ==========================================
CREATE TABLE IF NOT EXISTS export_verification (
  verification_id TEXT PRIMARY KEY,
  export_id TEXT NOT NULL,
  verified_by TEXT NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  import_result TEXT NOT NULL,
  error_details TEXT,
  error_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by TEXT NOT NULL DEFAULT 'system',

  CONSTRAINT chk_import_result CHECK (import_result IN ('success', 'partial', 'failed'))
);

-- user テーブルが存在する場合のみ FK を追加
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user') THEN
    IF NOT EXISTS (
      SELECT FROM information_schema.table_constraints
      WHERE constraint_name = 'fk_export_verification_user' AND table_name = 'export_verification'
    ) THEN
      ALTER TABLE export_verification
      ADD CONSTRAINT fk_export_verification_user
      FOREIGN KEY (verified_by) REFERENCES "user"(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_export_verification_export_id ON export_verification(export_id);
CREATE INDEX IF NOT EXISTS idx_export_verification_verified_at ON export_verification(verified_at DESC);

-- ==========================================
-- 完了メッセージ
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'マイグレーション完了: spec v2 新規データ項目追加';
  RAISE NOTICE '拡張: employees(site_code, rehire_count, original_hire_date, current_hire_date, status拡張)';
  RAISE NOTICE '拡張: contracts(21カラム追加, contract_type拡張)';
  RAISE NOTICE '拡張: employee_contacts(住民票住所6カラム)';
  RAISE NOTICE '新規: export_verification テーブル';
END $$;
