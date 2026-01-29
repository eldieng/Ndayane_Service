"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Minus, Trash2, Printer, Search, User, FileText, Package, Save, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { ENTREPRISE, getContactPrint } from "@/config/entreprise"

interface Produit {
  id: string
  nom: string
  prixVente: number
  reference?: string
}

interface Client {
  id: string
  nom: string
  telephone: string
  adresse?: string
}

interface LigneCommande {
  produitId: string
  nom: string
  quantite: number
  prixUnitaire: number
  total: number
}

export default function BonCommandePage() {
  const router = useRouter()
  const [produits, setProduits] = useState<Produit[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [lignes, setLignes] = useState<LigneCommande[]>([])
  const [search, setSearch] = useState("")
  const [filteredProduits, setFilteredProduits] = useState<Produit[]>([])
  const [showResults, setShowResults] = useState(false)
  const [clientId, setClientId] = useState("")
  const [clientNom, setClientNom] = useState("")
  const [clientTelephone, setClientTelephone] = useState("")
  const [clientAdresse, setClientAdresse] = useState("")
  const [dateLivraison, setDateLivraison] = useState("")
  const [notes, setNotes] = useState("")
  const [numeroCommande, setNumeroCommande] = useState("")
  const [vendeur, setVendeur] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
    generateNumero()
  }, [])

  const generateNumero = () => {
    const date = new Date()
    const num = `BC-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
    setNumeroCommande(num)
  }

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      const [produitsRes, clientsRes] = await Promise.all([
        fetch("http://localhost:3001/produits?limit=1000", { headers }),
        fetch("http://localhost:3001/clients?limit=1000", { headers }),
      ])

      if (produitsRes.ok) {
        const data = await produitsRes.json()
        setProduits(data.data || data || [])
      }
      if (clientsRes.ok) {
        const data = await clientsRes.json()
        setClients(data.data || data || [])
      }
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  useEffect(() => {
    if (search.length >= 1) {
      const filtered = produits.filter(p =>
        p.nom.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredProduits(filtered)
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }, [search, produits])

  const addProduit = (produit: Produit) => {
    const existing = lignes.find(l => l.produitId === produit.id)
    if (existing) {
      setLignes(lignes.map(l =>
        l.produitId === produit.id
          ? { ...l, quantite: l.quantite + 1, total: (l.quantite + 1) * l.prixUnitaire }
          : l
      ))
    } else {
      setLignes([...lignes, {
        produitId: produit.id,
        nom: produit.nom,
        quantite: 1,
        prixUnitaire: produit.prixVente,
        total: produit.prixVente,
      }])
    }
    setSearch("")
    setShowResults(false)
  }

  const updateQuantite = (index: number, delta: number) => {
    setLignes(lignes.map((l, i) => {
      if (i === index) {
        const newQte = Math.max(1, l.quantite + delta)
        return { ...l, quantite: newQte, total: newQte * l.prixUnitaire }
      }
      return l
    }))
  }

  const updatePrix = (index: number, newPrix: number) => {
    setLignes(lignes.map((l, i) => {
      if (i === index) {
        return { ...l, prixUnitaire: newPrix, total: l.quantite * newPrix }
      }
      return l
    }))
  }

  const removeLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index))
  }

  const handleClientChange = (id: string) => {
    setClientId(id)
    if (id) {
      const client = clients.find(c => c.id === id)
      if (client) {
        setClientNom(client.nom)
        setClientTelephone(client.telephone || "")
        setClientAdresse(client.adresse || "")
      }
    } else {
      setClientNom("")
      setClientTelephone("")
      setClientAdresse("")
    }
  }

  const total = lignes.reduce((sum, l) => sum + l.total, 0)

  const saveBonCommande = async () => {
    if (lignes.length === 0) return null
    
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "BON_COMMANDE",
          clientId: clientId || null,
          clientNom: clientNom || null,
          clientTel: clientTelephone || null,
          dateLivraison: dateLivraison || null,
          vendeur: vendeur || null,
          notes: notes || null,
          lignes: lignes.map(l => ({
            produitId: l.produitId || null,
            designation: l.nom,
            quantite: l.quantite,
            prixUnitaire: l.prixUnitaire,
          })),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setNumeroCommande(data.numero)
        return data
      }
      return null
    } catch (error) {
      console.error("Erreur:", error)
      return null
    } finally {
      setSaving(false)
    }
  }

  const printBonCommande = async () => {
    const savedDoc = await saveBonCommande()
    const docNumero = savedDoc?.numero || numeroCommande
    
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    if (!printWindow) return

    const dateCommande = new Date().toLocaleDateString("fr-FR")

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bon de Commande ${docNumero}</title>
        <style>
          @page { size: 148mm 210mm; margin: 5mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 0; width: 138mm; color: #000; font-size: 9px; }
          .header { display: flex; align-items: flex-start; gap: 10px; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px; }
          .header img { height: 40px; }
          .header-right { flex: 1; text-align: right; }
          .header-right p { margin: 2px 0; font-size: 9px; }
          h1 { font-size: 14px; border-bottom: 2px solid #000; padding-bottom: 3px; margin-bottom: 8px; display: inline-block; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
          .info-box { border: 1px solid #000; padding: 8px; }
          .info-box p { margin: 3px 0; }
          .info-title { font-weight: bold; font-size: 10px; margin-bottom: 5px; border-bottom: 1px solid #000; padding-bottom: 3px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #000; padding: 5px; text-align: left; font-size: 9px; }
          th { background: #e0e0e0; font-weight: bold; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .total-row { font-weight: bold; background: #f0f0f0; }
          .total-row td { border: 2px solid #000; }
          .notes { border: 1px solid #000; padding: 8px; margin: 10px 0; font-size: 8px; }
          .footer { margin-top: 15px; text-align: center; font-size: 8px; border-top: 1px solid #000; padding-top: 8px; }
          .signature { display: flex; justify-content: space-between; margin-top: 15px; }
          .signature-box { width: 45%; text-align: center; }
          .signature-line { border-top: 1px solid #000; margin-top: 30px; padding-top: 3px; font-size: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${ENTREPRISE.logo}" alt="Logo" />
          <div class="header-right">
            <p style="font-size: 11px; font-weight: bold;">${getContactPrint().ligne1}</p>
            <p>${getContactPrint().ligne2}</p>
            <p>${getContactPrint().ligne3}</p>
          </div>
        </div>

        <h1>BON DE COMMANDE N° ${docNumero}</h1>

        <div class="info-grid">
          <div class="info-box">
            <div class="info-title">INFORMATIONS COMMANDE</div>
            <p>Date : <strong>${dateCommande}</strong></p>
            ${dateLivraison ? `<p>Livraison prévue : <strong>${new Date(dateLivraison).toLocaleDateString("fr-FR")}</strong></p>` : ""}
            ${vendeur ? `<p>Vendeur : <strong>${vendeur}</strong></p>` : ""}
          </div>
          <div class="info-box">
            <div class="info-title">CLIENT</div>
            <p>Nom : <strong>${clientNom || "Non spécifié"}</strong></p>
            <p>Téléphone : <strong>${clientTelephone || "-"}</strong></p>
            ${clientAdresse ? `<p>Adresse : <strong>${clientAdresse}</strong></p>` : ""}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>DESIGNATION</th>
              <th class="text-center" style="width: 50px;">QTE</th>
              <th class="text-right" style="width: 70px;">PRIX UNIT.</th>
              <th class="text-right" style="width: 80px;">MONTANT</th>
            </tr>
          </thead>
          <tbody>
            ${lignes.map(l => `
              <tr>
                <td>${l.nom}</td>
                <td class="text-center">${l.quantite}</td>
                <td class="text-right">${l.prixUnitaire.toLocaleString()} F</td>
                <td class="text-right">${l.total.toLocaleString()} F</td>
              </tr>
            `).join("")}
            ${lignes.length < 5 ? Array.from({ length: 5 - lignes.length }).map(() => `
              <tr>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            `).join("") : ""}
            <tr class="total-row">
              <td colspan="3" class="text-right">TOTAL TTC</td>
              <td class="text-right">${total.toLocaleString()} ${ENTREPRISE.devise}</td>
            </tr>
          </tbody>
        </table>

        ${notes ? `
        <div class="notes">
          <strong>Notes / Instructions :</strong><br/>
          ${notes}
        </div>
        ` : ""}

        <div class="signature">
          <div class="signature-box">
            <div class="signature-line">Signature Client</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">Signature Vendeur</div>
          </div>
        </div>

        <div class="footer">
          <p>${getContactPrint().adresse}</p>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/ventes" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bon de Commande</h1>
            <p className="text-gray-500">Créer un bon de commande client</p>
          </div>
        </div>
        <button
          onClick={printBonCommande}
          disabled={lignes.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          <Printer className="w-5 h-5" />
          Imprimer le Bon
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire */}
        <div className="lg:col-span-2 space-y-6">
          {/* Infos client */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Informations Client
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client existant</label>
                <select
                  value={clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Sélectionner un client --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.nom} {c.telephone ? `(${c.telephone})` : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendeur</label>
                <input
                  type="text"
                  value={vendeur}
                  onChange={(e) => setVendeur(e.target.value)}
                  placeholder="Nom du vendeur"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom client</label>
                <input
                  type="text"
                  value={clientNom}
                  onChange={(e) => setClientNom(e.target.value)}
                  placeholder="Nom du client"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="text"
                  value={clientTelephone}
                  onChange={(e) => setClientTelephone(e.target.value)}
                  placeholder="Téléphone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={clientAdresse}
                  onChange={(e) => setClientAdresse(e.target.value)}
                  placeholder="Adresse de livraison"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de livraison prévue</label>
                <input
                  type="date"
                  value={dateLivraison}
                  onChange={(e) => setDateLivraison(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Recherche produits */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Produits commandés
            </h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showResults && filteredProduits.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredProduits.slice(0, 10).map(p => (
                    <button
                      key={p.id}
                      onClick={() => addProduit(p)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 flex justify-between items-center"
                    >
                      <span className="font-medium">{p.nom}</span>
                      <span className="text-blue-600 font-bold">{p.prixVente.toLocaleString()} F</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tableau des lignes */}
            {lignes.length > 0 && (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Produit</th>
                    <th className="text-center py-2 text-sm font-medium text-gray-600 w-24">Qté</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-600 w-28">Prix Unit.</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-600 w-28">Total</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((ligne, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{ligne.nom}</td>
                      <td className="py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => updateQuantite(index, -1)} className="p-1 hover:bg-gray-100 rounded">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{ligne.quantite}</span>
                          <button onClick={() => updateQuantite(index, 1)} className="p-1 hover:bg-gray-100 rounded">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          value={ligne.prixUnitaire}
                          onChange={(e) => updatePrix(index, Number(e.target.value))}
                          className="w-full text-right px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="py-3 text-right font-medium">{ligne.total.toLocaleString()} F</td>
                      <td className="py-3">
                        <button onClick={() => removeLigne(index)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {lignes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucun produit ajouté</p>
                <p className="text-sm">Recherchez et ajoutez des produits</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes / Instructions</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Instructions de livraison, remarques..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Résumé */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Résumé de la Commande</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">N° Commande</span>
                <span className="font-medium">{numeroCommande}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nombre articles</span>
                <span className="font-medium">{lignes.reduce((sum, l) => sum + l.quantite, 0)}</span>
              </div>
              {dateLivraison && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Livraison</span>
                  <span className="font-medium">{new Date(dateLivraison).toLocaleDateString("fr-FR")}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total TTC</span>
                <span className="text-2xl font-bold text-blue-600">{total.toLocaleString()} F</span>
              </div>
            </div>

            <button
              onClick={printBonCommande}
              disabled={lignes.length === 0}
              className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Printer className="w-5 h-5" />
              Imprimer le Bon
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
