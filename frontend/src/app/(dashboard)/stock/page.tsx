"use client"

import { useState, useEffect } from "react"
import { Search, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Package, AlertTriangle, Loader2, Warehouse, History } from "lucide-react"
import Link from "next/link"

interface Stock {
  id: string
  quantite: number
  produit: { id: string; nom: string; unite: string; stockMin: number; prixVente: number }
  depot: { id: string; nom: string }
}

interface Mouvement {
  id: string
  type: string
  quantite: number
  motif: string
  createdAt: string
  produit: { nom: string }
  depot: { nom: string }
}

interface Depot {
  id: string
  nom: string
  principal: boolean
}

export default function StockPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [mouvements, setMouvements] = useState<Mouvement[]>([])
  const [depots, setDepots] = useState<Depot[]>([])
  const [search, setSearch] = useState("")
  const [depotFilter, setDepotFilter] = useState("")
  const [activeTab, setActiveTab] = useState<"stock" | "mouvements">("stock")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token")
        const headers = { Authorization: `Bearer ${token}` }
        const [stocksRes, mouvementsRes, depotsRes] = await Promise.all([
          fetch("${API_URL}/stock", { headers }),
          fetch("${API_URL}/stock/mouvements", { headers }),
          fetch("${API_URL}/depots", { headers }),
        ])
        if (stocksRes.ok) setStocks(await stocksRes.json())
        if (mouvementsRes.ok) setMouvements(await mouvementsRes.json())
        if (depotsRes.ok) setDepots(await depotsRes.json())
      } catch (error) {
        console.error("Erreur:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredStocks = stocks.filter(s => {
    const matchSearch = s.produit.nom.toLowerCase().includes(search.toLowerCase())
    const matchDepot = !depotFilter || s.depot.id === depotFilter
    return matchSearch && matchDepot
  })

  const stocksBas = filteredStocks.filter(s => s.quantite < s.produit.stockMin)
  const valeurStock = filteredStocks.reduce((sum, s) => sum + (s.quantite * s.produit.prixVente), 0)

  const formatDate = (date: string) => new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion du Stock</h1>
          <p className="text-gray-500">Suivez et gérez votre inventaire</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/stock/entree" className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"><ArrowDownCircle className="w-5 h-5" />Entrée</Link>
          <Link href="/stock/sortie" className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"><ArrowUpCircle className="w-5 h-5" />Sortie</Link>
          <Link href="/stock/transfert" className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium"><ArrowLeftRight className="w-5 h-5" />Transfert</Link>
          <Link href="/stock/historique" className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"><History className="w-5 h-5" />Historique</Link>
          <Link href="/stock/alertes" className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"><AlertTriangle className="w-5 h-5" />Alertes</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center"><Package className="w-6 h-6 text-amber-600" /></div>
            <div><p className="text-sm text-gray-500">Produits en stock</p><p className="text-xl font-bold text-gray-900">{filteredStocks.length}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
            <div><p className="text-sm text-gray-500">Alertes stock bas</p><p className="text-xl font-bold text-red-600">{stocksBas.length}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><Warehouse className="w-6 h-6 text-green-600" /></div>
            <div><p className="text-sm text-gray-500">Valeur du stock</p><p className="text-xl font-bold text-gray-900">{valeurStock.toLocaleString()} F</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b flex">
          <button onClick={() => setActiveTab("stock")} className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === "stock" ? "border-blue-600 text-amber-600" : "border-transparent text-gray-500"}`}>Etat du Stock</button>
          <button onClick={() => setActiveTab("mouvements")} className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === "mouvements" ? "border-blue-600 text-amber-600" : "border-transparent text-gray-500"}`}>Mouvements ({mouvements.length})</button>
        </div>

        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500" />
          </div>
          <select value={depotFilter} onChange={(e) => setDepotFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">Tous les depots</option>
            {depots.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
          </select>
        </div>

        {activeTab === "stock" ? (
          filteredStocks.length === 0 ? (
            <div className="text-center py-12"><Package className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-gray-500">Aucun stock</p></div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Depot</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantite</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valeur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStocks.map((item) => {
                  const isLow = item.quantite < item.produit.stockMin
                  return (
                    <tr key={item.id} className={isLow ? "bg-red-50" : ""}>
                      <td className="px-6 py-4"><div className="font-medium">{item.produit.nom}</div><div className="text-sm text-gray-500">Min: {item.produit.stockMin}</div></td>
                      <td className="px-6 py-4 text-gray-600">{item.depot.nom}</td>
                      <td className="px-6 py-4"><span className={isLow ? "text-red-600 font-semibold" : ""}>{item.quantite} {item.produit.unite}</span></td>
                      <td className="px-6 py-4">{(item.quantite * item.produit.prixVente).toLocaleString()} F</td>
                      <td className="px-6 py-4">{isLow ? <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Stock bas</span> : <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">OK</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        ) : (
          mouvements.length === 0 ? (
            <div className="text-center py-12"><p className="text-gray-500">Aucun mouvement</p></div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantite</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mouvements.map((m) => (
                  <tr key={m.id}>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(m.createdAt)}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${m.type === "ENTREE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{m.type}</span></td>
                    <td className="px-6 py-4 font-medium">{m.produit?.nom}</td>
                    <td className="px-6 py-4"><span className={m.type === "ENTREE" ? "text-green-600" : "text-red-600"}>{m.type === "ENTREE" ? "+" : "-"}{m.quantite}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{m.motif || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  )
}
