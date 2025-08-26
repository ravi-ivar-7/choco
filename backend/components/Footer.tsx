'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Chrome, ArrowRight, Sparkles, Github, Heart, ExternalLink } from 'lucide-react'

export default function Footer() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/login')
  }

  const navigationLinks = [
    { href: '/', label: 'Home' },
    { href: '/docs', label: 'Documentation' },
    { href: 'https://github.com/ravi-ivar-7/choco/', label: 'Extension', external: true },
    { href: '/dashboard', label: 'Dashboard' }
  ]

  const supportLinks = [
    { href: 'https://github.com/ravi-ivar-7/choco/issues', label: 'Report Issues', external: true },
    { href: 'https://github.com/ravi-ivar-7/choco/', label: 'GitHub', external: true },
    { href: '/docs', label: 'Help Center' },
    { href: '/register', label: 'Get Started' }
  ]

  const legalLinks = [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: 'mailto:legal@usechoco.com', label: 'Legal Contact' },
    { href: 'mailto:support@usechoco.com', label: 'Support' }
  ]

  return (
    <footer className="relative bg-gradient-to-br from-slate-50 via-white to-purple-50/30 border-t border-slate-200/60">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none"></div>
      
      <div className="relative container mx-auto px-4 lg:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-4 lg:col-span-5">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                  <span className="text-white font-bold text-xl">🍫</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Choco
                </span>
                <Badge variant="secondary" className="text-xs w-fit bg-purple-50 text-purple-700 border-purple-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Personal Browser Sync
                </Badge>
              </div>
            </div>
            
            <p className="text-slate-600 mb-8 max-w-md leading-relaxed">
              Keep your sessions synchronized across your devices while maintaining complete privacy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="group border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                onClick={() => window.open('https://github.com/ravi-ivar-7/choco/', '_blank')}
              >
                <Chrome className="w-4 h-4 mr-2 group-hover:text-purple-600 transition-colors" />
                Install Extension
                <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
              </Button>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                onClick={handleGetStarted}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2">
            <h4 className="font-semibold text-slate-900 mb-6 text-lg">Navigation</h4>
            <ul className="space-y-4">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    className="group flex items-center text-slate-600 hover:text-purple-600 transition-all duration-200 font-medium"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                    {link.external && (
                      <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-50 transition-opacity" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support Links */}
          <div className="col-span-1 md:col-span-1 lg:col-span-3">
            <h4 className="font-semibold text-slate-900 mb-6 text-lg">Support</h4>
            <ul className="space-y-4">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    className="group flex items-center text-slate-600 hover:text-purple-600 transition-all duration-200 font-medium"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                    {link.external && (
                      <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-50 transition-opacity" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal Links */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-slate-900 mb-6 text-lg">Legal</h4>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href}
                    className="group flex items-center text-slate-600 hover:text-purple-600 transition-all duration-200 font-medium"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-slate-200/60 mt-16 pt-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm text-slate-500">
              <p>© {new Date().getFullYear()} Choco. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <a href="/privacy" className="hover:text-purple-600 transition-colors">Privacy Policy</a>
                <a href="/terms" className="hover:text-purple-600 transition-colors">Terms of Service</a>
              </div>
              <div className="flex items-center gap-1">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>for personal sync</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
