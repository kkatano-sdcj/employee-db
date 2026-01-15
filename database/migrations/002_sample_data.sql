-- ==========================================
-- サンプルデータ投入
-- 目的: 開発・テスト用のサンプルデータを登録
-- 実行方法: Supabase Dashboard > SQL Editor で実行
-- ==========================================

-- ==========================================
-- 1. 従業員サンプルデータ
-- ==========================================

-- 既存データを削除してから挿入（クリーンな状態で開始）
DELETE FROM employee_admin_records WHERE employee_id LIKE 'emp-%';
DELETE FROM employment_history WHERE employee_id LIKE 'emp-%';
DELETE FROM contracts WHERE employee_id LIKE 'emp-%';
DELETE FROM work_conditions WHERE employee_id LIKE 'emp-%';
DELETE FROM employee_bank_accounts WHERE employee_id LIKE 'emp-%';
DELETE FROM employee_contacts WHERE employee_id LIKE 'emp-%';
DELETE FROM employees WHERE id LIKE 'emp-%';

-- 従業員1: BPS課所属
INSERT INTO employees (
  id, employee_number, branch_number, name, name_kana, sticker_item, gender, 
  birth_date, nationality, hired_at, rehired_at, retired_at, 
  employment_type, employment_status, department_code, my_number, 
  created_at, updated_at, updated_by
) VALUES (
  'emp-001', 'BPS0001', 0, '山田 太郎', 'ヤマダ タロウ', NULL, 'MALE',
  '1990-05-15', '日本', '2023-04-01', NULL, NULL,
  'PART_TIME', 'ACTIVE', 'BPS課', NULL, 
  NOW(), NOW(), 'system'
);

-- 従業員2: オンサイト課所属
INSERT INTO employees (
  id, employee_number, branch_number, name, name_kana, sticker_item, gender, 
  birth_date, nationality, hired_at, rehired_at, retired_at, 
  employment_type, employment_status, department_code, my_number, 
  created_at, updated_at, updated_by
) VALUES (
  'emp-002', 'ONS0001', 0, '佐藤 花子', 'サトウ ハナコ', NULL, 'FEMALE',
  '1985-08-20', '日本', '2022-10-01', NULL, NULL,
  'PART_TIME', 'ACTIVE', 'オンサイト課', NULL, 
  NOW(), NOW(), 'system'
);

-- 従業員3: CC課所属
INSERT INTO employees (
  id, employee_number, branch_number, name, name_kana, sticker_item, gender, 
  birth_date, nationality, hired_at, rehired_at, retired_at, 
  employment_type, employment_status, department_code, my_number, 
  created_at, updated_at, updated_by
) VALUES (
  'emp-003', 'CC0001', 0, '鈴木 一郎', 'スズキ イチロウ', NULL, 'MALE',
  '1995-12-10', '日本', '2024-01-15', NULL, NULL,
  'CONTRACT', 'ACTIVE', 'CC課', NULL, 
  NOW(), NOW(), 'system'
);

-- 従業員4: PS課所属（再入社あり）
INSERT INTO employees (
  id, employee_number, branch_number, name, name_kana, sticker_item, gender, 
  birth_date, nationality, hired_at, rehired_at, retired_at, 
  employment_type, employment_status, department_code, my_number, 
  created_at, updated_at, updated_by
) VALUES (
  'emp-004', 'PS0001', 1, '田中 美咲', 'タナカ ミサキ', NULL, 'FEMALE',
  '1992-03-25', '日本', '2021-06-01', '2024-04-01', NULL,
  'PART_TIME', 'ACTIVE', 'PS課', NULL, 
  NOW(), NOW(), 'system'
);

-- 従業員5: BPS課所属（休職中）
INSERT INTO employees (
  id, employee_number, branch_number, name, name_kana, sticker_item, gender, 
  birth_date, nationality, hired_at, rehired_at, retired_at, 
  employment_type, employment_status, department_code, my_number, 
  created_at, updated_at, updated_by
) VALUES (
  'emp-005', 'BPS0002', 0, '高橋 健太', 'タカハシ ケンタ', NULL, 'MALE',
  '1988-11-30', '日本', '2020-09-01', NULL, NULL,
  'FULL_TIME', 'ON_LEAVE', 'BPS課', NULL, 
  NOW(), NOW(), 'system'
);

