import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

export const AppShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex">
    <Sidebar />
    <main className="ml-72 flex-1">
      <TopBar />
      <div className="p-8 animate-fade-in">{children}</div>
    </main>
  </div>
);
