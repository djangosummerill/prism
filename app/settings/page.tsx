"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SettingsHeader } from "@/components/settings-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Settings() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SettingsHeader />
      </SidebarInset>
    </SidebarProvider>
  );
}
