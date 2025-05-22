"use client";

import { Copy, Share, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Select } from "~/components/ui/select";
import { api } from "~/trpc/server";

export function ShareItems() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [group, setGroup] = useState<string | undefined>(undefined);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Handle group change
  }, [group]);

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-1">
            <Share className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={async () => {
              await navigator.clipboard.writeText(window.location.href);
            }}
          >
            <Copy />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpen(true);
              setMenuOpen(false);
            }}
          >
            <Users />
            Share with Group
          </DropdownMenuItem>{" "}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent>
          <DialogTitle>
            <DialogHeader>Share with Group</DialogHeader>
          </DialogTitle>
          <Select name="group" value={group} disabled={false}></Select>
        </DialogContent>
      </Dialog>
    </>
  );
}
