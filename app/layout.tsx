import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import type React from "react" // Import React

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kuwestiyon AI",
  description:
    "A Filipino GPT with web search, PDF analysis, fact-checking, link analysis, quick translation, and NLP SQL queries",
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Kuwestiyon AI",
    description:
      "A Filipino GPT with web search, PDF analysis, fact-checking, link analysis, quick translation, and NLP SQL queries",
    type: "website",
    images: ["/icon.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kuwestiyon AI",
    description:
      "A Filipino GPT with web search, PDF analysis, fact-checking, link analysis, quick translation, and NLP SQL queries",
    images: ["/icon.png"],
  },
    generator: 'v0.dev'
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



import './globals.css'