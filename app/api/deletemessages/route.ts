import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { chatId, fromIndex } = await req.json();

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response("User not authenticated", { status: 401 });
    }

    // Get all messages for this chat ordered by creation time
    const { data: messages, error: fetchError } = await supabase
      .from("messages")
      .select("id, created_at")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch messages: ${fetchError.message}`);
    }

    if (!messages || messages.length === 0) {
      return new Response("No messages found", { status: 404 });
    }

    // Get messages to delete (from the specified index onwards)
    const messagesToDelete = messages.slice(fromIndex);

    if (messagesToDelete.length === 0) {
      return new Response("No messages to delete", { status: 200 });
    }

    // Delete the messages
    const messageIds = messagesToDelete.map((msg) => msg.id);
    const { error: deleteError } = await supabase
      .from("messages")
      .delete()
      .in("id", messageIds);

    if (deleteError) {
      throw new Error(`Failed to delete messages: ${deleteError.message}`);
    }

    return new Response(
      JSON.stringify({
        deleted: messagesToDelete.length,
        messageIds,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting messages:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
