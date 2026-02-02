"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, FolderTree, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/Toast"
import { API_URL } from "@/lib/api"

interface Categorie {
  id: string
  nom: string
  _count?: { produits: number }
}

export default function CategoriesPage() {
  const { showToast } = useToast()
  const [categories, setCategories] = useState<Categorie[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newCategorie, setNewCategorie] = useState("")
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("${API_URL}/categories", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setCategories(await response.json())
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setPageLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newCategorie.trim()) return
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("${API_URL}/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nom: newCategorie }),
      })

      if (!response.ok) throw new Error("Erreur")
      
      setNewCategorie("")
      setShowModal(false)
      showToast("Catégorie créée avec succès", "success")
      fetchCategories()
    } catch (error) {
      showToast("Erreur lors de la création", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) return
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setCategories(categories.filter(c => c.id !== id))
        showToast("Catégorie supprimée avec succès", "success")
      } else {
        showToast("Erreur: la catégorie contient peut-être des produits", "error")
      }
    } catch (error) {
      showToast("Erreur lors de la suppression", "error")
    }
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingNom, setEditingNom] = useState("")

  const handleEdit = async (id: string) => {
    if (!editingNom.trim()) return
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nom: editingNom }),
      })
      if (response.ok) {
        setCategories(categories.map(c => c.id === id ? { ...c, nom: editingNom } : c))
        setEditingId(null)
        setEditingNom("")
        showToast("Catégorie modifiée avec succès", "success")
      } else {
        showToast("Erreur lors de la modification", "error")
      }
    } catch (error) {
      showToast("Erreur lors de la modification", "error")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
          <p className="text-gray-500">Organisez vos produits par catégories</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Catégorie
        </button>
      </div>

      {/* Categories Grid */}
      {pageLoading ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderTree className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune catégorie</h3>
          <p className="text-gray-500 mb-4">Créez des catégories pour organiser vos produits</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Créer une catégorie
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <FolderTree className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cat.nom}</h3>
                    <p className="text-sm text-gray-500">{cat._count?.produits || 0} produits</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => { setEditingId(cat.id); setEditingNom(cat.nom); }}
                    className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Edition */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Modifier la Catégorie</h2>
            <input
              type="text"
              value={editingNom}
              onChange={(e) => setEditingNom(e.target.value)}
              placeholder="Nom de la catégorie"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setEditingId(null); setEditingNom(""); }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
                Annuler
              </button>
              <button
                onClick={() => handleEdit(editingId)}
                disabled={!editingNom.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Creation */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle Catégorie</h2>
            <input
              type="text"
              value={newCategorie}
              onChange={(e) => setNewCategorie(e.target.value)}
              placeholder="Nom de la catégorie"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || !newCategorie.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? "Création..." : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
