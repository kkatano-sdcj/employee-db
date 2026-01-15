/**
 * データ確認スクリプト
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { Pool } from "pg";

// .envファイルを読み込む
const candidateEnvPaths = [
  path.join(process.cwd(), ".env"),
  path.join(process.cwd(), "..", ".env"),
  path.join(process.cwd(), "..", "..", ".env"),
];

for (const envPath of candidateEnvPaths) {
  if (existsSync(envPath)) {
    config({ path: envPath, override: false });
    break;
  }
}

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error("❌ エラー: DATABASE_URL環境変数が設定されていません");
  process.exit(1);
}

async function verifyData() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes("supabase") ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();
    
    console.log("📊 データ確認結果:\n");

    // 部門マスター
    const deptResult = await client.query("SELECT * FROM departments ORDER BY code");
    console.log("📁 departments（部門マスター）:", deptResult.rowCount, "件");
    deptResult.rows.forEach(row => console.log(`   - ${row.code}: ${row.name}`));

    // 従業員
    const empResult = await client.query("SELECT id, employee_number, name, department_code, employment_status FROM employees ORDER BY employee_number");
    console.log("\n👤 employees（従業員）:", empResult.rowCount, "件");
    empResult.rows.forEach(row => 
      console.log(`   - ${row.employee_number}: ${row.name} (${row.department_code}, ${row.employment_status})`)
    );

    // 連絡先
    const contactResult = await client.query("SELECT ec.id, e.employee_number, ec.postal_code, ec.address1 FROM employee_contacts ec JOIN employees e ON ec.employee_id = e.id ORDER BY e.employee_number");
    console.log("\n📫 employee_contacts（連絡先）:", contactResult.rowCount, "件");
    contactResult.rows.forEach(row => 
      console.log(`   - ${row.employee_number}: ${row.postal_code} ${row.address1?.substring(0, 20)}...`)
    );

    // 銀行口座
    const bankResult = await client.query("SELECT eb.id, e.employee_number, eb.bank_name, eb.branch_name FROM employee_bank_accounts eb JOIN employees e ON eb.employee_id = e.id ORDER BY e.employee_number");
    console.log("\n🏦 employee_bank_accounts（銀行口座）:", bankResult.rowCount, "件");
    bankResult.rows.forEach(row => 
      console.log(`   - ${row.employee_number}: ${row.bank_name} ${row.branch_name}`)
    );

    // 勤務条件
    const wcResult = await client.query("SELECT wc.id, e.employee_number, wc.work_days_type, wc.work_days_count FROM work_conditions wc JOIN employees e ON wc.employee_id = e.id ORDER BY e.employee_number");
    console.log("\n📅 work_conditions（勤務条件）:", wcResult.rowCount, "件");
    wcResult.rows.forEach(row => 
      console.log(`   - ${row.employee_number}: ${row.work_days_type} ${row.work_days_count}日`)
    );

    // 契約
    const contractResult = await client.query("SELECT c.id, e.employee_number, c.wage_type, c.hourly_wage, c.sub_leader_allowance_amount FROM contracts c JOIN employees e ON c.employee_id = e.id ORDER BY e.employee_number");
    console.log("\n📝 contracts（契約）:", contractResult.rowCount, "件");
    contractResult.rows.forEach(row => 
      console.log(`   - ${row.id}: ${row.wage_type} ¥${row.hourly_wage}${row.sub_leader_allowance_amount ? ` (+¥${row.sub_leader_allowance_amount} サブリーダー手当)` : ''}`)
    );

    // 雇用履歴
    const histResult = await client.query("SELECT eh.id, e.employee_number, eh.event_type, eh.effective_date FROM employment_history eh JOIN employees e ON eh.employee_id = e.id ORDER BY eh.effective_date");
    console.log("\n📜 employment_history（雇用履歴）:", histResult.rowCount, "件");
    histResult.rows.forEach(row => 
      console.log(`   - ${row.employee_number}: ${row.event_type} (${row.effective_date})`)
    );

    // 事務管理
    const adminResult = await client.query("SELECT ear.id, e.employee_number, ear.web_salary_book_enabled, ear.health_insurance_card_type FROM employee_admin_records ear JOIN employees e ON ear.employee_id = e.id ORDER BY e.employee_number");
    console.log("\n📋 employee_admin_records（事務管理）:", adminResult.rowCount, "件");
    adminResult.rows.forEach(row => 
      console.log(`   - ${row.employee_number}: web給金帳=${row.web_salary_book_enabled}, 保険証種類=${row.health_insurance_card_type}`)
    );

    client.release();
    console.log("\n✅ データ確認完了");

  } catch (error) {
    console.error("❌ エラー:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifyData();

