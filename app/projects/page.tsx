"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ProjectsPage() {
    // We need a query to list user components. 
    // I haven't created `listUserComponents` yet in `convex/components.ts`.
    // I only created `getUserComponent`.
    // I should add `listUserComponents`.
    const components = useQuery(api.components.listUserComponents);

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
                                <div className="aspect-video w-full rounded-md border bg-muted flex items-center justify-center text-muted-foreground text-sm">
                                    Preview
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link href={`/design/${component._id}`} className="w-full">
                                    <Button className="w-full" variant="outline">Edit Design</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
