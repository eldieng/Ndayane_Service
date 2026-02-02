"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Download, Loader2, Package, Warehouse, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { API_URL } from "@/lib/api"

interface StockItem {
  id: string
  quantite: number
  produit: {
    nom: string
    prixAchat: number
    prixVente: number
    stockMin: number
    unite: string
  }
  depot: { nom: string }
}

interface RapportStock {
  stocks: StockItem[]
  totalValeurAchat: number
  totalValeurVente: number
  beneficePotentiel: number
}

export default function RapportStockPage() {
  const [loading, setLoading] = useState(true)
  const [rapport, setRapport] = useState<RapportStock | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchRapport()
  }, [])

  const fetchRapport = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/rapports/stock`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setRapport(await response.json())
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStocks = rapport?.stocks.filter(s =>
    s.produit.nom.toLowerCase().includes(search.toLowerCase())
  ) || []

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href="/rapports"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventaire</h1>
            <p className="text-gray-500">État complet du stock</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium"
        >
          <Download className="w-5 h-5" />
          Imprimer
        </button>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Quincaillerie Ndayane Services</h1>
          <h2 className="text-xl mt-2">Inventaire du Stock</h2>
          <p className="text-gray-500 mt-1">
            Date: {new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border p-4 print:hidden">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Summary */}
      {rapport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-sm text-gray-500">Produits en stock</p>
                <p className="text-xl font-bold text-gray-900">{rapport.stocks.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <Warehouse className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Valeur achat</p>
                <p className="text-xl font-bold text-gray-900">{rapport.totalValeurAchat.toLocaleString()} F</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Valeur vente</p>
                <p className="text-xl font-bold text-green-600">{rapport.totalValeurVente.toLocaleString()} F</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-500">Bénéfice potentiel</p>
                <p className="text-xl font-bold text-orange-600">{rapport.beneficePotentiel.toLocaleString()} F</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : filteredStocks.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Aucun produit en stock</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dépôt</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantité</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix Achat</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix Vente</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valeur Stock</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStocks.map((item) => {
                const isLow = item.quantite <= item.produit.stockMin
                const valeurStock = item.quantite * item.produit.prixVente
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 ${isLow ? "bg-red-50" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.produit.nom}</div>
                      <div className="text-xs text-gray-500">Min: {item.produit.stockMin} {item.produit.unite}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.depot.nom}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${isLow ? "text-red-600" : "text-gray-900"}`}>
                        {item.quantite}
                      </span>
                      <span className="text-gray-500 ml-1">{item.produit.unite}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {item.produit.prixAchat.toLocaleString()} F
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {item.produit.prixVente.toLocaleString()} F
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      {valeurStock.toLocaleString()} F
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          Bas
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {rapport && (
              <tfoot className="bg-gray-50 border-t-2">
                <tr>
                  <td colSpan={5} className="px-4 py-3 font-semibold text-gray-900">TOTAL</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600 text-lg">
                    {rapport.totalValeurVente.toLocaleString()} FCFA
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  )
}
