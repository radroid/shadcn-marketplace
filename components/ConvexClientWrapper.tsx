'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

// Dynamically import with SSR disabled to prevent React hooks error during server rendering
const ConvexClientProvider = dynamic(
  () => import('@/components/ConvexClientProvider'),
  { ssr: false }
)

export default function ConvexClientWrapper({ children }: { children: ReactNode }) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>
}


