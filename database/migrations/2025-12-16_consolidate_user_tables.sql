-- ==========================================
-- マイグレーション: ユーザーテーブルの統合（Better-Auth対応）
-- 作成日: 2025-12-16
-- 説明: Better-Authの標準テーブル構成に統合
--       - public.users（アプリ固有）→ public.user（Better-Auth標準）に統合
--       - public.sessions（アプリ固有）→ public.session（Better-Auth標準）に統合
--       - accountテーブルは認証情報保存のため維持
-- ==========================================

-- ==========================================
-- 1. public.user テーブルに role と departmentCode カラムを追加
-- ==========================================
DO $$
BEGIN
  -- roleカラムを追加（既存のUserRole enumを使用）
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'user' AND column_name = 'role'
  ) THEN
    ALTER TABLE public."user"
    ADD COLUMN role "UserRole" DEFAULT 'FIELD_MANAGER';
    RAISE NOTICE 'public.user テーブルに role カラムを追加しました。';
  END IF;

  -- departmentCodeカラムを追加
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'user' AND column_name = 'departmentCode'
  ) THEN
    ALTER TABLE public."user"
    ADD COLUMN "departmentCode" text;
    RAISE NOTICE 'public.user テーブルに departmentCode カラムを追加しました。';
  END IF;
END $$;

-- ==========================================
-- 2. public.users から public.user へデータをマイグレーション
-- ==========================================
DO $$
BEGIN
  -- usersテーブルが存在する場合のみ実行
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    UPDATE public."user" u
    SET
        role = us.role,
        "departmentCode" = us.department_code
    FROM public.users us
    WHERE u.id = us.id;
    RAISE NOTICE 'public.users から public.user へデータをマイグレーションしました。';
  END IF;
END $$;

-- ==========================================
-- 3. 外部キー参照を public.user に変更
-- ==========================================

-- 3.1: audit_logs の外部キーを変更
ALTER TABLE public.audit_logs
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.table_constraints
    WHERE constraint_name = 'audit_logs_user_id_fkey'
    AND table_name = 'audit_logs'
  ) THEN
    ALTER TABLE public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;
    RAISE NOTICE 'audit_logs の外部キーを public.user に変更しました。';
  END IF;
END $$;

-- 3.2: edit_locks の外部キーを変更
ALTER TABLE public.edit_locks
DROP CONSTRAINT IF EXISTS edit_locks_locked_by_fkey;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.table_constraints
    WHERE constraint_name = 'edit_locks_locked_by_fkey'
    AND table_name = 'edit_locks'
  ) THEN
    ALTER TABLE public.edit_locks
    ADD CONSTRAINT edit_locks_locked_by_fkey
    FOREIGN KEY (locked_by) REFERENCES public."user"(id) ON DELETE CASCADE;
    RAISE NOTICE 'edit_locks の外部キーを public.user に変更しました。';
  END IF;
END $$;

-- ==========================================
-- 4. 不要なテーブルを削除
-- ==========================================

-- 4.1: public.sessions テーブルを削除（Better-Authのsessionテーブルを使用）
DROP TABLE IF EXISTS public.sessions CASCADE;

-- 4.2: public.users テーブルを削除（Better-Authのuserテーブルを使用）
DROP TABLE IF EXISTS public.users CASCADE;

-- ==========================================
-- 完了メッセージ
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'ユーザーテーブルの統合が完了しました。';
  RAISE NOTICE '';
  RAISE NOTICE '変更内容:';
  RAISE NOTICE '- public.user テーブルに role, departmentCode カラムを追加';
  RAISE NOTICE '- public.users のデータを public.user にマイグレーション';
  RAISE NOTICE '- audit_logs, edit_locks の外部キーを public.user に変更';
  RAISE NOTICE '- public.users, public.sessions テーブルを削除';
  RAISE NOTICE '';
  RAISE NOTICE '現在のテーブル構成（Better-Auth標準）:';
  RAISE NOTICE '- public.user: ユーザー基本情報 + role + departmentCode';
  RAISE NOTICE '- public.account: 認証情報（パスワード、OAuthトークン）';
  RAISE NOTICE '- public.session: セッション管理';
  RAISE NOTICE '- public.verification: メール検証トークン';
  RAISE NOTICE '==========================================';
END $$;
