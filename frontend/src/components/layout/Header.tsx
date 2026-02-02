"use client"

import { Bell, Search, User, Menu, LogOut, AlertTriangle, Package, Users, FileText } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { API_URL } from "@/lib/api"

interface HeaderProps {
  onMenuClick?: () => void
}

interface UserProfile {
  nom: string
  email: string
  role: string
}

interface SearchResult {
  type: "produit" | "client" | "vente"
  id: string
  label: string
  sublabel?: string
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<UserProfile | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [alertesCount, setAlertesCount] = useState(0)
  const [showAlertes, setShowAlertes] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [searching, setSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchProfile()
    fetchAlertes()
    
    // Écouter les changements du localStorage
    const handleStorageChange = () => {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        try {
          setUser(JSON.parse(userStr))
        } catch (e) {}
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const fetchProfile = async () => {
    try {
      // D'abord essayer de récupérer depuis localStorage
      const userStr = localStorage.getItem("user")
      if (userStr) {
        try {
          const userData = JSON.parse(userStr)
          if (userData.nom) {
            setUser(userData)
            return
          }
        } catch (e) {}
      }
      
      // Sinon récupérer depuis l'API
      const token = localStorage.getItem("token")
      if (!token) return
      const response = await fetch(`${API_URL}/utilisateurs/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data)
        localStorage.setItem("user", JSON.stringify(data))
      }
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const fetchAlertes = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      const response = await fetch(`${API_URL}/stock/alertes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAlertesCount(data.count || 0)
      }
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  // Recherche globale
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch(searchQuery)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300)
    return () => clearTimeout(searchTimer)
  }, [searchQuery])

  const performSearch = async (query: string) => {
    setSearching(true)
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }
      
      const [produitsRes, clientsRes, ventesRes] = await Promise.all([
        fetch(`${API_URL}/produits?search=${encodeURIComponent(query)}`, { headers }),
        fetch(`${API_URL}/clients?search=${encodeURIComponent(query)}`, { headers }),
        fetch(`${API_URL}/ventes?search=${encodeURIComponent(query)}`, { headers }),
      ])

      const results: SearchResult[] = []

      if (produitsRes.ok) {
        const result = await produitsRes.json()
        const produits = result.data || []
        produits.slice(0, 5).forEach((p: any) => {
          results.push({ type: "produit", id: p.id, label: p.nom, sublabel: `${p.prixVente?.toLocaleString()} F` })
        })
      }

      if (clientsRes.ok) {
        const result = await clientsRes.json()
        const clients = result.data || []
        clients.slice(0, 5).forEach((c: any) => {
          results.push({ type: "client", id: c.id, label: c.nom, sublabel: c.telephone })
        })
      }

      if (ventesRes.ok) {
        const result = await ventesRes.json()
        const ventes = result.data || []
        ventes.slice(0, 5).forEach((v: any) => {
          results.push({ type: "vente", id: v.id, label: v.numero || `Vente #${v.id.slice(0,8)}`, sublabel: `${v.total?.toLocaleString()} F` })
        })
      }

      setSearchResults(results)
      setShowResults(results.length > 0)
    } catch (error) {
      console.error("Erreur recherche:", error)
    } finally {
      setSearching(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false)
    setSearchQuery("")
    if (result.type === "produit") router.push(`/produits/${result.id}`)
    else if (result.type === "client") router.push(`/clients/${result.id}`)
    else if (result.type === "vente") router.push(`/ventes/${result.id}`)
  }

  const getResultIcon = (type: string) => {
    if (type === "produit") return <Package className="w-4 h-4 text-amber-500" />
    if (type === "client") return <Users className="w-4 h-4 text-blue-500" />
    return <FileText className="w-4 h-4 text-green-500" />
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile menu button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-4" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher produit, client, vente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
            {/* Résultats de recherche */}
            {showResults && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {searching ? (
                  <div className="p-4 text-center text-gray-500">Recherche...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">Aucun résultat</div>
                ) : (
                  <div className="py-2">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}-${index}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 text-left"
                      >
                        {getResultIcon(result.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{result.label}</p>
                          {result.sublabel && (
                            <p className="text-xs text-gray-500 truncate">{result.sublabel}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 capitalize">{result.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Alertes Stock */}
          <Link
            href="/stock/alertes"
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Alertes de stock"
          >
            {alertesCount > 0 ? (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
            {alertesCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                {alertesCount > 99 ? "99+" : alertesCount}
              </span>
            )}
          </Link>

          {/* User */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 pl-3 border-l hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.nom || "Utilisateur"}</p>
                <p className="text-xs text-gray-500">{user?.role || "..."}</p>
              </div>
              <div className="w-9 h-9 bg-amber-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                <Link
                  href="/parametres"
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="w-4 h-4" />
                  Mon profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
