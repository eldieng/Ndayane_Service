"use client"

import { useState, useEffect, Suspense } from "react"
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/Toast"

interface Produit { id: string; nom: string; unite: string }
interface Depot { id: string; nom: string }
interface LigneEntree { produitId: string; quantite: number }

function EntreeStockContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const produitParam = searchParams.get("produit")
  const { showToast } = useToast()
  const [produits, setProduits] = useState<Produit[]>([])
  const [depots, setDepots] = useState<Depot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [depotId, setDepotId] = useState("")
  const [motif, setMotif] = useState("APPROVISIONNEMENT")
  const [lignes, setLignes] = useState<LigneEntree[]>([{ produitId: "", quantite: 1 }])

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token")
        const headers = { Authorization: `Bearer ${token}` }
        const [pRes, dRes] = await Promise.all([
          fetch("${API_URL}/produits?limit=1000", { headers }),
          fetch("${API_URL}/depots", { headers }),
        ])
        let produitsList: Produit[] = []
        if (pRes.ok) {
          const result = await pRes.json()
          produitsList = result.data || []
          setProduits(produitsList)
        }
        if (dRes.ok) {
          const deps = await dRes.json()
          setDepots(deps)
          if (deps.length > 0) setDepotId(deps[0].id)
        }
        // Pré-sélectionner le produit si passé en paramètre URL
        const urlParams = new URLSearchParams(window.location.search)
        const produitId = urlParams.get("produit")
        if (produitId && produitsList.length > 0) {
          const produitExiste = produitsList.find((p: Produit) => p.id === produitId)
          if (produitExiste) {
            setLignes([{ produitId: produitId, quantite: 1 }])
          }
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const addLigne = () => setLignes([...lignes, { produitId: "", quantite: 1 }])
  const removeLigne = (i: number) => setLignes(lignes.filter((_, idx) => idx !== i))
  const updateLigne = (i: number, field: string, value: string | number) => {
    const newLignes = [...lignes]
    newLignes[i] = { ...newLignes[i], [field]: value }
    setLignes(newLignes)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!depotId || lignes.some(l => !l.produitId || l.quantite <= 0)) {
      showToast("Veuillez remplir tous les champs", "warning")
      return
    }
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      for (const ligne of lignes) {
        await fetch("${API_URL}/stock/entree", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ produitId: ligne.produitId, depotId, quantite: ligne.quantite, motif }),
        })
      }
      showToast("Entrée de stock enregistrée avec succès", "success")
      router.push("/stock")
    } catch (e) { showToast("Erreur lors de l'enregistrement", "error") }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/stock" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <div><h1 className="text-2xl font-bold">Entrée de Stock</h1><p className="text-gray-500">Ajouter des produits au stock</p></div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Dépôt de destination *</label>
            <select value={depotId} onChange={(e) => setDepotId(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required>
              {depots.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Motif</label>
            <select value={motif} onChange={(e) => setMotif(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
              <option value="APPROVISIONNEMENT">Approvisionnement</option>
              <option value="RETOUR_CLIENT">Retour client</option>
              <option value="INVENTAIRE">Ajustement inventaire</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="font-medium">Produits *</label>
            <button type="button" onClick={addLigne} className="flex items-center gap-1 text-amber-500 hover:text-amber-600 text-sm"><Plus className="w-4 h-4" />Ajouter</button>
          </div>
          <div className="space-y-3">
            {lignes.map((ligne, i) => (
              <div key={i} className="flex gap-3 items-center">
                <select value={ligne.produitId} onChange={(e) => updateLigne(i, "produitId", e.target.value)} className="flex-1 px-4 py-2 border rounded-lg" required>
                  <option value="">Sélectionner un produit</option>
                  {produits.map(p => <option key={p.id} value={p.id}>{p.nom} ({p.unite})</option>)}
                </select>
                <input type="number" min="1" value={ligne.quantite} onChange={(e) => updateLigne(i, "quantite", parseInt(e.target.value))} className="w-24 px-4 py-2 border rounded-lg" required />
                {lignes.length > 1 && <button type="button" onClick={() => removeLigne(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Link href="/stock" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Annuler</Link>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50">
            <Save className="w-5 h-5" />{saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function EntreeStockPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>}>
      <EntreeStockContent />
    </Suspense>
  )
}
