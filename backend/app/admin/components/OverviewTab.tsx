'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, RefreshCw } from 'lucide-react'
import DashboardStats from './DashboardStats'

interface StatsData {
  activeCredentials: number
  totalUsers: number
  totalTeams: number
  lastCredentialUpdate: string
  credentialStatus: 'active' | 'none'
}

function getStatusIcon(status: 'active' | 'none') {
  switch (status) {
    case 'active':
      return CheckCircle
    default:
      return Clock
  }
}

export default function OverviewTab() {
  const [stats, setStats] = useState<StatsData>({
    activeCredentials: 0,
    totalUsers: 0,
    totalTeams: 0,
    lastCredentialUpdate: 'Never',
    credentialStatus: 'none'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('choco_token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch('/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.error || 'Failed to load stats')
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
      setError('Failed to load dashboard statistics')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading overview...</p>
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
            onClick={loadStats}
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

  const StatusIcon = getStatusIcon(stats.credentialStatus)

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <DashboardStats stats={stats} />

      {/* Credential Status Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Credential Status</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon className={`h-5 w-5 ${
              stats.credentialStatus === 'active' ? 'text-green-500' : 'text-gray-400'
            }`} />
            <div>
              <p className="text-sm font-medium text-slate-900">
                {stats.credentialStatus === 'active' ? 'Active Credentials' : 'No Active Credentials'}
              </p>
              <p className="text-xs text-slate-500">
                Last updated: {stats.lastCredentialUpdate}
              </p>
            </div>
          </div>
          
          <Badge variant={stats.credentialStatus === 'active' ? 'default' : 'secondary'}>
            {stats.credentialStatus === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        
        <div className="pt-4 border-t mt-4">
          <div className="text-sm text-slate-600 text-center">
            <strong>Quick Summary:</strong> {stats.activeCredentials} active credentials available.
            <br />
            <span className="text-xs text-slate-500 mt-1 block">
              View detailed credential information in the Credentials tab.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
