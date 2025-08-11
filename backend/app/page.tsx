'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  Users, 
  Key, 
  Clock, 
  Lock, 
  ArrowRight,
  Chrome,
  Server,
  Database,
  Zap
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = () => {
    setIsLoading(true)
    router.push('/login')
  }

  const features = [
    {
      icon: Shield,
      title: 'Secure Token Management',
      description: 'AES-256 encrypted tokens stored server-side with secure access control',
      gradient: 'from-blue-600 to-indigo-600'
    },
    {
      icon: Users,
      title: 'Team Access Control',
      description: 'Only authorized team members can access shared tokens',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      icon: Key,
      title: 'Auto Token Refresh',
      description: 'Seamless token validation and refresh for web platforms',
      gradient: 'from-emerald-600 to-teal-600'
    },
    {
      icon: Clock,
      title: 'Real-time Sync',
      description: 'Token updates sync instantly across all team members',
      gradient: 'from-amber-600 to-orange-600'
    }
  ]

  const architecture = [
    {
      icon: Chrome,
      title: 'Browser Extension',
      description: 'Chrome extension for seamless maang.in integration'
    },
    {
      icon: Server,
      title: 'Backend API',
      description: 'Next.js backend with secure token management'
    },
    {
      icon: Database,
      title: 'Encrypted Storage',
      description: 'SQLite database with encrypted token storage'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🍫</span>
            </div>
            <span className="text-xl font-bold">Choco</span>
            <Badge variant="secondary">Team Access Manager</Badge>
          </div>
          <Button onClick={handleGetStarted} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Admin Login'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Secure Team Access Management</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Team Access Manager for{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Web Platforms
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Streamline your team's workflow with secure, automated access management 
              for shared web platform accounts with encrypted storage and secure access control.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" onClick={handleGetStarted} disabled={isLoading}>
                <Shield className="mr-2 h-5 w-5" />
                Access Admin Dashboard
              </Button>
              <Button variant="outline" size="lg">
                <Chrome className="mr-2 h-5 w-5" />
                Install Extension
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-900">AES-256</div>
                <div className="text-sm text-slate-600">Encryption</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">24/7</div>
                <div className="text-sm text-slate-600">Monitoring</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">Real-time</div>
                <div className="text-sm text-slate-600">Sync</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">Security</div>
                <div className="text-sm text-slate-600">Logs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Choco?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Built with security and team collaboration in mind, Choco provides enterprise-grade 
              token management for your team's web platform accounts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Separator />

      {/* Architecture Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Choco consists of three main components working together to provide 
              secure and seamless team access management.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {architecture.map((component, index) => {
              const Icon = component.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Icon className="h-8 w-8 text-slate-700" />
                  </div>
                  <h3 className="font-semibold mb-2">{component.title}</h3>
                  <p className="text-sm text-slate-600">{component.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">🍫</span>
            </div>
            <span className="font-semibold">Choco</span>
          </div>
          <p className="text-sm text-slate-600">
            Secure team access management for web platforms • Built with Next.js & TypeScript
          </p>
        </div>
      </footer>
    </div>
  )
}
