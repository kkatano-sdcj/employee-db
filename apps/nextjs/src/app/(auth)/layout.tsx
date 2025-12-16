import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            従業員データベース
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Employee Database System
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
