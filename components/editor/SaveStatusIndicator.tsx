import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveStatusIndicatorProps {
    status: SaveStatus;
    hasChanges?: boolean;
}

export default function SaveStatusIndicator({ status, hasChanges = false }: SaveStatusIndicatorProps) {
    if (status === 'idle') {
        // Show orange dot when there are unsaved changes
        if (hasChanges) {
            return (
                <div className="flex items-center gap-2 text-sm">
                    <Circle className="h-2 w-2 fill-orange-500 text-orange-500 animate-pulse" />
                </div>
            );
        }
        // Show "Saved" when there are no changes
        return (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Saved</span>
            </div>
        );
    }

    if (status === 'saving') {
        return (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving changes</span>
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
                <span>Error</span>
            </div>
        );
    }

    return null;
}
