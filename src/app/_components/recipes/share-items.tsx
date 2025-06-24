"use client";

import { Check, Copy, Share, Users, X } from "lucide-react";
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
import { Spinner } from "~/components/ui/spinner";
import { useAuth } from "@clerk/nextjs";

export function CopyLinkButton() {
  return (
    <DropdownMenuItem
      onClick={async () => {
        await navigator.clipboard.writeText(window.location.href);
      }}
      className="flex cursor-pointer items-center gap-2"
    >
      <Copy className="h-4 w-4" />
      <span>Copy link</span>
    </DropdownMenuItem>
  );
}

export function ShareWithGroupButton({ onClick }: { onClick: () => void }) {
  return (
    <DropdownMenuItem
      className="flex cursor-pointer items-center gap-2"
      onClick={onClick}
    >
      <Users className="h-4 w-4" />
      <span>Share with Group</span>
    </DropdownMenuItem>
  );
}

export function GroupDialog({
  open,
  onOpenChange,
  recipeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipeId: string;
}) {
  const { userId } = useAuth() ?? {};
  const [shareSuccess, setShareSuccess] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(
    undefined,
  );
  const [removingId, setRemovingId] = useState<string | undefined>(undefined);

  const { data: groupsData, refetch: refetchGroups } =
    api.group.getByUserId.useQuery(userId ?? "", {
      enabled: !!userId && open, // Only fetch when dialog is open
    });

  // Share mutation
  const shareMutation = api.sharing.shareRecipeToGroup.useMutation({
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

  const removeSharedGroupMutation =
    api.sharing.removeSharedRecipeFromGroup.useMutation();
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

  const handleRemoveSharedGroup = (groupId: string) => {
    if (!groupId) return;
    setRemovingId(groupId);
    removeSharedGroupMutation
      .mutateAsync({
        recipeId,
        groupId,
      })
      .then(() => {
        setRemovingId(undefined);
        void refetchGroups();
      })
      .catch((error) => {
        console.error("Error removing shared group:", error);
      });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent id="group-dialog" className="sm:max-w-md">
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
                  value={selectedGroup ?? ""}
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
                    <div className="flex" key={group.id}>
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <span>{group.name}</span>
                        <div
                          className="h-3 w-3 cursor-pointer p-0 text-red-400"
                          onClick={() => handleRemoveSharedGroup(group.id)}
                        >
                          <X className="h-full w-full" />
                        </div>
                      </Badge>
                      {removeSharedGroupMutation.isPending &&
                        removingId === group.id && <Spinner />}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ShareItems({ recipeId }: { recipeId: string }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="ml-1">
            <Share className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          <CopyLinkButton />
          <ShareWithGroupButton
            onClick={() => {
              setOpen(true);
              setMenuOpen(false);
            }}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <GroupDialog open={open} onOpenChange={setOpen} recipeId={recipeId} />
    </>
  );
}
