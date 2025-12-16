import { existsSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { z } from "zod";

const candidateEnvPaths = [
  path.join(process.cwd(), ".env"),
  path.join(process.cwd(), "..", ".env"),
  path.join(process.cwd(), "..", "..", ".env"),
];

for (const envPath of candidateEnvPaths) {
  if (existsSync(envPath)) {
    config({ path: envPath, override: false });
  }
}

// Vercel環境のURL自動検出
function getAuthUrl(): string {
  // 明示的に設定されている場合はそれを使用
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;

  // Vercel環境
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // ローカル開発環境
  return "http://localhost:3000";
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  AUTH_URL: z.string().url(),
  VERCEL_URL: z.string().optional(),
  VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
});

const rawEnv = {
  DATABASE_URL: process.env.DATABASE_URL ?? process.env.POSTGRES_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_URL: getAuthUrl(),
  VERCEL_URL: process.env.VERCEL_URL,
  VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
};

type Env = z.infer<typeof envSchema>;

function formatZodIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "value"}: ${issue.message}`)
    .join(", ");
}

let parsedEnv: Env;

try {
  parsedEnv = envSchema.parse(rawEnv);
} catch (error) {
  if (error instanceof z.ZodError) {
    const formatted = formatZodIssues(error);
    const hint =
      "ルート直下の `.env` に Supabase の接続情報 (例: DATABASE_URL) を設定してください。";

    console.error("[env] 環境変数の検証に失敗しました:", formatted);
    console.error("[env] ヒント:", hint);

    throw new Error(`環境変数の設定が不足しています: ${formatted}`);
  }
  throw error;
}

export const env = parsedEnv;
