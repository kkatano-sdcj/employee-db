"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { FunnelIcon } from "@heroicons/react/24/outline";

type AdvancedFilterDialogProps = {
  defaults: {
    query: string;
    status: string;
    employmentType: string;
    department?: string;
    contractFrom?: string;
    contractTo?: string;
    minHourlyWage?: string;
    maxHourlyWage?: string;
    hasDocuments?: string;
    hasAlert?: string;
  };
};

export function AdvancedFilterDialog({ defaults }: AdvancedFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [portalEl] = useState<HTMLElement | null>(() => {
    if (typeof document === "undefined") {
      return null;
    }
    return document.createElement("div");
  });
  const titleId = useId();

  useEffect(() => {
    if (!portalEl) return;
    document.body.appendChild(portalEl);
    return () => {
      document.body.removeChild(portalEl);
    };
  }, [portalEl]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? titleId : undefined}
      >
        <FunnelIcon className="w-4 h-4 text-slate-500" />
        詳細
      </button>

      {open &&
        portalEl &&
        createPortal(
          <div
            className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Filter</p>
                <h2 id={titleId} className="text-lg font-semibold text-slate-900">
                  詳細フィルター
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium"
              >
                閉じる
              </button>
            </div>

            <form
              action="/employees"
              method="get"
              className="px-6 py-5 space-y-5"
              data-advanced-filter-form
            >
              <input type="hidden" name="q" value={defaults.query} />
              <input type="hidden" name="status" value={defaults.status} />
              <input type="hidden" name="type" value={defaults.employmentType} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 text-sm text-slate-600">
                  勤務場所（部門コード）
                  <select
                    name="department"
                    defaultValue={defaults.department}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  >
                    <option value="">指定なし</option>
                    <option value="BPS">BPS課</option>
                    <option value="ONSITE">オンサイト課</option>
                    <option value="CC">CC課</option>
                    <option value="PS">PS課</option>
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm text-slate-600">
                  契約開始日（From）
                  <input
                    type="date"
                    name="contractFrom"
                    defaultValue={defaults.contractFrom}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-slate-600">
                  契約開始日（To）
                  <input
                    type="date"
                    name="contractTo"
                    defaultValue={defaults.contractTo}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-2 text-sm text-slate-600">
                    時給（最小）
                    <input
                      type="number"
                      min="0"
                    name="minHourlyWage"
                    defaultValue={defaults.minHourlyWage}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                      placeholder="例: 1200"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-slate-600">
                    時給（最大）
                    <input
                      type="number"
                      min="0"
                    name="maxHourlyWage"
                    defaultValue={defaults.maxHourlyWage}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                      placeholder="例: 1800"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-xl px-4 py-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    name="hasDocuments"
                    defaultChecked={defaults.hasDocuments === "true"}
                    value="true"
                    className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                  />
                  提出物（雇用契約書・保険証）未完了のみ
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    name="hasAlert"
                    defaultChecked={defaults.hasAlert === "true"}
                    value="true"
                    className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                  />
                  契約更新アラート対象のみ
                </label>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                >
                  キャンセル
                </button>
                <div className="flex gap-3">
                  <button
                    type="reset"
                    className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
                  >
                    条件リセット
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-all shadow-soft"
                  >
                    検索条件を適用
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
          portalEl
        )}
    </>
  );
}
