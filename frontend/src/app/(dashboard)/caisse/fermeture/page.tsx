"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Calculator, 
  Download, 
  Printer, 
  ArrowLeft, 
  Banknote, 
  Smartphone, 
  CreditCard,
  CheckCircle,
  Loader2,
  Calendar,
  TrendingUp,
  ShoppingCart,
  Users
} from "lucide-react"
import Link from "next/link"
import { API_URL } from "@/lib/api"

interface VenteJour {
  id: string
  numero: string
  total: number
  createdAt: string
  modePaiement?: string
  client?: { nom: string }
}

interface StatsCaisse {
  totalVentes: number
  nombreVentes: number
  totalEspeces: number
  totalMobile: number
  totalWave: number
  totalOrangeMoney: number
  totalCheque: number
  totalCarteBancaire: number
  nombreClients: number
}

export default function FermetureCaissePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [ventes, setVentes] = useState<VenteJour[]>([])
  const [stats, setStats] = useState<StatsCaisse>({
    totalVentes: 0,
    nombreVentes: 0,
    totalEspeces: 0,
    totalMobile: 0,
    totalWave: 0,
    totalOrangeMoney: 0,
    totalCheque: 0,
    totalCarteBancaire: 0,
    nombreClients: 0,
  })
  const [fondCaisse, setFondCaisse] = useState(0)
  const [montantComptabilise, setMontantComptabilise] = useState(0)
  const [observations, setObservations] = useState("")
  const [fermetureDone, setFermetureDone] = useState(false)

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  useEffect(() => {
    fetchVentesJour()
  }, [])

  const fetchVentesJour = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      // Récupérer les ventes du jour
      const response = await fetch("${API_URL}/ventes?limit=1000", { headers })
      if (response.ok) {
        const result = await response.json()
        const allVentes = result.data || result || []
        
        // Filtrer les ventes du jour
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        
        const ventesJour = allVentes.filter((v: VenteJour) => {
          const venteDate = new Date(v.createdAt)
          return venteDate >= todayStart
        })

        setVentes(ventesJour)

        // Calculer les statistiques
        const statsCalc: StatsCaisse = {
          totalVentes: 0,
          nombreVentes: ventesJour.length,
          totalEspeces: 0,
          totalMobile: 0,
          totalWave: 0,
          totalOrangeMoney: 0,
          totalCheque: 0,
          totalCarteBancaire: 0,
          nombreClients: new Set(ventesJour.filter((v: VenteJour) => v.client).map((v: VenteJour) => v.client?.nom)).size,
        }

        ventesJour.forEach((v: VenteJour) => {
          statsCalc.totalVentes += v.total || 0
          const mode = v.modePaiement || "ESPECES"
          if (mode === "ESPECES") statsCalc.totalEspeces += v.total || 0
          else if (mode === "WAVE") statsCalc.totalWave += v.total || 0
          else if (mode === "ORANGE_MONEY") statsCalc.totalOrangeMoney += v.total || 0
          else if (mode === "CHEQUE") statsCalc.totalCheque += v.total || 0
          else if (mode === "CARTE_BANCAIRE") statsCalc.totalCarteBancaire += v.total || 0
          else statsCalc.totalMobile += v.total || 0
        })

        statsCalc.totalMobile = statsCalc.totalWave + statsCalc.totalOrangeMoney

        setStats(statsCalc)
        setMontantComptabilise(statsCalc.totalEspeces)
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const ecart = montantComptabilise - (stats.totalEspeces + fondCaisse)

  const handleFermeture = () => {
    setFermetureDone(true)
  }

  const generatePDF = () => {
    const printContent = document.getElementById("rapport-caisse")
    if (printContent) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Rapport de Caisse - ${today}</title>
            <style>
              @page { size: 148mm 210mm; margin: 5mm; }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; padding: 0; width: 138mm; color: #000; font-size: 9px; }
              .header { display: flex; align-items: flex-start; gap: 10px; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px; }
              .header img { height: 40px; }
              .header-right { flex: 1; text-align: right; }
              .header-right p { margin: 2px 0; font-size: 9px; }
              h1 { font-size: 12px; border-bottom: 2px solid #000; padding-bottom: 3px; margin-bottom: 8px; display: inline-block; }
              h2 { font-size: 10px; margin: 10px 0 5px; border-bottom: 1px solid #000; padding-bottom: 2px; }
              .info-box { border: 1px solid #000; padding: 5px; margin-bottom: 8px; }
              .info-row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 9px; }
              .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin: 8px 0; }
              .stat-box { border: 1px solid #000; padding: 5px; text-align: center; }
              .stat-label { font-size: 7px; color: #666; }
              .stat-value { font-size: 12px; font-weight: bold; }
              .table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9px; }
              .table th, .table td { border: 1px solid #000; padding: 4px; text-align: left; }
              .table th { background: #e0e0e0; font-weight: bold; font-size: 8px; }
              .table td:last-child { text-align: right; }
              .total-row { font-weight: bold; background: #f0f0f0; }
              .total-row td { border: 2px solid #000; }
              .ecart-positif { font-weight: bold; }
              .ecart-negatif { font-weight: bold; }
              .observations { border: 1px solid #000; padding: 8px; margin: 8px 0; font-size: 9px; }
              .signature { margin-top: 15px; display: flex; justify-content: space-between; }
              .signature-box { width: 45%; text-align: center; }
              .signature-line { border-top: 1px solid #000; margin-top: 30px; padding-top: 3px; font-size: 8px; }
              .footer { margin-top: 10px; text-align: center; font-size: 8px; border-top: 1px solid #000; padding-top: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="/logo.png" alt="Logo" />
              <div class="header-right">
                <p style="font-size: 11px; font-weight: bold;">Gérant : Mor FALL</p>
                <p>Tel : 77 781 89 08 – 77 766 85 36</p>
                <p>Email : morfall491@gmail.com</p>
              </div>
            </div>

            <h1>RAPPORT DE FERMETURE DE CAISSE</h1>
            
            <div class="info-box">
              <div class="info-row">
                <span>Date :</span>
                <span><strong>${today}</strong></span>
              </div>
              <div class="info-row">
                <span>Heure de fermeture :</span>
                <span><strong>${new Date().toLocaleTimeString("fr-FR")}</strong></span>
              </div>
            </div>

            <h2>RESUME DES VENTES</h2>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-label">Ventes</div>
                <div class="stat-value">${stats.nombreVentes}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Total</div>
                <div class="stat-value">${stats.totalVentes.toLocaleString()}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Clients</div>
                <div class="stat-value">${stats.nombreClients}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Moy.</div>
                <div class="stat-value">${stats.nombreVentes > 0 ? Math.round(stats.totalVentes / stats.nombreVentes).toLocaleString() : 0}</div>
              </div>
            </div>

            <h2>REPARTITION PAR MODE DE PAIEMENT</h2>
            <table class="table">
              <thead>
                <tr>
                  <th>Mode</th>
                  <th style="text-align: right;">Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Espèces</td>
                  <td>${stats.totalEspeces.toLocaleString()} F</td>
                </tr>
                <tr>
                  <td>Wave</td>
                  <td>${stats.totalWave.toLocaleString()} F</td>
                </tr>
                <tr>
                  <td>Orange Money</td>
                  <td>${stats.totalOrangeMoney.toLocaleString()} F</td>
                </tr>
                <tr>
                  <td>Chèque</td>
                  <td>${stats.totalCheque.toLocaleString()} F</td>
                </tr>
                <tr>
                  <td>Carte Bancaire</td>
                  <td>${stats.totalCarteBancaire.toLocaleString()} F</td>
                </tr>
                <tr class="total-row">
                  <td>TOTAL</td>
                  <td>${stats.totalVentes.toLocaleString()} FCFA</td>
                </tr>
              </tbody>
            </table>

            <h2>CONTROLE DE CAISSE (ESPECES)</h2>
            <table class="table">
              <tbody>
                <tr>
                  <td>Fond de caisse</td>
                  <td>${fondCaisse.toLocaleString()} F</td>
                </tr>
                <tr>
                  <td>Ventes en espèces</td>
                  <td>${stats.totalEspeces.toLocaleString()} F</td>
                </tr>
                <tr>
                  <td>Montant théorique</td>
                  <td>${(stats.totalEspeces + fondCaisse).toLocaleString()} F</td>
                </tr>
                <tr>
                  <td>Montant comptabilisé</td>
                  <td>${montantComptabilise.toLocaleString()} F</td>
                </tr>
                <tr class="total-row">
                  <td>Écart</td>
                  <td class="${ecart >= 0 ? 'ecart-positif' : 'ecart-negatif'}">${ecart >= 0 ? '+' : ''}${ecart.toLocaleString()} F</td>
                </tr>
              </tbody>
            </table>

            ${observations ? `
            <h2>OBSERVATIONS</h2>
            <div class="observations">${observations}</div>
            ` : ''}

            <div class="signature">
              <div class="signature-box">
                <div class="signature-line">Caissier(ère)</div>
              </div>
              <div class="signature-box">
                <div class="signature-line">Responsable</div>
              </div>
            </div>

            <div class="footer">
              Quincaillerie Ndayane Service - Rue Blaise Diagne X Armand Angrand
            </div>
          </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/caisse" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fermeture de Caisse</h1>
            <p className="text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {today}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium"
          >
            <Download className="w-5 h-5" />
            Télécharger PDF
          </button>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium"
          >
            <Printer className="w-5 h-5" />
            Imprimer
          </button>
        </div>
      </div>

      <div id="rapport-caisse" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Résumé */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ventes</p>
                  <p className="text-xl font-bold">{stats.nombreVentes}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold">{stats.totalVentes.toLocaleString()} F</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Clients</p>
                  <p className="text-xl font-bold">{stats.nombreClients}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ticket moyen</p>
                  <p className="text-xl font-bold">
                    {stats.nombreVentes > 0 ? Math.round(stats.totalVentes / stats.nombreVentes).toLocaleString() : 0} F
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Répartition par mode de paiement */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Mode de Paiement</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Banknote className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Espèces</span>
                </div>
                <span className="font-bold text-green-600">{stats.totalEspeces.toLocaleString()} FCFA</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-amber-600" />
                  <span className="font-medium">Wave</span>
                </div>
                <span className="font-bold text-amber-600">{stats.totalWave.toLocaleString()} FCFA</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">Orange Money</span>
                </div>
                <span className="font-bold text-orange-600">{stats.totalOrangeMoney.toLocaleString()} FCFA</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Chèque</span>
                </div>
                <span className="font-bold text-gray-600">{stats.totalCheque.toLocaleString()} FCFA</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Carte Bancaire</span>
                </div>
                <span className="font-bold text-purple-600">{stats.totalCarteBancaire.toLocaleString()} FCFA</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-500 text-white rounded-lg mt-4">
                <span className="font-semibold">TOTAL JOURNÉE</span>
                <span className="text-xl font-bold">{stats.totalVentes.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          {/* Liste des ventes */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Ventes du jour ({ventes.length})</h2>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {ventes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Aucune vente pour cette journée</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ventes.map((vente, index) => (
                      <tr key={vente.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{index + 1}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {new Date(vente.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-4 py-2 text-sm">{vente.client?.nom || "Comptoir"}</td>
                        <td className="px-4 py-2 text-sm font-medium text-right">{(vente.total || 0).toLocaleString()} F</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Contrôle de caisse */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contrôle de Caisse</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fond de caisse (FCFA)</label>
                <input
                  type="number"
                  value={fondCaisse}
                  onChange={(e) => setFondCaisse(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Ventes espèces</span>
                  <span className="font-medium">{stats.totalEspeces.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">+ Fond de caisse</span>
                  <span className="font-medium">{fondCaisse.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Montant théorique</span>
                  <span>{(stats.totalEspeces + fondCaisse).toLocaleString()} F</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant comptabilisé (FCFA)</label>
                <input
                  type="number"
                  value={montantComptabilise}
                  onChange={(e) => setMontantComptabilise(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className={`p-4 rounded-lg ${ecart === 0 ? 'bg-green-50' : ecart > 0 ? 'bg-amber-50' : 'bg-red-50'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Écart</span>
                  <span className={`text-xl font-bold ${ecart === 0 ? 'text-green-600' : ecart > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    {ecart >= 0 ? '+' : ''}{ecart.toLocaleString()} F
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {ecart === 0 ? "Caisse équilibrée" : ecart > 0 ? "Excédent de caisse" : "Manquant de caisse"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Notes ou remarques..."
                />
              </div>

              {!fermetureDone ? (
                <button
                  onClick={handleFermeture}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Valider la Fermeture
                </button>
              ) : (
                <div className="p-4 bg-green-100 text-green-700 rounded-lg text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">Caisse fermée avec succès</p>
                  <p className="text-sm">Pensez à télécharger le rapport</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
