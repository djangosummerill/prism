import { useTheme } from "next-themes";
import { SettingsDropdown } from "../settings-dropdown";
import { SettingsItem } from "../settings-item";
import { SettingsSection } from "../settings-section";

export default function Appearance() {
  const { theme, setTheme } = useTheme();

  return (
    <SettingsSection
      title="Theme"
      description="Switch between light and dark mode."
    >
      <SettingsItem
        label="Dark mode"
        description="Enable dark mode for this app."
        control={
          <SettingsDropdown
            defaultValue={theme ?? "system"}
            onChange={(theme) => setTheme(theme)}
            options={[
              { label: "System", value: "system" },
              { label: "Light", value: "light" },
              { label: "Dark", value: "dark" },
            ]}
          />
        }
      />
    </SettingsSection>
  );
}
