"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      <Input
        value={internalValue}
        placeholder={placeholder}
        onChange={handleInputChange}
        {...props}
      />
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
