"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { useSidebar } from "./sidebar-context";
import { useSession, signOut } from "@/lib/auth-client";

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
  const router = useRouter();
  const { isOpen, toggle } = useSidebar();
  const { data: session, isPending } = useSession();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const userInitial = session?.user?.name?.charAt(0) || "U";
  const userName = session?.user?.name || "ユーザー";
  const userEmail = session?.user?.email || "";

  return (
    <aside
      className={`
        fixed h-full z-40 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 glass-morphism
        transition-all duration-300 ease-in-out
        ${isOpen ? "w-72" : "w-20"}
      `}
    >
      {/* トグルボタン */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors z-50"
      >
        <ChevronLeftIcon
          className={`w-4 h-4 text-slate-600 transition-transform duration-300 ${
            isOpen ? "" : "rotate-180"
          }`}
        />
      </button>

      {/* ロゴセクション */}
      <div className={`p-8 ${isOpen ? "" : "px-4"}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-soft flex-shrink-0">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <div
            className={`transition-all duration-300 overflow-hidden ${
              isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}
          >
            <h1 className="text-xl font-bold text-slate-900 whitespace-nowrap">Employee DB</h1>
            <p className="text-xs text-slate-500 font-medium whitespace-nowrap">統合管理システム v2.0</p>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className={`pb-6 ${isOpen ? "px-6" : "px-3"}`}>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
                           (item.href === "/employees" && pathname.startsWith("/employees"));
            return (
              <Link
                href={item.href}
                key={item.name}
                title={isOpen ? undefined : item.name}
                className={`
                  group flex items-center text-sm font-medium rounded-xl hover-lift transition-all
                  ${isOpen ? "px-4 py-3" : "px-3 py-3 justify-center"}
                  ${
                    isActive
                      ? "bg-slate-900 text-white shadow-soft"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                `}
              >
                <Icon className={`
                  w-5 h-5 transition-colors flex-shrink-0
                  ${isOpen ? "mr-3" : ""}
                  ${isActive ? "text-slate-300" : "text-slate-400 group-hover:text-slate-600"}
                `} />
                <span
                  className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                    isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                  }`}
                >
                  {item.name}
                </span>
                {isActive && item.href === "/" && isOpen && (
                  <span className="ml-auto w-2 h-2 bg-accent-emerald rounded-full animate-pulse-soft" />
                )}
              </Link>
            );
          })}
        </div>

        {/* 管理セクション */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <p
            className={`text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 transition-all duration-300 overflow-hidden ${
              isOpen ? "px-4 opacity-100" : "px-0 text-center opacity-100"
            }`}
          >
            {isOpen ? "管理" : "..."}
          </p>
          {adminItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                href={item.href}
                key={item.name}
                title={isOpen ? undefined : item.name}
                className={`
                  group flex items-center text-sm font-medium rounded-xl hover-lift transition-all
                  ${isOpen ? "px-4 py-3" : "px-3 py-3 justify-center"}
                  ${
                    isActive
                      ? "bg-slate-900 text-white shadow-soft"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                `}
              >
                <Icon className={`
                  w-5 h-5 transition-colors flex-shrink-0
                  ${isOpen ? "mr-3" : ""}
                  ${isActive ? "text-slate-300" : "text-slate-400 group-hover:text-slate-600"}
                `} />
                <span
                  className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                    isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ユーザープロファイル */}
      <div className={`absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white/50 ${isOpen ? "p-6" : "p-3"}`}>
        {isPending ? (
          <div className={`flex items-center ${isOpen ? "" : "justify-center"}`}>
            <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
            {isOpen && (
              <div className="ml-3 flex-1">
                <div className="h-4 bg-slate-200 rounded animate-pulse mb-1 w-20" />
                <div className="h-3 bg-slate-200 rounded animate-pulse w-32" />
              </div>
            )}
          </div>
        ) : (
          <div className={`flex items-center ${isOpen ? "" : "justify-center"}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-semibold shadow-soft flex-shrink-0">
              {userInitial}
            </div>
            <div
              className={`ml-3 flex-1 transition-all duration-300 overflow-hidden ${
                isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}
            >
              <p className="text-sm font-semibold text-slate-900 whitespace-nowrap truncate max-w-[140px]">
                {userName}
              </p>
              <p className="text-xs text-slate-500 whitespace-nowrap truncate max-w-[140px]">
                {userEmail}
              </p>
            </div>
            {isOpen && (
              <button
                onClick={handleLogout}
                title="ログアウト"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowRightStartOnRectangleIcon className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
