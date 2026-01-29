"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
  Calendar,
  Download,
  Loader2,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import Link from "next/link"

interface StatsVentes {
  totalVentes: number
  chiffreAffaires: number
  panierMoyen: number
  nombreClients: number
}

interface VenteParJour {
  date: string
  total: number
  count: number
}

interface ProduitPopulaire {
  produit: { id: string; nom: string; prixVente: number }
  quantiteVendue: number
  chiffreAffaires: number
}

export default function RapportsPage() {
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState("semaine")
  const [stats, setStats] = useState<StatsVentes>({
    totalVentes: 0,
    chiffreAffaires: 0,
    panierMoyen: 0,
    nombreClients: 0,
  })
  const [ventesParJour, setVentesParJour] = useState<VenteParJour[]>([])
  const [produitsPopulaires, setProduitsPopulaires] = useState<ProduitPopulaire[]>([])

  useEffect(() => {
    fetchRapports()
  }, [periode])

  const fetchRapports = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      const [statsRes, ventesRes, produitsRes] = await Promise.all([
        fetch(`http://localhost:3001/rapports/stats?periode=${periode}`, { headers }),
        fetch(`http://localhost:3001/rapports/ventes-par-jour?periode=${periode}`, { headers }),
        fetch(`http://localhost:3001/rapports/produits-populaires?periode=${periode}`, { headers }),
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (ventesRes.ok) setVentesParJour(await ventesRes.json())
      if (produitsRes.ok) setProduitsPopulaires(await produitsRes.json())
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
  }

  const maxVente = Math.max(...ventesParJour.map(v => v.total), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports & Statistiques</h1>
          <p className="text-gray-500">Analysez les performances de votre activité</p>
        </div>
        <div className="flex gap-2">
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="jour">Aujourd&apos;hui</option>
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="trimestre">3 derniers mois</option>
            <option value="semestre">6 derniers mois</option>
            <option value="annee">Cette année</option>
          </select>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium"
          >
            <Download className="w-4 h-4" />
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Chiffre d&apos;affaires</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.chiffreAffaires.toLocaleString()} F
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Nombre de ventes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalVentes}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-gray-700" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Panier moyen</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.panierMoyen.toLocaleString()} F
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-700" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Clients servis</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.nombreClients}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ventes par jour */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Évolution des ventes</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              {ventesParJour.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Aucune donnée pour cette période</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ventesParJour.map((jour) => (
                    <div key={jour.date} className="flex items-center gap-4">
                      <span className="w-16 text-sm text-gray-500">{formatDate(jour.date)}</span>
                      <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-lg flex items-center justify-end pr-2"
                          style={{ width: `${(jour.total / maxVente) * 100}%`, minWidth: jour.total > 0 ? '60px' : '0' }}
                        >
                          <span className="text-xs text-white font-medium">
                            {jour.total.toLocaleString()} F
                          </span>
                        </div>
                      </div>
                      <span className="w-12 text-sm text-gray-500 text-right">{jour.count} v.</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Produits populaires */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Produits les plus vendus</h3>
                <Package className="w-5 h-5 text-gray-400" />
              </div>
              {produitsPopulaires.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Aucune vente pour cette période</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {produitsPopulaires.slice(0, 8).map((item, index) => (
                    <div key={item.produit?.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? "bg-yellow-100 text-yellow-700" :
                          index === 1 ? "bg-gray-200 text-gray-700" :
                          index === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{item.produit?.nom || "Produit"}</p>
                          <p className="text-sm text-gray-500">{item.quantiteVendue} vendus</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-600">
                          {item.chiffreAffaires?.toLocaleString() || 0} F
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/rapports/journalier"
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Rapport journalier</h4>
                <p className="text-sm text-gray-500">Bilan du jour</p>
              </div>
            </Link>

            <Link
              href="/rapports/ventes"
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Rapport des ventes</h4>
                <p className="text-sm text-gray-500">Détail par période</p>
              </div>
            </Link>

            <Link
              href="/rapports/stock"
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Inventaire</h4>
                <p className="text-sm text-gray-500">État du stock</p>
              </div>
            </Link>

            <Link
              href="/rapports/clients"
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Rapport clients</h4>
                <p className="text-sm text-gray-500">Analyse clientèle</p>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
