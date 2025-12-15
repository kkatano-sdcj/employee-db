"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar-context";

const AppShellContent = ({ children }: { children: React.ReactNode }) => {
  const { isOpen } = useSidebar();

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isOpen ? "ml-72" : "ml-20"
        }`}
      >
        <TopBar />
        <div className="p-8 animate-fade-in">{children}</div>
      </main>
    </div>
  );
};

export const AppShell = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <AppShellContent>{children}</AppShellContent>
  </SidebarProvider>
);
