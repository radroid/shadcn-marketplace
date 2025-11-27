"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { ComponentPreviewCard } from "@/components/ComponentPreviewCard";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export default function ComponentsPage() {
    const components = useQuery(api.components.listUserComponents);
    const deleteComponent = useMutation(api.components.deleteUserComponent);
    const [deletingId, setDeletingId] = useState<Id<"userComponents"> | null>(null);

    const handleDelete = async (id: Id<"userComponents">) => {
        try {
            setDeletingId(id);
            await deleteComponent({ id });
            toast.success("Component moved to trash. It will be permanently deleted after 7 days.");
            setDeletingId(null);
        } catch (error) {
            console.error("Failed to delete component:", error);
            toast.error("Failed to delete component");
            setDeletingId(null);
        }
    };

    if (components === undefined) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">My Components</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your customized components.
                </p>
            </div>

            {components.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/10">
                    <p className="text-muted-foreground">You haven&apos;t created any components yet.</p>
                    <Link href="/">
                        <Button>Browse Marketplace</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {components.map((component) => (
                        <Card key={component._id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{component.name}</CardTitle>
                                <CardDescription>Last updated: {new Date(component._creationTime).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ComponentPreviewCard
                                    code={component.code}
                                    previewCode={component.previewCode}
                                    globalCss={component.globalCss}
                                    dependencies={component.dependencies}
                                    componentName={component.catalogComponentId || component.name.toLowerCase().replace(/\s+/g, "-")}
                                />
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Link href={`/design/${component._id}`} className="flex-1">
                                    <Button className="w-full" variant="outline">Edit Design</Button>
                                </Link>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            disabled={deletingId === component._id}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Component</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete &quot;{component.name}&quot;? 
                                                This action will move it to trash. It will be permanently deleted after 7 days.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(component._id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

