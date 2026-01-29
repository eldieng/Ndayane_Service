"use client"

import { ToastProvider } from "@/components/ui/Toast"
import { ReactNode } from "react"

export default function ToastProviderWrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}
