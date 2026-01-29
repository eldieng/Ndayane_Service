"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit, Phone, MapPin, User, Calendar, ShoppingCart, Loader2, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/Toast"

interface Client {
  id: string
  nom: string
  telephone: string
  adresse: string
  email: string
  typeClient: string
  solde: number
  actif: boolean
  createdAt: string
  ventes?: { id: string; numero: string; total: number; createdAt: string }[]
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchClient(params.id as string)
    }
  }, [params.id])

  const fetchClient = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setClient(await response.json())
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) return
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/clients/${params.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        showToast("Client supprimé avec succès", "success")
        router.push("/clients")
      } else {
        showToast("Erreur lors de la suppression", "error")
      }
    } catch (error) {
      showToast("Erreur lors de la suppression", "error")
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Client non trouvé</p>
        <Link href="/clients" className="text-amber-600 hover:underline mt-2 inline-block">
          Retour aux clients
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/clients"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.nom}</h1>
            <p className="text-gray-500">Fiche client</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/clients/${client.id}/modifier`}
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
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{client.nom}</h2>
                <span className="px-2 py-1 text-xs font-medium bg-amber-500 text-orange-700 rounded-full">
                  {client.typeClient}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{client.telephone || "Non renseigné"}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{client.adresse || "Non renseigné"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Client depuis {formatDate(client.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Solde */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Solde du compte</h3>
            {client.solde < 0 ? (
              <>
                <div className="text-3xl font-bold text-green-600">
                  {Math.abs(client.solde).toLocaleString()} FCFA
                </div>
                <p className="text-sm text-green-600 mt-2">Crédit disponible</p>
                <Link
                  href="/caisse"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Utiliser le crédit
                </Link>
              </>
            ) : client.solde > 0 ? (
              <>
                <div className="text-3xl font-bold text-red-600">
                  {client.solde.toLocaleString()} FCFA
                </div>
                <p className="text-sm text-red-500 mt-2">Dette en cours</p>
              </>
            ) : (
              <div className="text-3xl font-bold text-gray-600">0 FCFA</div>
            )}
            <Link
              href="/paiements/acompte"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-amber-500 text-amber-600 hover:bg-amber-50 rounded-lg text-sm font-medium"
            >
              Enregistrer un acompte
            </Link>
          </div>
        </div>

        {/* Historique des ventes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Historique des achats</h3>
              <ShoppingCart className="w-5 h-5 text-gray-400" />
            </div>

            {!client.ventes || client.ventes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucun achat enregistré</p>
              </div>
            ) : (
              <div className="space-y-3">
                {client.ventes.map((vente) => (
                  <Link
                    key={vente.id}
                    href={`/ventes/${vente.id}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{vente.numero || vente.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">{formatDate(vente.createdAt)}</p>
                    </div>
                    <span className="font-semibold text-green-600">
                      {vente.total.toLocaleString()} FCFA
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
