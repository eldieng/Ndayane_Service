"use client"

import { API_URL } from "@/lib/api"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit, Package, Warehouse, Loader2, Trash2, Tag } from "lucide-react"
import Link from "next/link"

interface Produit {
  id: string
  nom: string
  unite: string
  prixAchat: number
  prixVente: number
  stockMin: number
  fournisseur: string
  actif: boolean
  createdAt: string
  categorie?: { id: string; nom: string }
  stocks?: { quantite: number; depot: { nom: string } }[]
}

export default function ProduitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [produit, setProduit] = useState<Produit | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProduit(params.id as string)
    }
  }, [params.id])

  const fetchProduit = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/produits/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setProduit(await response.json())
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/produits/${params.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        router.push("/produits")
      } else {
        alert("Erreur lors de la suppression")
      }
    } catch (error) {
      alert("Erreur lors de la suppression")
    }
  }

  const getStockTotal = () => {
    return produit?.stocks?.reduce((sum, s) => sum + s.quantite, 0) || 0
  }

  const marge = produit ? produit.prixVente - produit.prixAchat : 0
  const margePercent = produit && produit.prixAchat > 0 ? ((marge / produit.prixAchat) * 100).toFixed(1) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!produit) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Produit non trouvé</p>
        <Link href="/produits" className="text-amber-500 hover:underline mt-2 inline-block">
          Retour aux produits
        </Link>
      </div>
    )
  }

  const stockTotal = getStockTotal()
  const isLowStock = stockTotal <= produit.stockMin

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/produits"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{produit.nom}</h1>
            <p className="text-gray-500">Fiche produit</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/produits/${produit.id}/modifier`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium"
          >
            <Edit className="w-5 h-5" />
            Modifier
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            <Trash2 className="w-5 h-5" />
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{produit.nom}</h2>
                {produit.categorie && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    {produit.categorie.nom}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Unité</span>
                <span className="font-medium text-gray-900">{produit.unite}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Fournisseur</span>
                <span className="font-medium text-gray-900">{produit.fournisseur || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Stock minimum</span>
                <span className="font-medium text-gray-900">{produit.stockMin} {produit.unite}</span>
              </div>
            </div>
          </div>

          {/* Prix */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Prix</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Prix d&apos;achat</span>
                <span className="font-medium text-gray-900">{produit.prixAchat.toLocaleString()} F</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Prix de vente</span>
                <span className="font-bold text-green-600">{produit.prixVente.toLocaleString()} F</span>
              </div>
              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-gray-500">Marge</span>
                <div className="text-right">
                  <span className="font-bold text-amber-500">{marge.toLocaleString()} F</span>
                  <span className="text-sm text-gray-500 ml-1">({margePercent}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stock par dépôt */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Stock par dépôt</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isLowStock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}>
                Total: {stockTotal} {produit.unite}
              </div>
            </div>

            {!produit.stocks || produit.stocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Warehouse className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucun stock enregistré</p>
                <Link
                  href="/stock/entree"
                  className="text-amber-500 hover:underline mt-2 inline-block"
                >
                  Faire une entrée de stock
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {produit.stocks.map((stock, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Warehouse className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{stock.depot.nom}</span>
                    </div>
                    <span className={`font-semibold ${stock.quantite <= produit.stockMin ? "text-red-600" : "text-gray-900"}`}>
                      {stock.quantite} {produit.unite}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {isLowStock && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-center gap-3">
                <Tag className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-700">Stock bas</p>
                  <p className="text-sm text-red-600">
                    Le stock est inférieur au minimum ({produit.stockMin} {produit.unite})
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
