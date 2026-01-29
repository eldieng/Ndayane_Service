"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, AlertTriangle, Package, Loader2, PackagePlus } from "lucide-react"
import Link from "next/link"

interface AlerteStock {
  id: string
  nom: string
  categorie: string
  stockActuel: number
  stockMin: number
  unite: string
  prixAchat: number
  ecart: number
}

export default function AlertesStockPage() {
  const [alertes, setAlertes] = useState<AlerteStock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlertes()
  }, [])

  const fetchAlertes = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/stock/alertes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAlertes(data.alertes || [])
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (alerte: AlerteStock) => {
    if (alerte.stockActuel === 0) {
      return { label: "Rupture", bg: "bg-red-100", text: "text-red-700", border: "border-red-200" }
    }
    return { label: "Stock bas", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/stock" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alertes de Stock</h1>
          <p className="text-gray-500">Produits en rupture ou sous le seuil minimum</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total alertes</p>
              <p className="text-2xl font-bold text-gray-900">{alertes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En rupture</p>
              <p className="text-2xl font-bold text-red-600">
                {alertes.filter((a) => a.stockActuel === 0).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Stock bas</p>
              <p className="text-2xl font-bold text-amber-600">
                {alertes.filter((a) => a.stockActuel > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des alertes */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : alertes.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-green-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune alerte</h3>
            <p className="text-gray-500">Tous vos produits sont bien approvisionnés</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock actuel</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Seuil min.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {alertes.map((alerte) => {
                const status = getStockStatus(alerte)
                return (
                  <tr key={alerte.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${status.bg} rounded-lg flex items-center justify-center`}>
                          <Package className={`w-5 h-5 ${status.text}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{alerte.nom}</p>
                          <p className="text-xs text-gray-500">{alerte.prixAchat.toLocaleString()} F/{alerte.unite}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{alerte.categorie}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${alerte.stockActuel === 0 ? "text-red-600" : "text-amber-600"}`}>
                        {alerte.stockActuel} {alerte.unite}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {alerte.stockMin} {alerte.unite}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                        <AlertTriangle className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/stock/entree?produit=${alerte.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm text-amber-600 hover:bg-amber-50 rounded-lg"
                      >
                        <PackagePlus className="w-4 h-4" />
                        Entrée stock
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
