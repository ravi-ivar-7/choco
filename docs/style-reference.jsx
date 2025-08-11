'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, X, Clock, TrendingUp, Zap, ArrowRight,
  Palette, BookOpen, Layers, User, Settings, Crown,
  FileText, Image, Video, Code, Sparkles
} from 'lucide-react'
import { Button } from '@/coreflow/components/ui/button'
import { Badge } from '@/coreflow/components/ui/badge'
import { Separator } from '@/coreflow/components/ui/separator'
import InlineSpinner from '@/coreflow/components/loaders/InlineSpinner'

const recentSearches = [
  'AI workflow automation',
  'Image generation prompts',
  'Data visualization templates',
  'API integration guides'
]

const trendingSearches = [
  'GPT-4 prompts',
  'Midjourney styles',
  'Workflow templates',
  'Canvas automation',
  'AI art generation'
]

const quickActions = [
  {
    icon: Palette,
    title: 'Create New Canvas',
    description: 'Start building a workflow',
    href: '/canvas/new',
    gradient: 'from-purple-600 to-pink-600'
  },
  {
    icon: BookOpen,
    title: 'Browse Library',
    description: 'Explore prompt collections',
    href: '/library',
    gradient: 'from-blue-600 to-indigo-600'
  },
  {
    icon: Layers,
    title: 'Public Gallery',
    description: 'Discover community creations',
    href: '/gallery',
    gradient: 'from-emerald-600 to-teal-600'
  },
  {
    icon: User,
    title: 'My Profile',
    description: 'Manage your account',
    href: '/profile',
    gradient: 'from-amber-600 to-orange-600'
  }
]

const searchCategories = [
  { icon: FileText, label: 'Templates', count: 234 },
  { icon: Image, label: 'Images', count: 156 },
  { icon: Video, label: 'Videos', count: 89 },
  { icon: Code, label: 'Code', count: 67 },
  { icon: Sparkles, label: 'AI Models', count: 45 }
]

