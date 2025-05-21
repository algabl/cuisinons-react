"use client";
import React from "react";
import type { Icon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: typeof Icon;
  }[];
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  // Get active item from the pathname, active item is the item that most closely matches the pathname
  const activeItem = items.reduce(
    (bestMatch, item) => {
      if (
        pathname.startsWith(item.url) &&
        item.url.length > (bestMatch?.url.length ?? 0)
      ) {
        return item;
      }
      return bestMatch;
    },
    undefined as (typeof items)[0] | undefined,
  );
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu></SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link
                href={item.url}
                prefetch={true}
                onClick={() => setOpenMobile(false)}
              >
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={item === activeItem}
                >
                  {item.icon && React.createElement(item.icon)}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
