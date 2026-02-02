"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, ClipboardList, Search, Eye, Printer, Trash2, Loader2, Plus, Calendar, Filter, Pencil } from "lucide-react"
import { ENTREPRISE, getContactPrint } from "@/config/entreprise"
import { API_URL } from "@/lib/api"

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
  clientNom?: string
  clientTel?: string
  total: number
  validite?: number
  dateLivraison?: string
  vendeur?: string
  statut: string
  createdAt: string
  lignes: LigneDocument[]
  client?: { nom: string; telephone?: string }
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 20, totalPages: 0 })

  useEffect(() => {
    fetchDocuments()
  }, [page, typeFilter])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })
      if (typeFilter) params.append("type", typeFilter)
      if (search) params.append("search", search)

      const response = await fetch(`${API_URL}/documents?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const result = await response.json()
        setDocuments(result.data || [])
        setMeta(result.meta || { total: 0, page: 1, limit: 20, totalPages: 0 })
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchDocuments()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce document ?")) return
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/documents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        fetchDocuments()
      }
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "ACCEPTE": return "bg-green-100 text-green-700"
      case "REFUSE": return "bg-red-100 text-red-700"
      case "CONVERTI": return "bg-blue-100 text-blue-700"
      case "EXPIRE": return "bg-gray-100 text-gray-700"
      default: return "bg-yellow-100 text-yellow-700"
    }
  }

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case "EN_ATTENTE": return "En attente"
      case "ACCEPTE": return "Accepté"
      case "REFUSE": return "Refusé"
      case "CONVERTI": return "Converti"
      case "EXPIRE": return "Expiré"
      default: return statut
    }
  }

  const printDocument = (doc: Document) => {
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    if (!printWindow) return

    const isDevis = doc.type === "DEVIS"
    const title = isDevis ? "DEVIS" : "BON DE COMMANDE"
    const dateDoc = formatDate(doc.createdAt)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} ${doc.numero}</title>
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
        <h1>${title} N° ${doc.numero}</h1>
        <div class="info-grid">
          <div class="info-box">
            <div class="info-title">INFORMATIONS</div>
            <p>Date : <strong>${dateDoc}</strong></p>
            ${isDevis && doc.validite ? `<p>Validité : <strong>${doc.validite} jours</strong></p>` : ""}
            ${!isDevis && doc.dateLivraison ? `<p>Livraison : <strong>${formatDate(doc.dateLivraison)}</strong></p>` : ""}
            ${doc.vendeur ? `<p>Vendeur : <strong>${doc.vendeur}</strong></p>` : ""}
          </div>
          <div class="info-box">
            <div class="info-title">CLIENT</div>
            <p>Nom : <strong>${doc.clientNom || doc.client?.nom || "Non spécifié"}</strong></p>
            <p>Téléphone : <strong>${doc.clientTel || doc.client?.telephone || "-"}</strong></p>
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
            ${doc.lignes.map(l => `
              <tr>
                <td>${l.designation}</td>
                <td class="text-center">${l.quantite}</td>
                <td class="text-right">${l.prixUnitaire.toLocaleString()} F</td>
                <td class="text-right">${l.total.toLocaleString()} F</td>
              </tr>
            `).join("")}
            <tr class="total-row">
              <td colspan="3" class="text-right">TOTAL TTC</td>
              <td class="text-right">${doc.total.toLocaleString()} ${ENTREPRISE.devise}</td>
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

  const filteredDocuments = documents.filter(d => {
    if (!search) return true
    return d.numero.toLowerCase().includes(search.toLowerCase()) ||
           d.clientNom?.toLowerCase().includes(search.toLowerCase()) ||
           d.client?.nom?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500">Historique des devis et bons de commande</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/documents/devis"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <FileText className="w-5 h-5" />
            Nouveau Devis
          </Link>
          <Link
            href="/documents/bon-commande"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <ClipboardList className="w-5 h-5" />
            Nouveau Bon
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par numéro ou client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Tous les types</option>
            <option value="DEVIS">Devis</option>
            <option value="BON_COMMANDE">Bons de commande</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun document</h3>
            <p className="text-gray-500 mb-4">Les devis et bons de commande apparaîtront ici</p>
            <div className="flex justify-center gap-2">
              <Link
                href="/documents/devis"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Créer un devis
              </Link>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {doc.type === "DEVIS" ? (
                        <FileText className="w-5 h-5 text-green-600" />
                      ) : (
                        <ClipboardList className="w-5 h-5 text-blue-600" />
                      )}
                      <span className="text-sm font-medium">
                        {doc.type === "DEVIS" ? "Devis" : "Bon Cmd"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-medium text-gray-900">{doc.numero}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(doc.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {doc.clientNom || doc.client?.nom || "Non spécifié"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">
                      {doc.total.toLocaleString()} F
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatutColor(doc.statut)}`}>
                      {getStatutLabel(doc.statut)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => printDocument(doc)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                        title="Imprimer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-500">
              {meta.total} document(s) au total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="px-3 py-1">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
