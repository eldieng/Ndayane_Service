"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Download, Calendar, Loader2, FileText } from "lucide-react"
import Link from "next/link"

interface Vente {
  id: string
  numero: string
  createdAt: string
  total: number
  remise: number
  client?: { nom: string }
  lignes: { quantite: number; produit: { nom: string }; prixUnitaire: number; total: number }[]
}

export default function RapportVentesPage() {
  const [loading, setLoading] = useState(true)
  const [ventes, setVentes] = useState<Vente[]>([])
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")

  useEffect(() => {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    setDateDebut(weekAgo.toISOString().split("T")[0])
    setDateFin(today.toISOString().split("T")[0])
  }, [])

  useEffect(() => {
    if (dateDebut && dateFin) {
      fetchVentes()
    }
  }, [dateDebut, dateFin])

  const fetchVentes = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `http://localhost:3001/rapports/ventes?dateDebut=${dateDebut}&dateFin=${dateFin}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (response.ok) {
        setVentes(await response.json())
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

  const totalCA = ventes.reduce((sum, v) => sum + (v.total - (v.remise || 0)), 0)
  const totalRemises = ventes.reduce((sum, v) => sum + (v.remise || 0), 0)

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Rapport des Ventes - ${dateDebut} au ${dateFin}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .header img { height: 70px; margin-bottom: 10px; }
            .header-info { font-size: 12px; color: #666; }
            .badge { background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border: 1px solid #f59e0b; border-radius: 12px; padding: 16px; margin: 16px 0; }
            .badge-title { font-size: 11px; color: #b45309; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
            .badge-value { font-size: 18px; font-weight: bold; color: #111; margin-top: 4px; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
            .stat-box { background: #f9fafb; border-radius: 12px; padding: 16px; text-align: center; }
            .stat-label { font-size: 11px; color: #666; text-transform: uppercase; }
            .stat-value { font-size: 24px; font-weight: bold; color: #111; margin-top: 4px; }
            .stat-value.green { color: #059669; }
            .stat-value.orange { color: #d97706; }
            .table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 20px; }
            .table th { background: #111827; color: white; padding: 10px 8px; text-align: left; font-weight: 500; }
            .table td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
            .table tr:nth-child(even) { background: #f9fafb; }
            .table .total-row { background: #fef3c7; font-weight: bold; }
            .grand-total { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; }
            .grand-total-label { font-size: 12px; opacity: 0.9; }
            .grand-total-value { font-size: 32px; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; padding: 16px; background: #f3f4f6; border-radius: 12px; font-size: 12px; color: #666; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/logo.png" alt="Logo" />
            <div class="header-info">
              <p style="margin: 4px 0;"><strong>Gérant : Mor FALL</strong></p>
              <p style="margin: 4px 0;">📞 77 781 89 08 | 📞 77 766 85 36</p>
              <p style="margin: 4px 0;">📍 Rue Blaise Diagne X Armand Angrand</p>
            </div>
          </div>

          <div class="badge">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div class="badge-title">Rapport des Ventes</div>
                <div class="badge-value">Du ${new Date(dateDebut).toLocaleDateString("fr-FR")} au ${new Date(dateFin).toLocaleDateString("fr-FR")}</div>
              </div>
              <div style="text-align: right;">
                <div class="badge-title">Généré le</div>
                <div style="font-size: 13px; color: #374151;">${new Date().toLocaleDateString("fr-FR")}</div>
              </div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-label">Nombre de ventes</div>
              <div class="stat-value">${ventes.length}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Chiffre d'affaires</div>
              <div class="stat-value green">${totalCA.toLocaleString()} F</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Total remises</div>
              <div class="stat-value orange">${totalRemises.toLocaleString()} F</div>
            </div>
          </div>

          <div class="grand-total">
            <div class="grand-total-label">Chiffre d'affaires total</div>
            <div class="grand-total-value">${totalCA.toLocaleString()} FCFA</div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Date</th>
                <th>Client</th>
                <th>Articles</th>
                <th style="text-align: right">Remise</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${ventes.map((v) => `
                <tr>
                  <td>${v.numero || v.id.slice(0, 8)}</td>
                  <td>${formatDate(v.createdAt)}</td>
                  <td>${v.client?.nom || "Comptoir"}</td>
                  <td>${v.lignes?.length || 0} art.</td>
                  <td style="text-align: right; color: #d97706;">${v.remise > 0 ? "-" + v.remise.toLocaleString() : "-"}</td>
                  <td style="text-align: right; font-weight: 500;">${(v.total - (v.remise || 0)).toLocaleString()} F</td>
                </tr>
              `).join("")}
              <tr class="total-row">
                <td colspan="4"><strong>TOTAL</strong></td>
                <td style="text-align: right; color: #d97706;"><strong>-${totalRemises.toLocaleString()} F</strong></td>
                <td style="text-align: right;"><strong>${totalCA.toLocaleString()} FCFA</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            Quincaillerie Ndayane Services - Système de Gestion
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
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href="/rapports"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rapport des Ventes</h1>
            <p className="text-gray-500">Détail des ventes par période</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium"
        >
          <Download className="w-5 h-5" />
          Imprimer
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 print:hidden">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">Du</span>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Au</span>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Quincaillerie Ndayane Services</h1>
          <h2 className="text-xl mt-2">Rapport des Ventes</h2>
          <p className="text-gray-500 mt-1">
            Du {dateDebut} au {dateFin}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Nombre de ventes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{ventes.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Chiffre d&apos;affaires</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{totalCA.toLocaleString()} FCFA</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Total remises</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{totalRemises.toLocaleString()} FCFA</p>
        </div>
      </div>

      {/* Ventes Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : ventes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Aucune vente pour cette période</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Articles</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Remise</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ventes.map((vente) => (
                <tr key={vente.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{vente.numero || vente.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(vente.createdAt)}</td>
                  <td className="px-4 py-3">{vente.client?.nom || "Client comptoir"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{vente.lignes?.length || 0} article(s)</td>
                  <td className="px-4 py-3 text-right text-orange-600">
                    {vente.remise > 0 ? `-${vente.remise.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">
                    {(vente.total - (vente.remise || 0)).toLocaleString()} F
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2">
              <tr>
                <td colSpan={4} className="px-4 py-3 font-semibold text-gray-900">TOTAL</td>
                <td className="px-4 py-3 text-right font-semibold text-orange-600">
                  -{totalRemises.toLocaleString()} F
                </td>
                <td className="px-4 py-3 text-right font-bold text-green-600 text-lg">
                  {totalCA.toLocaleString()} FCFA
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
