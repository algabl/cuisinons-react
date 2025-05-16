import { Pencil, Share, Trash } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

function handleEdit() {}

function handleDelete() {
  console.log("Delete clicked");
}

function handleShare() {
  console.log("Share clicked");
}

export function Dropdown(props: { id: string; children: React.ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto">
        <DropdownMenuGroup>
          <Link href={`/app/recipes/${props.id}/edit`}>
            <DropdownMenuItem>
              <Pencil />
              Edit
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem>
            <Trash />
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Share />
            Share
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
