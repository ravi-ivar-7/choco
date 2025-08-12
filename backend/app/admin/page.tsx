'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Import modular components
import AdminHeader from './components/AdminHeader'
import NavigationTabs from './components/NavigationTabs'
import OverviewTab from './components/OverviewTab'
import TeamsManagement from './components/TeamsManagement'
import MembersManagement from './components/MembersManagement'
import CredentialsManagement from './components/CredentialsManagement'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'member'
  teamId: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'members' | 'credentials'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalUsers: 0,
    activeCredentials: 0
  })

  // Authentication check - minimal, no data loading
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('choco_token')
      
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const authResponse = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ requiredRole: 'admin' })
        })
        
        if (!authResponse.ok) {
          localStorage.removeItem('choco_token')
          router.push('/login')
          return
        }
        
        const authData = await authResponse.json()
        if (!authData.success) {
          localStorage.removeItem('choco_token')
          router.push('/login')
          return
        }
        
        setUser(authData.data.user)
        // Load stats after successful authentication
        await loadStats()
      } catch (error) {
        console.error('Auth verification failed:', error)
        localStorage.removeItem('choco_token')
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    verifyAuth()
  }, [])

  // Load dashboard stats
  const loadStats = async () => {
    try {
      const token = localStorage.getItem('choco_token')
      const response = await fetch('/api/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats({
            totalTeams: data.data.totalTeams || 0,
            totalUsers: data.data.totalUsers || 0,
            activeCredentials: data.data.activeCredentials || 0
          })
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('choco_token')
    router.push('/login')
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <AdminHeader user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-2 text-slate-600">Manage your teams, members, and credentials</p>
        </div>

        {/* Navigation Tabs with real-time stats */}
        <NavigationTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          stats={stats}
        />

        {/* Tab Content - Each tab loads its own data */}
        <div className="mt-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'teams' && <TeamsManagement />}
          {activeTab === 'members' && <MembersManagement />}
          {activeTab === 'credentials' && <CredentialsManagement />}
        </div>
      </div>
    </div>
  )
}
