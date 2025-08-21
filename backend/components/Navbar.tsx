'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Chrome, Menu, X, Sparkles, User, LogOut } from 'lucide-react'

interface UserData {
  id: string
  email: string
  name: string
  teams?: Array<{
    teamId: string
    teamName: string
    role: 'admin' | 'member'
    isOwner: boolean
  }>
}

export default function Navbar() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('choco_token')
      console.log('Token exists:', !!token)
      
      if (!token) {
        setAuthLoading(false)
        return
      }

      try {
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('Response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Response data:', data)
          
          if (data.success && data.data?.user) {
            console.log('Setting user from data.data.user:', data.data.user)
            setUser(data.data.user)
          } else if (data.user) {
            console.log('Setting user from data.user:', data.user)
            setUser(data.user)
          } else {
            console.log('No user found in response, removing token')
            localStorage.removeItem('choco_token')
          }
        } else {
          console.log('Response not ok, removing token')
          localStorage.removeItem('choco_token')
        }
      } catch (error) {
        console.error('Auth verification failed:', error)
        localStorage.removeItem('choco_token')
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleGetStarted = () => {
    setIsLoading(true)
    router.push('/login')
  }

  const handleLogout = () => {
    localStorage.removeItem('choco_token')
    setUser(null)
    router.push('/login')
  }

  // Show loading state for dashboard auth
  if (authLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/60">
        <div className="container mx-auto px-4 lg:px-6 h-16 lg:h-18 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </header>
    )
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-lg shadow-slate-900/5' 
        : 'bg-white/80 backdrop-blur-sm border-b border-transparent'
    }`}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg">🍫</span>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-tight">
                Choco
              </span>
              <Badge variant="secondary" className="text-xs w-fit bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 transition-colors">
                <Sparkles className="w-3 h-3 mr-1" />
                Team Access Manager
              </Badge>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {[
              { href: '/', label: 'Home' },
              { href: '/docs', label: 'Docs' },
              { href: '/dashboard', label: 'Dashboard' },
              { href: 'https://github.com/ravi-ivar-7/choco/', label: 'Extension', external: true }
            ].map((item) => (
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 text-slate-700 hover:text-slate-900 hover:bg-white/80 rounded-xl transition-all duration-200 font-semibold relative group border border-transparent hover:border-slate-200 hover:shadow-sm"
                >
                  {item.label}
                  <div className="absolute inset-x-0 bottom-1 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 rounded-full"></div>
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-5 py-2.5 text-slate-700 hover:text-slate-900 hover:bg-white/80 rounded-xl transition-all duration-200 font-semibold relative group border border-transparent hover:border-slate-200 hover:shadow-sm"
                >
                  {item.label}
                  <div className="absolute inset-x-0 bottom-1 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 rounded-full"></div>
                </Link>
              )
            ))}
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <div 
                  className="flex items-center space-x-3 px-3 py-1.5 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => router.push('/dashboard?tab=profile')}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user.email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-slate-500 hover:text-red-600 p-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open('https://github.com/ravi-ivar-7/choco/', '_blank')}
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Extension
                </Button>
                <Button 
                  onClick={handleGetStarted} 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? 'Loading...' : 'Get Started'}
                </Button>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2 hover:bg-slate-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="relative w-5 h-5">
              <Menu className={`absolute inset-0 transition-all duration-200 ${mobileMenuOpen ? 'opacity-0 rotate-45' : 'opacity-100 rotate-0'}`} />
              <X className={`absolute inset-0 transition-all duration-200 ${mobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45'}`} />
            </div>
          </Button>
        </div>
        
        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 space-y-1 border-t border-slate-100">
            {[
              { href: '/', label: 'Home' },
              { href: '/docs', label: 'Docs' },
              { href: '/dashboard', label: 'Dashboard' },
              { href: 'https://github.com/ravi-ivar-7/choco/', label: 'Extension', external: true }
            ].map((item) => (
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-5 py-3.5 text-slate-700 hover:text-slate-900 hover:bg-white/80 rounded-xl transition-all duration-200 font-semibold border border-transparent hover:border-slate-200 hover:shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-5 py-3.5 text-slate-700 hover:text-slate-900 hover:bg-white/80 rounded-xl transition-all duration-200 font-semibold border border-transparent hover:border-slate-200 hover:shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            ))}
            
            <div className="pt-4 space-y-3">
              {user ? (
                <>
                  <div 
                    className="flex items-center space-x-3 px-4 py-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => {
                      router.push('/dashboard?tab=profile')
                      setMobileMenuOpen(false)
                    }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 flex-1">{user.email}</span>
                  </div>
                  <Button 
                    variant="outline"
                    className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-center"
                    onClick={() => {
                      window.open('https://github.com/ravi-ivar-7/choco/', '_blank')
                      setMobileMenuOpen(false)
                    }}
                  >
                    <Chrome className="w-4 h-4 mr-2" />
                    Install Extension
                  </Button>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                    onClick={() => {
                      handleGetStarted()
                      setMobileMenuOpen(false)
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    ) : (
                      <ArrowRight className="w-4 h-4 mr-2" />
                    )}
                    {isLoading ? 'Loading...' : 'Get Started'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
