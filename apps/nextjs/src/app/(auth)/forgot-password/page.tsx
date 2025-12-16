"use client";

import { useState } from "react";
import Link from "next/link";
import { forgetPassword } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await forgetPassword({
        email,
        redirectTo: "/reset-password",
      });

      if (result.error) {
        setError(result.error.message || "リクエストに失敗しました");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("リクエストに失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-900 text-center mb-6">
          メールを送信しました
        </h2>
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <p>
            パスワードリセット用のリンクを送信しました。
          </p>
          <p className="mt-2 text-xs text-green-600">
            開発環境ではコンソールにリセットリンクが出力されます。
          </p>
        </div>
        <Link
          href="/login"
          className="block w-full py-2.5 px-4 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 text-center transition-colors"
        >
          ログインに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8">
      <h2 className="text-xl font-bold text-slate-900 text-center mb-2">
        パスワード再設定
      </h2>
      <p className="text-sm text-slate-500 text-center mb-6">
        登録済みのメールアドレスを入力してください
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="example@company.com"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "送信中..." : "リセットリンクを送信"}
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
