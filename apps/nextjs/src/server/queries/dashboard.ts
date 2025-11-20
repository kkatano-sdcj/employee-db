import { db } from "@/server/db";

export type DashboardMetrics = {
  totals: {
    employees: number;
    activeEmployees: number;
    expiringContracts: number;
    alerts: number;
  };
  renewalPipeline: Array<{
    contractId: string;
    employeeId: string;
    name: string;
    employmentExpiryScheduledDate?: string;
    status: string;
    departmentCode: string;
    daysUntilExpiry: number | null;
  }>;
  departmentStats: Array<{ departmentCode: string; count: number }>;
  contractProgress: {
    processedThisMonth: number;
    backlog: number;
    target: number;
  };
  payroll: {
    monthlyTotal: number;
  };
};

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const [employeeTotals] = await db`
    SELECT
      COUNT(*)::int as "employees",
      COUNT(*) FILTER (WHERE employment_status = 'ACTIVE')::int as "activeEmployees"
    FROM employees
  `;

  const [contractTotals] = await db`
    SELECT
      COUNT(*) FILTER (
        WHERE employment_expiry_scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
      )::int as "expiringContracts",
      COUNT(*) FILTER (
        WHERE employment_expiry_scheduled_date IS NOT NULL
          AND employment_expiry_scheduled_date < CURRENT_DATE
      )::int as "alerts"
    FROM contracts
  `;

  const departmentRows = await db<
    Array<{ departmentCode: string | null; count: number }>
  >`
    SELECT department_code as "departmentCode", COUNT(*)::int as "count"
    FROM employees
    GROUP BY department_code
    ORDER BY department_code
  `;

  const [contractProgress] = await db`
    SELECT
      COUNT(*) FILTER (
        WHERE date_trunc('month', updated_at) = date_trunc('month', NOW())
      )::int as "processed",
      COUNT(*) FILTER (
        WHERE status IN ('DRAFT', 'AWAITING_APPROVAL')
      )::int as "backlog"
    FROM contracts
  `;

  const [payrollRow] = await db`
    SELECT COALESCE(SUM(c.hourly_wage * 160), 0)::numeric as "monthlyTotal"
    FROM contracts c
    INNER JOIN employees e ON e.id = c.employee_id
    WHERE e.employment_status = 'ACTIVE'
      AND (
        c.employment_expiry_scheduled_date IS NULL
        OR c.employment_expiry_scheduled_date >= CURRENT_DATE
      )
  `;

  const renewalPipeline = await db<
    Array<{
      contractId: string;
      employeeId: string;
      name: string;
      departmentCode: string;
      employmentExpiryScheduledDate: Date | string | null;
      daysUntilExpiry: number | null;
      status: string;
    }>
  >`
    WITH ranked_contracts AS (
      SELECT
        c.id,
        c.employee_id,
        e.name,
        e.department_code,
        c.employment_expiry_scheduled_date,
        c.status,
        ROW_NUMBER() OVER (
          PARTITION BY c.employee_id
          ORDER BY c.employment_expiry_scheduled_date ASC
        ) as row_num
      FROM contracts c
      INNER JOIN employees e ON e.id = c.employee_id
      WHERE c.employment_expiry_scheduled_date IS NOT NULL
        AND c.employment_expiry_scheduled_date <= CURRENT_DATE + INTERVAL '120 days'
    )
    SELECT
      rc.id as "contractId",
      rc.employee_id as "employeeId",
      rc.name,
      rc.department_code as "departmentCode",
      rc.employment_expiry_scheduled_date as "employmentExpiryScheduledDate",
      CASE
        WHEN rc.employment_expiry_scheduled_date IS NULL THEN NULL
        ELSE (rc.employment_expiry_scheduled_date::date - CURRENT_DATE)::int
      END as "daysUntilExpiry",
      rc.status
    FROM ranked_contracts rc
    WHERE rc.row_num = 1
    ORDER BY rc.employment_expiry_scheduled_date ASC
    LIMIT 12
  `;

  return {
    totals: {
      employees: Number(employeeTotals?.employees ?? 0),
      activeEmployees: Number(employeeTotals?.activeEmployees ?? 0),
      expiringContracts: Number(contractTotals?.expiringContracts ?? 0),
      alerts: Number(contractTotals?.alerts ?? 0),
    },
    renewalPipeline: renewalPipeline.map((item) => ({
      ...item,
      employmentExpiryScheduledDate: item.employmentExpiryScheduledDate
        ? new Date(item.employmentExpiryScheduledDate).toISOString().slice(0, 10)
        : undefined,
      daysUntilExpiry:
        typeof item.daysUntilExpiry === "number" ? item.daysUntilExpiry : null,
    })),
    departmentStats: departmentRows.map((row) => ({
      departmentCode: row.departmentCode ?? "未設定",
      count: Number(row.count ?? 0),
    })),
    contractProgress: {
      processedThisMonth: Number(contractProgress?.processed ?? 0),
      backlog: Number(contractProgress?.backlog ?? 0),
      target: Math.max(Number(contractProgress?.processed ?? 0) + Number(contractProgress?.backlog ?? 0), 1),
    },
    payroll: {
      monthlyTotal: Number(payrollRow?.monthlyTotal ?? 0),
    },
  };
}
