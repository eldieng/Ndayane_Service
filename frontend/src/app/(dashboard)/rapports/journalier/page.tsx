"use client"

import { useState, useEffect } from "react"
import { 
  Calendar, 
  Download, 
  Printer, 
  ArrowLeft, 
  Loader2,
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  Banknote,
  Smartphone,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

interface VenteJour {
  id: string
  numero: string
  total: number
  createdAt: string
  modePaiement?: string
  client?: { nom: string }
  lignes?: { quantite: number; produit?: { nom: string } }[]
}

interface StatsJour {
  totalVentes: number
  nombreVentes: number
  totalEspeces: number
  totalWave: number
  totalOrangeMoney: number
  totalCheque: number
  totalCarteBancaire: number
  nombreClients: number
  produitsVendus: number
}

export default function RapportJournalierPage() {
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [ventes, setVentes] = useState<VenteJour[]>([])
  const [stats, setStats] = useState<StatsJour>({
    totalVentes: 0,
    nombreVentes: 0,
    totalEspeces: 0,
    totalWave: 0,
    totalOrangeMoney: 0,
    totalCheque: 0,
    totalCarteBancaire: 0,
    nombreClients: 0,
    produitsVendus: 0,
  })

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  useEffect(() => {
    fetchVentesJour()
  }, [selectedDate])

  const fetchVentesJour = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      const response = await fetch("http://localhost:3001/ventes?limit=1000", { headers })
      if (response.ok) {
        const result = await response.json()
        const allVentes = result.data || result || []
        
        const dateStart = new Date(selectedDate)
        dateStart.setHours(0, 0, 0, 0)
        const dateEnd = new Date(selectedDate)
        dateEnd.setHours(23, 59, 59, 999)
        
        const ventesJour = allVentes.filter((v: VenteJour) => {
          const venteDate = new Date(v.createdAt)
          return venteDate >= dateStart && venteDate <= dateEnd
        })

        setVentes(ventesJour)

        const statsCalc: StatsJour = {
          totalVentes: 0,
          nombreVentes: ventesJour.length,
          totalEspeces: 0,
          totalWave: 0,
          totalOrangeMoney: 0,
          totalCheque: 0,
          totalCarteBancaire: 0,
          nombreClients: new Set(ventesJour.filter((v: VenteJour) => v.client).map((v: VenteJour) => v.client?.nom)).size,
          produitsVendus: 0,
        }

        ventesJour.forEach((v: VenteJour) => {
          statsCalc.totalVentes += v.total || 0
          const mode = v.modePaiement || "ESPECES"
          if (mode === "ESPECES") statsCalc.totalEspeces += v.total || 0
          else if (mode === "WAVE") statsCalc.totalWave += v.total || 0
          else if (mode === "ORANGE_MONEY") statsCalc.totalOrangeMoney += v.total || 0
          else if (mode === "CHEQUE") statsCalc.totalCheque += v.total || 0
          else if (mode === "CARTE_BANCAIRE") statsCalc.totalCarteBancaire += v.total || 0
          
          if (v.lignes) {
            statsCalc.produitsVendus += v.lignes.reduce((sum, l) => sum + l.quantite, 0)
          }
        })

        setStats(statsCalc)
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const changeDate = (days: number) => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + days)
    setSelectedDate(date.toISOString().split("T")[0])
  }

  const generatePDF = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Rapport Journalier - ${formatDateDisplay(selectedDate)}</title>
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
            .total-box { border: 2px solid #000; padding: 8px; margin: 8px 0; background: #f0f0f0; }
            .total-label { font-size: 9px; }
            .total-value { font-size: 16px; font-weight: bold; }
            .table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 8px; }
            .table th, .table td { border: 1px solid #000; padding: 3px; text-align: left; }
            .table th { background: #e0e0e0; font-weight: bold; font-size: 7px; }
            .table td:last-child { text-align: right; }
            .payment-table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9px; }
            .payment-table td { border: 1px solid #000; padding: 4px; }
            .payment-table td:last-child { text-align: right; font-weight: bold; }
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

          <h1>RAPPORT JOURNALIER</h1>
          
          <div class="info-box">
            <div class="info-row">
              <span>Date :</span>
              <span><strong>${formatDateDisplay(selectedDate)}</strong></span>
            </div>
            <div class="info-row">
              <span>Généré le :</span>
              <span><strong>${new Date().toLocaleDateString("fr-FR")} ${new Date().toLocaleTimeString("fr-FR")}</strong></span>
            </div>
          </div>

          <h2>RESUME DES VENTES</h2>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-label">Ventes</div>
              <div class="stat-value">${stats.nombreVentes}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Produits</div>
              <div class="stat-value">${stats.produitsVendus}</div>
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

          <div class="total-box">
            <div class="total-label">CHIFFRE D'AFFAIRES DU JOUR</div>
            <div class="total-value">${stats.totalVentes.toLocaleString()} FCFA</div>
          </div>

          <h2>ENCAISSEMENTS PAR MODE</h2>
          <table class="payment-table">
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
            <tr style="background: #f0f0f0;">
              <td style="border: 2px solid #000;"><strong>TOTAL</strong></td>
              <td style="border: 2px solid #000;"><strong>${stats.totalVentes.toLocaleString()} FCFA</strong></td>
            </tr>
          </table>

          <h2>DETAIL DES VENTES (${ventes.length})</h2>
          <table class="table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Heure</th>
                <th>Client</th>
                <th>Mode</th>
                <th style="text-align: right">Montant</th>
              </tr>
            </thead>
            <tbody>
              ${ventes.slice(0, 15).map((v, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${new Date(v.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</td>
                  <td>${(v.client?.nom || "Comptoir").substring(0, 12)}</td>
                  <td>${(v.modePaiement || "ESP").substring(0, 6)}</td>
                  <td style="text-align: right;">${(v.total || 0).toLocaleString()}</td>
                </tr>
              `).join("")}
              ${ventes.length > 15 ? `<tr><td colspan="5" style="text-align: center; font-style: italic;">... et ${ventes.length - 15} autres ventes</td></tr>` : ''}
            </tbody>
          </table>

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/rapports" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Rapport Journalier</h1>
            <p className="text-sm text-gray-500">Bilan des ventes par jour</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Telecharger</span> PDF
          </button>
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium text-sm"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600 hidden sm:block" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
            <span className="hidden sm:block text-gray-500">|</span>
            <span className="font-medium text-gray-900 text-sm sm:text-base text-center">{formatDateDisplay(selectedDate)}</span>
          </div>
          <button
            onClick={() => changeDate(1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={selectedDate >= new Date().toISOString().split("T")[0]}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
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
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Produits</p>
                  <p className="text-xl font-bold">{stats.produitsVendus}</p>
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
                  <TrendingUp className="w-5 h-5 text-orange-600" />
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

          {/* Total */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white">
            <div className="text-center">
              <p className="text-amber-100 mb-2">Chiffre d&apos;affaires du jour</p>
              <p className="text-4xl font-bold">{stats.totalVentes.toLocaleString()} FCFA</p>
            </div>
          </div>

          {/* Paiements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Encaissements par mode</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Especes</span>
                  </div>
                  <span className="font-bold text-green-600">{stats.totalEspeces.toLocaleString()} F</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-amber-600" />
                    <span className="font-medium">Wave</span>
                  </div>
                  <span className="font-bold text-amber-600">{stats.totalWave.toLocaleString()} F</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-orange-600" />
                    <span className="font-medium">Orange Money</span>
                  </div>
                  <span className="font-bold text-orange-600">{stats.totalOrangeMoney.toLocaleString()} F</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Cheque</span>
                  </div>
                  <span className="font-bold text-gray-600">{stats.totalCheque.toLocaleString()} F</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Carte Bancaire</span>
                  </div>
                  <span className="font-bold text-purple-600">{stats.totalCarteBancaire.toLocaleString()} F</span>
                </div>
              </div>
            </div>

            {/* Liste des ventes */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Ventes du jour ({ventes.length})</h2>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {ventes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucune vente pour cette date</p>
                  </div>
                ) : (
                  <>
                    {/* Vue Mobile */}
                    <div className="md:hidden divide-y">
                      {ventes.map((vente) => (
                        <div key={vente.id} className="p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">
                              {new Date(vente.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="font-medium text-sm">{(vente.total || 0).toLocaleString()} F</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{vente.client?.nom || "Comptoir"}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              vente.modePaiement === "WAVE" ? "bg-amber-100 text-amber-700" :
                              vente.modePaiement === "ORANGE_MONEY" ? "bg-orange-100 text-orange-700" :
                              "bg-green-100 text-green-700"
                            }`}>
                              {(vente.modePaiement || "ESP").substring(0, 4)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Vue Desktop */}
                    <table className="w-full hidden md:table">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {ventes.map((vente) => (
                          <tr key={vente.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">
                              {new Date(vente.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="px-4 py-2 text-sm">{vente.client?.nom || "Comptoir"}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                vente.modePaiement === "WAVE" ? "bg-amber-100 text-amber-700" :
                                vente.modePaiement === "ORANGE_MONEY" ? "bg-orange-100 text-orange-700" :
                                vente.modePaiement === "CHEQUE" ? "bg-gray-100 text-gray-700" :
                                vente.modePaiement === "CARTE_BANCAIRE" ? "bg-purple-100 text-purple-700" :
                                "bg-green-100 text-green-700"
                              }`}>
                                {vente.modePaiement || "ESPECES"}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-right">{(vente.total || 0).toLocaleString()} F</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
