"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ComponentPreviewCard } from "@/components/ComponentPreviewCard";
import { useEffect } from "react";

export default function Home() {
  const components = useQuery(api.components.list);

  // Scroll to top when component mounts (when navigating to homepage)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Component Marketplace</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Browse, edit, and use Shadcn UI components.
        </p>
      </div>

      {components === undefined ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[300px] rounded-xl border bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : components.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No components found. Seed the database to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {components.map((component) => (
            <Card key={component._id} className="flex gap-4 flex-col">
              <CardHeader>
                <CardTitle>{component.name}</CardTitle>
                <CardDescription>{component.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ComponentPreviewCard
                  code={component.code}
                  previewCode={component.previewCode}
                  globalCss={component.globalCss}
                  dependencies={component.dependencies}
                  componentName={component.componentId}
                />
              </CardContent>
              <CardFooter>
                <Link href={`/component/${component.componentId}`} className="w-full">
                  <Button className="w-full">View & Edit</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
