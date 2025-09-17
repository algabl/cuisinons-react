import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { api } from "~/trpc/server";
import { PublicHeader } from "../_components/public/header";

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "Cuisinons Recipe Manager",
  },
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session.userId) {
    redirect("/sign-in");
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

// function PublicHeader({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="bg-background min-h-screen">
//       {/* <SiteHeader /> */}
//       <header className="sticky top-0 z-10 flex h-12 items-center border-b border-b-slate-200 bg-white/50 px-4 shadow-sm backdrop-blur">
//         <a href="/app" className="flex items-center">
//           <Image src="/icon.png" alt="Logo" width={32} height={32} />
//           <span className="ml-2 font-bold">Cuisinons</span>
//         </a>
//         <Button variant="outline" className="ml-auto">
//           <Link href="/sign-in">Join Cuisinons</Link>
//         </Button>
//       </header>
//       <div className="flex flex-1 flex-col overflow-y-auto">
//         <div className="@container/main flex flex-1 flex-col gap-2">
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// }
