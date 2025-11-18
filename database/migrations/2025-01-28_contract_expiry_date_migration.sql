-- ==========================================
-- マイグレーション: 契約テーブルの雇用満了日管理機能
-- 作成日: 2025-01-28
-- 目的: specs/002-contract-expiry-date/spec.md に準拠したスキーマ変更
-- ==========================================

-- ==========================================
-- 1. contracts テーブル: 新しいフィールドの追加
-- ==========================================
-- employment_expiry_scheduled_date（雇用満了予定日）を追加
DO $$
BEGIN
  -- employment_expiry_scheduled_dateカラムが存在しない場合のみ追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'employment_expiry_scheduled_date'
  ) THEN
    ALTER TABLE contracts ADD COLUMN employment_expiry_scheduled_date DATE;
  END IF;
END $$;

-- employment_expiry_date（実際の雇用満了日、任意項目）を追加
DO $$
BEGIN
  -- employment_expiry_dateカラムが存在しない場合のみ追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name = 'employment_expiry_date'
  ) THEN
    ALTER TABLE contracts ADD COLUMN employment_expiry_date DATE;
  END IF;
END $$;

-- ==========================================
-- 2. 既存データの移行（FR-009）
-- ==========================================
-- contract_end_dateの値をemployment_expiry_scheduled_dateにコピー
UPDATE contracts 
SET employment_expiry_scheduled_date = contract_end_date 
WHERE contract_end_date IS NOT NULL 
  AND employment_expiry_scheduled_date IS NULL;

-- ==========================================
-- 3. バリデーション制約の追加
-- ==========================================
-- employment_expiry_scheduled_dateはcontract_start_dateより後の日付であることを検証（FR-005）
DO $$
BEGIN
  -- 既存の制約を削除（存在する場合）
  IF EXISTS (
    SELECT FROM information_schema.table_constraints 
    WHERE constraint_name = 'chk_contract_expiry_scheduled_date'
  ) THEN
    ALTER TABLE contracts DROP CONSTRAINT chk_contract_expiry_scheduled_date;
  END IF;
  
  -- 新しい制約を追加
  ALTER TABLE contracts 
  ADD CONSTRAINT chk_contract_expiry_scheduled_date 
  CHECK (
    employment_expiry_scheduled_date IS NULL 
    OR employment_expiry_scheduled_date > contract_start_date
  );
END $$;

-- employment_expiry_dateはcontract_start_dateより後の日付であることを検証（FR-006）
DO $$
BEGIN
  -- 既存の制約を削除（存在する場合）
  IF EXISTS (
    SELECT FROM information_schema.table_constraints 
    WHERE constraint_name = 'chk_contract_expiry_date'
  ) THEN
    ALTER TABLE contracts DROP CONSTRAINT chk_contract_expiry_date;
  END IF;
  
  -- 新しい制約を追加
  ALTER TABLE contracts 
  ADD CONSTRAINT chk_contract_expiry_date 
  CHECK (
    employment_expiry_date IS NULL 
    OR employment_expiry_date >= contract_start_date
  );
END $$;

-- ==========================================
-- 4. インデックスの更新
-- ==========================================
-- 契約更新アラート用のインデックスをemployment_expiry_scheduled_dateベースに変更
-- 既存のインデックスを削除（存在する場合）
DROP INDEX IF EXISTS idx_contracts_status_end_date;

-- 新しいインデックスを作成（employment_expiry_scheduled_dateベース）
CREATE INDEX IF NOT EXISTS idx_contracts_expiry_scheduled_date 
ON contracts(employment_expiry_scheduled_date) 
WHERE termination_alert_flag = true 
  AND employment_expiry_scheduled_date IS NOT NULL;

-- 契約更新アラート用の複合インデックス（status + employment_expiry_scheduled_date）
CREATE INDEX IF NOT EXISTS idx_contracts_status_expiry_scheduled 
ON contracts(status, employment_expiry_scheduled_date) 
WHERE termination_alert_flag = true 
  AND employment_expiry_scheduled_date IS NOT NULL;

-- ==========================================
-- 5. contract_end_dateフィールドの削除（段階的移行のためコメントアウト）
-- ==========================================
-- 注意: 後方互換性のため、contract_end_dateは当面の間保持します
-- 将来的に削除する場合は、以下のコマンドを実行してください：
-- 
-- DO $$
-- BEGIN
--   IF EXISTS (
--     SELECT FROM information_schema.columns 
--     WHERE table_name = 'contracts' AND column_name = 'contract_end_date'
--   ) THEN
--     ALTER TABLE contracts DROP COLUMN contract_end_date;
--   END IF;
-- END $$;

-- ==========================================
-- 完了メッセージ
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'マイグレーションが完了しました。contractsテーブルに雇用満了予定日・雇用満了日フィールドを追加し、既存データを移行しました。';
END $$;

