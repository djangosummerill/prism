"use client";

import { ComponentProps, useState } from "react";
import { IconPrism, IconTrash, IconEdit } from "@tabler/icons-react";

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
import { DeleteDialog } from "./delete-dialog";
import { deleteChat } from "@/lib/chat-store";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const {
    chats,
    currentChatId,
    setCurrentChatId,
    deleteChat: deleteCachedChat,
  } = useChatContext();
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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
                <SidebarMenuItem
                  key={chat.id}
                  className="relative"
                  onMouseEnter={() => setHoveredChatId(chat.id)}
                  onMouseLeave={() => setHoveredChatId(null)}
                >
                  <SidebarMenuButton
                    onClick={() => handleChatClick(chat.id)}
                    className={`${
                      currentChatId === chat.id ? "bg-muted" : ""
                    } ${
                      hoveredChatId === chat.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : ""
                    }`}
                  >
                    {chat.title ?? "Untitled Chat"}
                  </SidebarMenuButton>
                  {hoveredChatId === chat.id && (
                    <div className="absolute right-0 top-0 bottom-0 flex items-center pr-1">
                      <div className="absolute right-0 top-0 bottom-0 w-14 bg-muted rounded-r-md" />
                      <div className="absolute right-14 top-0 bottom-0 w-6 bg-gradient-to-l from-muted to-transparent" />
                      <div className="relative z-10 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 transition-opacity hover:bg-border"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement edit functionality
                          }}
                        >
                          <IconEdit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 transition-opacity hover:bg-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingChatId(chat.id); // this could probably be replaced with hoveredChatId but i don't wanna take any chances
                            setOpen(true);
                            // TODO: Implement delete functionality
                          }}
                        >
                          <IconTrash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <DeleteDialog
        open={open}
        setOpen={setOpen}
        onConfirm={() => {
          deleteChat(deletingChatId || "");
          deleteCachedChat(deletingChatId || "");
        }}
      />
    </Sidebar>
  );
}
