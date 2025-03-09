import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "CyberScan",
    description: "Automatische web vulnerability scanner",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="bg-gray-950 text-gray-100">
        {children}
        </body>
        </html>
    );
}
