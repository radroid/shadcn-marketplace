"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { Box, Package } from "lucide-react";

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const searchResults = useQuery(
        api.components.searchComponents,
        searchQuery.length > 0 ? { query: searchQuery } : "skip"
    );

    // Handle keyboard shortcut (Cmd+K or Ctrl+K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onOpenChange(true);
            }
            if (e.key === "Escape") {
                onOpenChange(false);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [onOpenChange]);

    const handleSelect = (type: "marketplace" | "myComponent", id: string, componentId?: string) => {
        if (type === "marketplace") {
            router.push(`/component/${componentId}`);
        } else {
            router.push(`/design/${id}`);
        }
        onOpenChange(false);
        setSearchQuery("");
    };

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
            <CommandInput
                placeholder="Search components..."
                value={searchQuery}
                onValueChange={setSearchQuery}
            />
            <CommandList>
                {!searchQuery && (
                    <CommandEmpty>Type to search components...</CommandEmpty>
                )}
                {searchQuery && searchResults === undefined && (
                    <CommandEmpty>Searching...</CommandEmpty>
                )}
                {searchQuery && searchResults && searchResults.marketplace.length === 0 && searchResults.myComponents.length === 0 && (
                    <CommandEmpty>No components found.</CommandEmpty>
                )}
                
                {searchResults?.myComponents && searchResults.myComponents.length > 0 && (
                    <CommandGroup heading="My Components">
                        {searchResults.myComponents.map((component) => (
                            <CommandItem
                                key={component._id}
                                value={`my-${component._id}-${component.name}`}
                                onSelect={() => handleSelect("myComponent", component._id)}
                            >
                                <Box className="mr-2 h-4 w-4" />
                                <span>{component.name}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {searchResults?.marketplace && searchResults.marketplace.length > 0 && (
                    <CommandGroup heading="Marketplace">
                        {searchResults.marketplace.map((component) => (
                            <CommandItem
                                key={component._id}
                                value={`marketplace-${component._id}-${component.name}`}
                                onSelect={() => handleSelect("marketplace", component._id, component.componentId)}
                            >
                                <Package className="mr-2 h-4 w-4" />
                                <span>{component.name}</span>
                                {component.description && (
                                    <span className="text-xs text-muted-foreground ml-2 truncate">
                                        {component.description}
                                    </span>
                                )}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    );
}

