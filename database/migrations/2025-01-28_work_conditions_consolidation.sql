-- ==========================================
-- マイグレーション: 勤務条件テーブルの統合
-- 作成日: 2025-01-28
-- 目的: specs/003-work-conditions-consolidation/spec.md に準拠したスキーマ変更
-- ==========================================

-- ==========================================
-- 1. work_conditions テーブル: JSONBカラムの追加
-- ==========================================
-- 統合構造として、勤務時間帯、休憩時間帯、勤務場所、交通費情報をJSONBで保存
DO $$
BEGIN
  -- working_hours_jsonbカラムが存在しない場合のみ追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'work_conditions' AND column_name = 'working_hours_jsonb'
  ) THEN
    ALTER TABLE work_conditions ADD COLUMN working_hours_jsonb JSONB DEFAULT '[]'::jsonb;
  END IF;
  
  -- break_hours_jsonbカラムが存在しない場合のみ追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'work_conditions' AND column_name = 'break_hours_jsonb'
  ) THEN
    ALTER TABLE work_conditions ADD COLUMN break_hours_jsonb JSONB DEFAULT '[]'::jsonb;
  END IF;
  
  -- work_locations_jsonbカラムが存在しない場合のみ追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'work_conditions' AND column_name = 'work_locations_jsonb'
  ) THEN
    ALTER TABLE work_conditions ADD COLUMN work_locations_jsonb JSONB DEFAULT '[]'::jsonb;
  END IF;
  
  -- transportation_routes_jsonbカラムが存在しない場合のみ追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'work_conditions' AND column_name = 'transportation_routes_jsonb'
  ) THEN
    ALTER TABLE work_conditions ADD COLUMN transportation_routes_jsonb JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- ==========================================
-- 2. 既存データの移行（子テーブルからJSONBへ）
-- ==========================================
-- working_hoursテーブルのデータをJSONBに移行
UPDATE work_conditions wc
SET working_hours_jsonb = (
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', wh.id,
      'start_time', wh.start_time::text,
      'end_time', wh.end_time::text
    ) ORDER BY wh.start_time
  ), '[]'::jsonb)
  FROM working_hours wh
  WHERE wh.work_condition_id = wc.id
)
WHERE EXISTS (
  SELECT 1 FROM working_hours wh WHERE wh.work_condition_id = wc.id
);

-- break_hoursテーブルのデータをJSONBに移行
UPDATE work_conditions wc
SET break_hours_jsonb = (
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', bh.id,
      'start_time', bh.start_time::text,
      'end_time', bh.end_time::text
    ) ORDER BY bh.start_time
  ), '[]'::jsonb)
  FROM break_hours bh
  WHERE bh.work_condition_id = wc.id
)
WHERE EXISTS (
  SELECT 1 FROM break_hours bh WHERE bh.work_condition_id = wc.id
);

-- work_locationsテーブルのデータをJSONBに移行
UPDATE work_conditions wc
SET work_locations_jsonb = (
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', wl.id,
      'location', wl.location
    ) ORDER BY wl.location
  ), '[]'::jsonb)
  FROM work_locations wl
  WHERE wl.work_condition_id = wc.id
)
WHERE EXISTS (
  SELECT 1 FROM work_locations wl WHERE wl.work_condition_id = wc.id
);

-- transportation_routesテーブルのデータをJSONBに移行
UPDATE work_conditions wc
SET transportation_routes_jsonb = (
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', tr.id,
      'route', tr.route,
      'round_trip_amount', tr.round_trip_amount,
      'monthly_pass_amount', tr.monthly_pass_amount,
      'max_amount', tr.max_amount,
      'nearest_station', tr.nearest_station
    ) ORDER BY tr.route
  ), '[]'::jsonb)
  FROM transportation_routes tr
  WHERE tr.work_condition_id = wc.id
)
WHERE EXISTS (
  SELECT 1 FROM transportation_routes tr WHERE tr.work_condition_id = wc.id
);

-- ==========================================
-- 3. JSONBカラムのデフォルト値設定
-- ==========================================
-- NULLの場合は空配列に設定
UPDATE work_conditions 
SET working_hours_jsonb = '[]'::jsonb 
WHERE working_hours_jsonb IS NULL;

UPDATE work_conditions 
SET break_hours_jsonb = '[]'::jsonb 
WHERE break_hours_jsonb IS NULL;

UPDATE work_conditions 
SET work_locations_jsonb = '[]'::jsonb 
WHERE work_locations_jsonb IS NULL;

UPDATE work_conditions 
SET transportation_routes_jsonb = '[]'::jsonb 
WHERE transportation_routes_jsonb IS NULL;

-- ==========================================
-- 4. JSONBカラムのNOT NULL制約追加（デフォルト値があるため安全）
-- ==========================================
DO $$
BEGIN
  -- working_hours_jsonbのNOT NULL制約
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'work_conditions' 
    AND column_name = 'working_hours_jsonb' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE work_conditions ALTER COLUMN working_hours_jsonb SET NOT NULL;
  END IF;
  
  -- break_hours_jsonbのNOT NULL制約
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'work_conditions' 
    AND column_name = 'break_hours_jsonb' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE work_conditions ALTER COLUMN break_hours_jsonb SET NOT NULL;
  END IF;
  
  -- work_locations_jsonbのNOT NULL制約
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'work_conditions' 
    AND column_name = 'work_locations_jsonb' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE work_conditions ALTER COLUMN work_locations_jsonb SET NOT NULL;
  END IF;
  
  -- transportation_routes_jsonbのNOT NULL制約
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'work_conditions' 
    AND column_name = 'transportation_routes_jsonb' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE work_conditions ALTER COLUMN transportation_routes_jsonb SET NOT NULL;
  END IF;
END $$;

-- ==========================================
-- 5. JSONBカラムのインデックス追加（検索・フィルタリング用）
-- ==========================================
-- GINインデックスでJSONBの検索を高速化
CREATE INDEX IF NOT EXISTS idx_work_conditions_working_hours_jsonb 
ON work_conditions USING GIN (working_hours_jsonb);

CREATE INDEX IF NOT EXISTS idx_work_conditions_break_hours_jsonb 
ON work_conditions USING GIN (break_hours_jsonb);

CREATE INDEX IF NOT EXISTS idx_work_conditions_work_locations_jsonb 
ON work_conditions USING GIN (work_locations_jsonb);

CREATE INDEX IF NOT EXISTS idx_work_conditions_transportation_routes_jsonb 
ON work_conditions USING GIN (transportation_routes_jsonb);

-- ==========================================
-- 6. 子テーブルの削除（統合完了後）
-- ==========================================
-- データ移行が完了したら、子テーブルを削除して1つのテーブルに統合
-- 外部キー制約があるため、CASCADEで削除

-- インデックスの削除
DROP INDEX IF EXISTS idx_working_hours_work_condition_id;
DROP INDEX IF EXISTS idx_break_hours_work_condition_id;
DROP INDEX IF EXISTS idx_work_locations_work_condition_id;
DROP INDEX IF EXISTS idx_transportation_routes_work_condition_id;

-- テーブルの削除
DROP TABLE IF EXISTS working_hours CASCADE;
DROP TABLE IF EXISTS break_hours CASCADE;
DROP TABLE IF EXISTS work_locations CASCADE;
DROP TABLE IF EXISTS transportation_routes CASCADE;

-- ==========================================
-- 完了メッセージ
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'マイグレーションが完了しました。work_conditionsテーブルにJSONBカラムを追加し、既存データを移行しました。子テーブルを削除して1つのテーブルに統合しました。';
END $$;

