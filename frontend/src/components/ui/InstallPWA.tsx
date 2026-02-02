"use client"

import { useState, useEffect } from "react"
import { Download, X, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Afficher la bannière après 3 secondes si pas déjà refusée
      const dismissed = localStorage.getItem("pwa-install-dismissed")
      if (!dismissed) {
        setTimeout(() => setShowInstallBanner(true), 3000)
      }
    }

    // Écouter si l'app est installée
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallBanner(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Afficher le prompt d'installation
    await deferredPrompt.prompt()
    
    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === "accepted") {
      setIsInstalled(true)
    }
    
    setShowInstallBanner(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstallBanner(false)
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  // Ne rien afficher si déjà installé ou pas de prompt disponible
  if (isInstalled || !showInstallBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl shadow-2xl p-4 z-50 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Fermer"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-white/20 p-3 rounded-xl">
          <Smartphone className="w-8 h-8" />
        </div>
        
        <div className="flex-1 pr-6">
          <h3 className="font-bold text-lg">Installer l&apos;application</h3>
          <p className="text-sm text-white/90 mt-1">
            Accédez rapidement à Ndayane Services depuis votre bureau ou écran d&apos;accueil.
          </p>
          
          <button
            onClick={handleInstallClick}
            className="mt-3 flex items-center gap-2 bg-white text-amber-600 px-4 py-2 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Installer maintenant
          </button>
        </div>
      </div>
    </div>
  )
}
