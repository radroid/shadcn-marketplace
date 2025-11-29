// Force dynamic rendering for the components route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

