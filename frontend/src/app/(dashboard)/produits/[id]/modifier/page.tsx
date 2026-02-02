"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { API_URL } from "@/lib/api"

interface Categorie {
  id: string
  nom: string
}

interface ProduitForm {
  nom: string
  categorieId: string
  unite: string
  prixAchat: number
  prixVente: number
  stockMin: number
  fournisseur: string
  stockActuel: number
}

export default function ModifierProduitPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Categorie[]>([])
  const [formData, setFormData] = useState<ProduitForm>({
    nom: "",
    categorieId: "",
    unite: "pièce",
    prixAchat: 0,
    prixVente: 0,
    stockMin: 0,
    fournisseur: "",
    stockActuel: 0,
  })

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      const [produitRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/produits/${params.id}`, { headers }),
        fetch(`${API_URL}/categories`, { headers }),
      ])

      if (produitRes.ok) {
        const produit = await produitRes.json()
        const stockTotal = produit.stocks?.reduce((sum: number, s: { quantite: number }) => sum + s.quantite, 0) || 0
        setFormData({
          nom: produit.nom || "",
          categorieId: produit.categorieId || "",
          unite: produit.unite || "pièce",
          prixAchat: produit.prixAchat || 0,
          prixVente: produit.prixVente || 0,
          stockMin: produit.stockMin || 0,
          fournisseur: produit.fournisseur || "",
          stockActuel: stockTotal,
        })
      }
      if (categoriesRes.ok) {
        setCategories(await categoriesRes.json())
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nom.trim()) {
      alert("Le nom est obligatoire")
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      
      // Mettre à jour le produit
      const response = await fetch(`${API_URL}/produits/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: formData.nom,
          categorieId: formData.categorieId || null,
          unite: formData.unite,
          prixAchat: formData.prixAchat,
          prixVente: formData.prixVente,
          stockMin: formData.stockMin,
          fournisseur: formData.fournisseur,
        }),
      })

      if (response.ok) {
        // Mettre à jour le stock si modifié
        const produit = await response.json()
        const currentStock = produit.stocks?.reduce((sum: number, s: { quantite: number }) => sum + s.quantite, 0) || 0
        
        if (formData.stockActuel > 0 && formData.stockActuel !== currentStock) {
          const diff = formData.stockActuel - currentStock
          // Si le stock actuel est 0 ou si on ajoute du stock, utiliser entree
          // Si on retire du stock, utiliser sortie
          if (diff > 0) {
            await fetch(`${API_URL}/stock/entree`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                produitId: params.id,
                depotId: "depot-principal",
                quantite: diff,
                motif: "Ajustement manuel depuis modification produit",
              }),
            })
          } else if (diff < 0 && currentStock > 0) {
            await fetch(`${API_URL}/stock/sortie`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                produitId: params.id,
                depotId: "depot-principal",
                quantite: Math.abs(diff),
                motif: "Ajustement manuel depuis modification produit",
              }),
            })
          }
        }
        
        router.push(`/produits/${params.id}`)
      } else {
        alert("Erreur lors de la modification")
      }
    } catch (error) {
      alert("Erreur lors de la modification")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/produits/${params.id}`}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modifier le produit</h1>
          <p className="text-gray-500">Mettre à jour les informations</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du produit *
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              value={formData.categorieId}
              onChange={(e) => setFormData({ ...formData, categorieId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Sans catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unité
            </label>
            <select
              value={formData.unite}
              onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="pièce">Pièce</option>
              <option value="kg">Kilogramme (kg)</option>
              <option value="m">Mètre (m)</option>
              <option value="m²">Mètre carré (m²)</option>
              <option value="litre">Litre</option>
              <option value="sac">Sac</option>
              <option value="carton">Carton</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fournisseur
            </label>
            <input
              type="text"
              value={formData.fournisseur}
              onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix d&apos;achat (FCFA)
            </label>
            <input
              type="number"
              min="0"
              value={formData.prixAchat}
              onChange={(e) => setFormData({ ...formData, prixAchat: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix de vente (FCFA)
            </label>
            <input
              type="number"
              min="0"
              value={formData.prixVente}
              onChange={(e) => setFormData({ ...formData, prixVente: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock actuel
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={formData.stockActuel}
                onChange={(e) => setFormData({ ...formData, stockActuel: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">{formData.unite}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Modifier le stock via Entrée/Sortie de stock est recommandé</p>
          </div>
        </div>

        {/* Marge */}
        {formData.prixVente > 0 && formData.prixAchat > 0 && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-700">
              <span className="font-medium">Marge :</span>{" "}
              {(formData.prixVente - formData.prixAchat).toLocaleString()} FCFA
              ({((formData.prixVente - formData.prixAchat) / formData.prixAchat * 100).toFixed(1)}%)
            </p>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
          <Link
            href={`/produits/${params.id}`}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  )
}
