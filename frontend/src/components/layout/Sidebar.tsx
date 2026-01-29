"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard,
  Users, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  FolderTree,
  PackageCheck,
  Receipt,
  UserCog,
  Upload,
  FileText,
  ClipboardList
} from "lucide-react"
import { cn } from "@/lib/utils"

// Définir les menus par rôle
const menusByRole: Record<string, { title: string; href: string; icon: any }[]> = {
  ADMIN: [
    { title: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { title: "Caisse", href: "/caisse", icon: ShoppingCart },
    { title: "Ventes", href: "/ventes", icon: Receipt },
    { title: "Documents", href: "/documents", icon: FileText },
    { title: "Clients", href: "/clients", icon: Users },
    { title: "Produits", href: "/produits", icon: Package },
    { title: "Catégories", href: "/categories", icon: FolderTree },
    { title: "Stock", href: "/stock", icon: PackageCheck },
    { title: "Dépôts", href: "/depots", icon: Warehouse },
    { title: "Paiements", href: "/paiements", icon: CreditCard },
    { title: "Rapports", href: "/rapports", icon: BarChart3 },
    { title: "Utilisateurs", href: "/utilisateurs", icon: UserCog },
    { title: "Import données", href: "/import", icon: Upload },
  ],
  GERANT: [
    { title: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { title: "Caisse", href: "/caisse", icon: ShoppingCart },
    { title: "Ventes", href: "/ventes", icon: Receipt },
    { title: "Documents", href: "/documents", icon: FileText },
    { title: "Clients", href: "/clients", icon: Users },
    { title: "Produits", href: "/produits", icon: Package },
    { title: "Catégories", href: "/categories", icon: FolderTree },
    { title: "Stock", href: "/stock", icon: PackageCheck },
    { title: "Dépôts", href: "/depots", icon: Warehouse },
    { title: "Paiements", href: "/paiements", icon: CreditCard },
    { title: "Rapports", href: "/rapports", icon: BarChart3 },
  ],
  VENDEUR: [
    { title: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { title: "Caisse", href: "/caisse", icon: ShoppingCart },
    { title: "Ventes", href: "/ventes", icon: Receipt },
    { title: "Documents", href: "/documents", icon: FileText },
    { title: "Clients", href: "/clients", icon: Users },
    { title: "Produits", href: "/produits", icon: Package },
  ],
  RESPONSABLE_STOCK: [
    { title: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { title: "Produits", href: "/produits", icon: Package },
    { title: "Catégories", href: "/categories", icon: FolderTree },
    { title: "Stock", href: "/stock", icon: PackageCheck },
    { title: "Dépôts", href: "/depots", icon: Warehouse },
  ],
  COMPTABLE: [
    { title: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { title: "Ventes", href: "/ventes", icon: Receipt },
    { title: "Paiements", href: "/paiements", icon: CreditCard },
    { title: "Rapports", href: "/rapports", icon: BarChart3 },
    { title: "Clients", href: "/clients", icon: Users },
  ],
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string>("VENDEUR")

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserRole(user.role || "VENDEUR")
      } catch (e) {
        console.error("Erreur parsing user:", e)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const menuItems = menusByRole[userRole] || menusByRole.VENDEUR

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/logo.png" 
          alt="Ndayane Services" 
          className="h-12"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-amber-500 text-white shadow-md" 
                  : "text-gray-700 hover:bg-amber-50 hover:text-amber-700"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-amber-600")} />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 p-3 border-t border-gray-100 bg-gray-50">
        <Link
          href="/parametres"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-500" />
          Paramètres
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
