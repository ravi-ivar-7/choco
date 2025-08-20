'use client'

import { Building2, Users, Key, Activity } from 'lucide-react'

interface DashboardStats {
  activeCredentials: number
  totalUsers: number
  totalTeams: number
  lastCredentialUpdate: string
  credentialStatus: 'active' | 'expired' | 'none'
}

interface DashboardStatsProps {
  stats: DashboardStats
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Teams Card */}
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Total Teams</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{stats.totalTeams}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Members Card */}
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Total Members</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Active Credentials Card */}
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Active Credentials</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{stats.activeCredentials}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Key className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
