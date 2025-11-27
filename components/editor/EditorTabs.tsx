import React from "react";
import { useSandpack } from "@codesandbox/sandpack-react";
import { cn } from "@/lib/utils";
import { FileCode2, FileJson, FileType } from "lucide-react";

export function EditorTabs() {
    const { sandpack } = useSandpack();
    const { activeFile, visibleFiles, setActiveFile } = sandpack;

    const getFileIcon = (fileName: string) => {
        if (fileName.endsWith(".tsx") || fileName.endsWith(".ts")) return <FileCode2 className="w-4 h-4 text-blue-500" />;
        if (fileName.endsWith(".css")) return <FileType className="w-4 h-4 text-blue-400" />;
        if (fileName.endsWith(".json")) return <FileJson className="w-4 h-4 text-yellow-500" />;
        return <FileCode2 className="w-4 h-4 text-gray-500" />;
    };

    const getFileName = (filePath: string) => {
        const parts = filePath.split("/");
        return parts[parts.length - 1];
    };

    return (
        <div className="flex items-center h-full overflow-x-auto no-scrollbar py-2">
            {visibleFiles.map((filePath: string) => (
                <button
                    key={filePath}
                    onClick={() => setActiveFile(filePath)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm border-r border-border min-w-[120px] max-w-[200px] transition-colors relative",
                        activeFile === filePath
                            ? "bg-background text-foreground font-medium"
                            : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                >
                    {activeFile === filePath && (
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />
                    )}
                    {getFileIcon(filePath)}
                    <span className="truncate">{getFileName(filePath)}</span>
                </button>
            ))}
        </div>
    );
}
