import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BrandNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-20 text-center">
        <div className="goblin-card max-w-md p-10">
          <span className="text-5xl">🫥</span>
          <h1 className="mt-4 text-xl font-bold text-white">Brand not found</h1>
          <p className="mt-2 text-sm text-zinc-400">
            This brand kit doesn't exist or you don't have access to it.
          </p>
          <Link href="/dashboard" className="goblin-btn-primary mt-6 inline-flex">
            Back to vault
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
