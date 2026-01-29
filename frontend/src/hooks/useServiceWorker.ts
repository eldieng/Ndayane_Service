"use client"

import { useEffect, useState } from "react"

export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(true)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Vérifier l'état de connexion initial
    setIsOnline(navigator.onLine)

    // Écouter les changements de connexion
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Enregistrer le Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker enregistré:", registration.scope)
          setIsInstalled(true)

          // Vérifier les mises à jour
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // Nouvelle version disponible
                  console.log("Nouvelle version disponible")
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error("Erreur Service Worker:", error)
        })

      // Écouter les messages du Service Worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "SYNC_COMPLETE") {
          console.log("Synchronisation terminée")
        }
      })
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return { isOnline, isInstalled }
}
