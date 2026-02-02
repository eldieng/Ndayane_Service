"use client"

import { API_URL } from "@/lib/api"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Printer, Loader2, Check, Plus, Banknote, Smartphone, CreditCard, X, FileText, ClipboardList } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/Toast"
import { ENTREPRISE, getContactPrint } from "@/config/entreprise"

interface LigneVente {
  id: string
  produit: { nom: string; unite: string }
  quantite: number
  prixUnitaire: number
  total: number
}

interface Paiement {
  id: string
  montant: number
  modePaiement: string
  createdAt: string
  reference?: string
}

interface Vente {
  id: string
  numero: string
  createdAt: string
  sousTotal: number
  total: number
  remise: number
  statut: string
  modePaiement?: string
  client?: { id: string; nom: string; telephone: string; adresse: string }
  utilisateur?: { nom: string }
  lignes: LigneVente[]
  paiements?: Paiement[]
}

export default function VenteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const [vente, setVente] = useState<Vente | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaiementModal, setShowPaiementModal] = useState(false)
  const [montantPaiement, setMontantPaiement] = useState("")
  const [modePaiement, setModePaiement] = useState("ESPECES")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchVente(params.id as string)
    }
  }, [params.id])

  const fetchVente = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/ventes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setVente(await response.json())
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
      month: "long",
      year: "numeric",
    })
  }

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "ESPECES": return "Espèces"
      case "WAVE": return "Wave"
      case "ORANGE_MONEY": return "Orange Money"
      case "CARTE_BANCAIRE": return "Carte bancaire"
      case "CHEQUE": return "Chèque"
      default: return mode || "Espèces"
    }
  }

  const handlePrint = () => {
    const content = document.getElementById('facture-content')
    if (!content) {
      window.print()
      return
    }

    const printWindow = window.open('', '_blank', 'width=600,height=800')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture ${vente?.numero || ''}</title>
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
          .mb-3 { margin-bottom: 8px; }
          .mt-4 { margin-top: 10px; }
          .pb-4 { padding-bottom: 10px; }
          .pb-1 { padding-bottom: 3px; }
          .pt-3 { padding-top: 8px; }
          .p-2 { padding: 6px; }
          .p-3 { padding: 8px; }
          .p-4 { padding: 10px; }
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
          .bg-red-50 { display: none !important; }
          .border-red-200 { display: none !important; }
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

  const totalPaye = vente?.paiements?.reduce((sum, p) => sum + p.montant, 0) || 0
  const resteAPayer = (vente?.total || 0) - totalPaye

  const handleAddPaiement = async () => {
    if (!vente || !montantPaiement) return
    
    const montant = parseFloat(montantPaiement)
    if (montant <= 0 || montant > resteAPayer) {
      showToast("Montant invalide", "error")
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/paiements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          venteId: vente.id,
          clientId: vente.client?.id,
          montant,
          modePaiement,
          typePaiement: "REGLEMENT",
          reference: `PAY-${vente.numero}`,
          notes: `Acompte sur facture ${vente.numero}`,
        }),
      })

      if (response.ok) {
        showToast("Paiement enregistre avec succes", "success")
        setShowPaiementModal(false)
        setMontantPaiement("")
        fetchVente(vente.id)
      } else {
        showToast("Erreur lors du paiement", "error")
      }
    } catch (error) {
      showToast("Erreur lors du paiement", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrintDevis = () => {
    if (!vente) return
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    if (!printWindow) return

    const dateDevis = new Date().toLocaleDateString("fr-FR")
    const dateValidite = new Date()
    dateValidite.setDate(dateValidite.getDate() + 15)
    const numeroDevis = `DEV-${vente.numero}`

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Devis ${numeroDevis}</title>
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
          .validity { background: #f0f0f0; padding: 8px; border: 1px solid #000; margin: 10px 0; text-align: center; }
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
        <h1>DEVIS N° ${numeroDevis}</h1>
        <div class="info-grid">
          <div class="info-box">
            <div class="info-title">INFORMATIONS DEVIS</div>
            <p>Date : <strong>${dateDevis}</strong></p>
            <p>Validité : <strong>15 jours</strong></p>
            <p>Expire le : <strong>${dateValidite.toLocaleDateString("fr-FR")}</strong></p>
          </div>
          <div class="info-box">
            <div class="info-title">CLIENT / PROSPECT</div>
            <p>Nom : <strong>${vente.client?.nom || "Non spécifié"}</strong></p>
            <p>Téléphone : <strong>${vente.client?.telephone || "-"}</strong></p>
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
            ${vente.lignes?.map(l => `
              <tr>
                <td>${l.produit?.nom || "Produit"}</td>
                <td class="text-center">${l.quantite}</td>
                <td class="text-right">${(l.prixUnitaire || 0).toLocaleString()} F</td>
                <td class="text-right">${(l.total || 0).toLocaleString()} F</td>
              </tr>
            `).join("") || ""}
            <tr class="total-row">
              <td colspan="3" class="text-right">TOTAL TTC</td>
              <td class="text-right">${(vente.total || 0).toLocaleString()} FCFA</td>
            </tr>
          </tbody>
        </table>
        <div class="validity">
          Ce devis est valable <strong>15 jours</strong> à compter de sa date d'émission.
        </div>
        <div class="footer">
          <p>${getContactPrint().adresse}</p>
          <p style="margin-top: 5px;">${ENTREPRISE.mentions.devis}</p>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print() }, 250)
  }

  const handlePrintBonCommande = () => {
    if (!vente) return
    const printWindow = window.open('', '_blank', 'width=600,height=800')
    if (!printWindow) return

    const dateCommande = new Date().toLocaleDateString("fr-FR")
    const numeroCommande = `BC-${vente.numero}`

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bon de Commande ${numeroCommande}</title>
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
        <h1>BON DE COMMANDE N° ${numeroCommande}</h1>
        <div class="info-grid">
          <div class="info-box">
            <div class="info-title">INFORMATIONS COMMANDE</div>
            <p>Date : <strong>${dateCommande}</strong></p>
            <p>Réf. Facture : <strong>${vente.numero}</strong></p>
          </div>
          <div class="info-box">
            <div class="info-title">CLIENT</div>
            <p>Nom : <strong>${vente.client?.nom || "Non spécifié"}</strong></p>
            <p>Téléphone : <strong>${vente.client?.telephone || "-"}</strong></p>
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
            ${vente.lignes?.map(l => `
              <tr>
                <td>${l.produit?.nom || "Produit"}</td>
                <td class="text-center">${l.quantite}</td>
                <td class="text-right">${(l.prixUnitaire || 0).toLocaleString()} F</td>
                <td class="text-right">${(l.total || 0).toLocaleString()} F</td>
              </tr>
            `).join("") || ""}
            <tr class="total-row">
              <td colspan="3" class="text-right">TOTAL TTC</td>
              <td class="text-right">${(vente.total || 0).toLocaleString()} FCFA</td>
            </tr>
          </tbody>
        </table>
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
    setTimeout(() => { printWindow.print() }, 250)
  }

  const handleSendWhatsApp = () => {
    if (!vente?.client?.telephone) {
      showToast("Le client n'a pas de numéro de téléphone", "warning")
      return
    }

    // Normaliser le numéro pour WhatsApp (format international sans +)
    let phone = vente.client.telephone.replace(/[\s\-\.\(\)]/g, "")
    if (phone.startsWith("0")) phone = "221" + phone.slice(1)
    else if (phone.startsWith("7") && phone.length === 9) phone = "221" + phone
    else if (phone.startsWith("+")) phone = phone.slice(1)

    // Générer le token pour le lien de téléchargement
    const token = btoa(vente.id).replace(/[+/=]/g, '').slice(0, 12)
    const pdfUrl = `${API_URL}/factures/${vente.id}/download/${token}`

    // Message court avec lien PDF
    const message = `🧾 *FACTURE N°${vente.numero}*
━━━━━━━━━━━━━━━━━
*QUINCAILLERIE NDAYANE SERVICES*
📞 77 781 89 08 | 77 766 85 36
━━━━━━━━━━━━━━━━━

👤 Client: ${vente.client?.nom || "Client comptoir"}
📅 Date: ${formatDate(vente.createdAt)}
💰 *TOTAL: ${(vente.total || 0).toLocaleString()} FCFA*

📥 *Télécharger votre facture PDF:*
${pdfUrl}

✅ Merci pour votre confiance !
🙏 À bientôt chez Ndayane Services`

    // Ouvrir WhatsApp avec le message
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  if (!vente) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vente non trouvée</p>
        <Link href="/ventes" className="text-amber-600 hover:underline mt-2 inline-block">
          Retour aux ventes
        </Link>
      </div>
    )
  }

  const netAPayer = vente.total || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href="/ventes"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Facture {vente.numero}</h1>
            <p className="text-gray-500">{formatDate(vente.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {vente.client?.telephone && (
            <button
              onClick={handleSendWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-medium shadow-md"
          >
            <Printer className="w-5 h-5" />
            Facture
          </button>
          <button
            onClick={handlePrintDevis}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm"
          >
            <FileText className="w-4 h-4" />
            Devis
          </button>
          <button
            onClick={handlePrintBonCommande}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm"
          >
            <ClipboardList className="w-4 h-4" />
            Bon Cmd
          </button>
        </div>
      </div>

      {/* Facture style caisse - Format A5 Noir/Blanc */}
      <div className="facture-a5 bg-white rounded-xl shadow-sm border max-w-2xl mx-auto print:shadow-none print:border-none print:max-w-none print:mx-0">
        <div className="p-6" id="facture-content">
          {/* En-tête entreprise */}
          <div className="flex items-start gap-4 mb-4 pb-4 border-b-2 border-black">
            <div className="flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
              <p className="font-bold">{vente.numero}</p>
            </div>
            <div className="border border-black p-2">
              <p className="text-xs text-gray-600">Date :</p>
              <p className="font-medium">{formatDate(vente.createdAt)}</p>
            </div>
            <div className="border border-black p-2">
              <p className="text-xs text-gray-600">Client :</p>
              <p className="font-medium">{vente.client?.nom || "Comptoir"}</p>
            </div>
            <div className="border border-black p-2">
              <p className="text-xs text-gray-600">Téléphone :</p>
              <p className="font-medium">{vente.client?.telephone || "-"}</p>
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
              {vente.lignes?.map((ligne, index) => (
                <tr key={ligne.id || index}>
                  <td className="border border-black py-2 px-2">{ligne.produit?.nom || "Produit"}</td>
                  <td className="border border-black py-2 px-2 text-center">{ligne.quantite}</td>
                  <td className="border border-black py-2 px-2 text-right">{ligne.prixUnitaire?.toLocaleString()}</td>
                  <td className="border border-black py-2 px-2 text-right font-medium">{(ligne.total || 0).toLocaleString()}</td>
                </tr>
              ))}
              {/* Lignes vides pour compléter */}
              {(vente.lignes?.length || 0) < 5 && Array.from({ length: 5 - (vente.lignes?.length || 0) }).map((_, i) => (
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
              {vente.remise > 0 && (
                <>
                  <div className="flex justify-between border border-black p-2">
                    <span>Sous-total :</span>
                    <span className="font-medium">{(vente.sousTotal || 0).toLocaleString()} F</span>
                  </div>
                  <div className="flex justify-between border border-black border-t-0 p-2">
                    <span>Remise :</span>
                    <span className="font-medium">-{vente.remise?.toLocaleString()} F</span>
                  </div>
                </>
              )}
              <div className="flex justify-between border-2 border-black p-2 bg-gray-100">
                <span className="font-bold">TOTAL :</span>
                <span className="font-bold">{netAPayer.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          {/* Mode de paiement */}
          <div className="flex justify-between items-center mb-4 text-sm">
            <div className="border border-black p-2">
              <span className="text-gray-600">Mode de paiement : </span>
              <span className="font-bold">{getModeLabel(vente.modePaiement || "ESPECES")}</span>
            </div>
          </div>

          {/* Section Paiements et Reste à payer - Masqué à l'impression */}
          {resteAPayer > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200 print:hidden">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-red-600 font-medium">Reste à payer</p>
                  <p className="text-2xl font-bold text-red-700">{resteAPayer.toLocaleString()} FCFA</p>
                </div>
                <button
                  onClick={() => {
                    setMontantPaiement(resteAPayer.toString())
                    setShowPaiementModal(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un paiement
                </button>
              </div>
              {totalPaye > 0 && (
                <div className="text-sm text-gray-600">
                  <span>Total payé: </span>
                  <span className="font-medium text-green-600">{totalPaye.toLocaleString()} FCFA</span>
                  <span className="text-gray-400"> sur {netAPayer.toLocaleString()} FCFA</span>
                </div>
              )}
            </div>
          )}

          {/* Historique des paiements - Masqué à l'impression */}
          {vente.paiements && vente.paiements.length > 0 && (
            <div className="mt-4 print:hidden">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Historique des paiements</h4>
              <div className="space-y-2">
                {vente.paiements.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">
                        {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="text-xs text-gray-400">{getModeLabel(p.modePaiement)}</span>
                    </div>
                    <span className="font-medium text-green-600">+{p.montant.toLocaleString()} FCFA</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Montant en lettres */}
          <div className="border-2 border-black p-3 mb-4">
            <p className="text-xs text-gray-600">Arrêté la présente facture à la somme de :</p>
            <p className="font-bold capitalize">{numberToWords(netAPayer)}</p>
          </div>

          {/* Pied de page */}
          <div className="text-center text-sm border-t border-black pt-3">
            <p className="font-medium">{ENTREPRISE.mentions.facture}</p>
            <p className="text-xs text-gray-600">{getContactPrint().adresse}</p>
          </div>
        </div>
      </div>

      {/* Modal Paiement */}
      {showPaiementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ajouter un paiement</h3>
              <button onClick={() => setShowPaiementModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-sm text-gray-600">Facture: <span className="font-medium">{vente.numero}</span></p>
                <p className="text-sm text-gray-600">Reste à payer: <span className="font-bold text-red-600">{resteAPayer.toLocaleString()} FCFA</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant</label>
                <input
                  type="number"
                  value={montantPaiement}
                  onChange={(e) => setMontantPaiement(e.target.value)}
                  max={resteAPayer}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mode de paiement</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "ESPECES", label: "Espèces", icon: Banknote },
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
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-200 hover:border-amber-300"
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

// Fonction pour convertir un nombre en lettres
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
