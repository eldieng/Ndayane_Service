"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Printer, Save, Loader2, FileText, ClipboardList, Check } from "lucide-react"
import { ENTREPRISE, getContactPrint } from "@/config/entreprise"

interface LigneDocument {
  id: string
  designation: string
  quantite: number
  prixUnitaire: number
  total: number
}

interface Document {
  id: string
  numero: string
  type: "DEVIS" | "BON_COMMANDE"
  clientId?: string
  clientNom?: string
  clientTel?: string
  total: number
  validite?: number
  dateLivraison?: string
  vendeur?: string
  notes?: string
  statut: string
  createdAt: string
  lignes: LigneDocument[]
  client?: { id: string; nom: string; telephone?: string }
}

const statutOptions = [
  { value: "EN_ATTENTE", label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  { value: "ACCEPTE", label: "Accepté", color: "bg-green-100 text-green-700" },
  { value: "REFUSE", label: "Refusé", color: "bg-red-100 text-red-700" },
  { value: "CONVERTI", label: "Converti en vente", color: "bg-blue-100 text-blue-700" },
  { value: "EXPIRE", label: "Expiré", color: "bg-gray-100 text-gray-700" },
]

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statut, setStatut] = useState("")
  const [clientNom, setClientNom] = useState("")
  const [clientTel, setClientTel] = useState("")
  const [vendeur, setVendeur] = useState("")
  const [notes, setNotes] = useState("")
  const [validite, setValidite] = useState("")
  const [dateLivraison, setDateLivraison] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchDocument(params.id as string)
    }
  }, [params.id])

  const fetchDocument = async (id: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setDocument(data)
        setStatut(data.statut)
        setClientNom(data.clientNom || data.client?.nom || "")
        setClientTel(data.clientTel || data.client?.telephone || "")
        setVendeur(data.vendeur || "")
        setNotes(data.notes || "")
        setValidite(data.validite?.toString() || "")
        setDateLivraison(data.dateLivraison ? data.dateLivraison.split("T")[0] : "")
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatut = async (newStatut: string) => {
    if (!document) return
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/documents/${document.id}/statut`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statut: newStatut }),
      })
      if (response.ok) {
        setStatut(newStatut)
        setDocument({ ...document, statut: newStatut })
      }
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const handleSave = async () => {
    if (!document) return
    
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/documents/${document.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientNom,
          clientTel,
          vendeur,
          notes,
          validite: validite ? parseInt(validite) : null,
          dateLivraison: dateLivraison || null,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setDocument(data)
        alert("Document mis à jour avec succès")
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const printDocument = () => {
    if (!document) return
    
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    if (!printWindow) return

    const isDevis = document.type === "DEVIS"
    const title = isDevis ? "DEVIS" : "BON DE COMMANDE"
    const dateDoc = formatDate(document.createdAt)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} ${document.numero}</title>
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
        <h1>${title} N° ${document.numero}</h1>
        <div class="info-grid">
          <div class="info-box">
            <div class="info-title">INFORMATIONS</div>
            <p>Date : <strong>${dateDoc}</strong></p>
            ${isDevis && validite ? `<p>Validité : <strong>${validite} jours</strong></p>` : ""}
            ${!isDevis && dateLivraison ? `<p>Livraison : <strong>${formatDate(dateLivraison)}</strong></p>` : ""}
            ${vendeur ? `<p>Vendeur : <strong>${vendeur}</strong></p>` : ""}
          </div>
          <div class="info-box">
            <div class="info-title">CLIENT</div>
            <p>Nom : <strong>${clientNom || "Non spécifié"}</strong></p>
            <p>Téléphone : <strong>${clientTel || "-"}</strong></p>
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
            ${document.lignes.map(l => `
              <tr>
                <td>${l.designation}</td>
                <td class="text-center">${l.quantite}</td>
                <td class="text-right">${l.prixUnitaire.toLocaleString()} F</td>
                <td class="text-right">${l.total.toLocaleString()} F</td>
              </tr>
            `).join("")}
            <tr class="total-row">
              <td colspan="3" class="text-right">TOTAL TTC</td>
              <td class="text-right">${document.total.toLocaleString()} ${ENTREPRISE.devise}</td>
            </tr>
          </tbody>
        </table>
        ${!isDevis ? `
        <div class="signature">
          <div class="signature-box">
            <div class="signature-line">Signature Client</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">Signature Vendeur</div>
          </div>
        </div>
        ` : ""}
        <div class="footer">
          <p>${getContactPrint().adresse}</p>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print() }, 250)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Document non trouvé</p>
        <Link href="/documents" className="text-amber-600 hover:underline mt-2 inline-block">
          Retour aux documents
        </Link>
      </div>
    )
  }

  const isDevis = document.type === "DEVIS"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/documents" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            {isDevis ? (
              <FileText className="w-8 h-8 text-green-600" />
            ) : (
              <ClipboardList className="w-8 h-8 text-blue-600" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isDevis ? "Devis" : "Bon de Commande"} {document.numero}
              </h1>
              <p className="text-gray-500">{formatDate(document.createdAt)}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Enregistrer
          </button>
          <button
            onClick={printDocument}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium"
          >
            <Printer className="w-5 h-5" />
            Imprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Infos principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statut */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Statut du document</h2>
            <div className="flex flex-wrap gap-2">
              {statutOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleUpdateStatut(opt.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    statut === opt.value 
                      ? `${opt.color} ring-2 ring-offset-2 ring-gray-400` 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {statut === opt.value && <Check className="w-4 h-4 inline mr-1" />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Infos client */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Informations client</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={clientNom}
                  onChange={(e) => setClientNom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="text"
                  value={clientTel}
                  onChange={(e) => setClientTel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              {!isDevis && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendeur</label>
                  <input
                    type="text"
                    value={vendeur}
                    onChange={(e) => setVendeur(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
              {isDevis ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Validité (jours)</label>
                  <input
                    type="number"
                    value={validite}
                    onChange={(e) => setValidite(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de livraison</label>
                  <input
                    type="date"
                    value={dateLivraison}
                    onChange={(e) => setDateLivraison(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Lignes du document */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Produits</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Désignation</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 w-20">Qté</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 w-28">Prix Unit.</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {document.lignes.map((ligne) => (
                  <tr key={ligne.id} className="border-b">
                    <td className="py-3 px-4">{ligne.designation}</td>
                    <td className="py-3 px-4 text-center">{ligne.quantite}</td>
                    <td className="py-3 px-4 text-right">{ligne.prixUnitaire.toLocaleString()} F</td>
                    <td className="py-3 px-4 text-right font-medium">{ligne.total.toLocaleString()} F</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Résumé */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Résumé</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className="font-medium">{isDevis ? "Devis" : "Bon de Commande"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Numéro</span>
                <span className="font-mono font-medium">{document.numero}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{formatDate(document.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nb. articles</span>
                <span className="font-medium">{document.lignes.length}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total TTC</span>
                <span className="text-2xl font-bold text-amber-600">{document.total.toLocaleString()} F</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
