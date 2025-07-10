// src/components/auth/Login.tsx
import { useState } from 'react'

interface LoginProps {
  onLogin: () => void
}

const VALID_PASSWORDS = ['219151', '957675', '165962', '363650', '559482']

export function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (VALID_PASSWORDS.includes(password)) {
      localStorage.setItem('dwfc_authenticated', 'true')
      localStorage.setItem('dwfc_auth_timestamp', Date.now().toString())
      onLogin()
      setError('')
    } else {
      setError('Invalid password')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-[#181D21] flex items-center justify-center">
      <div className="bg-[#242B32] p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <img 
            src="/league_logos/Dorking Wanderers.png" 
            alt="Dorking Wanderers FC" 
            className="h-16 w-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-[#EFEFEF] mb-2">ELEVEN INTELLIGENCE</h1>
          <p className="text-white/60">Enter your unique 6 digit code</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-[#181D21] text-[#EFEFEF] rounded-lg border border-gray-600 focus:border-[#7406B5] focus:outline-none"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="mb-4 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-[#7406B5] text-white py-3 rounded-lg font-medium hover:bg-[#5a0487] transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}