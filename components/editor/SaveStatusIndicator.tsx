import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveStatusIndicatorProps {
    status: SaveStatus;
}

export default function SaveStatusIndicator({ status }: SaveStatusIndicatorProps) {
    if (status === 'idle') {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Circle className="h-4 w-4" />
                <span>Ready</span>
            </div>
        );
    }

    if (status === 'saving') {
        return (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
            </div>
        );
    }

    if (status === 'saved') {
        return (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Saved</span>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <XCircle className="h-4 w-4" />
                <span>Save failed</span>
            </div>
        );
    }

    return null;
}
