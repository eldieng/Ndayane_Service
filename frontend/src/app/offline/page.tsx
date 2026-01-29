"use client"

import { WifiOff, RefreshCw } from "lucide-react"

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-12 h-12 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mode Hors-ligne</h1>
        <p className="text-gray-500 mb-6">
          Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.
        </p>
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Fonctionnalités disponibles :</h2>
          <ul className="text-left text-sm text-gray-600 space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Consultation des données en cache
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Création de ventes (synchronisation ultérieure)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Navigation dans l&apos;application
            </li>
          </ul>
        </div>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium mx-auto"
        >
          <RefreshCw className="w-5 h-5" />
          Réessayer la connexion
        </button>
        <p className="text-xs text-gray-400 mt-4">
          Les données seront synchronisées automatiquement dès que la connexion sera rétablie.
        </p>
      </div>
    </div>
  )
}
