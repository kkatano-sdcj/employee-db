import { betterAuth } from "better-auth";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { env } from "@/env";

export type UserRole =
  | "SYSTEM_ADMIN"
  | "ADMIN"
  | "HR_MANAGER"
  | "FIELD_MANAGER"
  | "GENERAL_AFFAIRS"
  | "AUDITOR";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_URL.includes("supabase") ? { rejectUnauthorized: false } : false,
});

export const auth = betterAuth({
  database: pool,
  baseURL: env.AUTH_URL,
  secret: env.AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      console.log("=".repeat(50));
      console.log("パスワードリセットリンク（開発環境）");
      console.log(`ユーザー: ${user.email}`);
      console.log(`リセットURL: ${url}`);
      console.log("=".repeat(50));
    },
    password: {
      hash: async (password: string) => {
        return bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }: { hash: string; password: string }) => {
        return bcrypt.compare(password, hash);
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "FIELD_MANAGER",
        input: false,
      },
      departmentCode: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  trustedOrigins: [env.AUTH_URL],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
