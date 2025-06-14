"use client";

import { ComponentProps } from "react";
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
import { useChatContext } from "@/lib/chat-context";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { chats, currentChatId, setCurrentChatId } = useChatContext();

  const handleChatClick = (chatId: string) => {
    setCurrentChatId(chatId);
    router.push(`/chat/${chatId}`);
  };

  const handleNewChat = () => {
    setCurrentChatId(undefined);
    router.push("/");
  };

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
      <Button
        variant="outline"
        className="font-semibold m-2"
        onClick={handleNewChat}
      >
        New Chat
      </Button>
      <SidebarContent className="p-2">
        <SidebarGroup className="p-0 m-0">
          <SidebarGroupLabel>Today</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    onClick={() => handleChatClick(chat.id)}
                    className={currentChatId === chat.id ? "bg-muted" : ""}
                  >
                    {chat.title ?? "Untitled Chat"}
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
