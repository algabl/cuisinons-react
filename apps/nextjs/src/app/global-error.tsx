"use client";

import type Error from "next/error";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

import { Button } from "~/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div>
          <h2>Something went wrong!</h2>
          <Button onClick={() => reset()}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
