"use client"

import { useState, useEffect } from "react"
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  AlertTriangle,
  DollarSign,
  PackageCheck,
  Plus,
  Loader2,
  Warehouse,
  Bell
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/Toast"
import { API_URL } from "@/lib/api"

interface StockAlerte {
  id: string
  quantite: number
  produit: { nom: string; stockMin: number; unite: string }
  depot: { nom: string }
}

interface VenteRecente {
  id: string
  numero: string
  montantTotal: number
  remise: number
  dateVente: string
  client?: { nom: string }
}

const quickActions = [
  { title: "Nouvelle Vente", href: "/caisse", icon: ShoppingCart, color: "bg-amber-500 hover:bg-amber-600" },
  { title: "Ajouter Produit", href: "/produits/nouveau", icon: Package, color: "bg-gray-900 hover:bg-gray-800" },
  { title: "Nouveau Client", href: "/clients/nouveau", icon: Users, color: "bg-amber-600 hover:bg-amber-700" },
  { title: "Entrée Stock", href: "/stock/entree", icon: PackageCheck, color: "bg-gray-800 hover:bg-gray-700" },
]

export default function DashboardPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    chiffreAffaires: 0,
    ventesJour: 0,
    produitsStock: 0,
    alertesStock: 0,
    clientsActifs: 0,
  })
  const [alertes, setAlertes] = useState<StockAlerte[]>([])
  const [ventesRecentes, setVentesRecentes] = useState<VenteRecente[]>([])
  const [notificationShown, setNotificationShown] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Notification pour alertes stock
  useEffect(() => {
    if (!notificationShown && alertes.length > 0) {
      showToast(`⚠️ ${alertes.length} produit(s) en stock bas!`, "warning")
      setNotificationShown(true)
    }
  }, [alertes, notificationShown, showToast])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      const [statsRes, alertesRes, ventesRes] = await Promise.all([
        fetch("${API_URL}/dashboard/stats", { headers }),
        fetch("${API_URL}/dashboard/alertes-stock", { headers }),
        fetch("${API_URL}/dashboard/ventes-recentes", { headers }),
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
      if (alertesRes.ok) setAlertes(await alertesRes.json())
      if (ventesRes.ok) setVentesRecentes(await ventesRes.json())
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const statsCards = [
    {
      title: "Chiffre d'affaires (Jour)",
      value: `${stats.chiffreAffaires.toLocaleString()} F`,
      icon: DollarSign,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Ventes du jour",
      value: stats.ventesJour.toString(),
      icon: ShoppingCart,
      color: "text-gray-900",
      bgColor: "bg-gray-100",
    },
    {
      title: "Produits en stock",
      value: stats.produitsStock.toString(),
      icon: Package,
      color: "text-amber-700",
      bgColor: "bg-amber-50",
    },
    {
      title: "Clients actifs",
      value: stats.clientsActifs.toString(),
      icon: Users,
      color: "text-gray-700",
      bgColor: "bg-gray-100",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500">Bienvenue sur votre espace de gestion</p>
        </div>
        <Link
          href="/caisse"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Vente
        </Link>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {statsCards.map((stat) => (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 ml-2`}>
                  <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className={`${action.color} text-white rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 transition-colors shadow-sm`}
            >
              <action.icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">{action.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Alerts & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Alertes Stock</h3>
              {alertes.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                  {alertes.length}
                </span>
              )}
            </div>
            <Link href="/stock" className="text-sm text-amber-600 hover:text-amber-700">
              Voir tout
            </Link>
          </div>
          {alertes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Aucune alerte pour le moment</p>
              <p className="text-sm mt-1">Les produits en rupture apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alertes.slice(0, 5).map((alerte) => (
                <div key={alerte.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{alerte.produit.nom}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Warehouse className="w-3 h-3" />
                      {alerte.depot.nom}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{alerte.quantite} {alerte.produit.unite}</p>
                    <p className="text-xs text-gray-500">Min: {alerte.produit.stockMin}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-gray-900">Ventes récentes</h3>
            </div>
            <Link href="/ventes" className="text-sm text-amber-600 hover:text-amber-700">
              Voir tout
            </Link>
          </div>
          {ventesRecentes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Aucune vente récente</p>
              <p className="text-sm mt-1">Commencez par créer une nouvelle vente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ventesRecentes.slice(0, 5).map((vente) => (
                <Link 
                  key={vente.id} 
                  href={`/ventes/${vente.id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {vente.client?.nom || "Client comptoir"}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(vente.dateVente)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {(vente.montantTotal - (vente.remise || 0)).toLocaleString()} F
                    </p>
                    <p className="text-xs text-gray-500">{vente.numero || vente.id.slice(0, 8)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
