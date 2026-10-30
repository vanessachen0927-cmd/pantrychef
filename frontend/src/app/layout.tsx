import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PantryChef | Cook What You Have",
    template: "%s | PantryChef",
  },
  description:
    "Discover delicious recipes using ingredients you already have. Plan meals, save favorites, and make cooking easier.",
  applicationName: "PantryChef",
  openGraph: {
    type: "website",
    siteName: "PantryChef",
    title: "PantryChef | Cook What You Have",
    description:
      "Good food starts with what you have. Discover recipes, save favorites, and share the joy of cooking.",
    url: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-emerald-900/50">
          <nav className="mx-auto max-w-6xl p-5 flex flex-wrap gap-5 items-center">
            <Link
              href="/"
              className="font-bold text-2xl text-amber-400"
            >
              🍳 PantryChef
            </Link>

            <Link href="/">Recipes</Link>
            <Link href="/saved">Saved & Pantry</Link>
            <Link href="/shopping">Shopping List</Link>
            <Link href="/login" className="ml-auto">
              Sign in
            </Link>
          </nav>
        </header>

        <main className="max-w-6xl mx-auto px-5 py-10">
          {children}
        </main>

        <footer className="text-center text-sm text-slate-400 p-8">
          PantryChef • Made with love for food and the smiles
          shared around the table.
        </footer>
      </body>
    </html>
  );
}