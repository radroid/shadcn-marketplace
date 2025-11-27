import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import registry from "./registry.json";

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [pendingTheme, setPendingTheme] = React.useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);

  const handleThemeSelect = (value: string) => {
    if (value === currentTheme) return;
    setPendingTheme(value);
    setIsAlertOpen(true);
  };

  const handleConfirm = () => {
    if (pendingTheme) {
      onThemeChange(pendingTheme);
    }
    setIsAlertOpen(false);
    setPendingTheme(null);
  };

  const handleCancel = () => {
    setIsAlertOpen(false);
    setPendingTheme(null);
  };

  return (
    <>
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

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch Theme?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to switch to the "{pendingTheme}" theme? This will update the preview styles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Switch</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

