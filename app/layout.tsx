import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";

const font = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Discord Clone - Chat, Voice & Community App",
  description:
    "A powerful Discord alternative with real-time chat, voice, and community features. Connect, share, and build your own online space.",
  keywords: [
    "Discord Clone",
    "Chat App",
    "Voice Chat",
    "Community Platform",
    "Messaging App",
    "Online Communication",
  ],
  openGraph: {
    title: "Discord Clone - The Ultimate Community Chat App",
    description:
      "Join our Discord Clone for seamless messaging, voice calls, and community engagement. Experience the best in online communication.",
    url:
      process.env.NEXT_PUBLIC_SITE_URL! || "https://discord-shadow.vercel.app",
    type: "website",
    images: [
      {
        url: "https://img.freepik.com/free-vector/night-ocean-landscape-full-moon-stars-shine_107791-7397.jpg", // Replace with your actual image URL
        width: 1200,
        height: 630,
        alt: "Discord Clone Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Discord Clone - The Best Chat & Voice App",
    description:
      "Real-time messaging, voice chat, and community features. Your ultimate Discord alternative.",
    site:
      process.env.NEXT_PUBLIC_SITE_URL! || "https://discord-shadow.vercel.app", // Replace with your Twitter handle
    images: [
      "https://img.freepik.com/free-vector/night-ocean-landscape-full-moon-stars-shine_107791-7397.jpg",
    ], // Replace with actual image URL
  },
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={cn(font.className, "bg-white dark:bg-[#313338]")}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="discord-theme"
          >
            <SocketProvider>
              <ModalProvider />
              <Toaster />
              <QueryProvider>{children}</QueryProvider>
            </SocketProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
