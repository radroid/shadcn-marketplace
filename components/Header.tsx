"use client";

import { SignInButton, UserButton } from '@clerk/nextjs';
import { Authenticated, Unauthenticated } from "convex/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
    return (
        <header className="border-b">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="text-xl font-bold">
                    Shadcn Marketplace
                </Link>

                <div className="flex items-center gap-4">
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
