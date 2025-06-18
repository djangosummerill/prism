"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function signin(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect(`/auth/signin?error=${error.message}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signinWithGoogle() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: siteUrl,
    },
  });

  if (error) {
    redirect(`/auth/signin?error=${error.message}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}
