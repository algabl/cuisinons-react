"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function usePageTitle(): string {
  const [title, setTitle] = useState<string>(document.title);
  const pathname = usePathname();

  useEffect(() => {
    setTitle(document.title);
  }, [pathname]);

  return title;
}
