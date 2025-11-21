-- ==========================================
-- サンプルデータ挿入スクリプト
-- Supabase Dashboard > SQL Editor で実行してください
-- ==========================================

-- ==========================================
-- 1. work_conditionsテーブルにサンプルデータを挿入
-- ==========================================
INSERT INTO work_conditions (id, employee_id, effective_from, effective_to, work_days_type, work_days_count, work_days_count_note, paid_leave_base_date, working_hours_jsonb, break_hours_jsonb, work_locations_jsonb, transportation_routes_jsonb, created_at, updated_at, updated_by)
SELECT 
  'wc-' || e.employee_number,
  e.id,
  CASE e.employee_number
    WHEN 'EMP001' THEN '2024-04-01'::date
    WHEN 'EMP002' THEN '2023-06-01'::date
    WHEN 'EMP003' THEN '2024-01-15'::date
    WHEN 'EMP004' THEN '2022-09-01'::date
    WHEN 'EMP005' THEN '2023-11-01'::date
    WHEN 'EMP006' THEN '2024-03-01'::date
    WHEN 'EMP007' THEN '2023-07-15'::date
    WHEN 'EMP008' THEN '2022-12-01'::date
    WHEN 'EMP009' THEN '2024-05-01'::date
    WHEN 'EMP010' THEN '2023-02-01'::date
  END,
  CASE WHEN e.employee_number = 'EMP004' THEN '2024-10-31'::date ELSE NULL END,
  'WEEKLY',
  CASE e.employee_number
    WHEN 'EMP001' THEN 5 WHEN 'EMP002' THEN 5 WHEN 'EMP003' THEN 3
    WHEN 'EMP004' THEN 5 WHEN 'EMP005' THEN 4 WHEN 'EMP006' THEN 5
    WHEN 'EMP007' THEN 2 WHEN 'EMP008' THEN 5 WHEN 'EMP009' THEN 3
    WHEN 'EMP010' THEN 5
  END,
  CASE e.employee_number
    WHEN 'EMP001' THEN '月曜日から金曜日'
    WHEN 'EMP002' THEN '月曜日から金曜日'
    WHEN 'EMP003' THEN '火曜日、木曜日、金曜日'
    WHEN 'EMP004' THEN '月曜日から金曜日'
    WHEN 'EMP005' THEN '月曜日、水曜日、金曜日、土曜日'
    WHEN 'EMP006' THEN '月曜日から金曜日'
    WHEN 'EMP007' THEN '水曜日、金曜日'
    WHEN 'EMP008' THEN '月曜日から金曜日'
    WHEN 'EMP009' THEN '火曜日、水曜日、木曜日'
    WHEN 'EMP010' THEN '月曜日から金曜日'
  END,
  CASE e.employee_number
    WHEN 'EMP001' THEN '2024-04-01'::date WHEN 'EMP002' THEN '2023-06-01'::date
    WHEN 'EMP003' THEN '2024-01-15'::date WHEN 'EMP004' THEN '2022-09-01'::date
    WHEN 'EMP005' THEN '2023-11-01'::date WHEN 'EMP006' THEN '2024-03-01'::date
    WHEN 'EMP007' THEN '2023-07-15'::date WHEN 'EMP008' THEN '2022-12-01'::date
    WHEN 'EMP009' THEN '2024-05-01'::date WHEN 'EMP010' THEN '2023-02-01'::date
  END,
  CASE e.employee_number
    WHEN 'EMP001' THEN '[{"id":"wh-001","start_time":"09:00:00","end_time":"18:00:00"}]'::jsonb
    WHEN 'EMP002' THEN '[{"id":"wh-002","start_time":"09:00:00","end_time":"18:00:00"}]'::jsonb
    WHEN 'EMP003' THEN '[{"id":"wh-003","start_time":"10:00:00","end_time":"16:00:00"}]'::jsonb
    WHEN 'EMP004' THEN '[{"id":"wh-004","start_time":"09:00:00","end_time":"18:00:00"}]'::jsonb
    WHEN 'EMP005' THEN '[{"id":"wh-005","start_time":"09:30:00","end_time":"17:30:00"}]'::jsonb
    WHEN 'EMP006' THEN '[{"id":"wh-006","start_time":"09:00:00","end_time":"18:00:00"}]'::jsonb
    WHEN 'EMP007' THEN '[{"id":"wh-007","start_time":"10:00:00","end_time":"15:00:00"}]'::jsonb
    WHEN 'EMP008' THEN '[{"id":"wh-008","start_time":"09:00:00","end_time":"18:00:00"}]'::jsonb
    WHEN 'EMP009' THEN '[{"id":"wh-009","start_time":"09:00:00","end_time":"17:00:00"}]'::jsonb
    WHEN 'EMP010' THEN '[{"id":"wh-010","start_time":"09:00:00","end_time":"18:00:00"}]'::jsonb
  END,
  CASE e.employee_number
    WHEN 'EMP001' THEN '[{"id":"bh-001","start_time":"12:00:00","end_time":"13:00:00"}]'::jsonb
    WHEN 'EMP002' THEN '[{"id":"bh-002","start_time":"12:00:00","end_time":"13:00:00"}]'::jsonb
    WHEN 'EMP003' THEN '[{"id":"bh-003","start_time":"13:00:00","end_time":"13:30:00"}]'::jsonb
    WHEN 'EMP004' THEN '[{"id":"bh-004","start_time":"12:00:00","end_time":"13:00:00"}]'::jsonb
    WHEN 'EMP005' THEN '[{"id":"bh-005","start_time":"12:30:00","end_time":"13:30:00"}]'::jsonb
    WHEN 'EMP006' THEN '[{"id":"bh-006","start_time":"12:00:00","end_time":"13:00:00"}]'::jsonb
    WHEN 'EMP007' THEN '[{"id":"bh-007","start_time":"12:30:00","end_time":"13:00:00"}]'::jsonb
    WHEN 'EMP008' THEN '[{"id":"bh-008","start_time":"12:00:00","end_time":"13:00:00"}]'::jsonb
    WHEN 'EMP009' THEN '[{"id":"bh-009","start_time":"12:00:00","end_time":"13:00:00"}]'::jsonb
    WHEN 'EMP010' THEN '[{"id":"bh-010","start_time":"12:00:00","end_time":"13:00:00"}]'::jsonb
  END,
  CASE e.employee_number
    WHEN 'EMP001' THEN '[{"id":"wl-001","location":"本社オフィス"}]'::jsonb
    WHEN 'EMP002' THEN '[{"id":"wl-002","location":"本社オフィス"}]'::jsonb
    WHEN 'EMP003' THEN '[{"id":"wl-003","location":"支社オフィス"}]'::jsonb
    WHEN 'EMP004' THEN '[{"id":"wl-004","location":"本社オフィス"}]'::jsonb
    WHEN 'EMP005' THEN '[{"id":"wl-005","location":"本社オフィス"}]'::jsonb
    WHEN 'EMP006' THEN '[{"id":"wl-006","location":"本社オフィス"}]'::jsonb
    WHEN 'EMP007' THEN '[{"id":"wl-007","location":"支社オフィス"}]'::jsonb
    WHEN 'EMP008' THEN '[{"id":"wl-008","location":"本社オフィス"}]'::jsonb
    WHEN 'EMP009' THEN '[{"id":"wl-009","location":"本社オフィス"}]'::jsonb
    WHEN 'EMP010' THEN '[{"id":"wl-010","location":"本社オフィス"}]'::jsonb
  END,
  CASE e.employee_number
    WHEN 'EMP001' THEN '[{"id":"tr-001","route":"自宅-本社","round_trip_amount":500.00,"monthly_pass_amount":10000.00,"max_amount":15000.00,"nearest_station":"東京駅"}]'::jsonb
    WHEN 'EMP002' THEN '[{"id":"tr-002","route":"自宅-本社","round_trip_amount":600.00,"monthly_pass_amount":12000.00,"max_amount":15000.00,"nearest_station":"新宿駅"}]'::jsonb
    WHEN 'EMP003' THEN '[{"id":"tr-003","route":"自宅-支社","round_trip_amount":400.00,"monthly_pass_amount":8000.00,"max_amount":10000.00,"nearest_station":"渋谷駅"}]'::jsonb
    WHEN 'EMP004' THEN '[{"id":"tr-004","route":"自宅-本社","round_trip_amount":550.00,"monthly_pass_amount":11000.00,"max_amount":15000.00,"nearest_station":"品川駅"}]'::jsonb
    WHEN 'EMP005' THEN '[{"id":"tr-005","route":"自宅-本社","round_trip_amount":450.00,"monthly_pass_amount":9000.00,"max_amount":12000.00,"nearest_station":"上野駅"}]'::jsonb
    WHEN 'EMP006' THEN '[{"id":"tr-006","route":"自宅-本社","round_trip_amount":520.00,"monthly_pass_amount":10400.00,"max_amount":15000.00,"nearest_station":"池袋駅"}]'::jsonb
    WHEN 'EMP007' THEN '[{"id":"tr-007","route":"自宅-支社","round_trip_amount":380.00,"monthly_pass_amount":7600.00,"max_amount":10000.00,"nearest_station":"恵比寿駅"}]'::jsonb
    WHEN 'EMP008' THEN '[{"id":"tr-008","route":"自宅-本社","round_trip_amount":580.00,"monthly_pass_amount":11600.00,"max_amount":15000.00,"nearest_station":"横浜駅"}]'::jsonb
    WHEN 'EMP009' THEN '[{"id":"tr-009","route":"自宅-本社","round_trip_amount":480.00,"monthly_pass_amount":9600.00,"max_amount":12000.00,"nearest_station":"大宮駅"}]'::jsonb
    WHEN 'EMP010' THEN '[{"id":"tr-010","route":"自宅-本社","round_trip_amount":510.00,"monthly_pass_amount":10200.00,"max_amount":15000.00,"nearest_station":"川崎駅"}]'::jsonb
  END,
  NOW(),
  NOW(),
  'system'