-- ==========================================
-- 2. 連絡先サンプルデータ
-- ==========================================

INSERT INTO employee_contacts (
  id, employee_id, postal_code, address1, address2, address1_kana, address2_kana, phone1, email1, 
  created_at, updated_at, updated_by
) VALUES 
  ('contact-001', 'emp-001', '100-0001', '東京都千代田区千代田1-1', 'サンプルマンション101', 'トウキョウトチヨダクチヨダ', 'サンプルマンション101', '090-1234-5678', 'yamada@example.com', NOW(), NOW(), 'system'),
  ('contact-002', 'emp-002', '150-0002', '東京都渋谷区渋谷2-2-2', 'テストビル202', 'トウキョウトシブヤクシブヤ', 'テストビル202', '080-2345-6789', 'sato@example.com', NOW(), NOW(), 'system'),
  ('contact-003', 'emp-003', '160-0003', '東京都新宿区新宿3-3-3', NULL, 'トウキョウトシンジュククシンジュク', NULL, '070-3456-7890', 'suzuki@example.com', NOW(), NOW(), 'system');

-- ==========================================
-- 3. 銀行口座サンプルデータ
-- ==========================================

INSERT INTO employee_bank_accounts (
  id, employee_id, payment_priority, handling_category, payment_category,
  bank_code, bank_name, branch_code, branch_name, deposit_type, 
  account_number, account_holder_name, is_active, 
  created_at, updated_at, updated_by
) VALUES 
  ('bank-001', 'emp-001', 1, '振込', '給与', '0001', '三菱UFJ銀行', '001', '本店', 'SAVINGS', '1234567', 'ヤマダ タロウ', true, NOW(), NOW(), 'system'),
  ('bank-002', 'emp-002', 1, '振込', '給与', '0009', 'みずほ銀行', '002', '渋谷支店', 'SAVINGS', '2345678', 'サトウ ハナコ', true, NOW(), NOW(), 'system'),
  ('bank-003', 'emp-003', 1, '振込', '給与', '0005', '三井住友銀行', '003', '新宿支店', 'SAVINGS', '3456789', 'スズキ イチロウ', true, NOW(), NOW(), 'system'),
  ('bank-004', 'emp-004', 1, '振込', '給与', '0001', '三菱UFJ銀行', '010', '池袋支店', 'SAVINGS', '4567890', 'タナカ ミサキ', true, NOW(), NOW(), 'system');

-- ==========================================
-- 4. 勤務条件サンプルデータ
-- ==========================================

