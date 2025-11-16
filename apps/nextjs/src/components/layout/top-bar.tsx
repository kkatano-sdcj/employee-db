"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { MagnifyingGlassIcon, BellIcon, PlusIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";

export const TopBar = () => {
  const pathname = usePathname();
  const now = format(new Date(), "yyyy年MM月dd日 HH:mm", { locale: ja });

  // ページタイトルの取得
  const getPageTitle = () => {
    if (pathname === "/") return "ダッシュボード";
    if (pathname.startsWith("/employees")) return "従業員管理";
    if (pathname.startsWith("/contracts")) return "契約管理";
    if (pathname.startsWith("/reports")) return "レポート・分析";
    if (pathname.startsWith("/settings")) return "システム設定";
    return "Employee Database";
  };

  return (
    <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-lg border-b border-slate-200/50 glass-morphism">
      <div className="px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{getPageTitle()}</h2>
            <p className="text-sm text-slate-500 mt-1">
              最終更新: <span className="font-medium">{now}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* 検索 */}
            <div className="relative">
              <input
                type="text"
                placeholder="検索..."
                className="w-72 px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            </div>

            {/* 通知 */}
            <button className="relative p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all hover-lift">
              <BellIcon className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent-rose rounded-full"></span>
            </button>

            {/* クイックアクション */}
            <button className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-all shadow-soft hover-lift flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              クイックアクション
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};