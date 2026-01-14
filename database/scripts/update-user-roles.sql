-- ==========================================
-- ユーザーロール更新スクリプト
-- 作成日: 2025-01-28
-- 説明: 指定されたメールアドレスのユーザーにロールを割り当て
-- ==========================================

-- ロールの更新
UPDATE public."user"
SET role = 'SYSTEM_ADMIN'
WHERE email = 'system_admin@example.com';

UPDATE public."user"
SET role = 'FIELD_MANAGER'
WHERE email = 'user@example.com';

UPDATE public."user"
SET role = 'HR_MANAGER'
WHERE email = 'hrmanager@example.com';

UPDATE public."user"
SET role = 'ADMIN'
WHERE email = 'admin@example.com';

-- 更新結果の確認
SELECT 
  email,
  role,
  "departmentCode",
  name,
  "emailVerified",
  "createdAt"
FROM public."user"
WHERE email IN (
  'system_admin@example.com',
  'user@example.com',
  'hrmanager@example.com',
  'admin@example.com'
)
ORDER BY email;

