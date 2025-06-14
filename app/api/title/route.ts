import { createClient } from "@/lib/supabase/server";
import { generateTitle } from "@/lib/title";

export async function POST(req: Request) {
  const { message, id } = await req.json();
  const supabase = await createClient();
  const title = await generateTitle(message);

  const { data, error } = await supabase
    .from("chats")
    .update({ title: title })
    .eq("id", id);

  return new Response(title);
}
