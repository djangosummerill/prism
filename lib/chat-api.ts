// lib/chat-api.ts

export async function generateTitle(message: string, id: string) {
  const res = await fetch("/api/title", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, id }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data?.error || data?.message || res.statusText || "Unknown error"
    );
  }
  return res.text();
}

export async function deleteMessagesFromIndex(
  chatId: string,
  messageIndex: number
) {
  const response = await fetch("/api/deletemessages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, fromIndex: messageIndex }),
  });
  if (!response.ok) throw new Error("Failed to delete messages");
}
