"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye, Package, Loader2, CheckSquare, Square, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Produit {
  id: string
  nom: string
  reference?: string
  categorie?: { id: string; nom: string }
  unite: string
  prixAchat: number
  prixVente: number
  stockMin: number
  stocks: { quantite: number }[]
}

interface Categorie {
  id: string
  nom: string
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [search, setSearch] = useState("")
  const [categorieFilter, setCategorieFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [userRole, setUserRole] = useState<string>("")
  const [deleting, setDeleting] = useState(false)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 20, totalPages: 0 })

  useEffect(() => {
    // Récupérer le rôle de l'utilisateur
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserRole(user.role || "")
      } catch (e) {
        console.error("Erreur parsing user:", e)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProduits()
  }, [page, categorieFilter])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/categories", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) setCategories(await response.json())
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const fetchProduits = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })
      if (categorieFilter) params.append("categorieId", categorieFilter)
      
      const response = await fetch(`http://localhost:3001/produits?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const result = await response.json()
        setProduits(result.data || [])
        setMeta(result.meta || { total: 0, page: 1, limit: 20, totalPages: 0 })
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

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
    if (selectedIds.size === filteredProduits.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredProduits.map(p => p.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Supprimer ${selectedIds.size} produit(s) ?`)) return

    setDeleting(true)
    try {
      const token = localStorage.getItem("token")
      const idsArray = Array.from(selectedIds)
      for (const id of idsArray) {
        await fetch(`http://localhost:3001/produits/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      }
      setProduits(produits.filter(p => !selectedIds.has(p.id)))
      setSelectedIds(new Set())
    } catch (error) {
      alert("Erreur lors de la suppression")
    } finally {
      setDeleting(false)
    }
  }

  const filteredProduits = produits.filter(p => {
    const matchSearch = p.nom.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/produits/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setProduits(produits.filter(p => p.id !== id))
      } else {
        alert("Erreur lors de la suppression")
      }
    } catch (error) {
      alert("Erreur lors de la suppression")
    }
  }

  const getStockTotal = (produit: Produit) => {
    return produit.stocks?.reduce((sum, s) => sum + s.quantite, 0) || 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-500">Gérez votre catalogue de produits</p>
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
            href="/produits/nouveau"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Nouveau Produit
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
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select 
            value={categorieFilter}
            onChange={(e) => setCategorieFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nom}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : filteredProduits.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun produit</h3>
          <p className="text-gray-500 mb-4">Commencez par ajouter votre premier produit</p>
          <Link
            href="/produits/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter un produit
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {isAdmin && (
                  <th className="px-4 py-3 text-left">
                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                      {selectedIds.size === filteredProduits.length && filteredProduits.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Achat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix Vente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProduits.map((produit) => {
                const stock = getStockTotal(produit)
                const isLowStock = stock <= produit.stockMin
                return (
                  <tr key={produit.id} className={`hover:bg-gray-50 ${selectedIds.has(produit.id) ? "bg-amber-50" : ""}`}>
                    {isAdmin && (
                      <td className="px-4 py-4">
                        <button onClick={() => toggleSelect(produit.id)} className="text-gray-400 hover:text-gray-600">
                          {selectedIds.has(produit.id) ? (
                            <CheckSquare className="w-5 h-5 text-amber-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{produit.nom}</div>
                      <div className="text-sm text-gray-500">{produit.unite}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {produit.categorie?.nom || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {produit.prixAchat.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {produit.prixVente.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isLowStock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>
                        {stock} {produit.unite}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/produits/${produit.id}`} className="p-1 text-gray-400 hover:text-amber-600">
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link href={`/produits/${produit.id}/modifier`} className="p-1 text-gray-400 hover:text-green-600">
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button onClick={() => handleDelete(produit.id)} className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Affichage de {((meta.page - 1) * meta.limit) + 1} à {Math.min(meta.page * meta.limit, meta.total)} sur {meta.total} produits
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
