"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Phone, MapPin, Edit, Trash2, Eye, Loader2, CheckSquare, Square, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/Toast"

interface Client {
  id: string
  nom: string
  telephone: string
  adresse: string
  typeClient: string
  solde: number
  actif: boolean
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ClientsPage() {
  const { showToast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [userRole, setUserRole] = useState<string>("")
  const [deleting, setDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 20, totalPages: 0 })

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserRole(user.role || "")
      } catch (e) {
        console.error("Erreur parsing user:", e)
      }
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [page])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })
      
      const response = await fetch(`http://localhost:3001/clients?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const result = await response.json()
        setClients(result.data || [])
        setMeta(result.meta || { total: 0, page: 1, limit: 20, totalPages: 0 })
      }
    } catch (error) {
      console.error("Erreur chargement clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(c => 
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone?.includes(search)
  )

  const isAdmin = userRole === "ADMIN"

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredClients.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredClients.map(c => c.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Supprimer ${selectedIds.size} client(s) ?`)) return

    setDeleting(true)
    try {
      const token = localStorage.getItem("token")
      const idsArray = Array.from(selectedIds)
      for (const id of idsArray) {
        await fetch(`http://localhost:3001/clients/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      }
      setClients(clients.filter(c => !selectedIds.has(c.id)))
      setSelectedIds(new Set())
      showToast("Client(s) supprimé(s) avec succès", "success")
    } catch (error) {
      showToast("Erreur lors de la suppression", "error")
    } finally {
      setDeleting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) return
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/clients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setClients(clients.filter(c => c.id !== id))
        showToast("Client supprimé avec succès", "success")
      } else {
        showToast("Erreur lors de la suppression", "error")
      }
    } catch (error) {
      showToast("Erreur lors de la suppression", "error")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500">Gérez votre base de clients</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5" />
              {deleting ? "Suppression..." : `Supprimer (${selectedIds.size})`}
            </button>
          )}
          <Link
            href="/clients/nouveau"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Nouveau Client
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="">Tous les types</option>
            <option value="PARTICULIER">Particulier</option>
            <option value="CHANTIER">Chantier</option>
            <option value="ENTREPRISE">Entreprise</option>
          </select>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun client</h3>
            <p className="text-gray-500 mb-4">Commencez par ajouter votre premier client</p>
            <Link
              href="/clients/nouveau"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Ajouter un client
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {isAdmin && (
                  <th className="px-4 py-3 text-left">
                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                      {selectedIds.size === filteredClients.length && filteredClients.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solde</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredClients.map((client) => (
                <tr key={client.id} className={`hover:bg-gray-50 ${selectedIds.has(client.id) ? "bg-amber-50" : ""}`}>
                  {isAdmin && (
                    <td className="px-4 py-4">
                      <button onClick={() => toggleSelect(client.id)} className="text-gray-400 hover:text-gray-600">
                        {selectedIds.has(client.id) ? (
                          <CheckSquare className="w-5 h-5 text-amber-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{client.nom}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Phone className="w-4 h-4" />
                      {client.telephone || "-"}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      {client.adresse || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                      {client.typeClient}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={client.solde > 0 ? "text-red-600 font-medium" : "text-gray-900"}>
                      {client.solde.toLocaleString()} FCFA
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/clients/${client.id}`} className="p-1 text-gray-400 hover:text-amber-600">
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link href={`/clients/${client.id}/modifier`} className="p-1 text-gray-400 hover:text-green-600">
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button onClick={() => handleDelete(client.id)} className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Affichage de {((meta.page - 1) * meta.limit) + 1} à {Math.min(meta.page * meta.limit, meta.total)} sur {meta.total} clients
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
