'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

/**
 * Automatically stores authenticated Clerk users in the Convex database.
 * This component should be rendered once in the app layout.
 * It runs silently in the background and is idempotent (safe to call multiple times).
 */
export default function StoreUserEffect() {
    const { isSignedIn, user } = useUser()
    const storeUser = useMutation(api.users.store)

    useEffect(() => {
        // Only store if user is signed in
        if (!isSignedIn || !user) {
            return
        }

        // Call the store mutation
        // The mutation is idempotent - it will only create the user if they don't exist
        // or update their name if it has changed
        const storeUserAsync = async () => {
            try {
                await storeUser()
            } catch (error) {
                // Silently fail - this is a background operation
                // The user will get an error later if they try to perform actions that require a user record
                console.error('Failed to store user in Convex:', error)
            }
        }

        storeUserAsync()
    }, [isSignedIn, user?.id, storeUser])

    // This component doesn't render anything
    return null
}
