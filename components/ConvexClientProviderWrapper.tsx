'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

// Dynamically import with SSR disabled to avoid React 19 compatibility issues
// ConvexProviderWithClerk uses hooks that fail during SSR due to version mismatches
const ConvexClientProvider = dynamic(
  () => import('@/components/ConvexClientProvider'),
  { ssr: false }
)

export default function ConvexClientProviderWrapper({ children }: { children: ReactNode }) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>
}

