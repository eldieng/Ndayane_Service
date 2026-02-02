"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Plus, Minus, Trash2, ShoppingCart, User, CreditCard, Banknote, Loader2, Check, X, Calculator, Printer, Download, UserPlus } from "lucide-react"
import { useToast } from "@/components/ui/Toast"
import Link from "next/link"
import { ENTREPRISE, getContactPrint } from "@/config/entreprise"

interface Produit {
  id: string
  nom: string
  prixVente: number
  unite: string
  stocks: { quantite: number }[]
  categorieId?: string
}

interface Categorie {
  id: string
  nom: string
}

interface Client {
  id: string
  nom: string
  telephone: string
  solde: number
}

interface LigneVente {
  produitId: string
  nom: string
  prixUnitaire: number
  quantite: number
  unite: string
  total: number
}

interface VenteCreee {
  id: string
  numero: string
  total: number
  modePaiement: string
  createdAt: string
  lignes: LigneVente[]
  client?: { nom: string; telephone: string }
}

export default function CaissePage() {
  const [lignes, setLignes] = useState<LigneVente[]>([])
  const [search, setSearch] = useState("")
  const [clientId, setClientId] = useState("")
  const [remise, setRemise] = useState(0)
  const [produits, setProduits] = useState<Produit[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [selectedCategorie, setSelectedCategorie] = useState<string>("")
  const [filteredProduits, setFilteredProduits] = useState<Produit[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showMobileModal, setShowMobileModal] = useState(false)
  const [modePaiementMobile, setModePaiementMobile] = useState<string>("")
  const [showFacture, setShowFacture] = useState(false)
  const [venteCreee, setVenteCreee] = useState<VenteCreee | null>(null)
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const [newClientData, setNewClientData] = useState({ nom: "", telephone: "" })
  const [savingClient, setSavingClient] = useState(false)
  const [showAcompteModal, setShowAcompteModal] = useState(false)
  const [montantAcompte, setMontantAcompte] = useState("")
  const [modeAcompte, setModeAcompte] = useState("ESPECES")
  const [showPaiementModal, setShowPaiementModal] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  const sousTotal = lignes.reduce((sum, l) => sum + l.total, 0)
  const total = sousTotal - remise

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (search.length >= 1) {
      const filtered = produits.filter(p => 
        p.nom.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredProduits(filtered)
      setShowResults(true)
    } else {
      setFilteredProduits([])
      setShowResults(false)
    }
  }, [search, produits])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }
      
      const [produitsRes, clientsRes, categoriesRes] = await Promise.all([
        fetch("${API_URL}/produits?limit=500", { headers }),
        fetch("${API_URL}/clients", { headers }),
        fetch("${API_URL}/categories", { headers }),
      ])
      
      if (produitsRes.ok) {
        const result = await produitsRes.json()
        setProduits(result.data || result || [])
      }
      if (clientsRes.ok) {
        const result = await clientsRes.json()
        setClients(result.data || result || [])
      }
      if (categoriesRes.ok) {
        const result = await categoriesRes.json()
        setCategories(result.data || result || [])
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setDataLoaded(true)
    }
  }

  const getStock = (produit: Produit) => {
    return produit.stocks?.reduce((sum, s) => sum + s.quantite, 0) || 0
  }

  const addProduit = (produit: Produit) => {
    const existingIndex = lignes.findIndex(l => l.produitId === produit.id)
    
    if (existingIndex >= 0) {
      const newLignes = [...lignes]
      newLignes[existingIndex].quantite += 1
      newLignes[existingIndex].total = newLignes[existingIndex].quantite * newLignes[existingIndex].prixUnitaire
      setLignes(newLignes)
    } else {
      setLignes([...lignes, {
        produitId: produit.id,
        nom: produit.nom,
        prixUnitaire: produit.prixVente,
        quantite: 1,
        unite: produit.unite,
        total: produit.prixVente,
      }])
    }
    
    setSearch("")
    setShowResults(false)
    searchRef.current?.focus()
  }

  const updateQuantite = (index: number, delta: number) => {
    const newLignes = [...lignes]
    const newQte = Math.max(1, newLignes[index].quantite + delta)
    newLignes[index].quantite = newQte
    newLignes[index].total = newQte * newLignes[index].prixUnitaire
    setLignes(newLignes)
  }

  const removeLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index))
  }

  const handlePayer = async (modePaiement: string) => {
    if (lignes.length === 0) {
      alert("Ajoutez des produits à la vente")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("${API_URL}/ventes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId: clientId || undefined,
          remise,
          modePaiement,
          lignes: lignes.map(l => ({
            produitId: l.produitId,
            quantite: l.quantite,
            prixUnitaire: l.prixUnitaire,
          })),
        }),
      })

      if (!response.ok) throw new Error("Erreur")

      const vente = await response.json()
      
      // Préparer les données de la facture
      const clientSelected = clients.find(c => c.id === clientId)
      setVenteCreee({
        id: vente.id,
        numero: vente.numero,
        total: total,
        modePaiement,
        createdAt: new Date().toISOString(),
        lignes: lignes,
        client: clientSelected ? { nom: clientSelected.nom, telephone: clientSelected.telephone } : undefined,
      })
      
      setShowMobileModal(false)
      setModePaiementMobile("")
      setShowFacture(true)
    } catch (error) {
      alert("Erreur lors de l'enregistrement de la vente")
    } finally {
      setLoading(false)
    }
  }

  const closeFacture = () => {
    setShowFacture(false)
    setVenteCreee(null)
    setLignes([])
    setClientId("")
    setRemise(0)
  }

  const handleAcompte = () => {
    if (lignes.length === 0) {
      showToast("Ajoutez des produits", "error")
      return
    }
    if (!clientId) {
      showToast("Selectionnez un client pour un acompte", "error")
      return
    }
    setMontantAcompte("")
    setShowAcompteModal(true)
  }

  const confirmAcompte = async () => {
    const montant = parseFloat(montantAcompte)
    if (!montant || montant <= 0 || montant >= total) {
      showToast("Montant invalide (doit etre inferieur au total)", "error")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      // 1. Créer la vente SANS mode de paiement (statut EN_ATTENTE)
      const venteResponse = await fetch("${API_URL}/ventes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId,
          remise,
          // Pas de modePaiement = vente en attente
          lignes: lignes.map(l => ({
            produitId: l.produitId,
            quantite: l.quantite,
            prixUnitaire: l.prixUnitaire,
          })),
        }),
      })

      if (!venteResponse.ok) throw new Error("Erreur creation vente")
      const vente = await venteResponse.json()

      // 2. Créer le paiement partiel (acompte)
      const paiementResponse = await fetch("${API_URL}/paiements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          venteId: vente.id,
          clientId,
          montant,
          modePaiement: modeAcompte,
          typePaiement: "REGLEMENT",
          reference: `ACOMPTE-${vente.numero}`,
          notes: `Acompte sur facture ${vente.numero}`,
        }),
      })

      if (!paiementResponse.ok) throw new Error("Erreur paiement")

      const clientSelected = clients.find(c => c.id === clientId)
      setVenteCreee({
        id: vente.id,
        numero: vente.numero,
        total: total,
        modePaiement: `ACOMPTE ${montant.toLocaleString()} F`,
        createdAt: new Date().toISOString(),
        lignes: lignes,
        client: clientSelected ? { nom: clientSelected.nom, telephone: clientSelected.telephone } : undefined,
      })

      setShowAcompteModal(false)
      showToast(`Acompte de ${montant.toLocaleString()} F enregistre. Reste: ${(total - montant).toLocaleString()} F`, "success")
      setShowFacture(true)
    } catch (error) {
      showToast("Erreur lors de l'enregistrement", "error")
    } finally {
      setLoading(false)
    }
  }

  const printFacture = () => {
    const content = document.getElementById('facture-content')
    if (!content) return

    const printWindow = window.open('', '_blank', 'width=600,height=800')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture ${venteCreee?.numero || ''}</title>
        <style>
          @page { size: 148mm 210mm; margin: 8mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
          body { width: 132mm; padding: 0; background: white; font-size: 11px; color: #000; }
          img { height: 50px; }
          .flex { display: flex; }
          .flex-1 { flex: 1; }
          .flex-shrink-0 { flex-shrink: 0; }
          .items-start { align-items: flex-start; }
          .justify-end { justify-content: flex-end; }
          .justify-between { justify-content: space-between; }
          .gap-4 { gap: 12px; }
          .gap-2 { gap: 6px; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .text-lg { font-size: 14px; }
          .text-xl { font-size: 16px; }
          .text-sm { font-size: 10px; }
          .text-xs { font-size: 9px; }
          .font-bold { font-weight: bold; }
          .font-medium { font-weight: 500; }
          .text-gray-600 { color: #666; }
          .mb-4 { margin-bottom: 10px; }
          .pb-4 { padding-bottom: 10px; }
          .pb-1 { padding-bottom: 3px; }
          .pt-3 { padding-top: 8px; }
          .p-2 { padding: 6px; }
          .p-3 { padding: 8px; }
          .border { border: 1px solid #000; }
          .border-2 { border: 2px solid #000; }
          .border-black { border-color: #000; }
          .border-b-2 { border-bottom: 2px solid #000; }
          .border-t { border-top: 1px solid #000; }
          .border-t-0 { border-top: none; }
          .inline-block { display: inline-block; }
          .grid { display: grid; }
          .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
          .w-64 { width: 180px; }
          .w-20 { width: 50px; }
          .w-24 { width: 60px; }
          .bg-gray-100 { background: #f0f0f0; }
          .bg-gray-200 { background: #e0e0e0; }
          .capitalize { text-transform: capitalize; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 5px 6px; }
          th { background: #e0e0e0; font-weight: bold; font-size: 10px; }
          .print\\:hidden, [class*="print:hidden"] { display: none !important; }
          h1 { margin: 0; }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const getModeLabel = (mode: string) => {
    const modes: Record<string, string> = {
      ESPECES: "Espèces",
      WAVE: "Wave",
      ORANGE_MONEY: "Orange Money",
      CHEQUE: "Chèque",
      CARTE_BANCAIRE: "Carte Bancaire",
    }
    return modes[mode] || mode
  }

  const handleMobilePayment = () => {
    if (lignes.length === 0) {
      alert("Ajoutez des produits à la vente")
      return
    }
    setShowMobileModal(true)
  }

  const confirmMobilePayment = () => {
    if (!modePaiementMobile) {
      showToast("Sélectionnez un mode de paiement", "warning")
      return
    }
    handlePayer(modePaiementMobile)
  }

  const handleCreateClient = async () => {
    if (!newClientData.nom.trim()) {
      showToast("Le nom du client est obligatoire", "warning")
      return
    }
    setSavingClient(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("${API_URL}/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: newClientData.nom,
          telephone: newClientData.telephone,
          typeClient: "PARTICULIER",
        }),
      })
      if (response.ok) {
        const newClient = await response.json()
        setClients([newClient, ...clients])
        setClientId(newClient.id)
        setShowNewClientModal(false)
        setNewClientData({ nom: "", telephone: "" })
        showToast("Client créé avec succès", "success")
      } else {
        showToast("Erreur lors de la création du client", "error")
      }
    } catch (error) {
      showToast("Erreur lors de la création du client", "error")
    } finally {
      setSavingClient(false)
    }
  }

  return (
    <div className="lg:h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Left - Products - order-1 sur mobile pour être en premier */}
      <div className="order-1 flex-1 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden h-[50vh] lg:h-auto">
        {/* Search */}
        <div className="p-4 border-b relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => search.length >= 1 && setShowResults(true)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
          </div>
          
          {/* Search Results Dropdown */}
          {showResults && filteredProduits.length > 0 && (
            <div className="absolute left-4 right-4 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
              {filteredProduits.map((produit) => (
                <button
                  key={produit.id}
                  onClick={() => addProduit(produit)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-orange-50 border-b last:border-b-0 text-left"
                >
                  <div>
                    <p className="font-medium text-gray-900">{produit.nom}</p>
                    <p className="text-sm text-gray-500">Stock: {getStock(produit)} {produit.unite}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600">{produit.prixVente.toLocaleString()} F</p>
                    <p className="text-xs text-gray-400">/{produit.unite}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {showResults && search.length >= 1 && filteredProduits.length === 0 && (
            <div className="absolute left-4 right-4 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 p-4 text-center text-gray-500">
              Aucun produit trouvé pour &quot;{search}&quot;
            </div>
          )}
        </div>

        {/* Categories Filter */}
        <div className="px-4 py-2 border-b bg-gray-50 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCategorie("")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategorie === "" 
                ? "bg-amber-500 text-white" 
                : "bg-white border border-gray-300 text-gray-700 hover:bg-amber-50"
            }`}
          >
            Tous ({produits.length})
          </button>
          {categories.map((cat) => {
            const count = produits.filter(p => p.categorieId === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategorie(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategorie === cat.id 
                    ? "bg-amber-500 text-white" 
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-amber-50"
                }`}
              >
                {cat.nom} ({count})
              </button>
            )
          })}
        </div>

        {/* Products Grid - Show all products */}
        <div className="flex-1 p-2 sm:p-4 overflow-y-auto min-h-[200px]">
          {produits.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucun produit</p>
              <p className="text-sm">Ajoutez des produits dans le catalogue</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
              {produits
                .filter(p => !selectedCategorie || p.categorieId === selectedCategorie)
                .map((produit) => (
                <button
                  key={produit.id}
                  onClick={() => addProduit(produit)}
                  className="p-2 sm:p-3 bg-gray-50 hover:bg-orange-50 border rounded-lg text-left transition-colors"
                >
                  <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{produit.nom}</p>
                  <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Stock: {getStock(produit)}</p>
                  <p className="font-bold text-amber-600 text-xs sm:text-sm mt-0.5 sm:mt-1">{produit.prixVente.toLocaleString()} F</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right - Cart - order-2 sur mobile pour être après les produits */}
      <div className="order-2 w-full lg:w-96 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden flex-shrink-0 lg:max-h-none">
        {/* Header */}
        <div className="p-4 border-b bg-amber-500 text-white">
          <h2 className="font-semibold text-lg">Panier</h2>
          <p className="text-amber-100 text-sm">{lignes.length} article(s)</p>
        </div>

        {/* Client */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Client comptoir</option>
              {clients.map(client => {
                const credit = client.solde < 0 ? Math.abs(client.solde) : 0
                return (
                  <option key={client.id} value={client.id}>
                    {client.nom} {client.telephone ? `(${client.telephone})` : ""} {credit > 0 ? `[Crédit: ${credit.toLocaleString()}F]` : ""}
                  </option>
                )
              })}
            </select>
            <button
              onClick={() => setShowNewClientModal(true)}
              className="flex-shrink-0 p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
              title="Nouveau client"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>
          {/* Afficher le crédit disponible du client sélectionné */}
          {clientId && (() => {
            const selectedClient = clients.find(c => c.id === clientId)
            const credit = selectedClient && selectedClient.solde < 0 ? Math.abs(selectedClient.solde) : 0
            return credit > 0 ? (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  <span className="font-medium">Crédit disponible:</span> {credit.toLocaleString()} FCFA
                </p>
              </div>
            ) : null
          })()}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[120px]">
          {lignes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Panier vide</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lignes.map((ligne, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900 text-sm">{ligne.nom}</span>
                    <button
                      onClick={() => removeLigne(index)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantite(index, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{ligne.quantite}</span>
                      <button
                        onClick={() => updateQuantite(index, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {ligne.total.toLocaleString()} F
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="p-4 border-t bg-gray-50">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sous-total</span>
              <span className="font-medium">{sousTotal.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Remise</span>
              <input
                type="number"
                min="0"
                value={remise}
                onChange={(e) => setRemise(Number(e.target.value))}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-sm"
              />
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-amber-600">{total.toLocaleString()} FCFA</span>
            </div>
          </div>

          {/* Payment buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowPaiementModal(true)}
              disabled={loading || lignes.length === 0}
              className="flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Banknote className="w-5 h-5" />
              Paiement
            </button>
            <button
              onClick={handleAcompte}
              disabled={loading || lignes.length === 0}
              className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Calculator className="w-5 h-5" />
              Acompte
            </button>
          </div>

          {/* Fermeture de caisse */}
          <Link
            href="/caisse/fermeture"
            className="mt-2 flex items-center justify-center gap-2 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors text-sm"
          >
            <Calculator className="w-4 h-4" />
            Fermeture de Caisse
          </Link>
        </div>
      </div>

      {/* Modal Paiement - Espèces ou Autres */}
      {showPaiementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Mode de Paiement</h2>
              <button 
                onClick={() => setShowPaiementModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-500 mb-4">Montant à payer : <span className="font-bold text-amber-600">{total.toLocaleString()} FCFA</span></p>
              
              <button
                onClick={() => { setShowPaiementModal(false); handlePayer("ESPECES"); }}
                disabled={loading}
                className="w-full flex items-center gap-3 p-4 border-2 border-green-500 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-green-700 text-lg">Espèces</span>
                  <p className="text-sm text-green-600">Paiement en liquide</p>
                </div>
              </button>

              <button
                onClick={() => { setShowPaiementModal(false); handleMobilePayment(); }}
                disabled={loading}
                className="w-full flex items-center gap-3 p-4 border-2 border-orange-500 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-orange-700 text-lg">Autres</span>
                  <p className="text-sm text-orange-600">Wave, Orange Money, Chèque, Carte</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Paiement Mobile */}
      {showMobileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Mode de Paiement</h2>
              <button 
                onClick={() => { setShowMobileModal(false); setModePaiementMobile(""); }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-500 mb-4">Sélectionnez le mode de paiement :</p>
              
              <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${modePaiementMobile === "WAVE" ? "border-amber-500 bg-amber-50" : "hover:bg-gray-50"}`}>
                <input
                  type="radio"
                  name="modePaiement"
                  value="WAVE"
                  checked={modePaiementMobile === "WAVE"}
                  onChange={(e) => setModePaiementMobile(e.target.value)}
                  className="w-4 h-4 text-amber-600"
                />
                <span className="flex-1 font-medium">Wave</span>
                <span className="text-2xl">🌊</span>
              </label>

              <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${modePaiementMobile === "ORANGE_MONEY" ? "border-orange-500 bg-orange-50" : "hover:bg-gray-50"}`}>
                <input
                  type="radio"
                  name="modePaiement"
                  value="ORANGE_MONEY"
                  checked={modePaiementMobile === "ORANGE_MONEY"}
                  onChange={(e) => setModePaiementMobile(e.target.value)}
                  className="w-4 h-4 text-orange-600"
                />
                <span className="flex-1 font-medium">Orange Money</span>
                <span className="text-2xl">🟠</span>
              </label>

              <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${modePaiementMobile === "CHEQUE" ? "border-gray-500 bg-gray-50" : "hover:bg-gray-50"}`}>
                <input
                  type="radio"
                  name="modePaiement"
                  value="CHEQUE"
                  checked={modePaiementMobile === "CHEQUE"}
                  onChange={(e) => setModePaiementMobile(e.target.value)}
                  className="w-4 h-4 text-gray-600"
                />
                <span className="flex-1 font-medium">Chèque</span>
                <span className="text-2xl">📝</span>
              </label>

              <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${modePaiementMobile === "CARTE_BANCAIRE" ? "border-purple-500 bg-purple-50" : "hover:bg-gray-50"}`}>
                <input
                  type="radio"
                  name="modePaiement"
                  value="CARTE_BANCAIRE"
                  checked={modePaiementMobile === "CARTE_BANCAIRE"}
                  onChange={(e) => setModePaiementMobile(e.target.value)}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="flex-1 font-medium">Carte Bancaire</span>
                <span className="text-2xl">💳</span>
              </label>

              <div className="pt-4 border-t mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500">Total à payer</span>
                  <span className="text-xl font-bold text-amber-600">{total.toLocaleString()} FCFA</span>
                </div>
                <button
                  onClick={confirmMobilePayment}
                  disabled={!modePaiementMobile || loading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  Confirmer le Paiement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Facture Modal - Format A5 */}
      {showFacture && venteCreee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:bg-white print:p-0">
          <div className="facture-a5 bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl print:max-w-none print:max-h-none print:overflow-visible print:shadow-none print:rounded-none">
            {/* Header avec boutons */}
            <div className="flex items-center justify-between p-4 border-b print:hidden">
              <h2 className="text-lg font-semibold text-gray-900">Facture</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={printFacture}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg text-sm font-medium shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </button>
                <button
                  onClick={closeFacture}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenu de la facture - Design Noir/Blanc */}
            <div className="p-6" id="facture-content">
              {/* En-tête entreprise */}
              <div className="flex items-start gap-4 mb-4 pb-4 border-b-2 border-black">
                <div className="flex-shrink-0">
                  <img src={ENTREPRISE.logo} alt={ENTREPRISE.nom} className="h-16" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-lg font-bold">{getContactPrint().ligne1}</p>
                  <p className="text-sm font-medium">{getContactPrint().ligne2}</p>
                  <p className="text-sm">{getContactPrint().ligne3}</p>
                </div>
              </div>

              {/* Titre FACTURE */}
              <div className="mb-4">
                <h1 className="text-xl font-bold border-b-2 border-black pb-1 inline-block">FACTURE</h1>
              </div>

              {/* Infos facture */}
              <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
                <div className="border border-black p-2">
                  <p className="text-xs text-gray-600">Num facture :</p>
                  <p className="font-bold">{venteCreee.numero}</p>
                </div>
                <div className="border border-black p-2">
                  <p className="text-xs text-gray-600">Date :</p>
                  <p className="font-medium">{new Date(venteCreee.createdAt).toLocaleDateString("fr-FR")}</p>
                </div>
                <div className="border border-black p-2">
                  <p className="text-xs text-gray-600">Client :</p>
                  <p className="font-medium">{venteCreee.client?.nom || "Comptoir"}</p>
                </div>
                <div className="border border-black p-2">
                  <p className="text-xs text-gray-600">Téléphone :</p>
                  <p className="font-medium">{venteCreee.client?.telephone || "-"}</p>
                </div>
              </div>

              {/* Tableau des produits */}
              <table className="w-full text-sm border-collapse mb-4">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-black py-2 px-2 text-left font-bold">DESIGNATION</th>
                    <th className="border border-black py-2 px-2 text-center font-bold w-20">QTE</th>
                    <th className="border border-black py-2 px-2 text-right font-bold w-24">PRIX UNIT</th>
                    <th className="border border-black py-2 px-2 text-right font-bold w-24">MONTANT</th>
                  </tr>
                </thead>
                <tbody>
                  {venteCreee.lignes.map((ligne, index) => (
                    <tr key={index}>
                      <td className="border border-black py-2 px-2">{ligne.nom}</td>
                      <td className="border border-black py-2 px-2 text-center">{ligne.quantite}</td>
                      <td className="border border-black py-2 px-2 text-right">{ligne.prixUnitaire.toLocaleString()}</td>
                      <td className="border border-black py-2 px-2 text-right font-medium">{ligne.total.toLocaleString()}</td>
                    </tr>
                  ))}
                  {/* Lignes vides pour compléter */}
                  {venteCreee.lignes.length < 5 && Array.from({ length: 5 - venteCreee.lignes.length }).map((_, i) => (
                    <tr key={`empty-${i}`}>
                      <td className="border border-black py-2 px-2">&nbsp;</td>
                      <td className="border border-black py-2 px-2">&nbsp;</td>
                      <td className="border border-black py-2 px-2">&nbsp;</td>
                      <td className="border border-black py-2 px-2">&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totaux */}
              <div className="flex justify-end mb-4">
                <div className="w-64">
                  {remise > 0 && (
                    <>
                      <div className="flex justify-between border border-black p-2">
                        <span>Sous-total :</span>
                        <span className="font-medium">{(venteCreee.total + remise).toLocaleString()} F</span>
                      </div>
                      <div className="flex justify-between border border-black border-t-0 p-2">
                        <span>Remise :</span>
                        <span className="font-medium">-{remise.toLocaleString()} F</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between border-2 border-black p-2 bg-gray-100">
                    <span className="font-bold">TOTAL :</span>
                    <span className="font-bold">{venteCreee.total.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>

              {/* Mode de paiement */}
              <div className="flex justify-between items-center mb-4 text-sm">
                <div className="border border-black p-2">
                  <span className="text-gray-600">Mode de paiement : </span>
                  <span className="font-bold">{getModeLabel(venteCreee.modePaiement)}</span>
                </div>
              </div>

              {/* Montant en lettres */}
              <div className="border-2 border-black p-3 mb-4">
                <p className="text-xs text-gray-600">Arrêté la présente facture à la somme de :</p>
                <p className="font-bold capitalize">{numberToWords(venteCreee.total)}</p>
              </div>

              {/* Pied de page */}
              <div className="text-center text-sm border-t border-black pt-3">
                <p className="font-medium">{ENTREPRISE.mentions.facture}</p>
                <p className="text-xs text-gray-600">{getContactPrint().adresse}</p>
              </div>
            </div>

            {/* Bouton fermer en bas */}
            <div className="p-4 border-t print:hidden flex gap-3">
              <button
                onClick={printFacture}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Imprimer
              </button>
              <button
                onClick={closeFacture}
                className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium"
              >
                Nouvelle vente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouveau Client */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Nouveau Client</h2>
              <button
                onClick={() => setShowNewClientModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du client *
                </label>
                <input
                  type="text"
                  value={newClientData.nom}
                  onChange={(e) => setNewClientData({ ...newClientData, nom: e.target.value })}
                  placeholder="Ex: Mamadou Diallo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={newClientData.telephone}
                  onChange={(e) => setNewClientData({ ...newClientData, telephone: e.target.value })}
                  placeholder="Ex: 77 123 45 67"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t">
              <button
                onClick={() => setShowNewClientModal(false)}
                className="flex-1 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateClient}
                disabled={savingClient}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingClient ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Créer le client
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Acompte */}
      {showAcompteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Enregistrer un Acompte</h2>
              <button 
                onClick={() => setShowAcompteModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-sm text-gray-600">Total de la facture: <span className="font-bold text-amber-600">{total.toLocaleString()} FCFA</span></p>
                <p className="text-xs text-gray-500 mt-1">Le client paie une partie maintenant, le reste plus tard</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant de l&apos;acompte *</label>
                <input
                  type="number"
                  value={montantAcompte}
                  onChange={(e) => setMontantAcompte(e.target.value)}
                  placeholder="Ex: 50000"
                  max={total - 1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {montantAcompte && parseFloat(montantAcompte) > 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    Reste a payer: {(total - parseFloat(montantAcompte)).toLocaleString()} FCFA
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mode de paiement</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "ESPECES", label: "Especes" },
                    { value: "WAVE", label: "Wave" },
                    { value: "ORANGE_MONEY", label: "OM" },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setModeAcompte(mode.value)}
                      className={`p-2 rounded-lg border text-sm ${
                        modeAcompte === mode.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={confirmAcompte}
                disabled={loading || !montantAcompte || parseFloat(montantAcompte) <= 0 || parseFloat(montantAcompte) >= total}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Enregistrer l&apos;acompte
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

// Fonction pour convertir un nombre en lettres (simplifié)
function numberToWords(num: number): string {
  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"]
  const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"]
  
  if (num === 0) return "zéro franc"
  if (num >= 1000000) {
    const millions = Math.floor(num / 1000000)
    const reste = num % 1000000
    return (millions === 1 ? "un million" : numberToWords(millions).replace(" francs", "") + " millions") + (reste > 0 ? " " + numberToWords(reste).replace(" francs", "") : "") + " francs"
  }
  if (num >= 1000) {
    const milliers = Math.floor(num / 1000)
    const reste = num % 1000
    return (milliers === 1 ? "mille" : numberToWords(milliers).replace(" francs", "") + " mille") + (reste > 0 ? " " + numberToWords(reste).replace(" francs", "") : "") + " francs"
  }
  if (num >= 100) {
    const centaines = Math.floor(num / 100)
    const reste = num % 100
    return (centaines === 1 ? "cent" : units[centaines] + " cent") + (reste > 0 ? " " + numberToWords(reste).replace(" francs", "") : "") + " francs"
  }
  if (num >= 20) {
    const dizaine = Math.floor(num / 10)
    const unite = num % 10
    if (dizaine === 7 || dizaine === 9) {
      return tens[dizaine] + "-" + units[10 + unite] + " francs"
    }
    return tens[dizaine] + (unite > 0 ? "-" + units[unite] : "") + " francs"
  }
  return units[num] + " francs"
}
