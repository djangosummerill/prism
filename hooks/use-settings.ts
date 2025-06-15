import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const SETTINGS_KEY = "settings_cache";

export type Settings = Record<string, any>; // value is now any (jsonb)

function getCachedSettings(): Settings {
  try {
    const cached = localStorage.getItem(SETTINGS_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
}

function setCachedSettings(settings: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore write errors
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(getCachedSettings());
  const supabase = createClient();

  // Fetch current user and their settings
  const fetchSettings = useCallback(async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("Could not fetch user for settings.");
      return;
    }

    const { data, error } = await supabase
      .from("settings")
      .select("key, value")
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to fetch settings: " + error.message);
      return;
    }
    if (data) {
      const settingsObj: Settings = {};
      data.forEach((row: { key: string; value: any }) => {
        settingsObj[row.key] = row.value;
      });
      setSettings(settingsObj);
      setCachedSettings(settingsObj);
    }
  }, [supabase]);

  // Update a setting for the current user
  const updateSetting = useCallback(
    async (key: string, value: any) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Could not fetch user for settings.");
        return false;
      }

      const { error } = await supabase.from("settings").upsert(
        [{ user_id: user.id, key, value }],
        { onConflict: "user_id,key" } // composite key
      );

      if (error) {
        toast.error(error.message);
        return false;
      }
      // Update local state and cache immediately
      setSettings((prev) => {
        const updated = { ...prev, [key]: value };
        setCachedSettings(updated);
        return updated;
      });
      toast.success("Setting updated!");
      return true;
    },
    [supabase]
  );

  // On mount, fetch from Supabase in background
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    refresh: fetchSettings,
    updateSetting,
  };
}
