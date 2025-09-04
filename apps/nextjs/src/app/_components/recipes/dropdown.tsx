"use client";
import { Pencil, Share2, Trash } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  AlertDialogContent,
  AlertDialog,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "~/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "~/components/ui/dropdown-menu";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import {
  CopyLinkButton,
  GroupDialog,
  ShareWithGroupButton,
} from "./share-items";

export function Dropdown(props: { id: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const recipeDelete = api.recipe.delete.useMutation();
  const router = useRouter();

  const handleDelete = async (id: string) => {
    recipeDelete.mutate(
      { id },
      {
        onSuccess: () => {
          router.refresh(); // Refresh server component list after delete
        },
      },
    );
  };

  // function handleShare() {
  //   console.log("Share clicked");
  // }
  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href={`/app/recipes/${props.id}/edit`}>
                <Pencil />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                setOpen(true);
                setMenuOpen(false);
              }}
            >
              <Trash />
              Delete
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <CopyLinkButton />
                  <ShareWithGroupButton
                    onClick={() => {
                      setGroupOpen(true);
                      setMenuOpen(false);
                    }}
                  />
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setMenuOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              recipe
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await handleDelete(props.id);
                setOpen(false);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {groupOpen && (
        <GroupDialog
          open={groupOpen}
          onOpenChange={setGroupOpen}
          recipeId={props.id}
        />
      )}
    </>
  );
}
