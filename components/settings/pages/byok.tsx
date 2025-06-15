import { useTheme } from "next-themes";
import { SettingsDropdown } from "../settings-dropdown";
import { SettingsItem } from "../settings-item";
import { SettingsSection } from "../settings-section";
import { SettingsInput } from "../settings-input";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";

export default function BYOK() {
  const { settings, updateSetting } = useSettings();

  // If you want to use a more specific key, change "key" to "openrouter_api_key"
  const apiKey = settings["key"] ?? "";

  return (
    <SettingsSection
      title="OpenRouter"
      description="Bypass rate limits by using your own API key."
    >
      <SettingsItem
        label="API Key"
        description="Your OpenRouter API key."
        control={
          <SettingsInput
            placeholder="sk-or-v1-..."
            value={apiKey}
            onSave={async (key) => {
              await updateSetting("key", key);
            }}
          />
        }
      />
    </SettingsSection>
  );
}
