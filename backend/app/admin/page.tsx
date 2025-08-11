'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

// Import modular components
import AdminHeader from './components/AdminHeader'
import NavigationTabs from './components/NavigationTabs'
import OverviewTab from './components/OverviewTab'
import TeamsManagement from './components/TeamsManagement'
import MembersManagement from './components/MembersManagement'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'member'
  teamId: string
}

interface Team {
  id: string
  name: string
  description?: string
  algozenithAccountId: string
  createdAt: string
  updatedAt: string
}

interface Member {
  id: string
  email: string
  name: string
  role: 'admin' | 'member'
  teamId: string
  teamName: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

interface DashboardStats {
  activeTokens: number
  totalUsers: number
  totalTeams: number
  lastTokenUpdate: string
  tokenStatus: 'active' | 'expired' | 'none'
  recentActivity: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'members'>('overview')
  const [stats, setStats] = useState<DashboardStats>({
    activeTokens: 0,
    totalUsers: 0,
    totalTeams: 0,
    lastTokenUpdate: 'Never',
    tokenStatus: 'none',
    recentActivity: 0
  })
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tokenInfo, setTokenInfo] = useState<any>(null)

  // Authentication check with server-side JWT verification
  useEffect(() => {
    const verifyAuthAndLoadData = async () => {
      const token = localStorage.getItem('choco_token')
      
      if (!token) {
        router.push('/login')
        return
      }

      try {
        // Verify JWT token and admin role with server
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ requiredRole: 'admin' })
        })

        const data = await response.json()
        
        if (!data.success) {
          console.error('Auth verification failed:', data.message)
          localStorage.removeItem('choco_token')
          localStorage.removeItem('choco_user')
          alert('Session expired or access denied. Please login again.')
          router.push('/login')
          return
        }

        // Update user data from server verification
        setUser(data.user)
        localStorage.setItem('choco_user', JSON.stringify(data.user))
        
        // Load dashboard data after successful auth
        await loadDashboardData()
        
      } catch (error) {
        console.error('Auth verification error:', error)
        localStorage.removeItem('choco_token')
        localStorage.removeItem('choco_user')
        router.push('/login')
      }
    }

    verifyAuthAndLoadData()
  }, [router])

  const handleLogout = async () => {
    const token = localStorage.getItem('choco_token')
    
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      } catch (error) {
        console.error('Logout error:', error)
      }
    }

    localStorage.removeItem('choco_token')
    localStorage.removeItem('choco_user')
    router.push('/login')
  }

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('choco_token')
      if (!token) return

      // Load teams
      const teamsResponse = await fetch('/api/teams', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const teamsData = await teamsResponse.json()
      if (teamsData.success) {
        setTeams(teamsData.teams)
      }

      // Load members
      const membersResponse = await fetch('/api/members', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const membersData = await membersResponse.json()
      if (membersData.success) {
        setMembers(membersData.members)
      }

      // Load token info
      const tokenResponse = await fetch('/api/maang/team', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const tokenData = await tokenResponse.json()
      setTokenInfo(tokenData)

      // Update stats
      setStats({
        totalTeams: teamsData.teams?.length || 0,
        totalUsers: membersData.members?.length || 0,
        activeTokens: tokenData.success ? tokenData.count || 0 : 0,
        lastTokenUpdate: tokenData.tokens?.length > 0 ? 'Recently' : 'Never',
        tokenStatus: tokenData.success && tokenData.count > 0 ? 'active' : 'none',
        recentActivity: 0
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load data without full loading state (for updates)
  const refreshData = async () => {
    try {
      const token = localStorage.getItem('choco_token')
      if (!token) return

      // Load teams
      const teamsResponse = await fetch('/api/teams', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const teamsData = await teamsResponse.json()
      if (teamsData.success) {
        setTeams(teamsData.teams)
      }

      // Load members
      const membersResponse = await fetch('/api/members', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const membersData = await membersResponse.json()
      if (membersData.success) {
        setMembers(membersData.members)
      }

      // Update stats
      setStats(prev => ({
        ...prev,
        totalTeams: teamsData.teams?.length || 0,
        totalUsers: membersData.members?.length || 0,
      }))
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  }

  // Team management functions
  const handleCreateTeam = async (teamData: { name: string; description?: string; algozenithAccountId: string }) => {
    try {
      const token = localStorage.getItem('choco_token')
      if (!token) return

      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      })

      const result = await response.json()
      if (result.success) {
        await refreshData() // Refresh without full loading
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Failed to create team:', error)
      alert('Failed to create team')
    }
  }

  const handleUpdateTeam = async (teamData: { id: string; name: string; description?: string; algozenithAccountId: string }) => {
    try {
      const token = localStorage.getItem('choco_token')
      if (!token) return

      const response = await fetch('/api/teams', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      })

      const result = await response.json()
      if (result.success) {
        await refreshData()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Failed to update team:', error)
      alert('Failed to update team')
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return

    try {
      const token = localStorage.getItem('choco_token')
      if (!token) return

      const response = await fetch(`/api/teams?id=${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const result = await response.json()
      if (result.success) {
        await refreshData()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Failed to delete team:', error)
      alert('Failed to delete team')
    }
  }

  // Member management functions
  const handleCreateMember = async (memberData: { name: string; email: string; role: 'admin' | 'member'; teamId: string }) => {
    try {
      const token = localStorage.getItem('choco_token')
      if (!token) return

      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      })

      const result = await response.json()
      if (result.success) {
        await refreshData()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Failed to create member:', error)
      alert('Failed to create member')
    }
  }

  const handleUpdateMember = async (memberData: { id: string; name: string; email: string; role: 'admin' | 'member'; teamId: string; isActive: boolean }) => {
    try {
      const token = localStorage.getItem('choco_token')
      if (!token) return

      const response = await fetch('/api/members', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      })

      const result = await response.json()
      if (result.success) {
        await refreshData()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Failed to update member:', error)
      alert('Failed to update member')
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return

    try {
      const token = localStorage.getItem('choco_token')
      if (!token) return

      const response = await fetch(`/api/members?id=${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const result = await response.json()
      if (result.success) {
        await refreshData()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Failed to delete member:', error)
      alert('Failed to delete member')
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
      {/* Admin Header */}
      <AdminHeader user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Dashboard Title */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage teams, members, and access tokens</p>
            </div>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <NavigationTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          stats={stats} 
        />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <OverviewTab stats={stats} tokenInfo={tokenInfo} />
          )}

          {activeTab === 'teams' && (
            <TeamsManagement
              teams={teams}
              onCreateTeam={handleCreateTeam}
              onUpdateTeam={handleUpdateTeam}
              onDeleteTeam={handleDeleteTeam}
            />
          )}

          {activeTab === 'members' && (
            <MembersManagement
              members={members}
              teams={teams}
              onCreateMember={handleCreateMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
            />
          )}
        </div>
      </div>
    </div>
  )
}
