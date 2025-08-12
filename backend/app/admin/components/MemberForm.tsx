'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

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

interface MemberFormProps {
  member?: Member | null
  teams: Team[]
  onSubmit: (memberData: { name: string; email: string; role: 'admin' | 'member'; teamId: string; isActive?: boolean }) => Promise<void>
  onCancel: () => void
}

export default function MemberForm({ member, teams, onSubmit, onCancel }: MemberFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      await onSubmit({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        role: formData.get('role') as 'admin' | 'member',
        teamId: formData.get('teamId') as string,
        isActive: member ? formData.get('isActive') === 'on' : true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {member ? 'Edit Member' : 'Add New Member'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
              <input 
                name="name" 
                type="text" 
                required 
                defaultValue={member?.name || ''}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Enter full name" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input 
                name="email" 
                type="email" 
                required 
                defaultValue={member?.email || ''}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Enter email address" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Role</label>
              <select 
                name="role" 
                required 
                defaultValue={member?.role || 'member'}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Team</label>
              <select 
                name="teamId" 
                required 
                defaultValue={member?.teamId || ''}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            {member && (
              <div>
                <label className="flex items-center space-x-2">
                  <input 
                    name="isActive" 
                    type="checkbox" 
                    defaultChecked={member.isActive}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {member ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                member ? 'Update Member' : 'Create Member'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
