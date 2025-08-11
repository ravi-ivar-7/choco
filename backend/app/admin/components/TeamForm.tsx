'use client'

import { Button } from '@/components/ui/button'

interface Team {
  id: string
  name: string
  description?: string
  platformAccountId: string
  createdAt: string
  updatedAt: string
}

interface TeamFormProps {
  team?: Team | null
  onSubmit: (teamData: { name: string; description?: string; platformAccountId: string }) => Promise<void>
  onCancel: () => void
}

export default function TeamForm({ team, onSubmit, onCancel }: TeamFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    await onSubmit({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      platformAccountId: formData.get('platformAccountId') as string,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {team ? 'Edit Team' : 'Add New Team'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Team Name</label>
              <input 
                name="name" 
                type="text" 
                required 
                defaultValue={team?.name || ''}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Enter team name" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
              <input 
                name="description" 
                type="text" 
                defaultValue={team?.description || ''}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Optional description" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Platform Account ID</label>
              <input 
                name="platformAccountId" 
                type="text" 
                required 
                defaultValue={team?.platformAccountId || ''}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Enter account ID" 
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              {team ? 'Update Team' : 'Create Team'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
