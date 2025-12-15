-- ==========================================
-- マイグレーション: employment_history テーブルに approval_number フィールドを追加
-- 作成日: 2025-01-28
-- 説明: specs/008-comprehensive-spec/spec.md の FR-094, FR-095 に対応
--       契約履歴タブで承認番号を表示するため、employment_history テーブルに承認番号フィールドを追加
-- ==========================================

-- ==========================================
-- 1. employment_history テーブルに approval_number カラムを追加
-- ==========================================
DO $$
BEGIN
  -- 承認番号フィールド（任意項目）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'employment_history' AND column_name = 'approval_number'
  ) THEN
    ALTER TABLE employment_history ADD COLUMN approval_number TEXT;
    COMMENT ON COLUMN employment_history.approval_number IS '承認番号（契約作成・更新時に入力、FR-094/FR-095準拠）';
  END IF;
END $$;

-- ==========================================
-- 2. インデックスの追加（承認番号での検索を高速化）
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_employment_history_approval_number 
ON employment_history(approval_number) 
WHERE approval_number IS NOT NULL;

-- ==========================================
-- 完了メッセージ
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'employment_history テーブルに approval_number フィールドを追加しました。';
  RAISE NOTICE 'FR-094, FR-095 の要件に対応: 契約履歴タブで承認番号を表示できるようになりました。';
END $$;



