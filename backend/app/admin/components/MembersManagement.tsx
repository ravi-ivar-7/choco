'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2 } from 'lucide-react'
import MemberForm from './MemberForm'

interface Team {
  id: string
  name: string
  description?: string
  algozenithAccountId: string
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

interface MembersManagementProps {
  members: Member[]
  teams: Team[]
  onCreateMember: (memberData: { name: string; email: string; role: 'admin' | 'member'; teamId: string }) => Promise<void>
  onUpdateMember: (memberData: { id: string; name: string; email: string; role: 'admin' | 'member'; teamId: string; isActive: boolean }) => Promise<void>
  onDeleteMember: (memberId: string) => Promise<void>
}

export default function MembersManagement({ 
  members, 
  teams, 
  onCreateMember, 
  onUpdateMember, 
  onDeleteMember 
}: MembersManagementProps) {
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  const handleCreateMember = async (memberData: { name: string; email: string; role: 'admin' | 'member'; teamId: string }) => {
    await onCreateMember(memberData)
    setShowMemberForm(false)
  }

  const handleUpdateMember = async (memberData: { name: string; email: string; role: 'admin' | 'member'; teamId: string; isActive?: boolean }) => {
    if (editingMember) {
      await onUpdateMember({ 
        ...memberData, 
        id: editingMember.id,
        isActive: memberData.isActive ?? true // Default to true if not provided
      })
      setEditingMember(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Members Management</h2>
        <Button onClick={() => setShowMemberForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
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
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteMember(member.id)}
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

      {/* Member Form Modal */}
      {(showMemberForm || editingMember) && (
        <MemberForm
          member={editingMember}
          teams={teams}
          onSubmit={editingMember ? handleUpdateMember : handleCreateMember}
          onCancel={() => {
            setShowMemberForm(false)
            setEditingMember(null)
          }}
        />
      )}
    </div>
  )
}
