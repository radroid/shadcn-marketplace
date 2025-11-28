"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import ComponentEditor from "@/components/editor/ComponentEditor";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function ComponentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isSignedIn } = useAuth();
    const componentId = params.id as string;

    const component = useQuery(api.components.getBySlug, { componentId });
    const createUserComponent = useMutation(api.components.createUserComponent);

    // Fetch registry dependencies
    const registryDependencies = component?.registryDependencies || [];
    const registryComponentCode = useQuery(
        api.components.getResolvedRegistryComponents,
        registryDependencies.length > 0 ? { ids: registryDependencies } : "skip"
    );

    const handleEdit = async () => {
        if (!isSignedIn) {
            router.push("/sign-in");
            return;
        }

        if (!component) return;

        try {
            const newId = await createUserComponent({
                name: component.name,
                code: component.code,
                previewCode: component.previewCode,
                catalogComponentId: component.componentId,
                dependencies: component.dependencies,
                registryDependencies: component.registryDependencies,
                globalCss: component.globalCss,
            });
            router.push(`/design/${newId}`);
        } catch (error) {
            console.error("Failed to create user component:", error);
        }
    };

    if (component === undefined) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (component === null) {
        return (
            <div className="container mx-auto py-8">
                <h1 className="text-2xl font-bold">Component not found</h1>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col">
            <div className="border-b bg-background px-4 py-3 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold">{component.name}</h1>
                    <p className="text-sm text-muted-foreground">{component.description}</p>
                </div>
                <Button onClick={handleEdit}>
                    {isSignedIn ? "Edit Copy" : "Sign in to Edit"}
                </Button>
            </div>
            <div className="flex-1 overflow-hidden">
                <ComponentEditor
                    code={component.code}
                    previewCode={component.previewCode}
                    readOnly={true}
                    dependencies={component.dependencies}
                    registryDependenciesCode={registryComponentCode}
                    componentName={component.componentId}
                />
            </div>
        </div>
    );
}
