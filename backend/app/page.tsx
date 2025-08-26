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
      title: 'End-to-End Encryption',
      description: 'Your data is encrypted before leaving your device',
      gradient: 'from-blue-600 to-indigo-600'
    },
    {
      icon: Users,
      title: 'Personal Use Only',
      description: 'Designed for syncing across your own devices',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      icon: Key,
      title: 'No Server Storage',
      description: 'We never store your browsing data or credentials',
      gradient: 'from-emerald-600 to-teal-600'
    },
    {
      icon: Clock,
      title: 'Instant Sync',
      description: 'Sessions sync seamlessly across your devices',
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
      title: 'Create Account',
      description: 'Set up your personal sync account'
    },
    {
      icon: Key,
      title: 'Sync Sessions',
      description: 'Your sessions sync privately across your devices'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/canva-1.jpg" 
            alt="Hero background" 
            className="w-full h-full object-cover object-top sm:object-center"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto px-6 sm:px-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100/95 to-pink-100/95 backdrop-blur-sm rounded-full px-5 py-3 mb-8 shadow-lg border border-white/30">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-800">Privacy First</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 sm:mb-10 text-white drop-shadow-2xl leading-[1.1] tracking-tight">
              Your Sessions, Your Devices,{' '}
              <span className="bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-none">
                Your Privacy
              </span>
            </h1>

            <p className="text-xl sm:text-2xl md:text-3xl text-white/95 mb-10 sm:mb-12 leading-relaxed font-light max-w-4xl mx-auto">
              Keep your sessions synchronized across your devices while maintaining complete privacy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16">
              <Button size="lg" onClick={handleGetStarted} disabled={isLoading} className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-2xl py-4 px-8 text-lg font-semibold rounded-2xl">
                <Shield className="mr-3 h-5 w-5" />
                Access Dashboard
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/register')} className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 py-4 px-8 text-lg font-semibold rounded-2xl shadow-xl">
                <Users className="mr-3 h-5 w-5" />
                Create Account
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.open('https://github.com/ravi-ivar-7/choco/', '_blank')} className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 py-4 px-8 text-lg font-semibold rounded-2xl shadow-xl">
                <Chrome className="mr-3 h-5 w-5" />
                Install Extension
              </Button>
            </div>

            <div className="flex flex-col space-y-6 sm:grid sm:grid-cols-3 sm:gap-8 sm:space-y-0 text-center max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-purple-500/25 to-pink-500/25 rounded-xl p-6 border border-purple-300/40 backdrop-blur-sm hover:from-purple-500/35 hover:to-pink-500/35 transition-all">
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <div className="text-purple-100">Private</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/25 to-cyan-500/25 rounded-xl p-6 border border-blue-300/40 backdrop-blur-sm hover:from-blue-500/35 hover:to-cyan-500/35 transition-all">
                <div className="text-3xl font-bold text-white mb-2">Zero</div>
                <div className="text-blue-100">Data Stored</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/25 to-teal-500/25 rounded-xl p-6 border border-emerald-300/40 backdrop-blur-sm hover:from-emerald-500/35 hover:to-teal-500/35 transition-all">
                <div className="text-3xl font-bold text-white mb-2">Instant</div>
                <div className="text-emerald-100">Sync</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Features Section */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-4 py-2 mb-6">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-800">Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Privacy-First Features</h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Built with your privacy as the top priority, designed for seamless cross-device synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const gradients = [
                'from-purple-500 to-pink-500',
                'from-blue-500 to-cyan-500', 
                'from-emerald-500 to-teal-500',
                'from-orange-500 to-red-500'
              ]
              return (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-white/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  <div className={`w-14 h-14 bg-gradient-to-r ${gradients[index % 4]} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Separator />

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full px-4 py-2 mb-6">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">Simple Setup</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">How It Works</h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Get your personal session sync set up in minutes with our simple three-step process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {howItWorks.map((step, index) => {
              const Icon = step.icon
              const colors = [
                { bg: 'from-purple-500 to-pink-500', border: 'border-purple-200', text: 'text-purple-600' },
                { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-200', text: 'text-blue-600' },
                { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-200', text: 'text-emerald-600' }
              ]
              return (
                <div key={index} className="text-center group">
                  <div className="relative">
                    <div className={`w-20 h-20 bg-gradient-to-r ${colors[index].bg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-all duration-300`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg border-2 border-gray-100">
                      <span className={colors[index].text}>{index + 1}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed max-w-sm mx-auto">{step.description}</p>
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
