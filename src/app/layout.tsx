import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AiFloatingWidget } from "@/components/AiFloatingWidget";

export const metadata: Metadata = {
  title: {
    default: "Sinab ko’r – 3 kunlik kasb qutisi",
    template: "%s | Sinab ko’r",
  },
  description:
    "Kasbni tanlashdan oldin uni 3 kunda, uyda sinab ko’ring. Oshpaz, dasturchi, fotograf, dizayner va usta to’plamlari. Haqiqiy asboblar va amaliy topshiriqlar.",
  keywords: [
    "kasb tanlash",
    "sinab ko'r",
    "kasb qutisi",
    "dasturchi",
    "dizayner",
    "fotograf",
    "oshpaz",
    "duradgor usta",
    "3 kunlik kasb",
  ],
  authors: [{ name: "Sinab ko'r jamoasi" }],
  openGraph: {
    title: "Sinab ko’r – 3 kunlik kasb qutisi",
    description:
      "Kasbni tanlashdan oldin uni 3 kunda, uyda sinab ko’ring. Yoshlar va ota-onalar uchun.",
    type: "website",
    locale: "uz_UZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-stone-50/60 text-stone-900 font-sans antialiased selection:bg-amber-200 selection:text-amber-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <AiFloatingWidget />
      </body>
    </html>
  );
}
