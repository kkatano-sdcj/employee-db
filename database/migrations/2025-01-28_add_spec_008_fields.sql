-- ==========================================
-- マイグレーション: spec 008 のデータベース入力項目に対応するフィールド追加
-- 作成日: 2025-01-28
-- 説明: specs/008-comprehensive-spec/spec.md の「データベースへの入力項目」と「入社時登録必須項目」に対応
-- 注意: 個人情報最小化ポリシーにより、住所・電話番号・銀行口座情報は保存しない
-- ==========================================

-- ==========================================
-- 1. employees テーブルにフセン項目を追加
-- ==========================================
DO $$
BEGIN
  -- フセン項目（入社時登録必須項目）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'sticker_item'
  ) THEN
    ALTER TABLE employees ADD COLUMN sticker_item TEXT;
    COMMENT ON COLUMN employees.sticker_item IS 'フセン項目（入社時登録必須項目）';
  END IF;
END $$;

-- ==========================================
-- 2. employee_admin_records テーブルに社会保険・給与関連フィールドを追加
-- ==========================================
DO $$
BEGIN
  -- 健康保険加入区分（入社時登録必須項目）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'employee_admin_records' AND column_name = 'health_insurance_category'
  ) THEN
    ALTER TABLE employee_admin_records ADD COLUMN health_insurance_category TEXT;
    COMMENT ON COLUMN employee_admin_records.health_insurance_category IS '健康保険加入区分（入社時登録必須項目）';
  END IF;

  -- 厚生年金加入区分（入社時登録必須項目）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'employee_admin_records' AND column_name = 'pension_category'
  ) THEN
    ALTER TABLE employee_admin_records ADD COLUMN pension_category TEXT;
    COMMENT ON COLUMN employee_admin_records.pension_category IS '厚生年金加入区分（入社時登録必須項目）';
  END IF;

  -- 基礎年金番号（入社時登録必須項目）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'employee_admin_records' AND column_name = 'basic_pension_number'
  ) THEN
    ALTER TABLE employee_admin_records ADD COLUMN basic_pension_number TEXT;
    COMMENT ON COLUMN employee_admin_records.basic_pension_number IS '基礎年金番号（入社時登録必須項目）';
  END IF;

  -- 厚生年金基金加入区分（入社時登録必須項目）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'employee_admin_records' AND column_name = 'pension_fund_category'
  ) THEN
    ALTER TABLE employee_admin_records ADD COLUMN pension_fund_category TEXT;
    COMMENT ON COLUMN employee_admin_records.pension_fund_category IS '厚生年金基金加入区分（入社時登録必須項目）';
  END IF;

  -- 雇用保険被保険者番号（入社時登録必須項目）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'employee_admin_records' AND column_name = 'employment_insurance_number'
  ) THEN
    ALTER TABLE employee_admin_records ADD COLUMN employment_insurance_number TEXT;
    COMMENT ON COLUMN employee_admin_records.employment_insurance_number IS '雇用保険被保険者番号（入社時登録必須項目）';
  END IF;

  -- 基本給
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'employee_admin_records' AND column_name = 'base_salary'
  ) THEN
    ALTER TABLE employee_admin_records ADD COLUMN base_salary DECIMAL(10, 2);
    COMMENT ON COLUMN employee_admin_records.base_salary IS '基本給';
  END IF;

  -- 通勤費区分（入社時登録必須項目）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'employee_admin_records' AND column_name = 'commuting_expense_category'
  ) THEN
    ALTER TABLE employee_admin_records ADD COLUMN commuting_expense_category TEXT;
    COMMENT ON COLUMN employee_admin_records.commuting_expense_category IS '通勤費区分（入社時登録必須項目）';
  END IF;

  -- 通勤費支払方法
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'employee_admin_records' AND column_name = 'commuting_expense_payment_method'
  ) THEN
    ALTER TABLE employee_admin_records ADD COLUMN commuting_expense_payment_method TEXT;
    COMMENT ON COLUMN employee_admin_records.commuting_expense_payment_method IS '通勤費支払方法';
  END IF;

  -- 日払い支給額
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'employee_admin_records' AND column_name = 'daily_payment_amount'
  ) THEN
    ALTER TABLE employee_admin_records ADD COLUMN daily_payment_amount DECIMAL(10, 2);
    COMMENT ON COLUMN employee_admin_records.daily_payment_amount IS '日払い支給額';
  END IF;
END $$;

-- ==========================================
-- 完了メッセージ
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'spec 008 のデータベース入力項目に対応するフィールド追加が完了しました。';
  RAISE NOTICE '注意: 個人情報最小化ポリシーにより、住所・電話番号・銀行口座情報は保存しません。';
END $$;



