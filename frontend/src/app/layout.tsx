import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ToastProviderWrapper from "@/components/providers/ToastProviderWrapper"
import ConnectionStatus from "@/components/ui/ConnectionStatus"
import ServiceWorkerRegistration from "@/components/providers/ServiceWorkerRegistration"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Quincaillerie Ndayane Services",
  description: "Logiciel de gestion commerciale et stock - Quincaillerie Ndayane Services",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ndayane Services",
  },
}

export const viewport: Viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <ToastProviderWrapper>
          <ServiceWorkerRegistration />
          {children}
          <ConnectionStatus />
        </ToastProviderWrapper>
      </body>
    </html>
  )
}
