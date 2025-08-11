'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import DashboardStats from './DashboardStats'

interface DashboardStats {
  activeTokens: number
  totalUsers: number
  totalTeams: number
  lastTokenUpdate: string
  tokenStatus: 'active' | 'expired' | 'none'
  recentActivity: number
}

interface OverviewTabProps {
  stats: DashboardStats
  tokenInfo: any
}

function getStatusIcon(status: 'active' | 'expired' | 'none') {
  switch (status) {
    case 'active':
      return CheckCircle
    case 'expired':
      return AlertTriangle
    default:
      return Clock
  }
}

function getStatusColor(status: 'active' | 'expired' | 'none') {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100'
    case 'expired':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export default function OverviewTab({ stats, tokenInfo }: OverviewTabProps) {
  const StatusIcon = getStatusIcon(stats.tokenStatus)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Grid - Responsive */}
      <DashboardStats stats={stats} />

      {/* Token Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Token Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Current Status</span>
            <Badge className={getStatusColor(stats.tokenStatus)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {stats.tokenStatus}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Last Update</span>
            <span className="text-sm text-slate-900">{stats.lastTokenUpdate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Active Tokens</span>
            <Badge className={getStatusColor(stats.tokenStatus)}>
              {stats.activeTokens}
            </Badge>
          </div>
          {tokenInfo && (
            <div className="pt-4 border-t">
              <div className="text-sm text-slate-600">
                <strong>Token Details:</strong> {tokenInfo.details || 'No additional details available'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-600">Teams Created</span>
            <Badge variant="outline">{stats.totalTeams}</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-600">Members Added</span>
            <Badge variant="outline">{stats.totalUsers}</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-600">Recent Actions</span>
            <Badge variant="outline">{stats.recentActivity}</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
