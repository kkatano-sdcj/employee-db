#!/usr/bin/env tsx
/**
 * 従業員データインポートスクリプト
 * 
 * CSVファイルから従業員データを読み込み、Supabaseに追加します。
 * 既に存在するemployee_numberのデータはスキップします。
 * 
 * 使用方法:
 *   cd apps/nextjs && pnpm tsx scripts/import-employees.ts
 */

import postgres from "postgres";
import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { randomUUID } from "crypto";

// ESM対応の__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 環境変数の読み込み
const rootEnvPath = resolve(__dirname, "../../../.env");
const localEnvPath = resolve(__dirname, "../.env");
dotenv.config({ path: rootEnvPath });
dotenv.config({ path: localEnvPath });

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

interface EmployeeRow {
  employee_number: string;
  branch_number: number;
  name: string;
  name_kana: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  birth_date: string;
  nationality: string;
  hired_at: string;
  retired_at: string | null;
  employment_type: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  employment_status: "ACTIVE" | "RETIRED" | "ON_LEAVE";
  department_code: string;
  my_number: string | null;
  updated_by: string;
}

function parseCSV(csvContent: string): EmployeeRow[] {
  const lines = csvContent.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: EmployeeRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(",").map((v) => v.trim());
    const row: Partial<EmployeeRow> = {};

    headers.forEach((header, index) => {
      const value = values[index] || "";
      switch (header) {
        case "employee_number":
          row.employee_number = value;
          break;
        case "branch_number":
          row.branch_number = parseInt(value, 10) || 0;
          break;
        case "name":
          row.name = value;
          break;
        case "name_kana":
          row.name_kana = value;
          break;
        case "gender":
          row.gender = value as "MALE" | "FEMALE" | "OTHER";
          break;
        case "birth_date":
          row.birth_date = value;
          break;
        case "nationality":
          row.nationality = value;
          break;
        case "hired_at":
          row.hired_at = value;
          break;
        case "retired_at":
          row.retired_at = value || null;
          break;
        case "employment_type":
          row.employment_type = value as "FULL_TIME" | "PART_TIME" | "CONTRACT";
          break;
        case "employment_status":
          row.employment_status = value as "ACTIVE" | "RETIRED" | "ON_LEAVE";
          break;
        case "department_code":
          row.department_code = value;
          break;
        case "my_number":
          row.my_number = value || null;
          break;
        case "updated_by":
          row.updated_by = value;
          break;
      }
    });

    if (row.employee_number && row.name) {
      rows.push(row as EmployeeRow);
    }
  }

  return rows;
}

async function importEmployees() {
  if (!DATABASE_URL) {
    console.error("❌ エラー: DATABASE_URL または POSTGRES_URL が設定されていません");
    process.exit(1);
  }

  console.log("📥 従業員データのインポートを開始します...\n");

  // CSVファイルの読み込み
  const csvPath = resolve(__dirname, "../../../database/data/dummy_employee.csv");
  console.log(`📄 CSVファイルを読み込み中: ${csvPath}`);
  
  let csvContent: string;
  try {
    csvContent = readFileSync(csvPath, "utf-8");
  } catch (error) {
    console.error(`❌ CSVファイルの読み込みに失敗しました: ${error}`);
    process.exit(1);
  }

  const employees = parseCSV(csvContent);
  console.log(`✅ ${employees.length}件のデータを読み込みました\n`);

  // データベース接続
  const sql = postgres(DATABASE_URL, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
  });

  try {
    // 既存のemployee_numberを取得
    console.log("🔍 既存の従業員データを確認中...");
    const existingEmployees = await sql`
      SELECT employee_number FROM employees
    `;
    const existingNumbers = new Set(
      existingEmployees.map((e: { employee_number: string }) => e.employee_number)
    );
    console.log(`   既存データ: ${existingNumbers.size}件\n`);

    // 新規追加対象のデータをフィルタリング
    const newEmployees = employees.filter(
      (emp) => !existingNumbers.has(emp.employee_number)
    );

    if (newEmployees.length === 0) {
      console.log("✅ 追加するデータはありません。すべてのデータが既に登録されています。");
      await sql.end();
      return;
    }

    console.log(`📝 ${newEmployees.length}件の新規データを追加します:\n`);

    // データを挿入
    let successCount = 0;
    let errorCount = 0;

    for (const emp of newEmployees) {
      try {
        const id = randomUUID();
        // 日付のバリデーションと変換
        const birthDate = emp.birth_date ? new Date(emp.birth_date + 'T00:00:00') : null;
        const hiredAt = emp.hired_at ? new Date(emp.hired_at + 'T00:00:00') : null;
        let retiredAt: Date | null = null;
        
        if (emp.retired_at && emp.retired_at.trim()) {
          try {
            retiredAt = new Date(emp.retired_at + 'T00:00:00');
            if (isNaN(retiredAt.getTime())) {
              retiredAt = null;
            }
          } catch (e) {
            retiredAt = null;
          }
        }

        if (!birthDate || isNaN(birthDate.getTime())) {
          throw new Error(`無効な生年月日: ${emp.birth_date}`);
        }
        if (!hiredAt || isNaN(hiredAt.getTime())) {
          throw new Error(`無効な入社日: ${emp.hired_at}`);
        }

        const now = new Date();

        const retiredAtValue = retiredAt ? retiredAt.toISOString().split('T')[0] : null;

        await sql`
          INSERT INTO employees (
            id,
            employee_number,
            branch_number,
            name,
            name_kana,
            gender,
            birth_date,
            nationality,
            hired_at,
            retired_at,
            employment_type,
            employment_status,
            department_code,
            my_number,
            updated_by,
            created_at,
            updated_at
          ) VALUES (
            ${id},
            ${emp.employee_number},
            ${emp.branch_number},
            ${emp.name},
            ${emp.name_kana},
            ${emp.gender},
            ${birthDate.toISOString().split('T')[0]},
            ${emp.nationality || null},
            ${hiredAt.toISOString().split('T')[0]},
            ${retiredAtValue},
            ${emp.employment_type},
            ${emp.employment_status},
            ${emp.department_code},
            ${emp.my_number || null},
            ${emp.updated_by},
            ${now},
            ${now}
          )
        `;
        console.log(`   ✅ ${emp.employee_number}: ${emp.name} (${emp.employment_status})`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ ${emp.employee_number}: ${emp.name} - エラー: ${error}`);
        errorCount++;
      }
    }

    console.log(`\n✅ インポート完了:`);
    console.log(`   成功: ${successCount}件`);
    if (errorCount > 0) {
      console.log(`   失敗: ${errorCount}件`);
    }

    // 最終的なレコード数を確認
    const [count] = await sql`SELECT COUNT(*) as count FROM employees`;
    console.log(`\n📊 現在の従業員数: ${(count as { count: bigint }).count}件`);
  } catch (error) {
    console.error("\n❌ エラーが発生しました:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

importEmployees().catch((error) => {
  console.error("予期しないエラー:", error);
  process.exit(1);
});

