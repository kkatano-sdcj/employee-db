"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  InboxIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import {
  BriefcaseIcon,
  DocumentDuplicateIcon,
  HomeIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";

const navItems = [
  { name: "ダッシュボード", href: "/", icon: HomeIcon },
  { name: "従業員一覧", href: "/employees", icon: UsersIcon },
  { name: "従業員登録", href: "/employees/new", icon: UserPlusIcon },
  { name: "契約管理", href: "/contracts", icon: DocumentTextIcon },
  { name: "レポート", href: "/reports", icon: ChartBarIcon },
  { name: "システム設定", href: "/settings", icon: Cog6ToothIcon },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="gradient-surface fixed inset-y-0 hidden w-72 flex-col border-r border-white/30 px-6 py-8 text-sm text-slate-600 shadow-glow lg:flex">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-glow">
          <BriefcaseIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">ACME HR</p>
          <p className="text-lg font-semibold text-slate-900">Employee DB</p>
        </div>
      </div>

      <div className="space-y-6 overflow-y-auto pb-20">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            メインメニュー
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  href={item.href}
                  key={item.name}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white text-slate-900 shadow-soft"
                      : "text-slate-500 hover:bg-white/70 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="rounded-2xl bg-white/90 p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            契約更新アラート
          </p>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <p className="text-2xl font-bold text-slate-900">8件</p>
              <p className="text-slate-500">30日以内の期限</p>
            </div>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="badge-dot bg-amber-400" /> 準備中
                </span>
                <span>5</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="badge-dot bg-rose-400" /> 要対応
                </span>
                <span>3</span>
              </li>
            </ul>
            <Link
              href="/contracts"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-soft"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
              詳細を確認
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-inner-soft">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/90 text-white">
          <InboxIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">統括管理者</p>
          <p className="text-xs text-slate-500">hr.manager@example.com</p>
        </div>
      </div>
    </aside>
  );
};
