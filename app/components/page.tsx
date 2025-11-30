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
import { useState, useMemo } from "react";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { TrashPopup } from "@/components/TrashPopup";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Filter, SortAsc } from "lucide-react";

type SortOption = "name-asc" | "name-desc" | "date-created-asc" | "date-created-desc" | "date-updated-asc" | "date-updated-desc";
type FilterOption = "all" | "recent" | "oldest";

export default function ComponentsPage() {
    const components = useQuery(api.components.listUserComponents);
    const trashComponents = useQuery(api.components.listTrashComponents);
    const deleteComponent = useMutation(api.components.deleteUserComponent);
    const [deletingId, setDeletingId] = useState<Id<"userComponents"> | null>(null);
    const [showTrash, setShowTrash] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>("date-updated-desc");
    const [filterBy, setFilterBy] = useState<FilterOption>("all");

    const handleDelete = async (id: Id<"userComponents">) => {
        try {
            setDeletingId(id);
            await deleteComponent({ id });
            toast.success("Component moved to trash. Click the trash icon to view.");
            setDeletingId(null);
        } catch (error) {
            console.error("Failed to delete component:", error);
            toast.error("Failed to delete component");
            setDeletingId(null);
        }
    };

    // Filter and sort components - must be called before any conditional returns
    const filteredAndSortedComponents = useMemo(() => {
        if (!components) return [];

        let filtered = [...components];

        // Apply filters
        if (filterBy === "recent") {
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            filtered = filtered.filter(
                (component) => component._creationTime >= sevenDaysAgo
            );
        } else if (filterBy === "oldest") {
            const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
            filtered = filtered.filter(
                (component) => component._creationTime <= thirtyDaysAgo
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name-asc":
                    return a.name.localeCompare(b.name);
                case "name-desc":
                    return b.name.localeCompare(a.name);
                case "date-created-asc":
                    return a._creationTime - b._creationTime;
                case "date-created-desc":
                    return b._creationTime - a._creationTime;
                case "date-updated-asc":
                    return a._creationTime - b._creationTime;
                case "date-updated-desc":
                    return b._creationTime - a._creationTime;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [components, sortBy, filterBy]);

    // Collect all unique registry dependencies from filtered components
    const allRegistryDependencies = useMemo(() => {
        if (!filteredAndSortedComponents) return [];
        
        const depsSet = new Set<string>();
        filteredAndSortedComponents.forEach(component => {
            if (component.registryDependencies) {
                component.registryDependencies.forEach(dep => depsSet.add(dep));
            }
        });
        
        return Array.from(depsSet);
    }, [filteredAndSortedComponents]);

    // Batch load all registry dependencies at once for performance
    const registryComponentCode = useQuery(
        api.components.getResolvedRegistryComponents,
        allRegistryDependencies.length > 0 ? { ids: allRegistryDependencies } : "skip"
    );

    // Helper to get registry code for a specific component
    const getRegistryCodeForComponent = (component: Doc<"userComponents">) => {
        if (!component.registryDependencies || !registryComponentCode) return undefined;
        
        const filteredCode: Record<string, { code: string; dependencies?: Record<string, string> }> = {};
        component.registryDependencies.forEach(dep => {
            if (registryComponentCode[dep]) {
                filteredCode[dep] = registryComponentCode[dep];
            }
        });
        
        return Object.keys(filteredCode).length > 0 ? filteredCode : undefined;
    };

    const trashCount = trashComponents?.length || 0;

    if (components === undefined) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 relative">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Components</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your customized components.
                        </p>
                    </div>
                </div>

                {/* Filters and Sort */}
                <div className="flex flex-wrap items-center gap-4 mt-6">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Filter:</span>
                        <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="All components" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All components</SelectItem>
                                <SelectItem value="recent">Recent (7 days)</SelectItem>
                                <SelectItem value="oldest">Older (30+ days)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <SortAsc className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Sort by:</span>
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                                <SelectItem value="date-created-desc">Newest first</SelectItem>
                                <SelectItem value="date-created-asc">Oldest first</SelectItem>
                                <SelectItem value="date-updated-desc">Recently updated</SelectItem>
                                <SelectItem value="date-updated-asc">Least recently updated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="text-sm text-muted-foreground ml-auto">
                        {filteredAndSortedComponents.length} {filteredAndSortedComponents.length === 1 ? "component" : "components"}
                    </div>
                </div>
            </div>

            {filteredAndSortedComponents.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/10">
                    <p className="text-muted-foreground">
                        {components?.length === 0
                            ? "You haven't created any components yet."
                            : "No components match your filters."}
                    </p>
                    {components?.length === 0 ? (
                        <Link href="/">
                            <Button className="mt-4">Browse Marketplace</Button>
                        </Link>
                    ) : (
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                                setFilterBy("all");
                                setSortBy("date-updated-desc");
                            }}
                        >
                            Clear filters
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAndSortedComponents.map((component: Doc<"userComponents">) => (
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
                                    registryDependenciesCode={getRegistryCodeForComponent(component)}
                                    isUserComponent={true}
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

            {/* Floating Trash Button */}
            {trashCount > 0 && (
                <div className="fixed bottom-6 right-6 z-40">
                    <button
                        onClick={() => setShowTrash(true)}
                        className="h-14 w-14 rounded-full bg-foreground text-background shadow-lg hover:scale-110 transition-transform flex items-center justify-center p-0 border-0 cursor-pointer relative"
                    >
                        <Trash2 className="h-6 w-6" />
                        <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center translate-x-1/2 -translate-y-1/2 min-w-5">
                            {trashCount > 9 ? "9+" : trashCount}
                        </span>
                    </button>
                </div>
            )}

            <TrashPopup isVisible={showTrash} onClose={() => setShowTrash(false)} />
        </div>
    );
}

