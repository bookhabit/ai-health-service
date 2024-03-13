import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "홈메이트 AI - Health Coach",
  description: "Health Coach 홈메이트 AI에게 운동을 상담하고 동기부여를 받고 아침마다 실행하는 푸쉬업과 스쿼트 챌린지를 통해서 운동습관을 기릅니다.",
  manifest:"/manifest.json",
  icons: {
    icon: "/test/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
          <Analytics/>
        </body>
      </html>
    </ClerkProvider>
  );
}
