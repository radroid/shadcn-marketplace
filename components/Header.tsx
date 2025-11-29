"use client";

import { SignInButton, UserButton } from '@clerk/nextjs';
import { Authenticated, Unauthenticated } from "convex/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { useDesignPage } from "./DesignPageContext";
import { Share, Search } from "lucide-react";
import { SearchDialog } from "./SearchDialog";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
    const designPage = useDesignPage();
    const [searchOpen, setSearchOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link 
                        href="/" 
                        className="text-xl font-bold"
                        onClick={(e) => {
                            // If already on homepage, scroll to top
                            if (pathname === "/") {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                            // Otherwise, Next.js Link will handle navigation and scroll
                        }}
                    >
                        Shadcn Marketplace
                    </Link>

                    <div className="flex items-center gap-4">
                        {/* Search Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSearchOpen(true)}
                            className="hidden sm:flex items-center gap-2 text-muted-foreground"
                        >
                            <Search className="h-4 w-4" />
                            <span className="hidden lg:inline">Search components...</span>
                            <kbd className="pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </Button>

                        {designPage?.hasPublishHandler && (
                            <Button variant="outline" size="sm" onClick={designPage.onPublishClick}>
                                <Share className="mr-2 h-4 w-4" />
                                Publish
                            </Button>
                        )}
                        <Authenticated>
                            <Link href="/components">
                                <Button variant="ghost">My Components</Button>
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
            <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        </>
    );
}
