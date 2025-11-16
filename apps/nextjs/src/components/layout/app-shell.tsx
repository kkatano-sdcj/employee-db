import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

export const AppShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-slate-50">
    <Sidebar />
    <div className="flex flex-col lg:ml-72">
      <TopBar />
      <main className="px-4 pb-16 pt-8 lg:px-10">{children}</main>
    </div>
  </div>
);
