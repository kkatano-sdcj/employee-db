-- employment_history テーブルに契約番号ベースの履歴保存用カラムを追加

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employment_history' AND column_name = 'contract_id'
  ) THEN
    ALTER TABLE employment_history ADD COLUMN contract_id TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employment_history' AND column_name = 'work_condition_snapshot'
  ) THEN
    ALTER TABLE employment_history ADD COLUMN work_condition_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employment_history' AND column_name = 'contract_terms_snapshot'
  ) THEN
    ALTER TABLE employment_history ADD COLUMN contract_terms_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employment_history' AND column_name = 'documents_snapshot'
  ) THEN
    ALTER TABLE employment_history ADD COLUMN documents_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'employment_history' AND constraint_name = 'chk_event_type'
  ) THEN
    ALTER TABLE employment_history DROP CONSTRAINT chk_event_type;
  END IF;
END $$;

ALTER TABLE employment_history
  ADD CONSTRAINT chk_event_type CHECK (event_type IN (
    'HIRE', 'TRANSFER', 'PROMOTION', 'SALARY_INCREASE',
    'SALARY_DECREASE', 'CONCURRENT_POST', 'RETIRE', 'REINSTATE',
    'CONTRACT_UPDATE'
  ));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'employment_history' AND constraint_name = 'fk_employment_history_contract'
  ) THEN
    ALTER TABLE employment_history
      ADD CONSTRAINT fk_employment_history_contract FOREIGN KEY (contract_id)
      REFERENCES contracts(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_employment_history_contract_id
  ON employment_history(contract_id, effective_date DESC);
