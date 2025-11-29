import Link from "next/link";

// Prevent static generation of the not-found page
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
      </p>
      <Link 
        href="/"
        className="inline-flex items-center justify-center h-10 rounded-md px-6 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Go Back Home
      </Link>
    </div>
  );
}

