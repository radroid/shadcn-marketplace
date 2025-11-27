import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import registry from "./registry.json";

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const handleThemeSelect = (value: string) => {
    if (value === currentTheme) return;
    onThemeChange(value);
  };

  return (
    <Select value={currentTheme} onValueChange={handleThemeSelect}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Theme" />
      </SelectTrigger>
      <SelectContent>
        {registry.items.map((item) => (
          <SelectItem key={item.name} value={item.name}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
