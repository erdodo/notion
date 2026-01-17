"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <h2 className="text-xl font-medium">Something went wrong!</h2>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
