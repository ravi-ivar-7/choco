'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Lock, Mail, Save, RefreshCw, Calendar, Shield, Users, Activity } from 'lucide-react'

interface UserData {
  user: {
    id: string
    email: string
    name: string
    isActive: boolean
    lastLoginAt?: string
    createdAt: string
    updatedAt: string
  }
  teams: Array<{
    id: string
    name: string
    description?: string
    platformAccountId: string
    role: 'admin' | 'member'
    isOwner: boolean
    joinedAt: string
    createdAt: string
    updatedAt: string
  }>
  teamMembers: Array<any>
  statistics: {
    totalTeams: number
    totalTeamMembers: number
    activeTeamMembers: number
    memberSince: string
    lastLogin?: string
    adminTeams: number
  }
}

export default function ProfileManagement() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Form states
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('choco_token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      if (data.success) {
        setUserData(data.data)
        setName(data.data.user.name)
      } else {
        setError(data.message || 'Failed to load user data')
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
      setError('Failed to load user profile')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [])

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert('Name cannot be empty')
      return
    }

    try {
      setActionLoading('name')
      
      const token = localStorage.getItem('choco_token')
      if (!token) {
        alert('No authentication token found')
        return
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      })

      const result = await response.json()
      if (result.success) {
        await loadUserData() // Refresh user data
        alert('Name updated successfully')
      } else {
        alert(result.message || 'Failed to update name')
      }
    } catch (error) {
      console.error('Failed to update name:', error)
      alert('Failed to update name')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('All password fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters long')
      return
    }

    try {
      setActionLoading('password')
      
      const token = localStorage.getItem('choco_token')
      if (!token) {
        alert('No authentication token found')
        return
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          currentPassword,
          newPassword 
        }),
      })

      const result = await response.json()
      if (result.success) {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        alert('Password updated successfully')
      } else {
        alert(result.message || 'Failed to update password')
      }
    } catch (error) {
      console.error('Failed to update password:', error)
      alert('Failed to update password')
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
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
            onClick={loadUserData}
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

  if (!userData) {
    return (
      <div className="text-center py-8 text-gray-500">
        No user data available
      </div>
    )
  }

  return (
    <div className="  mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <h2 className="text-xl font-semibold text-slate-900">Profile Settings</h2>
      </div>

      {/* User Overview - Compact Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="lg:col-span-2 bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm sm:text-xl">
                {userData.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 truncate">{userData.user.name}</h3>
              <p className="text-sm text-gray-600 flex items-center">
                <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{userData.user.email}</span>
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Activity className="w-3 h-3 mr-1" />
                  <span>{userData.user.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                {userData.user.lastLoginAt && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Last: {new Date(userData.user.lastLoginAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Teams - Compact */}
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Users className="w-4 h-4 mr-1" />
              Teams ({userData.teams?.length || 0})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {userData.teams && userData.teams.length > 0 ? (
                userData.teams.map((team) => (
                  <Badge key={team.id} variant={team.isOwner ? 'default' : 'secondary'} className="text-xs">
                    {team.name} ({team.role})
                    {team.isOwner && ' ★'}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">No teams assigned</span>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            Statistics
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Total Teams</span>
              <span className="text-sm font-medium">{userData.statistics.totalTeams}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Admin Teams</span>
              <span className="text-sm font-medium">{userData.statistics.adminTeams}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Team Members</span>
              <span className="text-sm font-medium">{userData.statistics.totalTeamMembers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Active Members</span>
              <span className="text-sm font-medium">{userData.statistics.activeTeamMembers}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-gray-600 mb-1">Member Since</div>
              <div className="text-sm font-medium">{new Date(userData.statistics.memberSince).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Forms - Side by Side on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Update Name Form */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-medium text-gray-900">Update Name</h3>
          </div>
          
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Enter your full name"
                disabled={actionLoading === 'name'}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={actionLoading === 'name' || name === userData.user.name}
              className="w-full"
              size="sm"
            >
              {actionLoading === 'name' ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {actionLoading === 'name' ? 'Updating...' : 'Update Name'}
            </Button>
          </form>
        </div>

        {/* Update Password Form */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
          <div className="flex items-center space-x-2 mb-4">
            <Lock className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
          </div>
          
          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Current password"
                disabled={actionLoading === 'password'}
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="New password (min 6 chars)"
                disabled={actionLoading === 'password'}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Confirm new password"
                disabled={actionLoading === 'password'}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={actionLoading === 'password'}
              className="w-full"
              size="sm"
            >
              {actionLoading === 'password' ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              {actionLoading === 'password' ? 'Updating...' : 'Change Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
