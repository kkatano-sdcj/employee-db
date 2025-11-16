"use client";

import { useState } from "react";

export const PayrollDownloadForm = () => {
  const [status, setStatus] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setStatus(undefined);
    const formData = new FormData(event.currentTarget);
    const snapshotDate = formData.get("snapshotDate")?.toString();

    const url = new URL("/api/reports/payroll", window.location.origin);
    if (snapshotDate) {
      url.searchParams.set("date", snapshotDate);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      setStatus("ダウンロードに失敗しました");
      setIsLoading(false);
      return;
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `payroll-${snapshotDate ?? "current"}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    setStatus("CSVをダウンロードしました");
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="input-label">基準日</span>
        <input name="snapshotDate" type="date" className="input-field" />
        <span className="text-xs text-slate-400">
          未指定の場合は本日時点のスナップショットを抽出します。
        </span>
      </label>
      <button
        type="submit"
        disabled={isLoading}
        className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
      >
        {isLoading ? "生成中..." : "CSVをダウンロード"}
      </button>
      {status && <p className="text-sm text-slate-500">{status}</p>}
    </form>
  );
};
