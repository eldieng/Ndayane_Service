"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { API_URL } from "@/lib/api"

interface Categorie {
  id: string
  nom: string
}

export default function NouveauProduitPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Categorie[]>([])
  const [formData, setFormData] = useState({
    nom: "",
    categorieId: "",
    unite: "pièce",
    prixAchat: 0,
    prixVente: 0,
    stockMin: 5,
    fournisseur: "",
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setCategories(await response.json())
      }
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/produits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Erreur lors de la création")

      router.push("/produits")
    } catch (error) {
      console.error(error)
      alert("Erreur lors de la création du produit")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/produits"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau Produit</h1>
          <p className="text-gray-500">Ajouter un nouveau produit au catalogue</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du produit *
              </label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Ciment CEM II 42.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                value={formData.categorieId}
                onChange={(e) => setFormData({ ...formData, categorieId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unité de mesure
              </label>
              <select
                value={formData.unite}
                onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="pièce">Pièce</option>
                <option value="kg">Kilogramme (kg)</option>
                <option value="m">Mètre (m)</option>
                <option value="m²">Mètre carré (m²)</option>
                <option value="litre">Litre</option>
                <option value="sac">Sac</option>
                <option value="carton">Carton</option>
                <option value="paquet">Paquet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix d&apos;achat (FCFA) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.prixAchat}
                onChange={(e) => setFormData({ ...formData, prixAchat: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix de vente (FCFA) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.prixVente}
                onChange={(e) => setFormData({ ...formData, prixVente: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock minimum (alerte)
              </label>
              <input
                type="number"
                min="0"
                value={formData.stockMin}
                onChange={(e) => setFormData({ ...formData, stockMin: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fournisseur
              </label>
              <input
                type="text"
                value={formData.fournisseur}
                onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nom du fournisseur"
              />
            </div>
          </div>

          {/* Marge */}
          {formData.prixVente > 0 && formData.prixAchat > 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Marge :</strong> {(formData.prixVente - formData.prixAchat).toLocaleString()} FCFA 
                ({((formData.prixVente - formData.prixAchat) / formData.prixAchat * 100).toFixed(1)}%)
              </p>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Link
              href="/produits"
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
