-- ==========================================
-- マイグレーション: spec.md要件に合わせたスキーマ更新
-- 作成日: 2025-01-28
-- 目的: 部門コード制約追加、不要フィールド削除
-- ==========================================

-- ==========================================
-- 1. employees テーブル: 部門コードのCHECK制約追加
-- ==========================================
-- 部門コードはBPS課、オンサイト課、CC課、PS課の4部署のみを許可（FR-001準拠）
DO $$
BEGIN
  -- 既存の制約を削除（存在する場合）
  IF EXISTS (
    SELECT FROM information_schema.table_constraints 
    WHERE constraint_name = 'chk_department_code'
  ) THEN
    ALTER TABLE employees DROP CONSTRAINT chk_department_code;
  END IF;
  
  -- 新しい制約を追加
  ALTER TABLE employees 
  ADD CONSTRAINT chk_department_code 
  CHECK (department_code IN ('BPS課', 'オンサイト課', 'CC課', 'PS課'));
END $$;

-- ==========================================
-- 2. employment_history テーブル: gradeフィールド削除
-- ==========================================
-- 役職・等級はパート従業員には不要なため削除（spec.md準拠）
DO $$
BEGIN
  -- gradeカラムが存在する場合のみ削除
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'employment_history' AND column_name = 'grade'
  ) THEN
    ALTER TABLE employment_history DROP COLUMN grade;
  END IF;
END $$;

-- ==========================================
-- 3. employment_history テーブル: 部門コードのCHECK制約追加
-- ==========================================
-- 部門コードはBPS課、オンサイト課、CC課、PS課のいずれか（NULLも許可）
DO $$
BEGIN
  -- 既存の制約を削除（存在する場合）
  IF EXISTS (
    SELECT FROM information_schema.table_constraints 
    WHERE constraint_name = 'chk_employment_history_department_code'
  ) THEN
    ALTER TABLE employment_history DROP CONSTRAINT chk_employment_history_department_code;
  END IF;
  
  -- 新しい制約を追加
  ALTER TABLE employment_history 
  ADD CONSTRAINT chk_employment_history_department_code 
  CHECK (department_code IS NULL OR department_code IN ('BPS課', 'オンサイト課', 'CC課', 'PS課'));
END $$;

-- ==========================================
-- 4. contracts テーブル: overtime_hourly_wageフィールド追加
-- ==========================================
-- 残業時給は給与・手当タブに表示するため必要（spec.md準拠）
DO $$
BEGIN
  -- overtime_hourly_wageカラムが存在しない場合のみ追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'overtime_hourly_wage'
  ) THEN
    ALTER TABLE contracts ADD COLUMN overtime_hourly_wage DECIMAL(10, 2);
  END IF;
END $$;

-- ==========================================
-- 完了メッセージ
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'マイグレーションが完了しました。spec.md要件に合わせたスキーマ更新を適用しました。';
END $$;

