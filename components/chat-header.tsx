"use client";

import { useState, useRef, useEffect, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
import { useChatContext } from "@/lib/chat-context";
import { renameChat } from "@/lib/chat-store";

interface ChatHeaderProps {
  chatName?: string;
  newChat: boolean;
  onRename?: (newName: string) => void;
}

export function ChatHeader({
  chatName = "New Chat",
  newChat,
  onRename,
}: ChatHeaderProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(chatName);
  const inputRef = useRef<HTMLInputElement>(null);
  const clickOffsetRef = useRef<number | null>(null);
  const { chats, updateChatTitle } = useChatContext();

  useEffect(() => {
    setValue(chatName);
  }, [chatName]);

  useEffect(() => {
    if (editing && inputRef.current) {
      const input = inputRef.current;
      input.focus();

      if (clickOffsetRef.current !== null) {
        input.setSelectionRange(clickOffsetRef.current, clickOffsetRef.current);
        clickOffsetRef.current = null; // Clear after applying
      } else {
        input.select(); // fallback to full select if no offset
      }
    }
  }, [editing]);

  const handleSave = () => {
    const trimmed = value.trim() || "Untitled Chat";
    setValue(trimmed);
    setEditing(false);
    if (trimmed !== chatName && onRename) {
      onRename(trimmed);
    }
  };

  const handleCancel = () => {
    setValue(chatName);
    setEditing(false);
  };

  const handleEditClick = (e: MouseEvent<HTMLHeadingElement>) => {
    if (newChat) return;

    // Find click offset in text
    const range = document.createRange();
    const selection = window.getSelection();

    const node = e.currentTarget.firstChild;
    if (node && typeof node.nodeValue === "string") {
      const offset = getClickTextOffset(e, node, e.currentTarget);
      clickOffsetRef.current = offset;
    }

    setEditing(true);
  };

  const getClickTextOffset = (
    e: MouseEvent,
    node: ChildNode,
    container: HTMLElement
  ) => {
    const text = node.nodeValue!;
    const clickX = e.clientX;

    for (let i = 0; i < text.length; i++) {
      const range = document.createRange();
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const rect = range.getBoundingClientRect();

      if (clickX < rect.left) {
        // Clicked before this character
        return i;
      }

      const midpoint = rect.left + rect.width / 2;

      if (clickX < midpoint) {
        // Clicked on left half of character → cursor before char
        return i;
      } else if (clickX <= rect.right) {
        // Clicked on right half of character → cursor after char
        return i + 1;
      }
    }

    // Click after last character
    return text.length;
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink onClick={() => router.push("/")}>
                <h1 className="text-base font-medium cursor-pointer">Chats</h1>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {editing ? (
                  <div className="relative inline-block">
                    <span
                      className="invisible text-base font-medium whitespace-pre"
                      aria-hidden="true"
                    >
                      {value || " "}
                    </span>
                    <input
                      ref={inputRef}
                      className="absolute inset-0 text-base font-medium bg-transparent border-none focus:outline-none w-full"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onBlur={handleSave}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave();
                        if (e.key === "Escape") handleCancel();
                      }}
                    />
                  </div>
                ) : (
                  <h1
                    className={`text-base font-medium  ${
                      newChat ? "cursor-default" : "cursor-text"
                    }`}
                    onClick={handleEditClick}
                    title={newChat ? "" : "Click to edit"}
                  >
                    {value}
                  </h1>
                )}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
