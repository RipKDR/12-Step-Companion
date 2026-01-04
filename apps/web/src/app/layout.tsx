import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "../components/TRPCProvider";
import { SessionProvider } from "../components/SessionProvider";

export const metadata: Metadata = {
  title: "12-Step Recovery Companion - Sponsor Portal",
  description: "Sponsor dashboard for 12-Step Recovery Companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SessionProvider>
          <TRPCProvider>{children}</TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

