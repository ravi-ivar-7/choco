'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut, Shield } from 'lucide-react'

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

interface DashboardHeaderProps {
  user: User
  onLogout: () => void
}

export default function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🍫</span>
              </div>
              <span className="text-xl font-bold text-slate-900">Choco</span>
              <Badge variant="secondary">Dashboard</Badge>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-600">{user.email}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-slate-600 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
