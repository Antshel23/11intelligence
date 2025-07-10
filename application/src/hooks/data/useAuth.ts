// src/hooks/useAuth.ts
import { useState, useEffect } from 'react'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    const authStatus = localStorage.getItem('dwfc_authenticated')
    const authTimestamp = localStorage.getItem('dwfc_auth_timestamp')
    
    if (authStatus === 'true' && authTimestamp) {
      const loginTime = parseInt(authTimestamp)
      const now = Date.now()
      const thirtyDays = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
      
      // Check if login is still valid (within 30 days)
      if (now - loginTime < thirtyDays) {
        setIsAuthenticated(true)
      } else {
        // Auth expired, clear storage
        logout()
      }
    }
    
    setIsLoading(false)
  }

  const login = () => {
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('dwfc_authenticated')
    localStorage.removeItem('dwfc_auth_timestamp')
    setIsAuthenticated(false)
  }

  return { isAuthenticated, isLoading, login, logout }
}