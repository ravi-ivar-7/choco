'use client'

import Footer from '@/components/Footer'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="prose prose-lg max-w-none">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">Personal Browser Sync Service</h3>
                        <p className="text-blue-900 leading-relaxed">
                            These terms govern your use of Choco, a personal browser synchronization service designed for individual use across your own devices.
                        </p>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Definitions and Terminology</h2>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold text-indigo-900 mb-4">Key Terms Used in This Service</h3>
                        <div className="space-y-4 text-indigo-900">
                            <div>
                                <h4 className="font-semibold mb-2">📱 "Teams" refers to:</h4>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li><strong>Account Categories:</strong> Different groupings of your personal accounts (e.g., "Personal", "Work", "Gaming")</li>
                                    <li><strong>Credential Collections:</strong> A way to organize and separate different sets of your login credentials by purpose or context</li>
                                    <li><strong>Sync Groups:</strong> Collections that define which of your personal devices can access which credentials</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">💻 "Members" refers to:</h4>
                                <ul className="list-disc pl-6 space-y-1">
                                    <li><strong>Your Personal Devices:</strong> Your own devices (laptop, desktop, tablet) that sync credentials within an account category</li>
                                    <li><strong>Device Instances:</strong> Different browser instances or profiles on your devices that need credential access</li>
                                    <li><strong>Authorized Endpoints:</strong> Your personal endpoints that can access and sync credential data for a specific account category</li>
                                </ul>
                            </div>
                            <div className="bg-indigo-100 p-3 rounded">
                                <p className="font-medium">Example: You might have a "Gaming" account category with your gaming PC, laptop - all your own devices that need access to your gaming platform logins.</p>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        By accessing or using Choco ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                        If you do not agree to these Terms, you may not use the Service.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        We may update these Terms from time to time. Your continued use of the Service after any changes 
                        constitutes acceptance of the new Terms.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Service Scope and User-Configured Sync</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Choco provides a user-configured browser synchronization service with the following components:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Browser Extension:</strong> Chrome extension that captures and syncs browser sessions, cookies, localStorage, and sessionStorage</li>
                        <li><strong>Web Dashboard:</strong> Interface for managing teams, members, credentials, and sync configurations</li>
                        <li><strong>User-Configured Storage:</strong> You choose where your data is stored</li>
                    </ul>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.1 Storage Configuration Options</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-blue-900 leading-relaxed mb-4">When you opt-in to use the service, you have full control over where your sync data is stored:</p>
                        <ul className="list-disc pl-6 text-blue-900">
                            <li><strong>Bring Your Own Database (BYOD):</strong> Configure your own Supabase, PostgreSQL, or compatible database</li>
                            <li><strong>Your Cloud Storage:</strong> Use your own cloud database instances</li>
                            <li><strong>Managed Service:</strong> Use our encrypted storage service</li>
                        </ul>
                        <p className="text-blue-900 leading-relaxed mt-4 font-medium">All data is stored encrypted regardless of your chosen storage option.</p>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.2 Extension Functionality</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">The browser extension synchronizes:</p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700">
                        <li>Browser cookies and authentication tokens</li>
                        <li>Local storage and session storage data</li>
                        <li>Browser fingerprinting data for session validation</li>
                        <li>Team and member configurations</li>
                        <li>Credential validation and expiry tracking</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Personal Use Only</h2>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <p className="text-amber-900 leading-relaxed font-medium">
                            <strong>Important:</strong> This service is designed for personal use only. You may only sync sessions 
                            across devices that you personally own and control.
                        </p>
                    </div>
                    <ul className="list-disc pl-6 mb-6 text-gray-700">
                        <li>Use the Service only on devices you personally own</li>
                        <li>Do not share your account credentials with others</li>
                        <li>Do not use the Service for commercial purposes</li>
                        <li>Do not attempt to sync sessions for other users</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Account Registration and Credential Handling</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        To use the Service, you must create an account and follow security protocols:
                    </p>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.1 Account Security</h3>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Provide accurate and complete registration information</li>
                        <li>Use strong, unique passwords for your account</li>
                        <li>Enable multi-factor authentication when available</li>
                        <li>Notify us immediately of any unauthorized use</li>
                        <li>You are responsible for all activities under your account</li>
                    </ul>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.2 Extension Credential Handling</h3>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <p className="text-amber-900 leading-relaxed font-medium">
                            <strong>Critical:</strong> The extension handles sensitive browser data including authentication tokens and session cookies.
                        </p>
                    </div>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Token Management:</strong> JWT tokens and refresh tokens are handled securely</li>
                        <li><strong>Cookie Security:</strong> Browser cookies are validated before sync</li>
                        <li><strong>Data Encryption:</strong> All data is stored encrypted in your configured storage</li>
                        <li><strong>Credential Validation:</strong> Extension validates token expiry and authenticity</li>
                        <li><strong>Secure Transmission:</strong> All credential data uses TLS 1.3 encryption in transit</li>
                    </ul>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.3 Your Responsibilities</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700">
                        <li>Only install the extension on devices you personally own and control</li>
                        <li>Regularly review and clean up stored credentials through the dashboard</li>
                        <li>Monitor credential expiry and refresh tokens as needed</li>
                        <li>Report any suspicious activity or unauthorized credential access immediately</li>
                        <li>Keep your browser and extension updated to the latest versions</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Acceptable Use Policy</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.1 Prohibited Activities</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Illegal Content:</strong> Use the Service to sync, store, or transmit any illegal content or data</li>
                        <li><strong>Unauthorized Access:</strong> Attempt to gain unauthorized access to the Service, other users' accounts, or third-party systems</li>
                        <li><strong>Malicious Activities:</strong> Use the Service to transmit malware, viruses, or other harmful code</li>
                        <li><strong>Service Disruption:</strong> Interfere with, disrupt, or overload the Service or its servers</li>
                        <li><strong>Reverse Engineering:</strong> Reverse engineer, decompile, disassemble, or attempt to derive source code</li>
                        <li><strong>Account Sharing:</strong> Share your account credentials or allow others to use your account</li>
                    </ul>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.2 Extension-Specific Restrictions</h3>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>No Credential Harvesting:</strong> Do not use the extension to harvest or collect credentials from other users</li>
                        <li><strong>No Automated Abuse:</strong> Do not create automated systems to abuse the sync functionality</li>
                        <li><strong>No Data Mining:</strong> Do not use the Service to mine or extract data from synchronized sessions</li>
                        <li><strong>Respect Rate Limits:</strong> Do not exceed API rate limits or attempt to circumvent usage restrictions</li>
                    </ul>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.3 Content Responsibility</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-900 leading-relaxed font-medium">
                            You are solely responsible for all content, data, and credentials synchronized through the Service.
                        </p>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Privacy and Data</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Your privacy is important to us. Please review our Privacy Policy to understand how we handle your data:
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-green-900 leading-relaxed font-medium mb-2">
                            <strong>Key Privacy Principles:</strong>
                        </p>
                        <ul className="list-disc pl-6 text-green-900">
                            <li>We do not store your browsing data or credentials on our servers</li>
                            <li>When you opt-in, you configure your own storage or use our encrypted service</li>
                            <li>All data is stored encrypted in your chosen storage location</li>
                            <li>You maintain full control over your data location and access</li>
                        </ul>
                    </div>
                    <ul className="list-disc pl-6 mb-6 text-gray-700">
                        <li>You can delete your data at any time through the dashboard</li>
                        <li>Our Privacy Policy is incorporated into these Terms by reference</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Payment Terms and Licensing</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.1 Service Pricing</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Choco is currently provided as a free service. If we introduce paid features in the future:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>We will provide 30 days advance notice of any pricing changes</li>
                        <li>Existing users will have grandfathered access to current features</li>
                        <li>Premium features will be clearly marked and optional</li>
                    </ul>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.2 License Grant</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Subject to these Terms, we grant you a limited, non-exclusive, non-transferable license to:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Install and use the browser extension on your personal devices</li>
                        <li>Access and use the web dashboard for personal sync management</li>
                        <li>Sync your browser sessions across your own devices</li>
                    </ul>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.3 Future Payment Terms</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-blue-900 leading-relaxed">
                            If paid features are introduced, the following terms will apply:
                        </p>
                        <ul className="list-disc pl-6 text-blue-900 mt-2">
                            <li><strong>Billing:</strong> Monthly or annual subscription billing</li>
                            <li><strong>Refunds:</strong> 14-day refund policy for subscription cancellations</li>
                            <li><strong>Auto-renewal:</strong> Subscriptions auto-renew unless cancelled</li>
                            <li><strong>Price Changes:</strong> 30-day notice for price increases</li>
                        </ul>
                    </div>
                    
                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Service Availability</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        We strive to maintain high availability but cannot guarantee uninterrupted service. 
                        We may temporarily suspend the Service for maintenance, updates, or other operational reasons.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Intellectual Property</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        The Service and its original content, features, and functionality are owned by Choco and are protected by:
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700">
                        <li>Copyright, trademark, and other intellectual property laws</li>
                        <li>International copyright treaties and conventions</li>
                        <li>Other proprietary rights</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Disclaimers</h2>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-900 leading-relaxed font-medium">
                            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
                            INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                            OR NON-INFRINGEMENT.
                        </p>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Limitation of Liability</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        IN NO EVENT SHALL CHOCO BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
                        OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, 
                        OR OTHER INTANGIBLE LOSSES.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Termination and Data Deletion</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">12.1 Termination by Us</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        We may terminate or suspend your account immediately, without prior notice, for:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Violation of these Terms or Acceptable Use Policy</li>
                        <li>Fraudulent, abusive, or illegal activity</li>
                        <li>Security breaches or compromised accounts</li>
                        <li>Extended periods of inactivity (12+ months)</li>
                    </ul>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">12.2 Termination by You</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        You may terminate your account at any time through:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Dashboard → Profile tab → Account deletion</li>
                        <li>Email request to support@usechoco.com</li>
                    </ul>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">12.3 Data Deletion Upon Termination</h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-green-900 leading-relaxed font-medium">
                            Upon account termination, the following data deletion timeline applies:
                        </p>
                    </div>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Immediate:</strong> Account access is revoked and login disabled</li>
                        <li><strong>Within 24 hours:</strong> Synchronized credentials and session data are deleted</li>
                        <li><strong>Within 7 days:</strong> Account information and preferences are permanently deleted</li>
                        <li><strong>Within 30 days:</strong> All backup copies and log references are purged</li>
                        <li><strong>BYOD Users:</strong> Data in your own database remains under your control</li>
                    </ul>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">12.4 Data Export Before Termination</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        Before deleting your account, you can export your data through the dashboard. 
                        We recommend exporting any important configurations or team settings you wish to preserve.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Governing Law and Dispute Resolution</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">13.1 Dispute Resolution Process</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-blue-900 leading-relaxed font-medium">
                            We encourage resolving disputes through the following process:
                        </p>
                    </div>
                    <ol className="list-decimal pl-6 mb-4 text-gray-700">
                        <li><strong>Direct Contact:</strong> Contact us at legal@usechoco.com to discuss the issue</li>
                        <li><strong>Good Faith Negotiation:</strong> We will attempt to resolve disputes within 30 days</li>
                        <li><strong>Mediation:</strong> If direct negotiation fails, disputes may go to mediation</li>
                        <li><strong>Arbitration:</strong> Binding arbitration as a final resort for unresolved disputes</li>
                    </ol>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">13.2 Jurisdiction and Venue</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Any legal proceedings shall be conducted in accordance with applicable laws. 
                        You consent to the personal jurisdiction of appropriate courts.
                    </p>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">13.3 Class Action Waiver</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        You agree that any dispute resolution proceedings will be conducted only on an individual basis 
                        and not in a class, consolidated, or representative action.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">15. Contact Information</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        If you have any questions about these Terms, please contact us:
                    </p>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8">
                        <ul className="list-none text-gray-700 space-y-2">
                            <li><strong>Email:</strong> legal@usechoco.com</li>
                            <li><strong>Support:</strong> support@usechoco.com</li>
                            <li><strong>Website:</strong> https://usechoco.com</li>
                        </ul>
                    </div>

                    <div className="border-t border-gray-200 pt-6 mt-8">
                        <p className="text-sm text-gray-500 text-center">
                            By using Choco, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}
