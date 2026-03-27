import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PBShub - Palli Bidyut Meter Manual & REB Technical DataHub",
  description: "Advanced DataHub for PBS Palli Bidyut Metering, Equipment Manuals, and REB Technical Documents. Find reading manual data formats, technical specifications, and guides.",
  keywords: "pbs meter, palli bidyut, reb, reading manual data format, electricity meter, technical manual, smart meter, pbs datahub, bangladesh rural electrification board, pollibidut reading guide",
  openGraph: {
    title: "PBShub - PBS & REB Technical DataHub",
    description: "Search for any Palli Bidyut (PBS) meter manual or REB technical specification with detailed data formats.",
    type: "website",
    locale: "bn_BD",
  },
  icons: {
    icon: 'https://i.ibb.co/C3C1Xdtn/96.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="animate-fade" suppressHydrationWarning>
        <Navbar />
        <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
          {children}
        </main>
        
        <footer className="footer-glass">
            <div className="container footer-content">
                <p>&copy; 2026 PBShub. All Rights Reserved.</p>
                <div className="footer-links">
                    <Link href="/terms">Terms</Link>
                    <Link href="/privacy">Privacy</Link>
                    <Link href="/support">Support</Link>
                </div>
            </div>
        </footer>
      </body>
    </html>
  );
}
