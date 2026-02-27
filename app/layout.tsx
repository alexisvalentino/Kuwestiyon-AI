import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import type React from "react" // Import React

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kuwestiyon AI",
  description:
    "An educational LLM testing interface for validating your own model or API integrations.",
  metadataBase: new URL("http://localhost:3000"),
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Kuwestiyon AI",
    description:
      "An educational LLM testing interface for validating your own model or API integrations.",
    type: "website",
    images: ["/icon.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kuwestiyon AI",
    description:
      "An educational LLM testing interface for validating your own model or API integrations.",
    images: ["/icon.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen">{children}</div>
      </body>
    </html>
  )
}