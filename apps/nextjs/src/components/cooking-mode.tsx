"use client";

import { useState } from "react";
import { Switch } from "./ui/switch";
import { useWakeLock } from "react-screen-wake-lock";

export function CookingMode() {
  const [checked, setChecked] = useState(false);

  const { isSupported, request, release } = useWakeLock({
    onRelease: () => setChecked(false),
  });

  async function handleChange(checked: boolean) {
    setChecked(checked);
    if (checked) {
      await request();
    } else {
      await release();
    }
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
