"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Download, Loader2, Users, Phone, DollarSign } from "lucide-react"
import Link from "next/link"

interface ClientRapport {
  id: string
  nom: string
  telephone: string
  totalAchats: number
  nombreVentes: number
  solde: number
}

export default function RapportClientsPage() {
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<ClientRapport[]>([])
  const [periode, setPeriode] = useState("mois")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchClients()
  }, [periode])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/rapports/clients?periode=${periode}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setClients(await response.json())
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.telephone?.includes(search)
  )

  const totalCA = clients.reduce((sum, c) => sum + c.totalAchats, 0)
  const totalCreances = clients.reduce((sum, c) => sum + (c.solde > 0 ? c.solde : 0), 0)

  const handlePrint = () => {
    window.print()
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
            <h1 className="text-2xl font-bold text-gray-900">Rapport Clients</h1>
            <p className="text-gray-500">Analyse de la clientèle</p>
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

      {/* Print Header */}
      <div className="hidden print:block mb-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Quincaillerie Ndayane Services</h1>
          <h2 className="text-xl mt-2">Rapport Clients</h2>
          <p className="text-gray-500 mt-1">
            Date: {new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 print:hidden">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="annee">Cette année</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-sm text-gray-500">Clients actifs</p>
              <p className="text-xl font-bold text-gray-900">{clients.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">CA Total</p>
              <p className="text-xl font-bold text-green-600">{totalCA.toLocaleString()} F</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-500">Créances clients</p>
              <p className="text-xl font-bold text-red-600">{totalCreances.toLocaleString()} F</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Aucun client trouvé</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nb Achats</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Achats</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Solde</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredClients.map((client, index) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{client.nom}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Phone className="w-4 h-4" />
                      {client.telephone || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{client.nombreVentes}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">
                    {client.totalAchats.toLocaleString()} F
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={client.solde > 0 ? "text-red-600 font-semibold" : "text-gray-500"}>
                      {client.solde > 0 ? `${client.solde.toLocaleString()} F` : "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2">
              <tr>
                <td colSpan={4} className="px-4 py-3 font-semibold text-gray-900">TOTAL</td>
                <td className="px-4 py-3 text-right font-bold text-green-600 text-lg">
                  {totalCA.toLocaleString()} F
                </td>
                <td className="px-4 py-3 text-right font-bold text-red-600">
                  {totalCreances.toLocaleString()} F
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
