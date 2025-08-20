'use client'

import { LayoutDashboard, Building2, Users, Key, User } from 'lucide-react'

type TabType = 'overview' | 'teams' | 'members' | 'credentials' | 'profile'

interface NavigationTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  stats: {
    totalTeams: number
    totalUsers: number
    activeCredentials: number
  }
}

export default function NavigationTabs({ activeTab, onTabChange, stats }: NavigationTabsProps) {
  const tabs = [
    {
      id: 'overview' as TabType,
      name: 'Overview',
      icon: LayoutDashboard,
      count: null
    },
    {
      id: 'teams' as TabType,
      name: 'Teams',
      icon: Building2,
      count: null
    },
    {
      id: 'members' as TabType,
      name: 'Members',
      icon: Users,
      count: null
    },
    {
      id: 'credentials' as TabType,
      name: 'Credentials',
      icon: Key,
      count: null
    },
    {
      id: 'profile' as TabType,
      name: 'Profile',
      icon: User,
      count: null
    }
  ]

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex flex-wrap gap-2 sm:gap-4 md:gap-8">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-2 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{tab.name}</span>
                {tab.count !== null && (
                  <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                    activeTab === tab.id 
                      ? 'text-blue-800 bg-blue-100' 
                      : 'text-gray-600 bg-gray-100'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
