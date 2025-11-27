"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import ComponentEditor from "@/components/editor/ComponentEditor";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SaveStatus } from "@/components/editor/SaveStatusIndicator";
import { useDesignPage } from "@/components/DesignPageContext";
import { useUser } from "@clerk/nextjs";

function DesignPageContent() {
    const params = useParams();
    const id = params.id as Id<"userComponents">;
    const { isSignedIn } = useUser();

    const component = useQuery(api.components.getUserComponent, { id });
    const updateComponent = useMutation(api.components.updateUserComponent);
    const publishComponent = useMutation(api.components.publishComponent);

    const [isPublishOpen, setIsPublishOpen] = useState(false);
    const [publishName, setPublishName] = useState("");
    const [publishDesc, setPublishDesc] = useState("");
    const [publishCategory, setPublishCategory] = useState("Buttons");
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');


    const handlePublish = async () => {
        if (!isSignedIn) {
            toast.error("Please sign in to publish components");
            return;
        }

        try {
            await publishComponent({
                id,
                name: publishName,
                description: publishDesc,
                category: publishCategory,
            });
            toast.success("Component published to marketplace!");
            setIsPublishOpen(false);
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "Failed to publish component";
            if (errorMessage.includes("Unauthenticated")) {
                toast.error("Please sign in to publish components");
            } else {
                toast.error("Failed to publish component");
            }
        }
    };

    // Initialize publish name from component
    const initialPublishName = component?.name || "";
    useEffect(() => {
        if (component && !publishName) {
            setPublishName(initialPublishName);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // We need local state to track edits before saving, 
    // BUT ComponentEditor currently doesn't expose onChange to parent easily 
    // unless we lift state up.
    // The ComponentEditor uses Sandpack's internal state.
    // To save, we need to get the code from Sandpack.
    // However, Sandpack state is inside the provider.
    // We might need to refactor ComponentEditor to accept an onChange callback 
    // or use a ref to get the current code.
    // Actually, Sandpack has `useActiveCode` but it must be used INSIDE SandpackProvider.

    // Refactor Plan:
    // We will pass an `onSave` prop to ComponentEditor? 
    // Or better, ComponentEditor should handle the "Save" button internally if we want access to code?
    // OR we lift the SandpackProvider up to this page?

    // Let's modify ComponentEditor to accept `onCodeChange` and we manage state here?
    // But Sandpack manages multiple files.

    // Simplest approach for now:
    // Put the "Save" button INSIDE ComponentEditor (or a custom header inside it)
    // so it has access to `useSandpack`.

    // But the requirement says "Auto-saves".
    // So we should use `useActiveCode` inside ComponentEditor and trigger a debounce save.

    // Let's go with:
    // 1. Pass `onSave` callback to ComponentEditor.
    // 2. Inside ComponentEditor, use `useActiveCode` and `useEffect` to call `onSave` (debounced).

    // Wait, `useActiveCode` only gives the *active* file.
    // We need all files if we are saving multiple.
    // `useSandpack` gives `sandpack.files`.

    // Let's update ComponentEditor to accept `onFilesChange`.

    // Register the publish click handler with the context
    const designPageContext = useDesignPage();
    const setPublishHandler = designPageContext?.setPublishHandler;
    
    useEffect(() => {
        if (!setPublishHandler) return;
        
        const handlePublishClick = () => {
            setIsPublishOpen(true);
        };
        
        setPublishHandler(handlePublishClick);
        
        // Cleanup: remove handler when component unmounts
        return () => {
            setPublishHandler(null);
        };
    }, [setPublishHandler]);

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
                <Dialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Publish to Marketplace</DialogTitle>
                            <DialogDescription>
                                Share your component with the world.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" value={publishName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPublishName(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="desc" className="text-right">Description</Label>
                                <Input id="desc" value={publishDesc} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPublishDesc(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="cat" className="text-right">Category</Label>
                                <Input id="cat" value={publishCategory} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPublishCategory(e.target.value)} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handlePublish}>Publish</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {component ? (
                    <div className="flex-1 min-h-0">
                        <ComponentEditor
                        code={component.code}
                        previewCode={component.previewCode}
                        globalCss={component.globalCss}
                        dependencies={component.dependencies}
                        componentName={component.catalogComponentId || "component"}
                        componentDisplayName={component.name}
                        componentDescription={component.catalogComponentId ? `Shadcn ui: ${component.catalogComponentId}` : undefined}
                        onSave={async (files) => {
                            if (!isSignedIn) {
                                setSaveStatus('error');
                                toast.error("Please sign in to save changes");
                                return;
                            }

                            setSaveStatus('saving');
                            try {
                                const componentPath = `/components/ui/${component.catalogComponentId || "component"}.tsx`;
                                await updateComponent({
                                    id,
                                    code: files[componentPath]?.code || component.code,
                                    previewCode: files["/Preview.tsx"]?.code || component.previewCode,
                                    globalCss: files["/globals.css"]?.code || component.globalCss,
                                });
                                setSaveStatus('saved');

                                // Reset to idle after 2 seconds
                                setTimeout(() => setSaveStatus('idle'), 2000);
                            } catch (error) {
                                console.error(error);
                                setSaveStatus('error');
                                const errorMessage = error instanceof Error ? error.message : "Failed to save changes";
                                if (errorMessage.includes("Unauthenticated")) {
                                    toast.error("Please sign in to save changes");
                                } else {
                                    toast.error("Failed to save changes");
                                }
                            }
                        }}
                            saveStatus={saveStatus}
                        />
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                )}
            </div>
    );
}

export default function DesignPage() {
    return <DesignPageContent />;
}
