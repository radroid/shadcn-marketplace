import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextRequest, NextResponse, NextFetchEvent } from 'next/server'

// Next.js 16: Migrated from middleware.ts to proxy.ts
// The proxy function wraps Clerk's middleware for authentication
const clerk = clerkMiddleware()

export function proxy(request: NextRequest, event: NextFetchEvent) {
  return clerk(request, event)
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}

