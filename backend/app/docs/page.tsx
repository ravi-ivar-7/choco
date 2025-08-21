'use client';

import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const docs = [
  { 
    name: 'Installation & Setup', 
    file: 'installation-setup.md', 
    icon: '🚀',
    description: 'Get started with Choco in minutes',
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    name: 'Usage Guide', 
    file: 'usage-guide.md', 
    icon: '📖',
    description: 'Learn how to use all features',
    color: 'from-purple-500 to-pink-500'
  },
  { 
    name: 'Extensibility Guide', 
    file: 'extensibility.md', 
    icon: '🔧',
    description: 'Extend Choco for your needs',
    color: 'from-green-500 to-emerald-500'
  },
  { 
    name: 'Project Overview', 
    file: 'project.md', 
    icon: '📋',
    description: 'Understand the architecture',
    color: 'from-orange-500 to-red-500'
  }
];

export default function DocsPage() {
  const [selectedDoc, setSelectedDoc] = useState('installation-setup.md');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDoc(selectedDoc);
  }, [selectedDoc]);

  const fetchDoc = async (filename: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/docs/${filename}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const text = await response.text();
      setContent(text);
    } catch (error) {
      setContent(`# Documentation Error

We're having trouble loading this documentation file. 

## 📚 View on GitHub Instead

You can access all documentation directly on our GitHub repository:

**[📖 View Documentation on GitHub →](https://github.com/ravi-ivar-7/choco/blob/master/README.md)**

### Available Documentation:
- [🚀 Installation & Setup](https://github.com/ravi-ivar-7/choco/blob/master/assets/docs/installation-setup.md)
- [📖 Usage Guide](https://github.com/ravi-ivar-7/choco/blob/master/assets/docs/usage-guide.md)
- [🔧 Extensibility Guide](https://github.com/ravi-ivar-7/choco/blob/master/assets/docs/extensibility.md)
- [📋 Project Overview](https://github.com/ravi-ivar-7/choco/blob/master/assets/docs/project.md)

### Need Help?
If you continue experiencing issues, please [open an issue on GitHub](https://github.com/ravi-ivar-7/choco/issues).`);
    }
    setLoading(false);
  };

  const selectedDocInfo = docs.find(doc => doc.file === selectedDoc);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Mobile Menu Button */}
      <div className="lg:hidden sticky top-16 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 py-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="font-medium text-slate-700">Documentation Menu</span>
        </button>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className={`lg:col-span-4 xl:col-span-3 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className={`${sidebarOpen ? 'fixed top-20 left-4 right-4 bottom-4 z-40 lg:sticky lg:top-24 lg:left-auto lg:right-auto lg:bottom-auto' : 'sticky top-24'}`}>
              <div className={`${sidebarOpen ? 'bg-white rounded-2xl shadow-2xl border border-slate-200 h-full overflow-y-auto lg:bg-white/70 lg:backdrop-blur-xl lg:shadow-xl lg:border-white/20 lg:h-auto lg:overflow-visible' : 'bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20'} overflow-hidden`}>
                
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 mb-2">Documentation</h2>
                      <p className="text-sm text-slate-600">Choose a guide to get started</p>
                    </div>
                    {sidebarOpen && (
                      <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                
                <nav className="p-4 space-y-2">
                  {docs.map((doc) => (
                    <button
                      key={doc.file}
                      onClick={() => {
                        setSelectedDoc(doc.file);
                        setSidebarOpen(false);
                      }}
                      className={`group w-full text-left p-4 rounded-xl transition-all duration-300 ${
                        selectedDoc === doc.file
                          ? 'bg-gradient-to-r ' + doc.color + ' text-white shadow-lg transform scale-[1.02]'
                          : 'hover:bg-slate-50 hover:shadow-md hover:transform hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`text-2xl transition-transform group-hover:scale-110 ${
                          selectedDoc === doc.file ? 'drop-shadow-sm' : ''
                        }`}>
                          {doc.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium text-sm mb-1 ${
                            selectedDoc === doc.file ? 'text-white' : 'text-slate-900'
                          }`}>
                            {doc.name}
                          </h3>
                          <p className={`text-xs ${
                            selectedDoc === doc.file ? 'text-white/80' : 'text-slate-500'
                          }`}>
                            {doc.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {/* Content Header */}
              {selectedDocInfo && (
                <div className={`p-6 bg-gradient-to-r ${selectedDocInfo.color} text-white`}>
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl drop-shadow-sm">{selectedDocInfo.icon}</div>
                    <div>
                      <h1 className="text-2xl font-bold mb-1">{selectedDocInfo.name}</h1>
                      <p className="text-white/90 text-sm">{selectedDocInfo.description}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {loading ? (
                <div className="p-12 text-center">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-500 rounded-full animate-spin mx-auto" style={{animationDelay: '0.15s'}}></div>
                  </div>
                  <p className="mt-4 text-slate-600 font-medium">Loading documentation...</p>
                  <p className="text-sm text-slate-400">Please wait while we fetch the content</p>
                </div>
              ) : (
                <div className="p-8 lg:p-12">
                  <div className="prose prose-lg prose-slate max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({children}) => {
                          const id = typeof children === 'string' 
                            ? children.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                            : '';
                          return (
                            <h1 id={id} className="text-4xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-200 scroll-mt-24">
                              {children}
                            </h1>
                          );
                        },
                        h2: ({children}) => {
                          const id = typeof children === 'string' 
                            ? children.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                            : '';
                          return (
                            <h2 id={id} className="text-2xl font-semibold text-slate-800 mt-12 mb-6 pb-2 border-b border-slate-100 scroll-mt-24">
                              {children}
                            </h2>
                          );
                        },
                        h3: ({children}) => {
                          const id = typeof children === 'string' 
                            ? children.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                            : '';
                          return (
                            <h3 id={id} className="text-xl font-semibold text-slate-800 mt-8 mb-4 scroll-mt-24">
                              {children}
                            </h3>
                          );
                        },
                        p: ({children}) => (
                          <p className="text-slate-700 leading-relaxed mb-6">
                            {children}
                          </p>
                        ),
                        code: ({children, className}) => {
                          const isBlock = className?.includes('language-');
                          const [copied, setCopied] = useState(false);
                          
                          const copyToClipboard = async (text: string) => {
                            try {
                              await navigator.clipboard.writeText(text);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            } catch (err) {
                              console.error('Failed to copy text: ', err);
                            }
                          };
                          
                          return isBlock ? (
                            <div className="relative group">
                              <pre className="bg-slate-900 text-slate-100 rounded-xl p-6 overflow-x-auto shadow-lg border border-slate-700">
                                <code className="text-sm font-mono">{children}</code>
                              </pre>
                              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => copyToClipboard(String(children))}
                                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                    copied 
                                      ? 'bg-green-600 text-white' 
                                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                                  }`}
                                >
                                  {copied ? 'Copied!' : 'Copy'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-sm font-mono border">
                              {children}
                            </code>
                          );
                        },
                        blockquote: ({children}) => (
                          <blockquote className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded-r-xl my-6">
                            <div className="text-blue-900">{children}</div>
                          </blockquote>
                        ),
                        ul: ({children}) => (
                          <ul className="space-y-2 mb-6 ml-6">
                            {children}
                          </ul>
                        ),
                        li: ({children}) => (
                          <li className="text-slate-700 relative">
                            <span className="absolute -left-6 top-2 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
                            {children}
                          </li>
                        ),
                        table: ({children}) => (
                          <div className="overflow-x-auto my-8">
                            <div className="inline-block min-w-full shadow-lg rounded-xl overflow-hidden border border-slate-200">
                              <table className="min-w-full bg-white divide-y divide-slate-200">
                                {children}
                              </table>
                            </div>
                          </div>
                        ),
                        thead: ({children}) => (
                          <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                            {children}
                          </thead>
                        ),
                        tbody: ({children}) => (
                          <tbody className="bg-white divide-y divide-slate-100">
                            {children}
                          </tbody>
                        ),
                        tr: ({children}) => (
                          <tr className="hover:bg-slate-50 transition-colors">
                            {children}
                          </tr>
                        ),
                        th: ({children}) => (
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 border-r border-slate-200 last:border-r-0">
                            {children}
                          </th>
                        ),
                        td: ({children}) => (
                          <td className="px-6 py-4 text-sm text-slate-700 border-r border-slate-100 last:border-r-0">
                            <div className="max-w-sm break-words">
                              {children}
                            </div>
                          </td>
                        ),
                        a: ({children, href}) => {
                          // Handle GitHub links - always open externally
                          if (href?.includes('github.com')) {
                            return (
                              <a 
                                href={href}
                                className="text-blue-600 hover:text-blue-800 font-medium underline decoration-blue-200 hover:decoration-blue-400 transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            );
                          }
                          
                          // Handle internal .md file links (with or without anchors)
                          if (href?.includes('.md')) {
                            const [filePart] = href.split('#');
                            const fileName = filePart.split('/').pop();
                            const docExists = docs.find(doc => doc.file === fileName);
                            
                            if (docExists && fileName) {
                              return (
                                <button
                                  onClick={() => setSelectedDoc(fileName)}
                                  className="text-blue-600 hover:text-blue-800 font-medium underline decoration-blue-200 hover:decoration-blue-400 transition-colors cursor-pointer"
                                >
                                  {children}
                                </button>
                              );
                            }
                          }
                          
                          // Handle external links and anchors
                          return (
                            <a 
                              href={href}
                              className="text-blue-600 hover:text-blue-800 font-medium underline decoration-blue-200 hover:decoration-blue-400 transition-colors"
                              target={href?.startsWith('http') ? '_blank' : undefined}
                              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                            >
                              {children}
                            </a>
                          );
                        },
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
