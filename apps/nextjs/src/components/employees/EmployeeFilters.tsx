"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const statusOptions = [
  { value: "ALL", label: "すべて" },
  { value: "ACTIVE", label: "稼働" },
  { value: "ON_LEAVE", label: "休職" },
  { value: "RETIRED", label: "退職" },
];

const employmentTypeOptions = [
  { value: "ALL", label: "すべて" },
  { value: "FULL_TIME", label: "常勤" },
  { value: "PART_TIME", label: "パート" },
  { value: "CONTRACT", label: "契約" },
];

export const EmployeeFilters = ({
  initialQuery,
  initialStatus,
  initialEmploymentType,
}: {
  initialQuery: string;
  initialStatus: string;
  initialEmploymentType: string;
}) => {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);
  const [employmentType, setEmploymentType] = useState(initialEmploymentType);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (status && status !== "ALL") params.set("status", status);
    if (employmentType && employmentType !== "ALL") params.set("type", employmentType);
    router.push(`/employees${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleReset = () => {
    setQuery("");
    setStatus("ALL");
    setEmploymentType("ALL");
    router.push("/employees");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-soft"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="input-label">キーワード</span>
          <input
            className="input-field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="従業員番号・氏名など"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="input-label">雇用区分</span>
          <select
            className="input-field"
            value={employmentType}
            onChange={(event) => setEmploymentType(event.target.value)}
          >
            {employmentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="input-label">状態</span>
          <select
            className="input-field"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft"
          >
            検索
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            クリア
          </button>
        </div>
      </div>
    </form>
  );
};
