// app/your-route/error.tsx
"use client";

import { useEffect, useRef } from "react"; // Import useRef

import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button"; // Assuming this path is correct

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const toastIdRef = useRef<string | number | undefined>(undefined); // Ref to store the toast ID

  useEffect(() => {
    // Only show the toast if we haven't already shown one for this error,
    // or if the error object itself changes (which is unlikely in this scenario)
    // This is a simple flag to prevent re-triggering in dev Strict Mode for the *same* error.
    if (!toastIdRef.current) {
      // Check if a toast has already been displayed
      console.error("Segment error caught:", error); // Keep your console log
      toastIdRef.current = toast.error(
        `Something went wrong in this section: ${error.message}`,
        {
          duration: 5000, // Optional: add duration
          onDismiss: () => {
            toastIdRef.current = undefined;
          }, // Reset ref on dismiss
          onAutoClose: () => {
            toastIdRef.current = undefined;
          }, // Reset ref on auto-close
          // cancel: {
          //   label: <X />,
          //   onClick: () => {
          //     toast.dismiss();
          //   },
          // },
        },
      );
    }
    // Cleanup function - not strictly necessary for this specific toast,
    // but good practice for other effects.
    return () => {
      if (toastIdRef.current) {
        // Optionally dismiss the toast if the component unmounts prematurely
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = undefined;
      }
    };
  }, [error]); // Depend on error object, though it won't change on re-render for the same error

  return (
    <div>
      <h2>Well, this is awkward</h2>
      <p>
        The content you were looking for in this section couldn't be loaded.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
