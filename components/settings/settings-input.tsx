"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";

interface SettingsInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  placeholder: string;
  onSave?: (value: string) => void;
}

export function SettingsInput({
  value = "",
  placeholder,
  onSave,
  ...props
}: SettingsInputProps) {
  // Track the last saved value
  const [lastSavedValue, setLastSavedValue] = React.useState(value ?? "");
  const [internalValue, setInternalValue] = React.useState(value ?? "");

  // Update both internal and last saved value if the prop changes
  React.useEffect(() => {
    setInternalValue(value ?? "");
    setLastSavedValue(value ?? "");
  }, [value]);

  const hasChanged = internalValue !== lastSavedValue;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(internalValue);
    }
    setLastSavedValue(internalValue); // Mark as saved
  };

  return (
    <div className="flex items-center">
      <div className="relative w-full">
        <Input
          value={internalValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          className="pr-9.5" // Add right padding so text doesn't go under the icon
          {...props}
        />
        {internalValue !== "" && (
          <Button
            variant="ghost"
            onClick={() => setInternalValue("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <IconX className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Button
        type="button"
        onClick={handleSave}
        disabled={!hasChanged}
        className="ml-2"
      >
        Save
      </Button>
    </div>
  );
}
