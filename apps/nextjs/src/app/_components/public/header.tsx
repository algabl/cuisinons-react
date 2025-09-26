import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export function PublicHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      {/* <SiteHeader /> */}
      <header className="sticky top-0 z-10 flex h-12 items-center border-b border-b-slate-200 bg-white/50 px-4 shadow-sm backdrop-blur">
        <Link href="/" className="flex items-center">
          <Image src="/icon.png" alt="Logo" width={32} height={32} />
          <span className="ml-2 font-bold">Cuisinons</span>
        </Link>
        <Button variant="outline" className="ml-auto">
          <Link href="/sign-in">Join Cuisinons</Link>
        </Button>
      </header>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="@container/main flex flex-1 flex-col gap-2">
          {children}
        </div>
      </div>
    </div>
  );
}