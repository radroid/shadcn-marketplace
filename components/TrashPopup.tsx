"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, X } from "lucide-react";
import { ComponentPreviewCard } from "@/components/ComponentPreviewCard";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TrashPopupProps {
    isVisible: boolean;
    onClose: () => void;
}

export function TrashPopup({ isVisible, onClose }: TrashPopupProps) {
    const trashComponents = useQuery(api.components.listTrashComponents);
    const restoreComponent = useMutation(api.components.restoreUserComponent);
    const [restoringId, setRestoringId] = useState<Id<"userComponents"> | null>(null);

    const handleRestore = async (id: Id<"userComponents">) => {
        try {
            setRestoringId(id);
            await restoreComponent({ id });
            toast.success("Component restored successfully");
            setRestoringId(null);
        } catch (error) {
            console.error("Failed to restore component:", error);
            toast.error("Failed to restore component");
            setRestoringId(null);
        }
    };

    return (
        <>
            {/* Backdrop with blur */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out",
                    isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
                aria-hidden="true"
            />
            
            {/* Drawer */}
            <div
                className={cn(
                    "fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-2xl transition-transform duration-300 ease-out",
                    "max-h-[80vh] overflow-y-auto rounded-t-lg",
                    isVisible ? "translate-y-0" : "translate-y-full"
                )}
            >
            <div className="container mx-auto py-6 px-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Trash2 className="h-6 w-6 text-muted-foreground" />
                        <div>
                            <h2 className="text-2xl font-bold">Trash</h2>
                            <p className="text-sm text-muted-foreground">
                                {trashComponents === undefined
                                    ? "Loading..."
                                    : trashComponents.length === 0
                                    ? "No deleted components"
                                    : `${trashComponents.length} deleted component${trashComponents.length === 1 ? "" : "s"}`}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {trashComponents === undefined ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">Loading trash...</p>
                    </div>
                ) : trashComponents.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/10">
                        <Trash2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">Your trash is empty</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {trashComponents.map((component: Doc<"userComponents">) => {
                            const deletedDate = component.deletedAt
                                ? new Date(component.deletedAt)
                                : null;
                            const daysUntilPermanent = deletedDate
                                ? Math.ceil(
                                      (7 * 24 * 60 * 60 * 1000 -
                                          (Date.now() - component.deletedAt!)) /
                                          (24 * 60 * 60 * 1000)
                                  )
                                : 0;

                            return (
                                <Card key={component._id} className="flex flex-col border-destructive/20">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{component.name}</CardTitle>
                                        <CardDescription>
                                            Deleted: {deletedDate?.toLocaleDateString()}
                                            {daysUntilPermanent > 0 && (
                                                <span className="block text-xs text-destructive mt-1">
                                                    Permanently deleted in {daysUntilPermanent} day
                                                    {daysUntilPermanent === 1 ? "" : "s"}
                                                </span>
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <ComponentPreviewCard
                                            code={component.code}
                                            previewCode={component.previewCode}
                                            globalCss={component.globalCss}
                                            dependencies={component.dependencies}
                                            componentName={
                                                component.catalogComponentId ||
                                                component.name.toLowerCase().replace(/\s+/g, "-")
                                            }
                                        />
                                    </CardContent>
                                    <CardContent className="pt-0">
                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            onClick={() => handleRestore(component._id)}
                                            disabled={restoringId === component._id}
                                        >
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            {restoringId === component._id
                                                ? "Restoring..."
                                                : "Restore"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
                </div>
            </div>
        </>
    );
}

