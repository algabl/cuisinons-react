import Footer from "../_components/public/footer";
import { PublicHeader } from "../_components/public/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PublicHeader>
      <main className="bg-muted flex min-h-screen flex-col items-center justify-center px-4">
        {children}
      </main>
      <Footer />
    </PublicHeader>
  );
}
