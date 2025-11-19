import { db } from "@/server/db";
import { fetchEmployees } from "@/server/queries/employees";

export type DashboardMetrics = {
  totals: {
    employees: number;
    activeEmployees: number;
    expiringContracts: number;
    alerts: number;
  };
  latestEmployees: Awaited<ReturnType<typeof fetchEmployees>>;
  renewalPipeline: Array<{
    contractId: string;
    employeeId: string;
    name: string;
    employmentExpiryScheduledDate?: string;
    status: string;
    departmentCode: string;
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
        WHERE employment_expiry_scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days'
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

  const latestEmployees = await fetchEmployees({ limit: 6 });

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
      status: string;
    }>
  >`
    SELECT
      c.id as "contractId",
      c.employee_id as "employeeId",
      e.name,
      e.department_code as "departmentCode",
      c.employment_expiry_scheduled_date as "employmentExpiryScheduledDate",
      c.status
    FROM contracts c
    INNER JOIN employees e ON e.id = c.employee_id
    WHERE c.employment_expiry_scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '120 days'
    ORDER BY c.employment_expiry_scheduled_date ASC
    LIMIT 8
  `;

  return {
    totals: {
      employees: Number(employeeTotals?.employees ?? 0),
      activeEmployees: Number(employeeTotals?.activeEmployees ?? 0),
      expiringContracts: Number(contractTotals?.expiringContracts ?? 0),
      alerts: Number(contractTotals?.alerts ?? 0),
    },
    latestEmployees,
    renewalPipeline: renewalPipeline.map((item) => ({
      ...item,
      employmentExpiryScheduledDate: item.employmentExpiryScheduledDate
        ? new Date(item.employmentExpiryScheduledDate).toISOString().slice(0, 10)
        : undefined,
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
