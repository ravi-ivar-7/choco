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
            <div className="pt-4 border-t space-y-3">
              <div className="text-sm text-slate-600">
                <strong>Token Details:</strong>
              </div>
              {tokenInfo.data?.tokens && tokenInfo.data.tokens.length > 0 && (
                <div className="space-y-4">
                  {tokenInfo.data.tokens.map((token: any, index: number) => (
                    <div key={token.id || index} className="w-full bg-slate-50 rounded-lg p-4 border">
                      {/* Header: Token # + Active Badge + Type + Created Date */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-slate-700">
                            Token #{index + 1}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-slate-500">
                            Created: {token.createdAt ? new Date(token.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Metadata: ID + Source */}
                      <div className="flex flex-col sm:flex-row sm:justify-between mb-4 gap-2 sm:gap-6">
                        <div className="text-xs">
                          <span className="font-medium text-slate-600">ID: </span>
                          <span className="text-slate-500 font-mono break-all">
                            {token.id}
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="font-medium text-slate-600">Source: </span>
                          <span className="text-slate-500">
                            {token.tokenSource || 'manual'}
                          </span>
                        </div>
                      </div>

                      {/* Token Values */}
                      <div className="space-y-3">
                        {token.refreshToken && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-600">Refresh Token:</span>
                              {token.refreshTokenExpiresAt && (
                                <span className="text-xs text-slate-400">
                                  Expires: {new Date(token.refreshTokenExpiresAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            <div className="text-xs font-mono bg-white p-2 rounded border break-all text-slate-700">
                              {token.refreshToken}
                            </div>
                          </div>
                        )}

                        {token.accessToken && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-600">Access Token:</span>
                              {token.accessTokenExpiresAt && (
                                <span className="text-xs text-slate-400">
                                  Expires: {new Date(token.accessTokenExpiresAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-mono bg-white p-2 rounded border break-all text-slate-700">
                              {token.accessToken}
                            </div>
                          </div>
                        )}

                        {token.generalToken && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-600">General Token:</span>
                              {token.generalTokenExpiresAt && (
                                <span className="text-xs text-slate-400">
                                  Expires: {new Date(token.generalTokenExpiresAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-mono bg-white p-2 rounded border break-all text-slate-700">
                              {token.generalToken}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
