"use client"

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';
import Footer from '@/components/Footer';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
  tags?: string[];
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const faqs: FAQItem[] = [
    {
      question: 'Why was I logged out?',
      answer: (
        <div className="space-y-3">
          <p>This can happen if all your devices remain inactive for an extended period, causing your credentials to expire. When this happens, automatic renewal may not be possible.</p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
            <p className="font-medium text-blue-800 flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>Solution: Simply log in to any one of your devices. Once you do, your session will sync automatically across all your connected devices.</span>
            </p>
          </div>
        </div>
      ),
      tags: ['login', 'session', 'troubleshooting']
    },
    {
      question: 'Why are multiple accounts used for my devices?',
      answer: (
        <div className="space-y-3">
          <p>Multiple accounts allow fine-grained control over your device access. For example:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li className="font-medium">Member-only accounts</li>
            <p className="text-sm text-gray-600 -mt-1 mb-2">Ideal for temporary or shared devices where you need limited access.</p>
            
            <li className="font-medium">Primary accounts</li>
            <p className="text-sm text-gray-600 -mt-1">Best for your personal devices that require full security and seamless syncing capabilities.</p>
          </ul>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-800">💡 This tiered approach ensures optimal security while maintaining convenience across all your devices.</p>
          </div>
        </div>
      ),
      tags: ['accounts', 'security', 'devices']
    },
    {
      question: 'Why was I logged out even when it says "Partial/Full credentials applied"?',
      answer: (
        <div className="space-y-3">
          <p>This typically occurs when the platform's security policies require reauthentication. Common reasons include:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Security policy updates</li>
            <li>Extended period of inactivity</li>
            <li>Unusual activity detection</li>
          </ul>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r">
            <p className="font-medium text-yellow-800 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>Solution: Perform a fresh login on any one of your devices to re-establish your session across all connected devices.</span>
            </p>
          </div>
        </div>
      ),
      tags: ['login', 'credentials', 'troubleshooting']
    },
    {
      question: 'Why does my session work even when it says "Partial credentials applied"?',
      answer: (
        <div className="space-y-3">
          <p>This is a normal security feature that helps maintain your session continuity. Here's what's happening:</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h.01a1 1 0 100-2H10V9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-700">Your session remains active because at least one valid credential is still active. The system uses this to refresh other credentials in the background.</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">The warning simply indicates that while some credentials need refreshing, your active session is not interrupted.</p>
        </div>
      ),
      tags: ['session', 'credentials', 'security']
    }
  ];

  const toggleItem = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    faq.answer?.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Auto-expand first item on mobile for better UX
    if (window.innerWidth < 640 && expandedItems.length === 0 && filteredFAQs.length > 0) {
      setExpandedItems([0]);
    }
  }, [filteredFAQs.length]);

  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? 
      <span key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{part}</span> : 
      part
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12 sm:py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about Choco and how to get the most out of your browser sync experience.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-10 max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="Search questions or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-500">
              {filteredFAQs.length} {filteredFAQs.length === 1 ? 'result' : 'results'} found
            </p>
          )}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden ${
                  expandedItems.includes(index) ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <button
                  className="w-full px-5 py-4 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => toggleItem(index)}
                  aria-expanded={expandedItems.includes(index)}
                  aria-controls={`faq-${index}`}
                >
                  <h2 className="text-lg font-medium text-gray-900 pr-4">
                    {highlightText(faq.question)}
                  </h2>
                  <span className="ml-2 flex-shrink-0 text-gray-400">
                    {expandedItems.includes(index) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </span>
                </button>
                
                <div 
                  id={`faq-${index}`}
                  className={`px-5 pb-5 pt-0 transition-all duration-200 ease-in-out ${
                    expandedItems.includes(index) ? 'block' : 'hidden'
                  }`}
                  aria-hidden={!expandedItems.includes(index)}
                >
                  <div className="text-gray-700 space-y-3">
                    {faq.answer}
                  </div>
                  {faq.tags && faq.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {faq.tags.map((tag, i) => (
                        <span 
                          key={i} 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-gray-500">Try different search terms or check back later.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
