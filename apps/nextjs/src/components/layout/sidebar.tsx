"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { name: "ダッシュボード", href: "/", icon: HomeIcon },
  { name: "従業員管理", href: "/employees", icon: UsersIcon },
  { name: "契約管理", href: "/contracts", icon: DocumentTextIcon },
  { name: "レポート・分析", href: "/reports", icon: ChartBarIcon },
];

const adminItems = [
  { name: "システム設定", href: "/settings", icon: Cog6ToothIcon },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed h-full z-40 w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 glass-morphism">
      {/* ロゴセクション */}
      <div className="p-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-soft">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Employee DB</h1>
            <p className="text-xs text-slate-500 font-medium">統合管理システム v2.0</p>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="px-6 pb-6">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
                           (item.href === "/employees" && pathname.startsWith("/employees"));
            return (
              <Link
                href={item.href}
                key={item.name}
                className={`
                  group flex items-center px-4 py-3 text-sm font-medium rounded-xl hover-lift transition-all
                  ${
                    isActive
                      ? "bg-slate-900 text-white shadow-soft"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                `}
              >
                <Icon className={`
                  w-5 h-5 mr-3 transition-colors
                  ${isActive ? "text-slate-300" : "text-slate-400 group-hover:text-slate-600"}
                `} />
                {item.name}
                {isActive && item.href === "/" && (
                  <span className="ml-auto w-2 h-2 bg-accent-emerald rounded-full animate-pulse-soft" />
                )}
              </Link>
            );
          })}
        </div>

        {/* 管理セクション */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            管理
          </p>
          {adminItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                href={item.href}
                key={item.name}
                className={`
                  group flex items-center px-4 py-3 text-sm font-medium rounded-xl hover-lift transition-all
                  ${
                    isActive
                      ? "bg-slate-900 text-white shadow-soft"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                `}
              >
                <Icon className={`
                  w-5 h-5 mr-3 transition-colors
                  ${isActive ? "text-slate-300" : "text-slate-400 group-hover:text-slate-600"}
                `} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ユーザープロファイル */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200 bg-white/50">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-semibold shadow-soft">
            管
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-slate-900">管理者</p>
            <p className="text-xs text-slate-500">admin@example.com</p>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowRightStartOnRectangleIcon className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </aside>
  );
};