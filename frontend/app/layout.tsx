import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "智能合规审核系统",
    description: "基于语义理解的合规审核系统",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh-CN">
            <body className={inter.className}>
                <div className="flex h-screen overflow-hidden bg-gray-50">
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
