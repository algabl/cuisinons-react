"use client";

import { useEffect, useState } from "react";
import { useWakeLock } from "react-screen-wake-lock";

import { Switch } from "./ui/switch";

export function CookingMode() {
  const [checked, setChecked] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { isSupported, request, release } = useWakeLock({
    onRelease: () => setChecked(false),
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleChange(checked: boolean) {
    setChecked(checked);
    if (checked) {
      await request();
    } else {
      await release();
    }
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-2 font-semibold">
          <Switch
            disabled={true}
            checked={false}
            onCheckedChange={() => {}}
            id="cooking-mode-switch"
          />
          Cooking Mode
        </label>
        <span className="text-muted-foreground ml-8 text-xs">
          Cooking mode will keep your screen on while you cook.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-2 font-semibold">
        <Switch
          disabled={!isSupported}
          checked={checked}
          onCheckedChange={handleChange}
          id="cooking-mode-switch"
        />
        Cooking Mode
      </label>
      <span className="text-muted-foreground ml-8 text-xs">
        Cooking mode will keep your screen on while you cook.
      </span>
    </div>
  );
}
