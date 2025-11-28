"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw, Save } from "lucide-react";
import { ThemeSelector } from "./ThemeSelector";
import SaveStatusIndicator, { SaveStatus } from "./SaveStatusIndicator";

interface EditorToolbarProps {
  componentDisplayName?: string;
  componentDescription?: string;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  saveStatus: SaveStatus;
  readOnly?: boolean;
  onReset: () => void;
  onSave: () => void;
  hasChanges?: boolean;
}

export function EditorToolbar({
  componentDisplayName,
  componentDescription,
  currentTheme,
  onThemeChange,
  saveStatus,
  readOnly,
  onReset,
  onSave,
  hasChanges = false,
}: EditorToolbarProps) {
  return (
    <div className="bg-muted/50 border-b border-border shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        {/* Component Info */}
        <div className="flex items-center gap-2 min-w-0 shrink">
          {componentDisplayName && (
            <h1 className="font-semibold truncate">{componentDisplayName}</h1>
          )}
          {componentDescription && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {componentDescription}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex items-center gap-2">
            {!readOnly && (
              <ThemeSelector
                currentTheme={currentTheme}
                onThemeChange={onThemeChange}
              />
            )}
            <SaveStatusIndicator status={saveStatus} hasChanges={hasChanges} />
          </div>

          {!readOnly && (
            <div className="flex items-center gap-1">
              <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onReset}
                title="Reset to last saved"
                disabled={!hasChanges}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              {hasChanges && (
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 px-3 ml-1"
                  onClick={onSave}
                  disabled={saveStatus === "saving"}
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Save
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

