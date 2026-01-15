import { Pool } from "pg";
import { env } from "@/env";
import type { User, UserRole } from "@/lib/user-types";

// 型と定数を共有ファイルから再エクスポート
export type { User, UserRole } from "@/lib/user-types";
export { roleLabels, roleColors } from "@/lib/user-types";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_URL.includes("supabase")
    ? { rejectUnauthorized: false }
    : false,
});

export const USERS_PER_PAGE = 10;

export interface PaginatedUsers {
  users: User[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export async function fetchUsers(
  page: number = 1,
  search: string = ""
): Promise<PaginatedUsers> {
  const offset = (page - 1) * USERS_PER_PAGE;
  const searchPattern = search ? `%${search}%` : null;

  // 総件数を取得
  const countQuery = searchPattern
    ? `SELECT COUNT(*) as count FROM public."user" WHERE name ILIKE $1 OR email ILIKE $1`
    : `SELECT COUNT(*) as count FROM public."user"`;
  const countParams = searchPattern ? [searchPattern] : [];

  const countResult = await pool.query<{ count: string }>(
    countQuery,
    countParams
  );
  const totalCount = parseInt(countResult.rows[0]?.count || "0", 10);
  const totalPages = Math.ceil(totalCount / USERS_PER_PAGE);

  // ページネーションされたユーザーを取得
  const usersQuery = searchPattern
    ? `
    SELECT
      id,
      email,
      name,
      role,
      "departmentCode",
      "emailVerified",
      "createdAt",
      "updatedAt"
    FROM public."user"
    WHERE name ILIKE $1 OR email ILIKE $1
    ORDER BY "createdAt" DESC
    LIMIT $2 OFFSET $3
  `
    : `
    SELECT
      id,
      email,
      name,
      role,
      "departmentCode",
      "emailVerified",
      "createdAt",
      "updatedAt"
    FROM public."user"
    ORDER BY "createdAt" DESC
    LIMIT $1 OFFSET $2
  `;
  const usersParams = searchPattern
    ? [searchPattern, USERS_PER_PAGE, offset]
    : [USERS_PER_PAGE, offset];

  const result = await pool.query<{
    id: string;
    email: string;
    name: string;
    role: UserRole;
    departmentCode: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>(usersQuery, usersParams);

  return {
    users: result.rows.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      departmentCode: row.departmentCode,
      emailVerified: row.emailVerified,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
    totalCount,
    currentPage: page,
    totalPages,
  };
}

export async function fetchUserById(id: string): Promise<User | null> {
  const result = await pool.query<{
    id: string;
    email: string;
    name: string;
    role: UserRole;
    departmentCode: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>(
    `
    SELECT 
      id,
      email,
      name,
      role,
      "departmentCode",
      "emailVerified",
      "createdAt",
      "updatedAt"
    FROM public."user"
    WHERE id = $1
  `,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    departmentCode: row.departmentCode,
    emailVerified: row.emailVerified,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function updateUserRole(
  id: string,
  role: UserRole,
  departmentCode?: string | null
): Promise<User | null> {
  const result = await pool.query<{
    id: string;
    email: string;
    name: string;
    role: UserRole;
    departmentCode: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>(
    `
    UPDATE public."user"
    SET 
      role = $2,
      "departmentCode" = $3,
      "updatedAt" = NOW()
    WHERE id = $1
    RETURNING 
      id,
      email,
      name,
      role,
      "departmentCode",
      "emailVerified",
      "createdAt",
      "updatedAt"
  `,
    [id, role, departmentCode ?? null]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    departmentCode: row.departmentCode,
    emailVerified: row.emailVerified,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM public."user" WHERE id = $1`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}


