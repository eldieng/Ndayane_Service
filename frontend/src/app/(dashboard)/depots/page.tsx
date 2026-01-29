"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Warehouse, MapPin, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/Toast"

interface Depot {
  id: string
  nom: string
  localisation: string
  principal: boolean
  actif: boolean
  _count?: { stocks: number }
}

export default function DepotsPage() {
  const { showToast } = useToast()
  const [depots, setDepots] = useState<Depot[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [formData, setFormData] = useState({
    nom: "",
    localisation: "",
    principal: false,
  })

  useEffect(() => {
    fetchDepots()
  }, [])

  const fetchDepots = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/depots", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setDepots(await response.json())
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setPageLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.nom.trim()) return
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/depots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Erreur")
      
      setFormData({ nom: "", localisation: "", principal: false })
      setShowModal(false)
      showToast("Dépôt créé avec succès", "success")
      fetchDepots()
    } catch (error) {
      showToast("Erreur lors de la création", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce dépôt ?")) return
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/depots/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setDepots(depots.filter(d => d.id !== id))
        showToast("Dépôt supprimé avec succès", "success")
      } else {
        showToast("Erreur: le dépôt contient peut-être du stock", "error")
      }
    } catch (error) {
      showToast("Erreur lors de la suppression", "error")
    }
  }

  const [editingDepot, setEditingDepot] = useState<Depot | null>(null)

  const handleEdit = async () => {
    if (!editingDepot || !editingDepot.nom.trim()) return
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/depots/${editingDepot.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: editingDepot.nom,
          localisation: editingDepot.localisation,
          principal: editingDepot.principal,
        }),
      })
      if (response.ok) {
        setDepots(depots.map(d => d.id === editingDepot.id ? editingDepot : d))
        setEditingDepot(null)
        showToast("Dépôt modifié avec succès", "success")
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
          <h1 className="text-2xl font-bold text-gray-900">Dépôts</h1>
          <p className="text-gray-500">Gérez vos emplacements de stockage</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau Dépôt
        </button>
      </div>

      {/* Depots Grid */}
      {pageLoading ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : depots.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Warehouse className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun dépôt</h3>
          <p className="text-gray-500 mb-4">Créez votre premier dépôt pour gérer votre stock</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Créer un dépôt
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {depots.map((depot) => (
            <div key={depot.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    depot.principal ? "bg-amber-100" : "bg-gray-100"
                  }`}>
                    <Warehouse className={`w-6 h-6 ${depot.principal ? "text-amber-600" : "text-gray-600"}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{depot.nom}</h3>
                    {depot.principal && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                        <CheckCircle className="w-3 h-3" />
                        Principal
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setEditingDepot(depot)}
                    className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(depot.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {depot.localisation && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4" />
                  {depot.localisation}
                </div>
              )}
              
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-900">{depot._count?.stocks || 0}</span> produits en stock
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Edition */}
      {editingDepot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Modifier le Dépôt</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={editingDepot.nom}
                  onChange={(e) => setEditingDepot({ ...editingDepot, nom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                <input
                  type="text"
                  value={editingDepot.localisation || ""}
                  onChange={(e) => setEditingDepot({ ...editingDepot, localisation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingDepot.principal}
                  onChange={(e) => setEditingDepot({ ...editingDepot, principal: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span className="text-sm text-gray-700">Dépôt principal</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingDepot(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleEdit}
                disabled={!editingDepot.nom.trim()}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Nouveau Dépôt</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du dépôt *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Magasin principal"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation
                </label>
                <input
                  type="text"
                  value={formData.localisation}
                  onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
                  placeholder="Adresse ou description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="principal"
                  checked={formData.principal}
                  onChange={(e) => setFormData({ ...formData, principal: e.target.checked })}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <label htmlFor="principal" className="text-sm text-gray-700">
                  Définir comme dépôt principal
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || !formData.nom.trim()}
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
