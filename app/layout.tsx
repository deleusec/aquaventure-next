import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";

const montserratSans = Montserrat({
  variable: "--montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AquaVenture",
  description: "Vivez l'aventure sous-marine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <html lang="en" className="dark">
        <body className={`${montserratSans.variable} antialiased`}>
          {children}
        </body>
      </html>
    </UserProvider>
  );
}
