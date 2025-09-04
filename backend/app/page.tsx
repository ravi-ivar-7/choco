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
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Download,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react'

import Footer from '@/components/Footer'

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = () => {
    setIsLoading(true)
    router.push('/dashboard')
  }

  const features = [
    {
      icon: Shield,
      title: 'Encrypted data storage',
      description: 'All your data is stored with advanced encryption',
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
      title: 'Use your storage for data',
      description: 'You can add your own database to store data securely',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="pt-20 pb-8 sm:pt-24  lg:pb-24 min-h-[calc(100vh-4rem)] sm:min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-500/5 to-blue-600/10"></div>
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(circle at 30% 20%, rgba(120,119,198,0.1), transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255,119,198,0.1), transparent 50%)
            `
          }}></div>
          {/* Mobile Background Image */}
          <div className="block sm:hidden absolute inset-0 opacity-10">
            <img 
              src="/images/connected-1_9-16-rbg.png" 
              alt="Choco extension background" 
              className="w-full h-full object-contain object-center"
            />
          </div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-5 py-3 mb-8 shadow-lg border border-purple-200/50">
                <Shield className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-800">Privacy First Session Sync</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 lg:mb-8 bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 bg-clip-text text-transparent leading-[1.1] tracking-tight">
                Sync Your Sessions{' '}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Securely
                </span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 mb-8 lg:mb-10 leading-relaxed font-light max-w-2xl mx-auto lg:mx-0">
                Keep your browsing sessions synchronized across all your devices while maintaining complete privacy and security.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 lg:mb-12">
                <Button size="lg" onClick={handleGetStarted} disabled={isLoading} className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl py-4 px-8 text-lg font-semibold rounded-2xl transform hover:scale-105 transition-all">
                  <Shield className="mr-3 h-5 w-5" />
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.open('https://chromewebstore.google.com/detail/choco-personal-browser-sy/cdlgnfhednemdcnpjpolienfjdolblgm', '_blank')} className="w-full sm:w-auto bg-white/80 backdrop-blur-sm border-slate-200 text-slate-700 hover:bg-white hover:shadow-lg py-4 px-8 text-lg font-semibold rounded-2xl transition-all">
                  <Download className="mr-3 h-5 w-5" />
                  Install Extension
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative max-w-lg mx-auto lg:max-w-none">
                {/* Desktop View */}
                <div className="hidden sm:block">
                  <img 
                    src="/images/connected-1_16-9-rbg.png" 
                    alt="Choco extension dashboard" 
                    className="w-full drop-shadow-2xl rounded-2xl"
                  />
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-xl">
                  <Zap className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-8 sm:mt-16 lg:mt-24 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-3xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-white/50 text-center hover:shadow-xl transition-all">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2">100%</div>
                <div className="text-slate-600 font-medium text-sm sm:text-base">Privacy Protected</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-white/50 text-center hover:shadow-xl transition-all">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1 sm:mb-2">Instant</div>
                <div className="text-slate-600 font-medium text-sm sm:text-base">Synchronization</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-5 py-3 mb-8">
              <Star className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-800">Why Choose Choco</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 lg:mb-8 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Privacy-First Features</h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Built with your privacy as the top priority, designed for seamless cross-device synchronization without compromising your data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const gradients = [
                'from-purple-500 to-pink-500',
                'from-blue-500 to-cyan-500', 
                'from-emerald-500 to-teal-500',
                'from-orange-500 to-red-500'
              ]
              return (
                <div key={index} className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg border border-slate-100 hover:shadow-2xl hover:scale-105 transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className={`w-16 h-16 lg:w-18 lg:h-18 bg-gradient-to-r ${gradients[index % 4]} rounded-2xl flex items-center justify-center mb-6 lg:mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                      <Icon className="h-8 w-8 lg:h-9 lg:w-9 text-white" />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold mb-4 text-slate-900 group-hover:text-slate-800 transition-colors">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-base lg:text-lg group-hover:text-slate-700 transition-colors">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
 

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full px-5 py-3 mb-8">
              <Zap className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-800">Simple Setup</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 lg:mb-8 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Get Started in Minutes</h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Set up your personal session sync in just three simple steps and start enjoying seamless cross-device browsing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
            {howItWorks.map((step, index) => {
              const Icon = step.icon
              const colors = [
                { bg: 'from-purple-500 to-pink-500', border: 'border-purple-200', text: 'text-purple-600' },
                { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-200', text: 'text-blue-600' },
                { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-200', text: 'text-emerald-600' }
              ]
              return (
                <div key={index} className="text-center group relative">
                  <div className="relative mb-8">
                    <div className={`w-24 h-24 lg:w-28 lg:h-28 bg-gradient-to-r ${colors[index].bg} rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500`}>
                      <Icon className="h-12 w-12 lg:h-14 lg:w-14 text-white" />
                    </div>
                    <div className="absolute -top-3 -left-3 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full flex items-center justify-center text-xl font-bold shadow-xl border-4 border-slate-100">
                      <span className={colors[index].text}>{index + 1}</span>
                    </div>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed max-w-sm mx-auto text-base lg:text-lg">{step.description}</p>
                  
                  {/* Connection Line */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-slate-200 to-transparent transform -translate-y-1/2 z-0"></div>
                  )}
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
