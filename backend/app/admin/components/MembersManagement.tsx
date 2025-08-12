'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react'
import MemberForm from './MemberForm'

interface Team {
  id: string
  name: string
  description?: string
  platformAccountId: string
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

export default function MembersManagement() {
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('choco_token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      // Load both members and teams
      const [membersResponse, teamsResponse] = await Promise.all([
        fetch('/api/members', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/teams', { headers: { 'Authorization': `Bearer ${token}` } })
      ])

      if (!membersResponse.ok || !teamsResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const [membersData, teamsData] = await Promise.all([
        membersResponse.json(),
        teamsResponse.json()
      ])

      if (membersData.success) {
        setMembers(membersData.data.members || [])
      }
      if (teamsData.success) {
        setTeams(teamsData.data.teams || [])
      }
      
      if (!membersData.success || !teamsData.success) {
        setError('Failed to load some data')
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      setError('Failed to load members and teams')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateMember = async (memberData: { name: string; email: string; role: 'admin' | 'member'; teamId: string }) => {
    try {
      setActionLoading('create')
      
      const token = localStorage.getItem('choco_token')
      if (!token) {
        alert('No authentication token found')
        return
      }

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
        await loadData() // Refresh the list
        setShowMemberForm(false)
        alert('Member created successfully')
      } else {
        alert(result.message || 'Failed to create member')
      }
    } catch (error) {
      console.error('Failed to create member:', error)
      alert('Failed to create member')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateMemberWrapper = async (memberData: { name: string; email: string; role: 'admin' | 'member'; teamId: string; isActive?: boolean }) => {
    await handleUpdateMember({ ...memberData, isActive: memberData.isActive ?? true })
  }

  const handleUpdateMember = async (memberData: { name: string; email: string; role: 'admin' | 'member'; teamId: string; isActive: boolean }) => {
    if (!editingMember) return
    
    try {
      setActionLoading(editingMember.id)
      
      const token = localStorage.getItem('choco_token')
      if (!token) {
        alert('No authentication token found')
        return
      }

      const response = await fetch('/api/members', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...memberData, id: editingMember.id }),
      })

      const result = await response.json()
      if (result.success) {
        await loadData() // Refresh the list
        setEditingMember(null)
        alert('Member updated successfully')
      } else {
        alert(result.message || 'Failed to update member')
      }
    } catch (error) {
      console.error('Failed to update member:', error)
      alert('Failed to update member')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member?')) {
      return
    }

    try {
      setActionLoading(memberId)
      
      const token = localStorage.getItem('choco_token')
      if (!token) {
        alert('No authentication token found')
        return
      }

      const response = await fetch(`/api/members?id=${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const result = await response.json()
      if (result.success) {
        await loadData() // Refresh the list
        alert('Member deleted successfully')
      } else {
        alert(result.message || 'Failed to delete member')
      }
    } catch (error) {
      console.error('Failed to delete member:', error)
      alert('Failed to delete member')
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading members...</p>
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
            onClick={loadData}
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
        <h2 className="text-xl font-semibold text-slate-900">Members Management</h2>
        <Button 
          onClick={() => setShowMemberForm(true)}
          disabled={actionLoading === 'create'}
        >
          <Plus className="h-4 w-4 mr-2" />
          {actionLoading === 'create' ? 'Creating...' : 'Add Member'}
        </Button>
      </div>

      <div className="grid gap-4">
        {members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No members found. Add your first team member to get started.
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-3">
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role}
                    </Badge>
                    <Badge variant="outline">{member.teamName}</Badge>
                    <Badge variant={member.isActive ? 'default' : 'secondary'}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Joined: {new Date(member.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingMember(member)}
                    disabled={actionLoading !== null}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteMember(member.id)}
                    disabled={actionLoading === member.id}
                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {actionLoading === member.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Member Form Modal */}
      {(showMemberForm || editingMember) && (
        <MemberForm
          member={editingMember}
          teams={teams}
          onSubmit={editingMember ? handleUpdateMemberWrapper : handleCreateMember}
          onCancel={() => {
            setShowMemberForm(false)
            setEditingMember(null)
          }}
        />
      )}
    </div>
  )
}
