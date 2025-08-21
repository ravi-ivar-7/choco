'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Shield,
  Users,
  Key,
  Clock,
  Chrome,
  Zap
} from 'lucide-react'

import Footer from '@/components/Footer'

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
      title: 'No Password Sharing',
      description: 'Team gets access without seeing passwords',
      gradient: 'from-blue-600 to-indigo-600'
    },
    {
      icon: Users,
      title: 'Multiple Users',
      description: 'Everyone can use the same account at once',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      icon: Key,
      title: 'Always Connected',
      description: 'Never get logged out or lose access',
      gradient: 'from-emerald-600 to-teal-600'
    },
    {
      icon: Clock,
      title: 'Instant Setup',
      description: 'Add team members in seconds',
      gradient: 'from-amber-600 to-orange-600'
    }
  ]

  const howItWorks = [
    {
      icon: Chrome,
      title: 'Install Extension',
      description: 'Add our Chrome extension to your browser'
    },
    {
      icon: Users,
      title: 'Join Your Team',
      description: 'Get invited to your team workspace'
    },
    {
      icon: Key,
      title: 'Access Shared Accounts',
      description: 'Use shared accounts without seeing passwords'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Break The Limit</span>
            </div>

            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Team Account Access{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Share accounts with your team safely. No more password sharing or device limits.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" onClick={handleGetStarted} disabled={isLoading}>
                <Shield className="mr-2 h-5 w-5" />
                Access Dashboard
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/register')}>
                <Users className="mr-2 h-5 w-5" />
                Create Account
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.open('https://github.com/ravi-ivar-7/choco/', '_blank')}>
                <Chrome className="mr-2 h-5 w-5" />
                Install Extension
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-900">100%</div>
                <div className="text-sm text-slate-600">Secure</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">Multi</div>
                <div className="text-sm text-slate-600">Device Access</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">Instant</div>
                <div className="text-sm text-slate-600">Setup</div>
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
            <h2 className="text-3xl font-bold mb-4">Perfect For Teams</h2>

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

      {/* Architecture Secti   Safe team account sharing without password risks.  on */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Get your team connected in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border-2 border-purple-100">
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <Icon className="h-8 w-8 text-slate-700" />
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
