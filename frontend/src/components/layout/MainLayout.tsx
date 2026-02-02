"use client"

import { useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import InstallPWA from "@/components/ui/InstallPWA"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`
        fixed inset-0 z-50 lg:hidden bg-black/50 transition-opacity
        ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `} onClick={() => setSidebarOpen(false)} />
      
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Bannière d'installation PWA */}
      <InstallPWA />
    </div>
  )
}