FROM employees e
WHERE e.employee_number IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 2. contractsテーブルにサンプルデータを挿入
-- ==========================================
INSERT INTO contracts (id, employee_id, contract_type, contract_start_date, contract_end_date, employment_expiry_scheduled_date, employment_expiry_date, is_renewable, fixed_term_base_date, job_description, hourly_wage, hourly_wage_note, overtime_hourly_wage, paid_leave_clause, termination_alert_flag, status, created_at, updated_at, updated_by)
SELECT 
  'contract-' || e.employee_number,
  e.id,
  CASE WHEN e.employment_type = 'FULL_TIME' THEN 'INDEFINITE' ELSE 'FIXED_TERM' END,
  CASE e.employee_number
    WHEN 'EMP001' THEN '2024-04-01'::date WHEN 'EMP002' THEN '2023-06-01'::date
    WHEN 'EMP003' THEN '2024-01-15'::date WHEN 'EMP004' THEN '2022-09-01'::date
    WHEN 'EMP005' THEN '2023-11-01'::date WHEN 'EMP006' THEN '2024-03-01'::date
    WHEN 'EMP007' THEN '2023-07-15'::date WHEN 'EMP008' THEN '2022-12-01'::date
    WHEN 'EMP009' THEN '2024-05-01'::date WHEN 'EMP010' THEN '2023-02-01'::date
  END,
  CASE e.employee_number
    WHEN 'EMP001' THEN '2025-03-31'::date WHEN 'EMP003' THEN '2024-12-31'::date
    WHEN 'EMP004' THEN '2024-10-31'::date WHEN 'EMP005' THEN '2024-10-31'::date
    WHEN 'EMP007' THEN '2024-07-14'::date WHEN 'EMP009' THEN '2025-04-30'::date
    ELSE NULL
  END,
  CASE e.employee_number
    WHEN 'EMP001' THEN '2025-03-31'::date WHEN 'EMP003' THEN '2024-12-31'::date
    WHEN 'EMP004' THEN '2024-10-31'::date WHEN 'EMP005' THEN '2024-10-31'::date
    WHEN 'EMP007' THEN '2024-07-14'::date WHEN 'EMP009' THEN '2025-04-30'::date
    ELSE NULL
  END,
  CASE WHEN e.employee_number = 'EMP004' THEN '2024-10-31'::date ELSE NULL END,
  CASE WHEN e.employment_type = 'PART_TIME' THEN true ELSE false END,
  CASE WHEN e.employment_type = 'PART_TIME' THEN
    CASE e.employee_number
      WHEN 'EMP001' THEN '2024-04-01'::date WHEN 'EMP003' THEN '2024-01-15'::date
      WHEN 'EMP005' THEN '2023-11-01'::date WHEN 'EMP007' THEN '2023-07-15'::date
      WHEN 'EMP009' THEN '2024-05-01'::date
      ELSE NULL
    END
    ELSE NULL
  END,
  CASE WHEN e.employment_type = 'PART_TIME' THEN 'パートタイム業務全般' ELSE '正社員業務全般' END,
  CASE e.employee_number
    WHEN 'EMP001' THEN 1200.00 WHEN 'EMP002' THEN 2500.00 WHEN 'EMP003' THEN 1150.00
    WHEN 'EMP004' THEN 2400.00 WHEN 'EMP005' THEN 1180.00 WHEN 'EMP006' THEN 2600.00
    WHEN 'EMP007' THEN 1100.00 WHEN 'EMP008' THEN 2450.00 WHEN 'EMP009' THEN 1220.00
    WHEN 'EMP010' THEN 2550.00
  END,
  CASE e.employee_number
    WHEN 'EMP001' THEN '時給1200円' WHEN 'EMP002' THEN '月給制（時給換算2500円）'
    WHEN 'EMP003' THEN '時給1150円' WHEN 'EMP004' THEN '月給制（時給換算2400円）'
    WHEN 'EMP005' THEN '時給1180円' WHEN 'EMP006' THEN '月給制（時給換算2600円）'
    WHEN 'EMP007' THEN '時給1100円' WHEN 'EMP008' THEN '月給制（時給換算2450円）'
    WHEN 'EMP009' THEN '時給1220円' WHEN 'EMP010' THEN '月給制（時給換算2550円）'
  END,
  CASE e.employee_number
    WHEN 'EMP001' THEN 1800.00 WHEN 'EMP002' THEN 3750.00 WHEN 'EMP003' THEN 1725.00
    WHEN 'EMP004' THEN 3600.00 WHEN 'EMP005' THEN 1770.00 WHEN 'EMP006' THEN 3900.00
    WHEN 'EMP007' THEN 1650.00 WHEN 'EMP008' THEN 3675.00 WHEN 'EMP009' THEN 1830.00
    WHEN 'EMP010' THEN 3825.00
  END,
  '有給休暇は勤続6ヶ月以上で付与',
  CASE WHEN e.employee_number = 'EMP005' THEN true ELSE false END,
  'SUBMITTED',
  NOW(),
  NOW(),
  'system'
