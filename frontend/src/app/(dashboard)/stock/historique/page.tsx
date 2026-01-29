"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, ArrowLeftRight, Loader2, Calendar, Package, User, Filter } from "lucide-react"
import Link from "next/link"

interface MouvementStock {
  id: string
  type: string
  quantite: number
  motif: string
  createdAt: string
  produit: { nom: string; unite: string }
  depot: { nom: string }
  utilisateur: { nom: string }
}

export default function HistoriqueMouvementsPage() {
  const [mouvements, setMouvements] = useState<MouvementStock[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState("")
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")

  useEffect(() => {
    fetchMouvements()
  }, [typeFilter])

  const fetchMouvements = async () => {
    try {
      const token = localStorage.getItem("token")
      let url = "http://localhost:3001/stock/mouvements"
      if (typeFilter) {
        url += `?type=${typeFilter}`
      }
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setMouvements(await response.json())
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTypeInfo = (type: string) => {
    const types: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
      ENTREE: {
        label: "Entrée",
        icon: <ArrowDownCircle className="w-4 h-4" />,
        bg: "bg-green-100",
        text: "text-green-700",
      },
      SORTIE: {
        label: "Sortie",
        icon: <ArrowUpCircle className="w-4 h-4" />,
        bg: "bg-red-100",
        text: "text-red-700",
      },
      TRANSFERT: {
        label: "Transfert",
        icon: <ArrowLeftRight className="w-4 h-4" />,
        bg: "bg-blue-100",
        text: "text-blue-700",
      },
      VENTE: {
        label: "Vente",
        icon: <ArrowUpCircle className="w-4 h-4" />,
        bg: "bg-amber-100",
        text: "text-amber-700",
      },
      RETOUR: {
        label: "Retour",
        icon: <ArrowDownCircle className="w-4 h-4" />,
        bg: "bg-purple-100",
        text: "text-purple-700",
      },
      AJUSTEMENT: {
        label: "Ajustement",
        icon: <Package className="w-4 h-4" />,
        bg: "bg-gray-100",
        text: "text-gray-700",
      },
    }
    return types[type] || types.AJUSTEMENT
  }

  const filteredMouvements = mouvements.filter((m) => {
    if (dateDebut && new Date(m.createdAt) < new Date(dateDebut)) return false
    if (dateFin && new Date(m.createdAt) > new Date(dateFin + "T23:59:59")) return false
    return true
  })

  const stats = {
    entrees: mouvements.filter((m) => m.type === "ENTREE").reduce((sum, m) => sum + m.quantite, 0),
    sorties: mouvements.filter((m) => m.type === "SORTIE" || m.type === "VENTE").reduce((sum, m) => sum + m.quantite, 0),
    transferts: mouvements.filter((m) => m.type === "TRANSFERT").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/stock" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historique des Mouvements</h1>
          <p className="text-gray-500">Traçabilité complète des entrées et sorties de stock</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total entrées</p>
              <p className="text-2xl font-bold text-green-600">{stats.entrees}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowUpCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total sorties</p>
              <p className="text-2xl font-bold text-red-600">{stats.sorties}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Transferts</p>
              <p className="text-2xl font-bold text-blue-600">{stats.transferts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Tous les types</option>
              <option value="ENTREE">Entrées</option>
              <option value="SORTIE">Sorties</option>
              <option value="VENTE">Ventes</option>
              <option value="TRANSFERT">Transferts</option>
              <option value="RETOUR">Retours</option>
              <option value="AJUSTEMENT">Ajustements</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <span className="text-gray-500">à</span>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Mouvements List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : filteredMouvements.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun mouvement</h3>
            <p className="text-gray-500">Les mouvements de stock apparaîtront ici</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dépôt</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Par</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredMouvements.map((mouvement) => {
                const typeInfo = getTypeInfo(mouvement.type)
                return (
                  <tr key={mouvement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(mouvement.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${typeInfo.bg} ${typeInfo.text}`}>
                        {typeInfo.icon}
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{mouvement.produit?.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{mouvement.depot?.nom}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${mouvement.type === "ENTREE" || mouvement.type === "RETOUR" ? "text-green-600" : "text-red-600"}`}>
                        {mouvement.type === "ENTREE" || mouvement.type === "RETOUR" ? "+" : "-"}
                        {mouvement.quantite} {mouvement.produit?.unite}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {mouvement.motif || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        {mouvement.utilisateur?.nom}
                      </div>
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
