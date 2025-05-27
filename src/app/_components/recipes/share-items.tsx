"use client";

import { Check, Copy, Share, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import { Badge } from "~/components/ui/badge";

export function ShareItems({ recipeId }: { recipeId: string }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(
    undefined,
  );
  const [shareSuccess, setShareSuccess] = useState(false);

  // Get session data
  const session = useSession();
  const userId = session.data?.user.id ?? "";

  // Fetch all user's groups
  const { data: groupsData, refetch: refetchGroups } =
    api.group.getByUserId.useQuery(userId, {
      enabled: !!userId && open, // Only fetch when dialog is open
    });

  // Share mutation
  const shareMutation = api.recipe.shareWithGroup.useMutation({
    onSuccess: () => {
      setShareSuccess(true);
      setSelectedGroup(undefined);
      void refetchGroups();

      // Reset success message after 3 seconds
      setTimeout(() => {
        setShareSuccess(false);
      }, 3000);
    },
  });

  // Filter shared and unshared groups
  const sharedGroups =
    groupsData?.filter((group) =>
      group.recipeSharings.some((sharing) => sharing.recipeId === recipeId),
    ) ?? [];

  const unsharedGroups =
    groupsData?.filter(
      (group) =>
        !group.recipeSharings.some((sharing) => sharing.recipeId === recipeId),
    ) ?? [];

  // Handle sharing with selected group
  const handleShareWithGroup = () => {
    if (!selectedGroup) return;

    shareMutation.mutate({
      recipeId,
      groupId: selectedGroup,
    });
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-1">
            <Share className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          <DropdownMenuItem
            onClick={async () => {
              await navigator.clipboard.writeText(window.location.href);
            }}
            className="flex cursor-pointer items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            <span>Copy link</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2"
            onClick={() => {
              setOpen(true);
              setMenuOpen(false);
            }}
          >
            <Users className="h-4 w-4" />
            <span>Share with Group</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Share with Group</DialogTitle>
            <DialogDescription>
              Share this recipe with your groups so everyone can enjoy it
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Share success message */}
            {shareSuccess && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <p>Recipe shared successfully!</p>
                </div>
              </div>
            )}

            {/* Share with group selector */}
            {unsharedGroups.length > 0 ? (
              <div className="flex flex-col space-y-4">
                <div className="flex gap-2">
                  <Select
                    value={selectedGroup}
                    onValueChange={(value) => setSelectedGroup(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {unsharedGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleShareWithGroup}
                    disabled={!selectedGroup || shareMutation.isPending}
                  >
                    Share
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                This recipe has already been shared with all your groups
              </p>
            )}

            {/* Already shared groups */}
            {sharedGroups.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Already shared with:</h3>
                  <div className="flex flex-wrap gap-2">
                    {sharedGroups.map((group) => (
                      <Badge
                        key={group.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <span>{group.name}</span>
                        <Check className="h-3 w-3 text-green-500" />
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
