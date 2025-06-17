"use client";

import { ComponentProps, useState } from "react";
import {
  IconPrism,
  IconTrash,
  IconEdit,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
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
import { Input } from "./ui/input";
import { NavUser } from "./nav-user";
import { useRouter } from "next/navigation";
import { useChatContext } from "@/lib/chat-context";
import { DeleteDialog } from "./delete-dialog";
import { deleteChat, renameChat } from "@/lib/chat-store";
import { format, isToday, isYesterday } from "date-fns";

// Helper to group chats by date (descending)
function groupChatsByDate(chats: any[]) {
  const groups: Record<string, any[]> = {};
  chats.forEach((chat) => {
    const date = format(new Date(chat.created_at), "yyyy-MM-dd");
    if (!groups[date]) groups[date] = [];
    groups[date].push(chat);
  });
  // Sort groups by date descending
  return Object.entries(groups)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, chats]) => [date, chats] as [string, any[]]);
}

// Helper to get label for a date
function getDateLabel(dateString: string) {
  const date = new Date(dateString);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d, yyyy");
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const {
    chats,
    currentChatId,
    setCurrentChatId,
    updateChatTitle,
    deleteChat: deleteCachedChat,
  } = useChatContext();

  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleChatClick = (chatId: string) => {
    setCurrentChatId(chatId);
    router.push(`/chat/${chatId}`);
  };

  const handleNewChat = () => {
    setCurrentChatId(undefined);
    router.push("/");
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      chat.title = newTitle;
      await updateChatTitle(chatId, newTitle);
      await renameChat(chatId, newTitle);
    }
  };

  // Filter and sort chats by createdAt descending
  const filteredChats = chats
    .filter((chat) =>
      (chat.title ?? "Untitled Chat")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  // Group chats by date
  const groupedChats = groupChatsByDate(filteredChats);

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
        className="font-semibold m-2 mb-2"
        onClick={handleNewChat}
      >
        New Chat
      </Button>
      <div className="relative mx-2 mb-2">
        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-10"
        />
        <Button
          variant="ghost"
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground ${
            searchQuery == "" ? "hidden" : ""
          }`}
          onClick={() => setSearchQuery("")}
        >
          <IconX />
        </Button>
      </div>
      <SidebarContent className="p-2">
        {filteredChats.length === 0 && searchQuery ? (
          <div className="pt-1.5 px-2 text-sm text-muted-foreground overflow-hidden whitespace-nowrap text-ellipsis">
            No chats found for "{searchQuery}"
          </div>
        ) : (
          groupedChats.map(([date, chatsForDate]) => (
            <SidebarGroup className="p-0 m-0" key={date}>
              <SidebarGroupLabel>{getDateLabel(date)}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chatsForDate.map((chat) => {
                    const isEditing = editingChatId === chat.id;
                    return (
                      <SidebarMenuItem
                        key={chat.id}
                        className="relative"
                        onMouseEnter={() => setHoveredChatId(chat.id)}
                        onMouseLeave={() => setHoveredChatId(null)}
                      >
                        <SidebarMenuButton
                          onClick={() => {
                            if (!isEditing) handleChatClick(chat.id);
                          }}
                          className={`${
                            currentChatId === chat.id ? "bg-muted" : ""
                          } ${
                            hoveredChatId === chat.id
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : ""
                          }`}
                        >
                          {isEditing ? (
                            <input
                              className="bg-transparent border-none focus:outline-none w-full"
                              value={editedTitle}
                              autoFocus
                              onChange={(e) => setEditedTitle(e.target.value)}
                              onBlur={() => {
                                if (editedTitle.trim()) {
                                  handleRenameChat(chat.id, editedTitle.trim());
                                }
                                setEditingChatId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") e.currentTarget.blur();
                                if (e.key === "Escape") setEditingChatId(null);
                              }}
                            />
                          ) : (
                            <span className="truncate whitespace-nowrap overflow-hidden w-full">
                              {chat.title ?? "Untitled Chat"}
                            </span>
                          )}
                        </SidebarMenuButton>

                        {hoveredChatId === chat.id && (
                          <div className="absolute right-0 top-0 bottom-0 flex items-center pr-1">
                            <div className="absolute right-0 top-0 bottom-0 w-14 bg-muted rounded-r-md pointer-events-none" />
                            <div className="absolute right-14 top-0 bottom-0 w-6 bg-gradient-to-l from-muted to-transparent pointer-events-none" />
                            <div className="relative z-10 flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 transition-opacity hover:bg-border"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingChatId(chat.id);
                                  setEditedTitle(chat.title ?? "");
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
                                  setDeletingChatId(chat.id);
                                  setOpen(true);
                                }}
                              >
                                <IconTrash className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
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
