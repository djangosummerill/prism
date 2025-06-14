import { SettingsHeader } from "@/components/settings-header";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IconPrism } from "@tabler/icons-react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SettingsHeader />
      <div className="flex flex-1 overflow-hidden">
        <SettingsSidebar side="left" className="rounded-bl-lg" />
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </>
  );
}
