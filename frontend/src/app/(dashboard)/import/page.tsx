"use client"

import { useState, useRef } from "react"
import { 
  Upload, 
  FileSpreadsheet, 
  Users, 
  Package, 
  Check, 
  X, 
  AlertCircle,
  Download,
  Loader2,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import * as XLSX from "xlsx"

type ImportType = "produits" | "clients" | null

interface ImportRow {
  [key: string]: any
}

export default function ImportPage() {
  const [importType, setImportType] = useState<ImportType>(null)
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<ImportRow[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: number; duplicates: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const produitFields = [
    { key: "reference", label: "Référence", required: true },
    { key: "nom", label: "Désignation/Nom", required: true },
    { key: "prixVente", label: "Prix de vente", required: true },
    { key: "prixAchat", label: "Prix d'achat", required: false },
    { key: "unite", label: "Unité", required: false },
    { key: "stockMin", label: "Stock minimum", required: false },
    { key: "stockInitial", label: "Stock initial", required: false },
    { key: "categorie", label: "Catégorie", required: false },
  ]

  const clientFields = [
    { key: "nom", label: "Nom", required: true },
    { key: "telephone", label: "Téléphone", required: false },
    { key: "email", label: "Email", required: false },
    { key: "adresse", label: "Adresse", required: false },
    { key: "typeClient", label: "Type (PARTICULIER/ENTREPRISE)", required: false },
  ]

  const fields = importType === "produits" ? produitFields : clientFields

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setResult(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target?.result, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json<ImportRow>(sheet)
        
        if (jsonData.length > 0) {
          const cols = Object.keys(jsonData[0])
          setColumns(cols)
          setData(jsonData)
          
          // Auto-mapping basé sur les noms de colonnes
          const autoMapping: Record<string, string> = {}
          fields.forEach(field => {
            const matchingCol = cols.find(col => {
              const colLower = col.toLowerCase()
              const keyLower = field.key.toLowerCase()
              const labelLower = field.label.toLowerCase()
              return colLower.includes(keyLower) ||
                colLower.includes(labelLower) ||
                (field.key === "nom" && colLower.includes("designation")) ||
                (field.key === "reference" && colLower.includes("ref")) ||
                (field.key === "prixVente" && (colLower.includes("prix_vente") || colLower === "prix_vente")) ||
                (field.key === "prixAchat" && (colLower.includes("prix_achat") || colLower === "prix_achat")) ||
                (field.key === "stockInitial" && (colLower.includes("stock_initial") || colLower === "stock_initial")) ||
                (field.key === "stockMin" && (colLower.includes("stock_min") || colLower === "stock_min"))
            })
            if (matchingCol) {
              autoMapping[field.key] = matchingCol
            }
          })
          setMapping(autoMapping)
        }
      } catch (error) {
        console.error("Erreur lecture fichier:", error)
        alert("Erreur lors de la lecture du fichier")
      }
    }
    reader.readAsBinaryString(selectedFile)
  }

  const handleImport = async () => {
    if (!importType || data.length === 0) return

    setImporting(true)
    let success = 0
    let errors = 0
    const duplicates: string[] = []

    try {
      const token = localStorage.getItem("token")
      const endpoint = importType === "produits" ? "produits" : "clients"

      for (const row of data) {
        try {
          const mappedData: any = {}
          
          fields.forEach(field => {
            const sourceCol = mapping[field.key]
            if (sourceCol && row[sourceCol] !== undefined) {
              let value = row[sourceCol]
              
              // Conversion des types
              if (field.key === "prixVente" || field.key === "prixAchat" || field.key === "stockMin" || field.key === "stockInitial") {
                value = parseFloat(String(value).replace(/[^\d.-]/g, "")) || 0
              }
              // Convertir le téléphone en String
              if (field.key === "telephone") {
                value = String(value)
              }
              
              mappedData[field.key] = value
            }
          })

          // Valeurs par défaut
          if (importType === "produits") {
            if (!mappedData.unite) mappedData.unite = "Unité"
            if (!mappedData.stockMin) mappedData.stockMin = 5
            if (!mappedData.prixAchat) mappedData.prixAchat = mappedData.prixVente * 0.8
          }

          if (importType === "clients") {
            if (!mappedData.type) mappedData.type = "PARTICULIER"
          }

          const response = await fetch(`${API_URL}/${endpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(mappedData),
          })

          if (response.ok) {
            const createdItem = await response.json()
            
            // Si produit avec stock initial, créer le mouvement de stock
            if (importType === "produits" && mappedData.stockInitial && mappedData.stockInitial > 0) {
              const stockRes = await fetch("${API_URL}/stock/entree", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  produitId: createdItem.id,
                  depotId: "depot-principal",
                  quantite: Number(mappedData.stockInitial),
                  motif: "Stock initial - Import",
                }),
              })
              if (!stockRes.ok) {
                console.error("Erreur création stock:", await stockRes.text())
              }
            }
            success++
          } else {
            // Vérifier si c'est une erreur de doublon
            const errorData = await response.json().catch(() => ({}))
            if (errorData.message && errorData.message.includes("existe déjà")) {
              duplicates.push(mappedData.nom || mappedData.reference || "Inconnu")
            }
            errors++
          }
        } catch (err) {
          errors++
        }
      }

      setResult({ success, errors, duplicates })
    } catch (error) {
      console.error("Erreur import:", error)
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = (type: "produits" | "clients") => {
    const headers = type === "produits" 
      ? ["REF", "DESIGNATION", "PRIX_VENTE", "PRIX_ACHAT", "UNITE", "STOCK_MIN", "STOCK_INITIAL", "CATEGORIE"]
      : ["NOM", "TELEPHONE", "EMAIL", "ADRESSE", "TYPECLIENT"]
    
    const exampleData = type === "produits"
      ? [["PL0046", "TEE EGAUX NF 14-18", "112000", "90000", "Unité", "5", "20", "Plomberie"]]
      : [["OUSMANE DRAME", "771234567", "", "Dakar", "PARTICULIER"]]

    const ws = XLSX.utils.aoa_to_sheet([headers, ...exampleData])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, type)
    XLSX.writeFile(wb, `template_${type}.xlsx`)
  }

  const reset = () => {
    setFile(null)
    setData([])
    setColumns([])
    setMapping({})
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/parametres" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import de Données</h1>
          <p className="text-gray-500">Importez vos produits et clients depuis un fichier Excel ou CSV</p>
        </div>
      </div>

      {/* Step 1: Choose type */}
      {!importType && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setImportType("produits")}
            className="bg-white rounded-xl shadow-sm border p-8 hover:shadow-md hover:border-amber-500 transition-all text-left"
          >
            <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Importer des Produits</h3>
            <p className="text-gray-500">Importez votre catalogue de produits avec références, prix et stock</p>
            <button
              onClick={(e) => { e.stopPropagation(); downloadTemplate("produits"); }}
              className="mt-4 flex items-center gap-2 text-sm text-amber-600 hover:text-orange-700"
            >
              <Download className="w-4 h-4" />
              Télécharger le template
            </button>
          </button>

          <button
            onClick={() => setImportType("clients")}
            className="bg-white rounded-xl shadow-sm border p-8 hover:shadow-md hover:border-green-500 transition-all text-left"
          >
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Importer des Clients</h3>
            <p className="text-gray-500">Importez votre base de clients avec coordonnées</p>
            <button
              onClick={(e) => { e.stopPropagation(); downloadTemplate("clients"); }}
              className="mt-4 flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
            >
              <Download className="w-4 h-4" />
              Télécharger le template
            </button>
          </button>
        </div>
      )}

      {/* Step 2: Upload file */}
      {importType && !file && (
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Import {importType === "produits" ? "des Produits" : "des Clients"}
            </h2>
            <button
              onClick={() => setImportType(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-amber-500 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Glissez votre fichier ici ou cliquez pour parcourir
              </p>
              <p className="text-sm text-gray-500">
                Formats acceptés : Excel (.xlsx, .xls) ou CSV (.csv)
              </p>
            </label>
          </div>

          <div className="mt-6 p-4 bg-amber-50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium mb-1">Format attendu :</p>
                {importType === "produits" ? (
                  <p>REF | DESIGNATION | PRIX_VENTE | PRIX_ACHAT | UNITE | STOCK_MIN | CATEGORIE</p>
                ) : (
                  <p>NOM | TELEPHONE | EMAIL | ADRESSE | TYPE</p>
                )}
                <button
                  onClick={() => downloadTemplate(importType)}
                  className="mt-2 underline hover:no-underline"
                >
                  Télécharger un fichier exemple
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Map columns */}
      {file && data.length > 0 && !result && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Mapping des colonnes</h2>
                <p className="text-sm text-gray-500">{data.length} lignes détectées dans {file.name}</p>
              </div>
              <button onClick={reset} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {fields.map(field => (
                <div key={field.key} className="flex items-center gap-4">
                  <label className="w-40 text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={mapping[field.key] || ""}
                    onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">-- Sélectionner --</option>
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Preview */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h3 className="font-medium text-gray-700">Aperçu (5 premières lignes)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map(col => (
                        <th key={col} className="px-4 py-2 text-left font-medium text-gray-500">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        {columns.map(col => (
                          <td key={col} className="px-4 py-2 text-gray-700">{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={reset}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleImport}
                disabled={importing || !fields.filter(f => f.required).every(f => mapping[f.key])}
                className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Importer {data.length} {importType}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Result */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${result.errors === 0 ? "bg-green-100" : "bg-yellow-100"}`}>
              {result.errors === 0 ? (
                <Check className="w-10 h-10 text-green-600" />
              ) : (
                <AlertCircle className="w-10 h-10 text-yellow-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Import terminé</h2>
            <p className="text-gray-500 mb-4">
              <span className="text-green-600 font-semibold">{result.success}</span> {importType} importés avec succès
              {result.errors > 0 && (
                <>, <span className="text-red-600 font-semibold">{result.errors}</span> erreurs</>
              )}
            </p>
          </div>

          {/* Afficher les doublons */}
          {result.duplicates.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">
                ⚠️ {result.duplicates.length} doublon(s) détecté(s) :
              </h3>
              <div className="max-h-32 overflow-y-auto">
                <ul className="text-sm text-yellow-700 space-y-1">
                  {result.duplicates.map((name, i) => (
                    <li key={i}>• {name}</li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-yellow-600 mt-2">
                Ces éléments existent déjà et n&apos;ont pas été importés.
              </p>
            </div>
          )}

          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => { reset(); setImportType(null); }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Nouvel import
            </button>
            <Link
              href={importType === "produits" ? "/produits" : "/clients"}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
            >
              Voir les {importType}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
