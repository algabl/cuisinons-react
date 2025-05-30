"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function usePageTitle(): string {
  const [title, setTitle] = useState<string>("");
  const pathname = usePathname();

  useEffect(() => {
    if (document !== undefined) {
      setTitle(document.title);
    }
  }, [pathname]);

  return title;
}