export function SearchModal({ isOpen, onClose, user, isAuthenticated }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState({})
  const [searchType, setSearchType] = useState('all')
  const [deepSearch, setDeepSearch] = useState(false)
  const [searchMetadata, setSearchMetadata] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const searchInputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (!isOpen) {
          // This would be handled by parent component
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({})
      setSearchMetadata(null)
      setSuggestions([])
      return
    }

    if (query.length < 2) {
      return
    }

    setIsSearching(true)
    
    try {
      const params = new URLSearchParams({
        q: query,
        type: searchType,
        deep: deepSearch.toString(),
        limit: '20'
      })

      const response = await fetch(`/api/search?${params}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setSearchResults(data.results || {})
      setSearchMetadata(data.metadata)
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults({})
      setSearchMetadata(null)
      setSuggestions([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultClick = (href) => {
    router.push(href)
    onClose()
  }

  const handleQuickAction = (href) => {
    router.push(href)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[2vh] md:pt-[8vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-2 md:mx-4 bg-gradient-to-b from-black/95 via-purple-900/20 to-black/95 backdrop-blur-2xl border border-purple-500/30 rounded-2xl md:rounded-3xl shadow-2xl shadow-purple-500/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center p-3 md:p-6 border-b border-white/10">
          <div className="relative flex-1">
            <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-white/60" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search canvases, users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                handleSearch(e.target.value)
              }}
              className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 bg-white/5 border border-white/20 rounded-xl md:rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm md:text-base"
            />
            {isSearching && (
              <div className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2">
                <InlineSpinner variant="ring" size="sm" color="purple" />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-2 md:ml-4 text-white/60 hover:text-white hover:bg-white/10 rounded-lg md:rounded-xl p-2"
          >
            <X className="w-4 md:w-5 h-4 md:h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] md:max-h-[60vh] overflow-y-auto">
          {searchQuery ? (
            /* Search Results and Controls */
            <div className="p-3 md:p-6">
              {/* Search Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 md:mb-4 space-y-2 md:space-y-0">
                <div className="text-white/80 text-xs md:text-sm">
                  {searchMetadata?.total > 0 ? (
                    <>
                      Found {searchMetadata.total} results for "{searchQuery}"
                      {searchMetadata?.isAuthenticated && (
                        <span className="ml-2 text-purple-400">• Full Search</span>
                      )}
                    </>
                  ) : searchQuery.length >= 2 ? (
                    `Searching for "${searchQuery}"...`
                  ) : (
                    'Type at least 2 characters to search'
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        setDeepSearch(!deepSearch)
                        handleSearch(searchQuery)
                      }}
                      className={`px-2 md:px-3 py-1 rounded-lg text-xs transition-all ${
                        deepSearch 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      <Zap className="w-3 h-3 mr-1 inline" />
                      <span className="hidden md:inline">Deep Search</span>
                      <span className="md:hidden">Deep</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search Type Filters - Always visible when searching */}
              <div className="flex space-x-1 md:space-x-2 mb-3 md:mb-4">
                {['all', 'canvases', 'users'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSearchType(type)
                      handleSearch(searchQuery)
                    }}
                    className={`px-2 md:px-3 py-1 rounded-lg text-xs capitalize transition-all ${
                      searchType === type
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {type === 'all' ? 'All' : type}
                  </button>
                ))}
              </div>

              {/* Results or No Results Message */}
              {(searchResults.canvases?.length > 0 || searchResults.users?.length > 0 || searchResults.prompts?.length > 0) ? (
                /* Results Sections */
                <div className="space-y-4 md:space-y-6">
                {/* Canvases */}
                {searchResults.canvases?.length > 0 && (
                  <div>
                    <h3 className="text-white font-medium mb-2 md:mb-3 flex items-center text-sm md:text-base">
                      <Palette className="w-3 md:w-4 h-3 md:h-4 mr-2 text-purple-400" />
                      Canvases ({searchResults.canvases.length})
                    </h3>
                    <div className="space-y-1 md:space-y-2">
                      {searchResults.canvases.map((canvas) => (
                        <button
                          key={canvas.id}
                          onClick={() => handleResultClick(`/canvas/${canvas.id}`)}
                          className="w-full flex items-center space-x-3 md:space-x-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 transition-all group"
                        >
                          <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                            {canvas.thumbnail ? (
                              <img src={canvas.thumbnail} alt={canvas.title} className="w-full h-full object-cover rounded-lg md:rounded-xl" />
                            ) : (
                              <Palette className="w-5 md:w-6 h-5 md:h-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="text-white font-medium group-hover:text-purple-300 transition-colors text-sm md:text-base truncate">
                              {canvas.title}
                            </div>
                            <div className="text-white/60 text-xs md:text-sm line-clamp-1">{canvas.description}</div>
                            <div className="flex items-center space-x-2 md:space-x-4 mt-1 text-xs text-white/40">
                              <span>{canvas.analytics.views} views</span>
                              <span>{canvas.analytics.likes} likes</span>
                              <span className="hidden md:inline">by {canvas.author.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30 text-xs hidden md:inline-flex">
                              {canvas.category}
                            </Badge>
                            <ArrowRight className="w-3 md:w-4 h-3 md:h-4 text-white/40 group-hover:text-white/80 transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Users */}
                {searchResults.users?.length > 0 && (
                  <div>
                    <h3 className="text-white font-medium mb-2 md:mb-3 flex items-center text-sm md:text-base">
                      <User className="w-3 md:w-4 h-3 md:h-4 mr-2 text-blue-400" />
                      Users ({searchResults.users.length})
                    </h3>
                    <div className="space-y-1 md:space-y-2">
                      {searchResults.users.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleResultClick(`/users/${user.id}`)}
                          className="w-full flex items-center space-x-3 md:space-x-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 transition-all group"
                        >
                          <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                            {user.image ? (
                              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 md:w-6 h-5 md:h-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="text-white font-medium group-hover:text-blue-300 transition-colors text-sm md:text-base truncate">
                              {user.name}
                            </div>
                            <div className="text-white/60 text-xs md:text-sm line-clamp-1">{user.bio || 'Canvas creator'}</div>
                            <div className="text-xs text-white/40 mt-1">
                              {user.canvasCount} public canvases
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30 text-xs hidden md:inline-flex">
                              Creator
                            </Badge>
                            <ArrowRight className="w-3 md:w-4 h-3 md:h-4 text-white/40 group-hover:text-white/80 transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prompts */}
                {searchResults.prompts?.length > 0 && (
                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-emerald-400" />
                      Prompts ({searchResults.prompts.length})
                    </h3>
                    <div className="space-y-2">
                      {searchResults.prompts.map((prompt) => (
                        <button
                          key={prompt.id}
                          onClick={() => handleResultClick(`/library/${prompt.id}`)}
                          className="w-full flex items-center space-x-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group"
                        >
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-white font-medium group-hover:text-emerald-300 transition-colors">
                              {prompt.title}
                            </div>
                            <div className="text-white/60 text-sm">{prompt.description}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {prompt.tags?.slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30">
                            {prompt.category}
                          </Badge>
                          <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <div className="text-white/60 text-sm mb-2">Try searching for:</div>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setSearchQuery(suggestion)}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/60 hover:text-white transition-all"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
              ) : (
                /* No Results */
                <div className="text-center py-6 md:py-8">
                  <div className="w-12 md:w-16 h-12 md:h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Search className="w-6 md:w-8 h-6 md:h-8 text-white" />
                  </div>
                  <div className="text-white font-medium mb-2 text-sm md:text-base">No results found</div>
                  <div className="text-white/60 text-xs md:text-sm">Try different keywords or check your spelling</div>
                </div>
              )}
            </div>
          ) : (
            /* Default Content */
            <div className="p-3 md:p-6 space-y-4 md:space-y-6">
              {/* Quick Actions */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">Quick Actions</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action.href)}
                        className="flex items-center space-x-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group"
                      >
                        <div className={`w-10 h-10 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-white font-medium text-sm group-hover:text-purple-300 transition-colors">
                            {action.title}
                          </div>
                          <div className="text-white/60 text-xs">{action.description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <Separator className="bg-white/20" />

              {/* Categories */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Layers className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">Browse Categories</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchCategories.map((category, index) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={index}
                        className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                      >
                        <Icon className="w-4 h-4 text-purple-400" />
                        <span className="text-white text-sm">{category.label}</span>
                        <Badge className="bg-purple-600/20 text-purple-300 text-xs">
                          {category.count}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              </div>

              <Separator className="bg-white/20" />

              {/* Recent & Trending */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Searches */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="w-4 h-4 text-white/60" />
                    <span className="text-white/80 text-sm font-medium">Recent</span>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(search)}
                        className="block w-full text-left px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trending */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-white/80 text-sm font-medium">Trending</span>
                  </div>
                  <div className="space-y-2">
                    {trendingSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(search)}
                        className="block w-full text-left px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 hidden md:block">
          <div className="flex items-center justify-between text-xs text-white/60">
            <div className="flex items-center space-x-4">
              <span>Press <kbd className="px-2 py-1 bg-white/10 rounded">ESC</kbd> to close</span>
              <span>Press <kbd className="px-2 py-1 bg-white/10 rounded">⌘K</kbd> to search</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>Powered by</span>
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-purple-400 font-medium">AI Search</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
