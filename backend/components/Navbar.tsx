'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Chrome, Menu, X, Sparkles, User, LogOut, Home, BookOpen, LayoutDashboard } from 'lucide-react'

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

  // Check authentication function
  const checkAuth = async () => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('choco_token')
    
    if (!token) {
      setAuthLoading(false)
      setUser(null)
      return
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.data?.user) {
          setUser(data.data.user)
        } else if (data.user) {
          setUser(data.user)
        } else {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('choco_token')
          }
          setUser(null)
        }
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('choco_token')
        }
        setUser(null)
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('choco_token')
      }
      setUser(null)
    } finally {
      setAuthLoading(false)
    }
  }

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Listen for storage changes (when user logs in from another tab/component)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'choco_token') {
        setAuthLoading(true)
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Listen for custom login event
  useEffect(() => {
    const handleLoginSuccess = () => {
      setAuthLoading(true)
      checkAuth()
    }

    window.addEventListener('loginSuccess', handleLoginSuccess)
    return () => window.removeEventListener('loginSuccess', handleLoginSuccess)
  }, [])

  const handleGetStarted = () => {
    setIsLoading(true)
    router.push('/login')
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('choco_token')
    }
    setUser(null)
    router.push('/login')
  }

  // Show loading state only on initial page load
  if (authLoading && user === null && (typeof window === 'undefined' || !localStorage.getItem('choco_token'))) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/60">
        <div className="container mx-auto px-4 lg:px-6 h-16 lg:h-18 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </header>
    )
  }

  return (
    <>
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
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
              { href: '/', label: 'Home', icon: Home, external: false },
              { href: '/docs', label: 'Docs', icon: BookOpen, external: false },
              { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, external: false }
            ].map((item) => (
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 text-slate-700 hover:text-slate-900 hover:bg-white/80 rounded-xl transition-all duration-200 font-semibold relative group border border-slate-100 hover:border-slate-200 hover:shadow-sm flex items-center space-x-2"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  <div className="absolute inset-x-0 bottom-1 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 rounded-full"></div>
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-5 py-2.5 text-slate-700 hover:text-slate-900 hover:bg-white/80 rounded-xl transition-all duration-200 font-semibold relative group border border-slate-100 hover:border-slate-200 hover:shadow-sm flex items-center space-x-2"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  <div className="absolute inset-x-0 bottom-1 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 rounded-full"></div>
                </Link>
              )
            ))}
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://github.com/ravi-ivar-7/choco/', '_blank')}
              className="text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-200"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Extension
            </Button>
            {authLoading ? (
              <div className="flex items-center space-x-3 px-3 py-1.5 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
              </div>
            ) : user ? (
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
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 px-3 py-1"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    <span className="text-xs">Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
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
              { href: '/', label: 'Home', icon: Home, external: false },
              { href: '/docs', label: 'Docs', icon: BookOpen, external: false },
              { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, external: false }
            ].map((item) => (
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 px-5 py-3.5 text-slate-700 hover:text-slate-900 hover:bg-white/80 rounded-xl transition-all duration-200 font-semibold border border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-5 py-3.5 text-slate-700 hover:text-slate-900 hover:bg-white/80 rounded-xl transition-all duration-200 font-semibold border border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            ))}
            
            <div className="pt-4 space-y-3">
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
              {authLoading ? (
                <div className="flex items-center space-x-3 px-4 py-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-32 animate-pulse flex-1"></div>
                </div>
              ) : user ? (
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
                    className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-medium"
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
    </>
  )
}