FROM employees e
WHERE e.employee_number IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 3. employment_historyテーブルにサンプルデータを挿入
-- ==========================================
INSERT INTO employment_history (id, employee_id, contract_id, effective_date, event_type, department_code, paid_leave_days, hourly_wage, work_condition_snapshot, contract_terms_snapshot, documents_snapshot, remarks, created_at, updated_at, updated_by)
VALUES
('eh-EMP001-001', (SELECT id FROM employees WHERE employee_number = 'EMP001'), 'contract-EMP001', '2024-04-01', 'HIRE', 'BPS課', 10, 1200.00, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '入社', NOW(), NOW(), 'system'),
('eh-EMP002-001', (SELECT id FROM employees WHERE employee_number = 'EMP002'), 'contract-EMP002', '2023-06-01', 'HIRE', 'BPS課', 10, 2500.00, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '入社', NOW(), NOW(), 'system'),
('eh-EMP002-002', (SELECT id FROM employees WHERE employee_number = 'EMP002'), 'contract-EMP002', '2024-01-01', 'SALARY_INCREASE', 'BPS課', NULL, 2600.00, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '昇給', NOW(), NOW(), 'system'),
('eh-EMP003-001', (SELECT id FROM employees WHERE employee_number = 'EMP003'), 'contract-EMP003', '2024-01-15', 'HIRE', 'オンサイト課', 10, 1150.00, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '入社', NOW(), NOW(), 'system'),
('eh-EMP004-001', (SELECT id FROM employees WHERE employee_number = 'EMP004'), 'contract-EMP004', '2022-09-01', 'HIRE', 'オンサイト課', 10, 2400.00, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '入社', NOW(), NOW(), 'system'),
('eh-EMP004-002', (SELECT id FROM employees WHERE employee_number = 'EMP004'), 'contract-EMP004', '2023-04-01', 'TRANSFER', 'オンサイト課', NULL, 2400.00, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '異動', NOW(), NOW(), 'system'),
('eh-EMP004-003', (SELECT id FROM employees WHERE employee_number = 'EMP004'), 'contract-EMP004', '2024-10-31', 'RETIRE', 'オンサイト課', NULL, 2400.00, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '退職', NOW(), NOW(), 'system'),
('eh-EMP005-001', (SELECT id FROM employees WHERE employee_number = 'EMP005'), 'contract-EMP005', '2023-11-01', 'HIRE', 'CC課', 10, 1180.00, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '入社', NOW(), NOW(), 'system'),
('eh-EMP005-002', (SELECT id FROM employees WHERE employee_number = 'EMP005'), 'contract-EMP005', '2024-06-01', 'SALARY_INCREASE', 'CC課', NULL, 1200.00, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '昇給', NOW(), NOW(), 'system'),
('eh-EMP006-001', (SELECT id FROM employees WHERE employee_number = 'EMP006'), 'contract-EMP006', '2024-03-01', 'HIRE', 'BPS課', 10, 2600.00, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '入社', NOW(), NOW(), 'system'),
('eh-EMP007-001', (SELECT id FROM employees WHERE employee_number = 'EMP007'), 'contract-EMP007', '2023-07-15', 'HIRE', 'CC課', 10, 1100.00, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '入社', NOW(), NOW(), 'system'),
('eh-EMP008-001', (SELECT id FROM employees WHERE employee_number = 'EMP008'), 'contract-EMP008', '2022-12-01', 'HIRE', 'PS課', 10, 2450.00, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '入社', NOW(), NOW(), 'system'),
('eh-EMP008-002', (SELECT id FROM employees WHERE employee_number = 'EMP008'), 'contract-EMP008', '2023-10-01', 'PROMOTION', 'PS課', NULL, 2450.00, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '昇格', NOW(), NOW(), 'system'),
('eh-EMP009-001', (SELECT id FROM employees WHERE employee_number = 'EMP009'), 'contract-EMP009', '2024-05-01', 'HIRE', 'PS課', 10, 1220.00, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '入社', NOW(), NOW(), 'system'),
('eh-EMP010-001', (SELECT id FROM employees WHERE employee_number = 'EMP010'), 'contract-EMP010', '2023-02-01', 'HIRE', 'CC課', 10, 2550.00, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '入社', NOW(), NOW(), 'system'),
('eh-EMP010-002', (SELECT id FROM employees WHERE employee_number = 'EMP010'), 'contract-EMP010', '2024-01-01', 'SALARY_INCREASE', 'CC課', NULL, 2550.00, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '昇給', NOW(), NOW(), 'system')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 4. employee_admin_recordsテーブルにサンプルデータを挿入
-- ==========================================
INSERT INTO employee_admin_records (id, employee_id, tax_withholding_category, employment_insurance, employment_insurance_card_submitted, social_insurance, pension_book_submitted, health_insurance_card_submitted, submitted_to_admin_on, returned_to_employee, expiration_notice_issued, resignation_letter_submitted, return_health_insurance_card, return_security_card, notes, created_at, updated_at, updated_by)
SELECT 
  'ear-' || e.employee_number,
  e.id,
  CASE WHEN MOD(CAST(SUBSTRING(e.employee_number, 4) AS INTEGER), 2) = 1 THEN '甲' ELSE '乙' END,
  '加入済み',
  CASE e.employee_number
    WHEN 'EMP001' THEN '2024-04-05'::date WHEN 'EMP002' THEN '2023-06-05'::date
    WHEN 'EMP003' THEN '2024-01-20'::date WHEN 'EMP004' THEN '2022-09-05'::date
    WHEN 'EMP005' THEN '2023-11-05'::date WHEN 'EMP006' THEN '2024-03-05'::date
    WHEN 'EMP007' THEN '2023-07-20'::date WHEN 'EMP008' THEN '2022-12-05'::date
    WHEN 'EMP009' THEN '2024-05-05'::date WHEN 'EMP010' THEN '2023-02-05'::date
  END,
  '加入済み',
  CASE e.employee_number
    WHEN 'EMP001' THEN '2024-04-05'::date WHEN 'EMP002' THEN '2023-06-05'::date
    WHEN 'EMP003' THEN '2024-01-20'::date WHEN 'EMP004' THEN '2022-09-05'::date
    WHEN 'EMP005' THEN '2023-11-05'::date WHEN 'EMP006' THEN '2024-03-05'::date
    WHEN 'EMP007' THEN '2023-07-20'::date WHEN 'EMP008' THEN '2022-12-05'::date
    WHEN 'EMP009' THEN '2024-05-05'::date WHEN 'EMP010' THEN '2023-02-05'::date
  END,
  CASE e.employee_number
    WHEN 'EMP001' THEN '2024-04-05'::date WHEN 'EMP002' THEN '2023-06-05'::date
    WHEN 'EMP003' THEN '2024-01-20'::date WHEN 'EMP004' THEN '2022-09-05'::date
    WHEN 'EMP005' THEN '2023-11-05'::date WHEN 'EMP006' THEN '2024-03-05'::date
    WHEN 'EMP007' THEN '2023-07-20'::date WHEN 'EMP008' THEN '2022-12-05'::date
    WHEN 'EMP009' THEN '2024-05-05'::date WHEN 'EMP010' THEN '2023-02-05'::date
  END,
  CASE e.employee_number
    WHEN 'EMP001' THEN '2024-04-05'::date WHEN 'EMP002' THEN '2023-06-05'::date
    WHEN 'EMP003' THEN '2024-01-20'::date WHEN 'EMP004' THEN '2022-09-05'::date
    WHEN 'EMP005' THEN '2023-11-05'::date WHEN 'EMP006' THEN '2024-03-05'::date
    WHEN 'EMP007' THEN '2023-07-20'::date WHEN 'EMP008' THEN '2022-12-05'::date
    WHEN 'EMP009' THEN '2024-05-05'::date WHEN 'EMP010' THEN '2023-02-05'::date
  END,
  NULL,
  NULL,
  CASE WHEN e.employee_number = 'EMP004' THEN '2024-10-31' ELSE NULL END,
  CASE e.employee_number
    WHEN 'EMP001' THEN '2024-04-05' WHEN 'EMP002' THEN '2023-06-05'
    WHEN 'EMP003' THEN '2024-01-20' WHEN 'EMP004' THEN '2024-10-31'
    WHEN 'EMP005' THEN '2023-11-05' WHEN 'EMP006' THEN '2024-03-05'
    WHEN 'EMP007' THEN '2023-07-20' WHEN 'EMP008' THEN '2022-12-05'
    WHEN 'EMP009' THEN '2024-05-05' WHEN 'EMP010' THEN '2023-02-05'
  END,
  CASE WHEN e.employee_number = 'EMP004' THEN '2024-11-05' ELSE NULL END,
  CASE WHEN e.employee_number = 'EMP004' THEN '2024-11-05' ELSE NULL END,
  CASE WHEN e.employee_number = 'EMP004' THEN '退職手続き完了' ELSE '特記事項なし' END,
  NOW(),
  NOW(),
  'system'
FROM employees e
WHERE e.employee_number IN ('EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010')
ON CONFLICT (id) DO NOTHING;
