import "./globals.css";

export const metadata = {
    title: "CyberScan",
    description: "Automatische web vulnerability scanner",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="bg-gray-100 text-gray-800">{children}</body>
        </html>
    );
}
