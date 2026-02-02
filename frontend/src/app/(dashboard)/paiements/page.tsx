"use client"

import { useState, useEffect } from "react"
import { Search, CreditCard, Loader2, Calendar, User, Banknote, Smartphone, FileText, Plus, Check, X } from "lucide-react"
import { useToast } from "@/components/ui/Toast"

interface Paiement {
  id: string
  montant: number
  modePaiement: string
  typePaiement?: string
  createdAt: string
  reference: string
  vente?: { numero: string; client?: { nom: string } }
  client?: { nom: string }
}

interface VenteRecherchee {
  id: string
  numero: string
  total: number
  statut: string
  client?: { id: string; nom: string }
  paiements: { montant: number }[]
}

export default function PaiementsPage() {
  const { showToast } = useToast()
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  // Recherche de facture
  const [searchFacture, setSearchFacture] = useState("")
  const [venteRecherchee, setVenteRecherchee] = useState<VenteRecherchee | null>(null)
  const [searchingFacture, setSearchingFacture] = useState(false)
  
  // Modal paiement
  const [showPaiementModal, setShowPaiementModal] = useState(false)
  const [montantPaiement, setMontantPaiement] = useState("")
  const [modePaiement, setModePaiement] = useState("ESPECES")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPaiements()
  }, [])

  const fetchPaiements = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/paiements", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setPaiements(await response.json())
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
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "ESPECES": return <Banknote className="w-4 h-4" />
      case "MOBILE_MONEY": return <Smartphone className="w-4 h-4" />
      case "CARTE": return <CreditCard className="w-4 h-4" />
      default: return <CreditCard className="w-4 h-4" />
    }
  }

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "ESPECES": return "Espèces"
      case "MOBILE_MONEY": return "Mobile Money"
      case "CARTE": return "Carte bancaire"
      case "VIREMENT": return "Virement"
      case "CHEQUE": return "Chèque"
      default: return mode
    }
  }

  const totalPaiements = paiements.reduce((sum, p) => sum + p.montant, 0)

  // Rechercher une facture par numéro
  const rechercherFacture = async () => {
    if (!searchFacture.trim()) return
    
    setSearchingFacture(true)
    setVenteRecherchee(null)
    try {
      const token = localStorage.getItem("token")
      // Rechercher dans les ventes
      const response = await fetch(`http://localhost:3001/ventes?search=${encodeURIComponent(searchFacture)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const result = await response.json()
        const ventes = result.data || result
        // Trouver la vente correspondante
        const vente = ventes.find((v: VenteRecherchee) => 
          v.numero?.toLowerCase().includes(searchFacture.toLowerCase())
        )
        if (vente) {
          setVenteRecherchee(vente)
        } else {
          showToast("Facture non trouvee", "error")
        }
      }
    } catch (error) {
      showToast("Erreur de recherche", "error")
    } finally {
      setSearchingFacture(false)
    }
  }

  const getResteAPayer = () => {
    if (!venteRecherchee) return 0
    const totalPaye = venteRecherchee.paiements?.reduce((sum, p) => sum + p.montant, 0) || 0
    return venteRecherchee.total - totalPaye
  }

  const handleAddPaiement = async () => {
    if (!venteRecherchee || !montantPaiement) return
    
    const montant = parseFloat(montantPaiement)
    const reste = getResteAPayer()
    if (montant <= 0 || montant > reste) {
      showToast("Montant invalide", "error")
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/paiements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          venteId: venteRecherchee.id,
          clientId: venteRecherchee.client?.id,
          montant,
          modePaiement,
          typePaiement: "REGLEMENT",
          reference: `PAY-${venteRecherchee.numero}`,
          notes: `Paiement sur facture ${venteRecherchee.numero}`,
        }),
      })

      if (response.ok) {
        const nouveauReste = reste - montant
        showToast(
          nouveauReste === 0 
            ? "Facture soldee!" 
            : `Paiement enregistre. Reste: ${nouveauReste.toLocaleString()} F`,
          "success"
        )
        setShowPaiementModal(false)
        setMontantPaiement("")
        setVenteRecherchee(null)
        setSearchFacture("")
        fetchPaiements()
      } else {
        showToast("Erreur lors du paiement", "error")
      }
    } catch (error) {
      showToast("Erreur lors du paiement", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
          <p className="text-gray-500">Historique des paiements reçus</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Banknote className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Espèces</p>
              <p className="text-xl font-bold text-gray-900">
                {paiements.filter(p => p.modePaiement === "ESPECES").reduce((s, p) => s + p.montant, 0).toLocaleString()} F
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Mobile Money</p>
              <p className="text-xl font-bold text-gray-900">
                {paiements.filter(p => ["WAVE", "ORANGE_MONEY"].includes(p.modePaiement)).reduce((s, p) => s + p.montant, 0).toLocaleString()} F
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Général</p>
              <p className="text-xl font-bold text-gray-900">{totalPaiements.toLocaleString()} F</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recherche de facture pour paiement */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Payer une facture
        </h3>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Entrer le numero de facture (ex: VT2026010001)"
              value={searchFacture}
              onChange={(e) => setSearchFacture(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && rechercherFacture()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={rechercherFacture}
            disabled={searchingFacture || !searchFacture.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {searchingFacture ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Rechercher
          </button>
        </div>

        {/* Résultat de la recherche */}
        {venteRecherchee && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">Facture {venteRecherchee.numero}</p>
                <p className="text-sm text-gray-600">Client: {venteRecherchee.client?.nom || "Client comptoir"}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">Total facture: <span className="font-medium">{venteRecherchee.total.toLocaleString()} FCFA</span></p>
                  <p className="text-sm">
                    Deja paye: <span className="font-medium text-green-600">
                      {(venteRecherchee.paiements?.reduce((s, p) => s + p.montant, 0) || 0).toLocaleString()} FCFA
                    </span>
                  </p>
                  <p className="text-lg font-bold text-red-600">
                    Reste a payer: {getResteAPayer().toLocaleString()} FCFA
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setVenteRecherchee(null)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {getResteAPayer() > 0 ? (
              <button
                onClick={() => {
                  setMontantPaiement(getResteAPayer().toString())
                  setShowPaiementModal(true)
                }}
                className="mt-3 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Enregistrer un paiement
              </button>
            ) : (
              <div className="mt-3 p-2 bg-green-100 text-green-700 rounded-lg text-center font-medium">
                <Check className="w-4 h-4 inline mr-1" />
                Facture entierement payee
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search historique */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Filtrer l'historique..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Paiements List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : paiements.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun paiement</h3>
            <p className="text-gray-500">Les paiements apparaîtront ici après les ventes</p>
          </div>
        ) : (
          <>
            {/* Vue Mobile - Cartes */}
            <div className="md:hidden divide-y">
              {paiements.map((paiement) => (
                <div key={paiement.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(paiement.createdAt)}
                      </div>
                      <div className="flex items-center gap-1 text-sm mt-1">
                        <User className="w-4 h-4 text-gray-400" />
                        {paiement.client?.nom || paiement.vente?.client?.nom || "Client comptoir"}
                      </div>
                    </div>
                    <span className="font-semibold text-green-600">
                      +{paiement.montant.toLocaleString()} F
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                      {getModeIcon(paiement.modePaiement)}
                      {getModeLabel(paiement.modePaiement)}
                    </span>
                    <span className="text-xs text-gray-400">{paiement.vente?.numero}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Vue Desktop - Tableau */}
            <table className="w-full hidden md:table">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paiements.map((paiement) => (
                  <tr key={paiement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(paiement.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-900">{paiement.reference || "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        {paiement.client?.nom || paiement.vente?.client?.nom || "Client comptoir"}
                      </div>
                      {paiement.typePaiement === "ACOMPTE" ? (
                        <span className="text-xs text-green-600 font-medium">Acompte</span>
                      ) : (
                        <span className="text-xs text-gray-400">{paiement.vente?.numero}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {getModeIcon(paiement.modePaiement)}
                        {getModeLabel(paiement.modePaiement)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-green-600">
                        +{paiement.montant.toLocaleString()} FCFA
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Modal Paiement */}
      {showPaiementModal && venteRecherchee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Enregistrer un paiement</h2>
              <button 
                onClick={() => setShowPaiementModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Facture: <span className="font-medium">{venteRecherchee.numero}</span></p>
                <p className="text-sm text-gray-600">Client: <span className="font-medium">{venteRecherchee.client?.nom || "Client comptoir"}</span></p>
                <p className="text-sm font-bold text-red-600 mt-1">Reste a payer: {getResteAPayer().toLocaleString()} FCFA</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant</label>
                <input
                  type="number"
                  value={montantPaiement}
                  onChange={(e) => setMontantPaiement(e.target.value)}
                  max={getResteAPayer()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mode de paiement</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "ESPECES", label: "Especes", icon: Banknote },
                    { value: "WAVE", label: "Wave", icon: Smartphone },
                    { value: "ORANGE_MONEY", label: "OM", icon: Smartphone },
                  ].map((mode) => {
                    const Icon = mode.icon
                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setModePaiement(mode.value)}
                        className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${
                          modePaiement === mode.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{mode.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={handleAddPaiement}
                disabled={submitting || !montantPaiement}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Enregistrer le paiement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
