import { useTheme } from "next-themes";
import { SettingsDropdown } from "../settings-dropdown";
import { SettingsItem } from "../settings-item";
import { SettingsSection } from "../settings-section";
import { SettingsInput } from "../settings-input";

export default function BYOK() {
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
            onSave={(key) => {
              console.log(key);
            }}
          />
        }
      />
    </SettingsSection>
  );
}
