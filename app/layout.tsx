import type { Metadata } from "next";
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import ConvexClientProvider from '@/components/ConvexClientProvider'
import Header from '@/components/Header'
import { Toaster } from 'sonner'
import StoreUserEffect from '@/components/StoreUserEffect'
import { ThemeProvider } from "@/components/theme-provider"
import { DesignPageProvider } from "@/components/DesignPageContext"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Shadcn Marketplace - Browse & Customize UI Components",
    template: "%s | Shadcn Marketplace"
  },
  description: "Discover, preview, and customize beautiful Shadcn UI components with live code editing. Browse our marketplace of ready-to-use React components with real-time theme customization.",
  keywords: ["shadcn", "ui components", "react", "nextjs", "tailwindcss", "component library", "design system"],
  authors: [{ name: "Shadcn Marketplace" }],
  creator: "Shadcn Marketplace",
  openGraph: {
    type: "website",
    title: "Shadcn Marketplace - Browse & Customize UI Components",
    description: "Discover, preview, and customize beautiful Shadcn UI components with live code editing.",
    siteName: "Shadcn Marketplace",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shadcn Marketplace - Browse & Customize UI Components",
    description: "Discover, preview, and customize beautiful Shadcn UI components with live code editing.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          <ConvexClientProvider>
            <DesignPageProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <StoreUserEffect />
                <Header />
                <main className="min-h-screen bg-background">
                  {children}
                </main>
                <Toaster />
              </ThemeProvider>
            </DesignPageProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
