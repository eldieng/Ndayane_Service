"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Calendar,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import Link from "next/link"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts"

interface StockAlerte {
  id: string
  quantite: number
  produit: { nom: string; stockMin: number; unite: string }
  depot: { nom: string }
}

interface VenteRecente {
  id: string
  numero: string
  total: number
  remise: number
  createdAt: string
  client?: { nom: string }
}

interface VenteParJour {
  date: string
  total: number
  count: number
}

interface VenteParCategorie {
  categorie: string
  total: number
}

const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"]

const quickActions = [
  { title: "Nouvelle Vente", href: "/caisse", icon: ShoppingCart, color: "bg-amber-500 hover:bg-amber-600" },
  { title: "Ajouter Produit", href: "/produits/nouveau", icon: Package, color: "bg-green-600 hover:bg-green-700" },
  { title: "Nouveau Client", href: "/clients/nouveau", icon: Users, color: "bg-purple-600 hover:bg-purple-700" },
  { title: "Entrée Stock", href: "/stock/entree", icon: PackageCheck, color: "bg-orange-600 hover:bg-orange-700" },
]

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    chiffreAffaires: 0,
    ventesJour: 0,
    produitsStock: 0,
    alertesStock: 0,
    clientsActifs: 0,
  })
  const [alertes, setAlertes] = useState<StockAlerte[]>([])
  const [ventesRecentes, setVentesRecentes] = useState<VenteRecente[]>([])
  const [ventesParJour, setVentesParJour] = useState<VenteParJour[]>([])
  const [ventesParCategorie, setVentesParCategorie] = useState<VenteParCategorie[]>([])
  const [periode, setPeriode] = useState<"7" | "30" | "90">("7")
  const [comparaison, setComparaison] = useState({ actuel: 0, precedent: 0, variation: 0 })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      const [statsRes, alertesRes, ventesRes, ventesJourRes, ventesCatRes, compRes] = await Promise.all([
        fetch("${API_URL}/dashboard/stats", { headers }),
        fetch("${API_URL}/dashboard/alertes-stock", { headers }),
        fetch("${API_URL}/dashboard/ventes-recentes", { headers }),
        fetch(`${API_URL}/dashboard/ventes-par-jour?jours=${periode}`, { headers }),
        fetch("${API_URL}/dashboard/ventes-par-categorie", { headers }),
        fetch(`${API_URL}/dashboard/comparaison?jours=${periode}`, { headers }),
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
      if (alertesRes.ok) {
        const alertesData = await alertesRes.json()
        setAlertes(Array.isArray(alertesData) ? alertesData : alertesData.data || [])
      }
      if (ventesRes.ok) {
        const ventesData = await ventesRes.json()
        setVentesRecentes(Array.isArray(ventesData) ? ventesData : ventesData.data || [])
      }
      if (ventesJourRes.ok) {
        const vjData = await ventesJourRes.json()
        setVentesParJour(Array.isArray(vjData) ? vjData : vjData.data || [])
      }
      if (ventesCatRes.ok) {
        const vcData = await ventesCatRes.json()
        setVentesParCategorie(Array.isArray(vcData) ? vcData : vcData.data || [])
      }
      if (compRes.ok) setComparaison(await compRes.json())
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      fetchGraphData()
    }
  }, [periode])

  const fetchGraphData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }
      const [ventesJourRes, compRes] = await Promise.all([
        fetch(`${API_URL}/dashboard/ventes-par-jour?jours=${periode}`, { headers }),
        fetch(`${API_URL}/dashboard/comparaison?jours=${periode}`, { headers }),
      ])
      if (ventesJourRes.ok) setVentesParJour(await ventesJourRes.json())
      if (compRes.ok) setComparaison(await compRes.json())
    } catch (error) {
      console.error("Erreur:", error)
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
      value: `${(stats?.chiffreAffaires || 0).toLocaleString()} F`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Ventes du jour",
      value: (stats?.ventesJour || 0).toString(),
      icon: ShoppingCart,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Produits en stock",
      value: (stats?.produitsStock || 0).toString(),
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Clients actifs",
      value: (stats?.clientsActifs || 0).toString(),
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden bg-black/50 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setSidebarOpen(false)} 
      />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>
      
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-6">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-sm text-gray-500">Bienvenue sur votre espace de gestion</p>
              </div>
              <Link
                href="/caisse"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Nouvelle Vente
              </Link>
            </div>

            {/* Stats */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {statsCards.map((stat) => (
                  <div key={stat.title} className="bg-white rounded-xl shadow-sm border p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{stat.title}</p>
                        <p className="text-base sm:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      </div>
                      <div className={`w-8 h-8 sm:w-12 sm:h-12 ${stat.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 ml-2`}>
                        <stat.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Actions rapides</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
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

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Graphique Ventes par jour */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Évolution des ventes</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <select
                      value={periode}
                      onChange={(e) => setPeriode(e.target.value as "7" | "30" | "90")}
                      className="text-xs sm:text-sm border border-gray-200 rounded-lg px-2 sm:px-3 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="7">7 jours</option>
                      <option value="30">30 jours</option>
                      <option value="90">90 jours</option>
                    </select>
                  </div>
                </div>
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ventesParJour}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toLocaleString()} F`, "CA"]}
                        contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
                      />
                      <Area type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Comparaison périodique */}
              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Comparaison</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 bg-amber-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500">Période actuelle</p>
                    <p className="text-lg sm:text-2xl font-bold text-amber-600">{(comparaison?.actuel || 0).toLocaleString()} F</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500">Période précédente</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-600">{(comparaison?.precedent || 0).toLocaleString()} F</p>
                  </div>
                  <div className={`p-3 sm:p-4 rounded-lg flex items-center justify-between ${(comparaison?.variation || 0) >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Variation</p>
                      <p className={`text-base sm:text-xl font-bold ${(comparaison?.variation || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {(comparaison?.variation || 0) >= 0 ? "+" : ""}{comparaison?.variation || 0}%
                      </p>
                    </div>
                    {(comparaison?.variation || 0) >= 0 ? (
                      <ArrowUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                    ) : (
                      <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Ventes par catégorie */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Ventes par catégorie</h3>
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ventesParCategorie}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="total"
                        nameKey="categorie"
                        label={({ categorie, percent }) => `${categorie} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {(ventesParCategorie || []).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value.toLocaleString()} F`, "Ventes"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Top catégories</h3>
                <div className="space-y-2 sm:space-y-3">
                  {(ventesParCategorie || []).slice(0, 5).map((cat, index) => (
                    <div key={cat.categorie} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{cat.categorie}</span>
                          <span className="text-sm text-gray-500">{(cat.total || 0).toLocaleString()} F</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${(cat.total / (ventesParCategorie[0]?.total || 1)) * 100}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts & Recent Sales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Stock Alerts */}
              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-gray-900">Alertes Stock</h3>
                    {(alertes?.length || 0) > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        {alertes.length}
                      </span>
                    )}
                  </div>
                  <Link href="/stock" className="text-sm text-amber-600 hover:text-orange-600">
                    Voir tout
                  </Link>
                </div>
                {(!alertes || alertes.length === 0) ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucune alerte pour le moment</p>
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
              <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold text-gray-900">Ventes récentes</h3>
                  </div>
                  <Link href="/ventes" className="text-sm text-amber-600 hover:text-orange-600">
                    Voir tout
                  </Link>
                </div>
                {(!ventesRecentes || ventesRecentes.length === 0) ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucune vente récente</p>
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
                          <p className="text-sm text-gray-500">{formatDate(vente.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {(vente.total || 0).toLocaleString()} F
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
        </main>
      </div>
    </div>
  )
}
