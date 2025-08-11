'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2 } from 'lucide-react'
import TeamForm from './TeamForm'

interface Team {
  id: string
  name: string
  description?: string
  algozenithAccountId: string
  createdAt: string
  updatedAt: string
}

interface TeamsManagementProps {
  teams: Team[]
  onCreateTeam: (teamData: { name: string; description?: string; algozenithAccountId: string }) => Promise<void>
  onUpdateTeam: (teamData: { id: string; name: string; description?: string; algozenithAccountId: string }) => Promise<void>
  onDeleteTeam: (teamId: string) => Promise<void>
}

export default function TeamsManagement({ teams, onCreateTeam, onUpdateTeam, onDeleteTeam }: TeamsManagementProps) {
  const [showTeamForm, setShowTeamForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)

  const handleCreateTeam = async (teamData: { name: string; description?: string; algozenithAccountId: string }) => {
    await onCreateTeam(teamData)
    setShowTeamForm(false)
  }

  const handleUpdateTeam = async (teamData: { name: string; description?: string; algozenithAccountId: string }) => {
    if (editingTeam) {
      await onUpdateTeam({ ...teamData, id: editingTeam.id })
      setEditingTeam(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Teams Management</h2>
        <Button onClick={() => setShowTeamForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Team
        </Button>
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
                    <Badge variant="outline">ID: {team.algozenithAccountId}</Badge>
                    <span className="text-xs text-gray-500">
                      Created: {new Date(team.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTeam(team)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteTeam(team.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
          onSubmit={editingTeam ? handleUpdateTeam : handleCreateTeam}
          onCancel={() => {
            setShowTeamForm(false)
            setEditingTeam(null)
          }}
        />
      )}
    </div>
  )
}