INSERT INTO work_conditions (
  id, employee_id, effective_from, effective_to, work_days_type, work_days_count, 
  work_days_count_note, holidays_jsonb, holidays_note, paid_leave_base_date,
  working_hours_jsonb, break_hours_jsonb, work_locations_jsonb, transportation_routes_jsonb, 
  created_at, updated_at, updated_by
) VALUES 
  (
    'wc-001', 'emp-001', '2023-04-01', NULL, 'WEEKLY', 5, 
    '月〜金勤務', 
    '[{"day": "SATURDAY"}, {"day": "SUNDAY"}, {"type": "HOLIDAY"}]'::jsonb,
    '土日祝日休み',
    '2023-04-01',
    '[{"id": "wh-1", "start_time": "09:00", "end_time": "18:00"}]'::jsonb,
    '[{"id": "bh-1", "start_time": "12:00", "end_time": "13:00"}]'::jsonb,
    '[{"id": "wl-1", "location": "本社オフィス"}]'::jsonb,
    '[{"id": "tr-1", "commute_type": "PUBLIC_TRANSPORT", "route": "JR山手線 渋谷駅→東京駅", "round_trip_amount": 500, "monthly_pass_amount": 10000, "max_amount": 15000, "nearest_station": "渋谷駅"}]'::jsonb,
    NOW(), NOW(), 'system'
  ),
  (
    'wc-002', 'emp-002', '2022-10-01', NULL, 'WEEKLY', 4, 
    '週4日勤務', 
    '[{"day": "WEDNESDAY"}, {"day": "SATURDAY"}, {"day": "SUNDAY"}]'::jsonb,
    '水土日休み',
    '2022-10-01',
    '[{"id": "wh-2", "start_time": "10:00", "end_time": "16:00"}]'::jsonb,
    '[{"id": "bh-2", "start_time": "12:30", "end_time": "13:00"}]'::jsonb,
    '[{"id": "wl-2", "location": "クライアント先A"}]'::jsonb,
    '[{"id": "tr-2", "commute_type": "CAR", "route": "自宅→クライアント先A", "round_trip_amount": 0, "monthly_pass_amount": 0, "max_amount": 0, "nearest_station": "", "distance_km": 15.5}]'::jsonb,
    NOW(), NOW(), 'system'
  ),
  (
    'wc-003', 'emp-003', '2024-01-15', NULL, 'SHIFT', 5, 
    'シフト制', 
    '[]'::jsonb,
    'シフトによる',
    '2024-01-15',
    '[{"id": "wh-3a", "start_time": "08:00", "end_time": "17:00"}, {"id": "wh-3b", "start_time": "13:00", "end_time": "22:00"}]'::jsonb,
    '[{"id": "bh-3", "start_time": "12:00", "end_time": "13:00"}]'::jsonb,
    '[{"id": "wl-3", "location": "コールセンター"}]'::jsonb,
    '[{"id": "tr-3", "commute_type": "PUBLIC_TRANSPORT", "route": "東京メトロ 新宿駅→池袋駅", "round_trip_amount": 400, "monthly_pass_amount": 8000, "max_amount": 12000, "nearest_station": "新宿駅"}]'::jsonb,
    NOW(), NOW(), 'system'
  );

-- ==========================================
-- 5. 契約サンプルデータ
-- ==========================================

INSERT INTO contracts (
  id, employee_id, contract_type, wage_type, contract_start_date, contract_end_date,
  employment_expiry_scheduled_date, employment_expiry_date, is_renewable, fixed_term_base_date,
  job_description, hourly_wage, sub_leader_allowance_amount, perfect_attendance_allowance_eligible,
  hourly_wage_note, overtime_hourly_wage, paid_leave_clause, termination_alert_flag, status, 
  created_at, updated_at, updated_by
) VALUES 
  (
    'BPS0001-CON00001', 'emp-001', 'FIXED_TERM', 'HOURLY', '2023-04-01', '2024-03-31',
    '2024-03-31', NULL, true, '2023-04-01',
    'データ入力業務', 1200.00, NULL, false,
    NULL, 1500.00, '法定通り', true, 'SUBMITTED', 
    NOW(), NOW(), 'system'
  ),
  (
    'ONS0001-CON00001', 'emp-002', 'FIXED_TERM', 'HOURLY', '2022-10-01', '2025-09-30',
    '2025-09-30', NULL, true, '2022-10-01',
    'クライアント先常駐業務', 1500.00, 200.00, true,
    'サブリーダー手当含む', 1875.00, '法定通り', true, 'SUBMITTED', 
    NOW(), NOW(), 'system'
  ),
  (
    'CC0001-CON00001', 'emp-003', 'FIXED_TERM', 'HOURLY', '2024-01-15', '2025-01-14',
    '2025-01-14', NULL, true, '2024-01-15',
    'カスタマーサポート業務', 1300.00, NULL, true,
    NULL, 1625.00, '法定通り', true, 'SUBMITTED', 
    NOW(), NOW(), 'system'
  ),
  (
    'PS0001-CON00001', 'emp-004', 'FIXED_TERM', 'PIECEWORK', '2024-04-01', '2025-03-31',
    '2025-03-31', NULL, true, '2024-04-01',
    '出来高制業務', 1100.00, NULL, false,
    '出来高制のため基本時給は参考値', 1375.00, '法定通り', true, 'SUBMITTED', 
    NOW(), NOW(), 'system'
  );

-- ==========================================
-- 6. 雇用履歴サンプルデータ
-- ==========================================

