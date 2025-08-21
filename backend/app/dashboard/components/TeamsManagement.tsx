'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, RefreshCw, Settings } from 'lucide-react'
import TeamForm from './TeamForm'
import CredentialConfig from './CredentialConfig'

interface Team {
  id: string
  name: string
  description?: string
  platformAccountId: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

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

interface TeamsManagementProps {
  user: User
  onUserUpdate: (user: User) => void
}

export default function TeamsManagement({ user, onUserUpdate }: TeamsManagementProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showTeamForm, setShowTeamForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [configTeam, setConfigTeam] = useState<Team | null>(null)

  // Check if user can manage a specific team
  const canManageTeam = (teamId: string) => {
    const userTeam = user.teams.find(t => t.teamId === teamId)
    return userTeam ? (userTeam.role === 'admin' || userTeam.isOwner) : false
  }

  // Check if user can create teams (must be admin of at least one team or have no teams)
  const canCreateTeams = user.teams.length === 0 || user.teams.some(t => t.role === 'admin' || t.isOwner)

  const loadTeams = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('choco_token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch('/api/teams', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch teams')
      }

      const data = await response.json()
      if (data.success) {
        setTeams(data.data.teams || [])
      } else {
        setError(data.error || 'Failed to load teams')
      }
    } catch (error) {
      console.error('Failed to load teams:', error)
      setError('Failed to load teams')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTeams()
  }, [])

  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('choco_token')
      if (!token) return

      const authResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      
      if (authResponse.ok) {
        const authData = await authResponse.json()
        if (authData.success) {
          onUserUpdate(authData.data.user)
        }
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    }
  }

  const handleCreateTeam = async (teamData: { name: string; description?: string; platformAccountId: string }) => {
    try {
      setActionLoading('create')
      
      const token = localStorage.getItem('choco_token')
      if (!token) {
        alert('No authentication token found')
        return
      }

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
        await loadTeams() // Refresh the teams list
        await refreshUserData() // Refresh user data to include new team permissions
        setShowTeamForm(false)
        alert('Team created successfully')
      } else {
        alert(result.message || 'Failed to create team')
      }
    } catch (error) {
      console.error('Failed to create team:', error)
      alert('Failed to create team')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateTeamWrapper = async (teamData: { name: string; description?: string; platformAccountId: string }) => {
    if (!editingTeam) return
    await handleUpdateTeam({ ...teamData, id: editingTeam.id })
  }

  const handleUpdateTeam = async (teamData: { id: string; name: string; description?: string; platformAccountId: string }) => {
    try {
      setActionLoading(teamData.id)
      
      const token = localStorage.getItem('choco_token')
      if (!token) {
        alert('No authentication token found')
        return
      }

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
        await loadTeams() // Refresh the list
        setEditingTeam(null)
        alert('Team updated successfully')
      } else {
        alert(result.message || 'Failed to update team')
      }
    } catch (error) {
      console.error('Failed to update team:', error)
      alert('Failed to update team')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return
    }

    try {
      setActionLoading(teamId)
      
      const token = localStorage.getItem('choco_token')
      if (!token) {
        alert('No authentication token found')
        return
      }

      const response = await fetch(`/api/teams?id=${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const result = await response.json()
      if (result.success) {
        await loadTeams() // Refresh the list
        alert('Team deleted successfully')
      } else {
        alert(result.message || 'Failed to delete team')
      }
    } catch (error) {
      console.error('Failed to delete team:', error)
      alert('Failed to delete team')
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading teams...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadTeams}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900">Teams Management</h2>
        {canCreateTeams && (
          <Button 
            onClick={() => setShowTeamForm(true)}
            disabled={actionLoading === 'create'}
          >
            <Plus className="h-4 w-4 mr-2" />
            {actionLoading === 'create' ? 'Creating...' : 'Add Team'}
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {teams.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No teams found. Create your first team to get started.
          </div>
        ) : (
          teams.map((team) => (
            <div key={team.id} className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                  {team.description && (
                    <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline">ID: {team.platformAccountId}</Badge>
                    <span className="text-xs text-gray-500">
                      Created: {new Date(team.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {canManageTeam(team.id) && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfigTeam(team)}
                        disabled={actionLoading !== null}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingTeam(team)}
                        disabled={actionLoading !== null}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTeam(team.id)}
                        disabled={actionLoading === team.id}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {actionLoading === team.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Team Form Modal */}
      {(showTeamForm || editingTeam) && (
        <TeamForm
          team={editingTeam}
          onSubmit={editingTeam ? handleUpdateTeamWrapper : handleCreateTeam}
          onCancel={() => {
            setShowTeamForm(false)
            setEditingTeam(null)
          }}
        />
      )}

      {/* Credential Config Modal */}
      {configTeam && (
        <CredentialConfig
          teamId={configTeam.id}
          teamName={configTeam.name}
          onClose={() => setConfigTeam(null)}
        />
      )}
    </div>
  )
}
