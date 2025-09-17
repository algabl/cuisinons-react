import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { api } from "~/trpc/server";

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "Cuisinons Recipe Manager",
  },
};

async function isPublicRecipeAccessible(pathname: string) {
  const recipeMatch = /^\/app\/recipes\/([^/]+)(?:\/.*)?$/.exec(pathname);
  if (!recipeMatch) return false;
  const recipeId = recipeMatch[1];

  if (!recipeId) return false;

  try {
    const recipe = await api.recipe.getById({ id: recipeId });
    return recipe?.isPrivate === false;
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return false;
  }
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  if (!session.userId) {
    const isPublicRecipe = await isPublicRecipeAccessible(pathname);
    if (!isPublicRecipe) {
      redirect("/sign-in");
    }
    return <PublicHeader>{children}</PublicHeader>;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function PublicHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      {/* <SiteHeader /> */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="@container/main flex flex-1 flex-col gap-2">
          {children}
        </div>
      </div>
    </div>
  );
}
