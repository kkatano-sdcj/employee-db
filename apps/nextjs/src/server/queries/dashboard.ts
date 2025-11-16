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
    contractEndDate?: string;
    status: string;
    departmentCode: string;
  }>;
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
        WHERE contract_end_date BETWEEN NOW() AND NOW() + INTERVAL '60 days'
      )::int as "expiringContracts",
      COUNT(*) FILTER (WHERE termination_alert_flag = true)::int as "alerts"
    FROM contracts
  `;

  const latestEmployees = await fetchEmployees({ limit: 6 });

  const renewalPipeline = await db<
    Array<{
      contractId: string;
      employeeId: string;
      name: string;
      departmentCode: string;
      contractEndDate: Date | string | null;
      status: string;
    }>
  >`
    SELECT
      c.id as "contractId",
      c.employee_id as "employeeId",
      e.name,
      e.department_code as "departmentCode",
      c.contract_end_date as "contractEndDate",
      c.status
    FROM contracts c
    INNER JOIN employees e ON e.id = c.employee_id
    WHERE c.contract_end_date BETWEEN NOW() AND NOW() + INTERVAL '120 days'
    ORDER BY c.contract_end_date ASC
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
      contractEndDate: item.contractEndDate
        ? new Date(item.contractEndDate).toISOString().slice(0, 10)
        : undefined,
    })),
  };
}
