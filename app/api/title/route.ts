import { createClient } from "@/lib/supabase/server";
import { generateTitle } from "@/lib/title";
import { toast } from "sonner";

export async function POST(req: Request) {
  const { message, id } = await req.json();
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response("User not authenticated", { status: 401 });
  }

  try {
    const title = await generateTitle(message, user.id);
    const { data, error } = await supabase
      .from("chats")
      .update({ title: title })
      .eq("id", id)
      .eq("user_id", user.id);

    return new Response(title);
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
