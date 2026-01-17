"use client"


export function EdgeStoreProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // EdgeStore is disabled for now
  // To enable it, uncomment the provider below
  return <>{children}</>;

  /* Uncomment this when you want to enable EdgeStore:
  return (
    <EdgeStoreProvider>
      {children}
    </EdgeStoreProvider>
  );
  */
}
