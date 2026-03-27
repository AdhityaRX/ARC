import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "ARC — AI-Powered Project Architect",
  description: "From idea to architecture in one conversation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[var(--arc-bg-primary)] text-[var(--arc-text-primary)] antialiased">
        {children}
      </body>
    </html>
  );
}
