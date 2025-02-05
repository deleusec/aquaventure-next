import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserratSans = Montserrat({
  variable: "--montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🫧 Aquaventure",
  description: "Vivez l'aventure sous-marine"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${montserratSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