INSERT INTO employment_history (
  id, employee_id, contract_id, effective_date, event_type, department_code,
  paid_leave_days, hourly_wage, approval_number, remarks, 
  created_at, updated_at, updated_by
) VALUES 
  (
    'hist-001', 'emp-001', 'BPS0001-CON00001', '2023-04-01', 'HIRE', 'BPS課',
    10, 1200.00, 'APR-2023-001', '新規入社', 
    NOW(), NOW(), 'system'
  ),
  (
    'hist-002', 'emp-002', 'ONS0001-CON00001', '2022-10-01', 'HIRE', 'オンサイト課',
    10, 1500.00, 'APR-2022-002', '新規入社', 
    NOW(), NOW(), 'system'
  ),
  (
    'hist-003', 'emp-003', 'CC0001-CON00001', '2024-01-15', 'HIRE', 'CC課',
    10, 1300.00, 'APR-2024-001', '新規入社', 
    NOW(), NOW(), 'system'
  ),
  (
    'hist-004', 'emp-004', NULL, '2021-06-01', 'HIRE', 'PS課',
    10, 1000.00, 'APR-2021-001', '初回入社', 
    NOW(), NOW(), 'system'
  ),
  (
    'hist-005', 'emp-004', NULL, '2023-03-31', 'RETIRE', 'PS課',
    0, 1000.00, NULL, '退職', 
    NOW(), NOW(), 'system'
  ),
  (
    'hist-006', 'emp-004', 'PS0001-CON00001', '2024-04-01', 'REINSTATE', 'PS課',
    10, 1100.00, 'APR-2024-002', '再入社', 
    NOW(), NOW(), 'system'
  );

-- ==========================================
-- 7. 従業員事務管理サンプルデータ
-- ==========================================

INSERT INTO employee_admin_records (
  id, employee_id, tax_withholding_category, web_salary_book_enabled,
  employment_insurance, employment_insurance_card_submitted, social_insurance,
  pension_book_submitted, health_insurance_card_submitted, health_insurance_card_type,
  health_insurance_category, pension_category, basic_pension_number, pension_fund_category,
  employment_insurance_number, commuting_expense_category, notes, 
  created_at, updated_at, updated_by
) VALUES 
  (
    'admin-001', 'emp-001', '甲', true,
    '加入', '提出済', '加入',
    '提出済', '提出済', 'MYNUMBER_CARD',
    '協会けんぽ', '加入', '1234-567890', '未加入',
    '1234-567890-1', '定期', NULL, 
    NOW(), NOW(), 'system'
  ),
  (
    'admin-002', 'emp-002', '甲', true,
    '加入', '提出済', '加入',
    '提出済', '提出済', 'PHYSICAL_CARD',
    '協会けんぽ', '加入', '2345-678901', '未加入',
    '2345-678901-2', '定期', 'サブリーダー', 
    NOW(), NOW(), 'system'
  ),
  (
    'admin-003', 'emp-003', '乙', false,
    '加入', '提出済', '未加入',
    '未提出', '未提出', 'ELIGIBILITY_CERT',
    '国保', '未加入', '3456-789012', '未加入',
    '3456-789012-3', '実費', '短時間勤務のため社保未加入', 
    NOW(), NOW(), 'system'
  ),
  (
    'admin-004', 'emp-004', '甲', true,
    '加入', '提出済', '加入',
    '提出済', '提出済', 'MYNUMBER_CARD',
    '協会けんぽ', '加入', '4567-890123', '未加入',
    '4567-890123-4', '実費', '再入社', 
    NOW(), NOW(), 'system'
  );

-- ==========================================
-- 完了メッセージ
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'サンプルデータ投入完了';
  RAISE NOTICE '従業員: 5件';
  RAISE NOTICE '連絡先: 3件';
  RAISE NOTICE '銀行口座: 4件';
  RAISE NOTICE '勤務条件: 3件';
  RAISE NOTICE '契約: 4件';
  RAISE NOTICE '雇用履歴: 6件';
  RAISE NOTICE '事務管理: 4件';
END $$;

