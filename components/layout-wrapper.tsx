"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { ChatProvider } from "@/lib/chat-context";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const { theme } = useTheme();

  // Don't show sidebar on auth pages
  const isAuthPage = pathname.startsWith("/auth");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <ChatProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 64)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset className="flex flex-col">{children}</SidebarInset>
        <Toaster
          theme={(theme as "system" | "light" | "dark" | undefined) ?? "system"}
        />
      </SidebarProvider>
    </ChatProvider>
  );
}
