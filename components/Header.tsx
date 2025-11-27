"use client";

import { SignInButton, UserButton } from '@clerk/nextjs';
import { Authenticated, Unauthenticated } from "convex/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { useDesignPage } from "./DesignPageContext";
import { Share } from "lucide-react";

export default function Header() {
    const designPage = useDesignPage();

    return (
        <header className="border-b">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="text-xl font-bold">
                    Shadcn Marketplace
                </Link>

                <div className="flex items-center gap-4">
                    {designPage?.hasPublishHandler && (
                        <Button variant="outline" size="sm" onClick={designPage.onPublishClick}>
                            <Share className="mr-2 h-4 w-4" />
                            Publish
                        </Button>
                    )}
                    <Authenticated>
                        <Link href="/projects">
                            <Button variant="ghost">My Projects</Button>
                        </Link>
                        <UserButton />
                    </Authenticated>
                    <Unauthenticated>
                        <SignInButton mode="modal">
                            <Button>Sign In</Button>
                        </SignInButton>
                    </Unauthenticated>
                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}
