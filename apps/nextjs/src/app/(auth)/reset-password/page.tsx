"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("無効なリンクです。パスワードリセットを再度リクエストしてください。");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("無効なリンクです");
      return;
    }

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      return;
    }

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword({
        newPassword: password,
        token,
      });

      if (result.error) {
        setError(result.error.message || "パスワードの再設定に失敗しました");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("パスワードの再設定に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-900 text-center mb-6">
          パスワードを再設定しました
        </h2>
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          パスワードが正常に変更されました。新しいパスワードでログインしてください。
        </div>
        <Link
          href="/login"
          className="block w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-center transition-colors"
        >
          ログインする
        </Link>
      </div>
    );
  }

  if (!token && error) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-900 text-center mb-6">
          パスワード再設定
        </h2>
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
        <Link
          href="/forgot-password"
          className="block w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-center transition-colors"
        >
          パスワードリセットをリクエスト
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8">
      <h2 className="text-xl font-bold text-slate-900 text-center mb-2">
        新しいパスワードを設定
      </h2>
      <p className="text-sm text-slate-500 text-center mb-6">
        新しいパスワードを入力してください
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            新しいパスワード <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="8文字以上"
          />
          <p className="mt-1 text-xs text-slate-500">
            8文字以上で入力してください
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            パスワード（確認） <span className="text-red-500">*</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="パスワードを再入力"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "設定中..." : "パスワードを変更"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ログインに戻る
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-3/4 mx-auto mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 bg-slate-200 rounded"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
