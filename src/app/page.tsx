import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

export default function Home() {
  return (
    <main className="bg-muted flex min-h-screen flex-col items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="mb-2 text-center text-3xl font-bold">
            Cuisinons
          </CardTitle>
          <Image src="/icon.png" alt="Cuisinons Logo" width={100} height={100} className="mx-auto mb-4" />
          <p className="text-muted-foreground text-center">
            Discover and share delicious recipes with the Cuisinons community!
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button>
            <Link href="/login">Get Started</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
