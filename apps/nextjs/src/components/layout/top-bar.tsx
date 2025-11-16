import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export const TopBar = () => {
  const now = format(new Date(), "yyyy年MM月dd日 (EEE) HH:mm", { locale: ja });

  return (
    <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-white/60 bg-white/80 px-5 py-4 backdrop-blur lg:px-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Dashboard</p>
          <h1 className="text-2xl font-semibold text-slate-900">従業員データベース</h1>
        </div>
        <div className="text-sm text-slate-500">{now} 更新</div>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-inner">
          <MagnifyingGlassIcon className="h-4 w-4" />
          <input
            className="w-full border-none bg-transparent text-sm focus:outline-none"
            placeholder="従業員・契約を検索"
          />
        </label>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="badge-dot bg-emerald-400" /> 稼働中 / メンテナンス予定なし
        </div>
      </div>
    </header>
  );
};
