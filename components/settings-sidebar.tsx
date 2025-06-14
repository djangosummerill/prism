"use client";

import { ComponentProps } from "react";
import {
  IconUser,
  IconPalette,
  IconShield,
  IconBell,
  IconKey,
  IconLanguage,
  IconMoon,
  IconSettings,
  IconHelpCircle,
  IconCreditCard,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";

const settingsItems = [
  {
    title: "General",
    icon: IconSettings,
    href: "/settings",
  },
  {
    title: "Profile",
    icon: IconUser,
    href: "/settings/profile",
  },
  {
    title: "Appearance",
    icon: IconPalette,
    href: "/settings/appearance",
  },
  {
    title: "Privacy & Security",
    icon: IconShield,
    href: "/settings/privacy",
  },
  {
    title: "Notifications",
    icon: IconBell,
    href: "/settings/notifications",
  },
  {
    title: "API Keys",
    icon: IconKey,
    href: "/settings/api-keys",
  },
  {
    title: "Language",
    icon: IconLanguage,
    href: "/settings/language",
  },
  {
    title: "Billing",
    icon: IconCreditCard,
    href: "/settings/billing",
  },
];

const supportItems = [
  {
    title: "Help & Support",
    icon: IconHelpCircle,
    href: "/settings/help",
  },
];

export function SettingsSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="none" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div className="flex items-center gap-2 px-2 py-1">
                <IconSettings className="size-5" />
                <span className="text-base font-bold">Settings</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <a href={item.href} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <a href={item.href} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
