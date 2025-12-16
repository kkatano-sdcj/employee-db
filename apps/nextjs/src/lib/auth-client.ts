"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
});

export const { signIn, signUp, signOut, useSession } = authClient;

type ForgetPasswordParams = {
  email: string;
  redirectTo?: string;
};

type ResetPasswordParams = {
  newPassword: string;
  token: string;
};

type AuthResult = {
  error?: { message: string } | null;
  data?: unknown;
};

export async function forgetPassword(params: ForgetPasswordParams): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/forget-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { error: { message: data.message || "リクエストに失敗しました" } };
    }

    return { data: await response.json() };
  } catch {
    return { error: { message: "リクエストに失敗しました" } };
  }
}

export async function resetPassword(params: ResetPasswordParams): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return { error: { message: data.message || "パスワードの再設定に失敗しました" } };
    }

    return { data: await response.json() };
  } catch {
    return { error: { message: "パスワードの再設定に失敗しました" } };
  }
}
