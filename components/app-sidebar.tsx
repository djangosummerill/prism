"use client";

import { useEffect, useState, ComponentProps } from "react";
import { IconPrism } from "@tabler/icons-react";

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
import { Button } from "./ui/button";
import { NavUser } from "./nav-user";
import { useRouter } from "next/navigation";
import { loadChats } from "@/lib/chat-store";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]); // Replace `any` with proper type if available

  useEffect(() => {
    async function fetchChats() {
      const loadedChats = await loadChats();
      setChats(loadedChats);
    }

    fetchChats();
  }, []);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconPrism className="!size-5" />
                <span className="text-base font-bold">Prism</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <Button
          variant="outline"
          className="font-semibold"
          onClick={() => router.push("/")}
        >
          New Chat
        </Button>
        <SidebarGroup className="p-0 m-0">
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    onClick={() => router.push(`/chat/${chat.id}`)}
                  >
                    {chat.name ?? "Untitled Chat"}
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
