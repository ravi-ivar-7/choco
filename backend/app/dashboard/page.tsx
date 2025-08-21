'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Import modular components
import NavigationTabs from './components/NavigationTabs'
import OverviewTab from './components/OverviewTab'
import TeamsManagement from './components/TeamsManagement'
import MembersManagement from './components/MembersManagement'
import CredentialsManagement from './components/CredentialsManagement'
import ProfileManagement from './components/ProfileManagement'

interface User {
  id: string
  email: string
  name: string
  teams: Array<{
    teamId: string
    teamName: string
    role: 'admin' | 'member'
    isOwner: boolean
  }>
}

// Component that uses useSearchParams - must be wrapped in Suspense
function DashboardContent() {
    const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  
  // Get tab from URL parameter or default to 'overview'
  const getInitialTab = (): 'overview' | 'teams' | 'members' | 'credentials' | 'profile' => {
    const tabParam = searchParams.get('tab')
    const validTabs = ['overview', 'teams', 'members', 'credentials', 'profile']
    return validTabs.includes(tabParam || '') ? tabParam as any : 'overview'
  }
  
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'members' | 'credentials' | 'profile'>(getInitialTab())

  // Update activeTab when URL parameter changes
  useEffect(() => {
    const newTab = getInitialTab()
    setActiveTab(newTab)
  }, [searchParams])
  
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalUsers: 0,
    activeCredentials: 0
  })

  // Load user data and stats
  useEffect(() => {
    const loadUserData = async () => {
      if (typeof window === 'undefined') return
      const token = localStorage.getItem('choco_token')
      if (!token) {
        router.push('/')
        return
      }

      try {
        const authResponse = await fetch('/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
        })
        
        if (authResponse.ok) {
          const authData = await authResponse.json()
          setUser(authData.data?.user || authData.user)
          await loadStats()
        } else {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('choco_token')
          }
          router.push('/')
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('choco_token')
        }
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  // Load dashboard stats
  const loadStats = async () => {
    try {
      if (typeof window === 'undefined') return
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
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
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
          {activeTab === 'teams' && <TeamsManagement user={user} onUserUpdate={setUser} />}
          {activeTab === 'members' && <MembersManagement user={user} onUserUpdate={setUser} />}
          {activeTab === 'credentials' && <CredentialsManagement />}
          {activeTab === 'profile' && <ProfileManagement />}
        </div>
      </div>
    </div>
  )
}

// Loading component for Suspense fallback
function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Loading dashboard...</p>
      </div>
    </div>
  )
}

// Main export with Suspense wrapper
export default function AdminDashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}
