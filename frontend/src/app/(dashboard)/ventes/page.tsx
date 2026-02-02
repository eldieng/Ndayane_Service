"use client"

import { useState, useEffect } from "react"
import { Search, Eye, FileText, Loader2, Calendar, User, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react"
import Link from "next/link"

interface Paiement {
  montant: number
}

interface Vente {
  id: string
  numero: string
  createdAt: string
  total: number
  sousTotal: number
  remise: number
  statut: string
  client?: { nom: string }
  lignes: { quantite: number }[]
  paiements?: Paiement[]
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function VentesPage() {
  const [ventes, setVentes] = useState<Vente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [statutFilter, setStatutFilter] = useState("")
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 20, totalPages: 0 })

  useEffect(() => {
    fetchVentes()
  }, [page])

  const fetchVentes = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })
      
      const response = await fetch(`${API_URL}/ventes?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const result = await response.json()
        setVentes(result.data || [])
        setMeta(result.meta || { total: 0, page: 1, limit: 20, totalPages: 0 })
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVentes = ventes.filter(v => {
    const matchSearch = !search || 
      v.numero?.toLowerCase().includes(search.toLowerCase()) ||
      v.client?.nom?.toLowerCase().includes(search.toLowerCase())
    const matchStatut = !statutFilter || v.statut === statutFilter
    return matchSearch && matchStatut
  })

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "VALIDEE": 
      case "PAYEE": return "bg-green-100 text-green-700"
      case "EN_ATTENTE": return "bg-yellow-100 text-yellow-700"
      case "PARTIELLE": return "bg-orange-100 text-orange-700"
      case "ANNULEE": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case "VALIDEE": return "Validée"
      case "PAYEE": return "Payée"
      case "EN_ATTENTE": return "En attente"
      case "PARTIELLE": return "Paiement partiel"
      case "ANNULEE": return "Annulée"
      default: return statut
    }
  }

  const getResteAPayer = (vente: Vente) => {
    const totalPaye = vente.paiements?.reduce((sum, p) => sum + p.montant, 0) || 0
    return vente.total - totalPaye
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventes</h1>
          <p className="text-gray-500">Historique des ventes et factures</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/caisse"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
          >
            <FileText className="w-5 h-5" />
            Nouvelle Vente
          </Link>
          <Link
            href="/documents/devis"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <FileText className="w-5 h-5" />
            Devis
          </Link>
          <Link
            href="/documents/bon-commande"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <ClipboardList className="w-5 h-5" />
            Bon Commande
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par numéro ou client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Tous les statuts</option>
            <option value="PARTIELLE">Paiement partiel</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="PAYEE">Payée</option>
            <option value="VALIDEE">Validée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </div>
      </div>

      {/* Ventes List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : filteredVentes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune vente</h3>
            <p className="text-gray-500 mb-4">Les ventes apparaîtront ici</p>
            <Link
              href="/caisse"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
            >
              Créer une vente
            </Link>
          </div>
        ) : (
          <>
            {/* Vue Mobile - Cartes */}
            <div className="md:hidden divide-y">
              {filteredVentes.map((vente) => (
                <div key={vente.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-mono font-medium text-gray-900">{vente.numero || vente.id.slice(0, 8)}</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(vente.createdAt)}
                      </div>
                    </div>
                    <Link
                      href={`/ventes/${vente.id}`}
                      className="p-2 text-gray-400 hover:text-amber-600"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                  <div className="flex items-center gap-1 text-sm mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    {vente.client?.nom || "Client comptoir"}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatutColor(vente.statut)}`}>
                      {getStatutLabel(vente.statut)}
                    </span>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">
                        {(vente.total || 0).toLocaleString()} F
                      </span>
                      {getResteAPayer(vente) > 0 && (
                        <div className="text-xs text-red-600">
                          Reste: {getResteAPayer(vente).toLocaleString()} F
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vue Desktop - Tableau */}
            <table className="w-full hidden md:table">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Vente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Articles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredVentes.map((vente) => (
                  <tr key={vente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-gray-900">{vente.numero || vente.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(vente.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        {vente.client?.nom || "Client comptoir"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {vente.lignes?.length || 0} article(s)
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {(vente.total || 0).toLocaleString()} FCFA
                        </span>
                        {(vente.remise || 0) > 0 && (
                          <span className="text-xs text-green-600 ml-1">(-{(vente.remise || 0).toLocaleString()})</span>
                        )}
                      </div>
                      {getResteAPayer(vente) > 0 && (
                        <span className="text-xs text-red-600">
                          Reste: {getResteAPayer(vente).toLocaleString()} F
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutColor(vente.statut)}`}>
                        {getStatutLabel(vente.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/ventes/${vente.id}`}
                        className="p-2 text-gray-400 hover:text-amber-600 inline-flex"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Stats */}
      {filteredVentes.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-amber-700 font-medium">
              {filteredVentes.length} vente(s) affichée(s)
            </span>
            <span className="text-gray-900 font-bold">
              Total: {filteredVentes.reduce((sum, v) => sum + (v.total || 0), 0).toLocaleString()} FCFA
            </span>
          </div>
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Affichage de {((meta.page - 1) * meta.limit) + 1} à {Math.min(meta.page * meta.limit, meta.total)} sur {meta.total} ventes
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                  let pageNum: number
                  if (meta.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= meta.totalPages - 2) {
                    pageNum = meta.totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium ${
                        page === pageNum
                          ? "bg-amber-500 text-white"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
