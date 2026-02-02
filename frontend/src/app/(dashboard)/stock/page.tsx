"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Package, ArrowUpCircle, ArrowDownCircle, RefreshCw, AlertTriangle, History, Loader2 } from "lucide-react"
import { API_URL } from "@/lib/api"

interface StockItem {
  produit: {
    id: string
    nom: string
    unite: string
    stockMin: number
  }
  depot: {
    id: string
    nom: string
  }
  quantite: number
}

export default function StockPage() {
  const [stocks, setStocks] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchStock()
  }, [])

  const fetchStock = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/stock`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setStocks(await response.json())
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStocks = stocks.filter(s => 
    s.produit.nom.toLowerCase().includes(search.toLowerCase())
  )

  const alertes = stocks.filter(s => s.quantite <= s.produit.stockMin)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion du Stock</h1>
          <p className="text-gray-500">Gérez les entrées, sorties et transferts de stock</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/stock/entree"
          className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors"
        >
          <ArrowUpCircle className="w-8 h-8 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Entrée</p>
            <p className="text-sm text-green-600">Ajouter du stock</p>
          </div>
        </Link>

        <Link
          href="/stock/sortie"
          className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
        >
          <ArrowDownCircle className="w-8 h-8 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">Sortie</p>
            <p className="text-sm text-red-600">Retirer du stock</p>
          </div>
        </Link>

        <Link
          href="/stock/transfert"
          className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
        >
          <RefreshCw className="w-8 h-8 text-blue-600" />
          <div>
            <p className="font-semibold text-blue-900">Transfert</p>
            <p className="text-sm text-blue-600">Entre dépôts</p>
          </div>
        </Link>

        <Link
          href="/stock/historique"
          className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors"
        >
          <History className="w-8 h-8 text-purple-600" />
          <div>
            <p className="font-semibold text-purple-900">Historique</p>
            <p className="text-sm text-purple-600">Mouvements</p>
          </div>
        </Link>
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h2 className="font-semibold text-orange-900">Alertes de stock bas ({alertes.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {alertes.slice(0, 6).map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-white p-2 rounded-lg">
                <span className="text-sm font-medium text-gray-900 truncate">{s.produit.nom}</span>
                <span className="text-sm font-bold text-red-600">{s.quantite} {s.produit.unite}</span>
              </div>
            ))}
          </div>
          {alertes.length > 6 && (
            <Link href="/stock/alertes" className="text-sm text-orange-600 hover:underline mt-2 inline-block">
              Voir toutes les alertes ({alertes.length})
            </Link>
          )}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Stock List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Dépôt</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Quantité</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Stock Min</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStocks.map((stock, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{stock.produit.nom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{stock.depot.nom}</td>
                  <td className="px-6 py-4 text-right font-medium">
                    {stock.quantite} {stock.produit.unite}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {stock.produit.stockMin} {stock.produit.unite}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {stock.quantite <= stock.produit.stockMin ? (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        Stock bas
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStocks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun stock trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}
