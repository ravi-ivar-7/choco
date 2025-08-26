'use client'

import Footer from '@/components/Footer'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="prose prose-lg max-w-none">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">Privacy-First Personal Session Sync</h3>
                        <p className="text-blue-900 leading-relaxed">
                            Choco is designed for personal use to synchronize your sessions across your own devices with end-to-end encryption.
                            We do not store browsing data, credentials, or monitor domains on our servers.
                        </p>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Choco ("we", "our", "us", "Company") operates a privacy-first browser extension and web dashboard (collectively, the "Service") designed
                        for personal session synchronization across your own devices.
                        This Privacy Policy explains our data practices and your privacy rights.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        By using our Service, you agree to the collection and use of information in accordance with this Privacy Policy.
                        If you do not agree with our policies and practices, do not use our Service.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.1 Information You Provide Directly</h3>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Account information (email address, password, name)</li>
                        <li>Team configuration settings</li>
                        <li>Dashboard preferences and settings</li>
                        <li>Support communications and feedback</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.2 Session Data (Personal Devices Only)</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-900 leading-relaxed font-medium">
                            <span className="bg-red-100 px-2 py-1 rounded font-semibold">Critical:</span> We <span className="bg-red-100 px-2 py-1 rounded font-medium">do NOT store, monitor, or have access to</span> your session data, browsing activity, or website domains.
                            We function as an <span className="bg-red-100 px-2 py-1 rounded font-medium">encrypted transport pipe only</span>.
                        </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-blue-900 leading-relaxed">
                            <span className="bg-blue-100 px-2 py-1 rounded font-medium">User Control:</span> Data collection only occurs when you explicitly opt-in and configure specific data types through your dashboard settings.
                            By default, <span className="bg-blue-100 px-2 py-1 rounded font-medium">no data is collected</span> until you choose to enable it.
                        </p>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4">When you choose to sync data between your personal devices and configure data collection in your dashboard, the extension may collect and handle:</p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><span className="bg-gray-100 px-1 py-0.5 rounded text-sm">Browser cookies</span> (specific cookies or all cookies based on configuration)</li>
                        <li><span className="bg-gray-100 px-1 py-0.5 rounded text-sm">localStorage data</span> (specific keys or full localStorage based on configuration)</li>
                        <li><span className="bg-gray-100 px-1 py-0.5 rounded text-sm">sessionStorage data</span> (specific keys or full sessionStorage based on configuration)</li>
                        <li><span className="bg-gray-100 px-1 py-0.5 rounded text-sm">Browser fingerprint</span> (canvas, screen resolution, timezone, language preferences)</li>
                        <li><span className="bg-gray-100 px-1 py-0.5 rounded text-sm">Geolocation data</span> (latitude, longitude, accuracy if permission granted)</li>
                        <li><span className="bg-gray-100 px-1 py-0.5 rounded text-sm">IP address</span> (local network IP via WebRTC)</li>
                        <li><span className="bg-gray-100 px-1 py-0.5 rounded text-sm">User agent string</span> (browser and OS information)</li>
                        <li><span className="bg-gray-100 px-1 py-0.5 rounded text-sm">Platform information</span> (operating system details)</li>
                        <li><span className="bg-gray-100 px-1 py-0.5 rounded text-sm">Browser details</span> (name, version)</li>
                        <li><span className="bg-gray-100 px-1 py-0.5 rounded text-sm">Device identifiers</span> (for sync coordination)</li>
                        <li><span className="bg-gray-100 px-1 py-0.5 rounded text-sm">Sync timestamps</span> (when data was last synchronized)</li>
                    </ul>


                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2.3 Automatically Collected Information</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700">
                        <li>Log data (IP addresses, browser type, access times)</li>
                        <li>Usage analytics (feature usage, error reports)</li>
                        <li>Device information (operating system, browser version)</li>
                        <li>Performance metrics (load times, error rates)</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.1 Primary Purposes</h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <ul className="list-disc pl-6 text-green-900">
                            <li>Provide <span className="bg-green-100 px-2 py-1 rounded font-medium">encrypted sync functionality</span> across your personal devices</li>
                            <li>Authenticate your <span className="bg-green-100 px-2 py-1 rounded font-medium">individual account access</span> to our sync service</li>
                            <li>Enable <span className="bg-green-100 px-2 py-1 rounded font-medium">personal session continuity</span> between your devices</li>
                            <li>Process and respond to your support requests and communications</li>
                        </ul>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.2 Secondary Purposes</h3>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Improve and optimize our Service performance</li>
                        <li>Detect, prevent, and address technical issues</li>
                        <li>Analyze usage patterns to enhance user experience</li>
                        <li>Provide customer support and technical assistance</li>
                        <li>Send important service notifications and updates</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.3 Data Processing Limitations</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Due to our privacy-first architecture and end-to-end encryption design:
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700">
                        <li>We cannot access or decrypt synchronized session data</li>
                        <li>We do not store browsing history or website information</li>
                        <li>We cannot monitor user activity across websites</li>
                        <li>We do not have access to user credentials or authentication tokens</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Legal Basis for Processing (GDPR)</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">For users in the European Economic Area (EEA) and United Kingdom, we process your personal data based on:</p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Consent:</strong> When you explicitly opt-in to data collection features</li>
                        <li><strong>Contract:</strong> To provide the sync services you've requested</li>
                        <li><strong>Legitimate Interest:</strong> To improve our services and ensure security</li>
                        <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
                    </ul>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-900 leading-relaxed">
                            You may <span className="bg-green-100 px-2 py-1 rounded font-medium">withdraw consent at any time</span> through the dashboard or by contacting us directly.
                        </p>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Data Storage Options</h2>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold text-purple-900 mb-3">🔐 Bring Your Own Database (Maximum Privacy)</h3>
                        <p className="text-purple-900 leading-relaxed mb-4">
                            For users who want complete control over their data storage, you can configure the extension to use your own database:
                        </p>
                        <ul className="list-disc pl-6 text-purple-900 mb-4">
                            <li><span className="bg-purple-100 px-2 py-1 rounded font-medium">Your own Supabase instance</span></li>
                            <li><span className="bg-purple-100 px-2 py-1 rounded font-medium">Your own cloud database</span></li>
                            <li><span className="bg-purple-100 px-2 py-1 rounded font-medium">Our managed service</span> (encrypted, we cannot access)</li>
                        </ul>
                        <p className="text-purple-900 leading-relaxed font-medium">
                            When using your own storage: <span className="bg-purple-100 px-2 py-1 rounded">Your data remains entirely under your control and we have no access to it</span>.
                        </p>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.1 Storage Options</h3>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.2 Service Providers (Infrastructure Only)</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">We may use trusted service providers only for basic infrastructure:</p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Cloud hosting for the extension and dashboard (no session data stored)</li>
                        <li>Email delivery for account notifications</li>
                        <li>Error monitoring (no personal data included)</li>
                        <li>Customer support platforms (only for your direct communications)</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.3 Legal Requirements</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">We may disclose your information if required to do so by law or in response to:</p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Valid legal requests from government authorities</li>
                        <li>Court orders or subpoenas</li>
                        <li>Legal proceedings or investigations</li>
                        <li>Protection of our rights, property, or safety</li>
                        <li>Prevention of fraud or illegal activities</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.4 Business Transfers</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.
                        We will provide notice before your personal information is transferred and becomes subject to a different privacy policy.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Data Security</h2>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.1 Technical Safeguards</h3>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>End-to-end encryption for data in transit (TLS 1.3)</li>
                        <li>AES-256 encryption for data</li> 
                        <li>Secure authentication protocols (OAuth 2.0, JWT)</li>
                        <li>Regular security assessments and penetration testing</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.2 Operational Safeguards</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700">
                        <li>Multi-factor authentication for accounts</li>
                        <li>Regular security updates and monitoring</li>
                        <li>Incident response procedures</li>
                        <li>Secure development practices</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Data Retention</h2>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.1 Retention Periods</h3>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Account Data:</strong> Retained while your account is active and for 30 days after deletion</li>
                        <li><strong>Sync Data:</strong> Retained as configured in your dashboard settings (default: 90 days)</li>
                        <li><strong>Log Data:</strong> Retained for 12 months for security and troubleshooting purposes</li>
                        <li><strong>Support Communications:</strong> Retained for 3 years for quality assurance</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">7.2 Data Deletion</h3>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                        <p className="text-purple-900 leading-relaxed mb-4">You can <span className="bg-purple-100 px-2 py-1 rounded font-medium">request or delete data</span> through:</p>
                        <ul className="list-disc pl-6 text-purple-900">
                            <li>Dashboard → Credentials tab (<span className="bg-purple-100 px-1 py-0.5 rounded text-sm font-mono">Individual or bulk delete stored credentials</span>)</li>
                            <li>Dashboard → Teams tab (<span className="bg-purple-100 px-1 py-0.5 rounded text-sm font-mono">Delete team configurations via team management</span>)</li>
                            <li>Dashboard → Members tab (<span className="bg-purple-100 px-1 py-0.5 rounded text-sm font-mono">Remove member data and permissions</span>)</li>
                            <li>Dashboard → Profile tab (<span className="bg-purple-100 px-1 py-0.5 rounded text-sm font-mono">Update account information or request account deletion</span>)</li>
                            <li>Email request to <span className="bg-purple-100 px-1 py-0.5 rounded text-sm font-mono">privacy@usechoco.com</span></li>
                        </ul>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. International Data Transfers</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Your information may be transferred to and processed in countries other than your country of residence.
                        These countries may have data protection laws that are different from the laws of your country.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        When we transfer your personal information to other countries, we implement appropriate safeguards including:
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700">
                        <li>Standard Contractual Clauses approved by the European Commission</li>
                        <li>Adequacy decisions for transfers to countries with adequate protection</li>
                        <li>Binding Corporate Rules for intra-group transfers</li>
                        <li>Your explicit consent for specific transfers</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Cookies and Tracking Technologies</h2>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.1 Our Use of Cookies</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">We use cookies and similar technologies for:</p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Essential Cookies:</strong> Required for basic functionality (authentication, security)</li>
                        <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                        <li><strong>Analytics Cookies:</strong> Help us understand how you use our Service</li>
                        <li><strong>Performance Cookies:</strong> Monitor and improve Service performance</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.2 Third-Party Cookies</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">We may use third-party services that set cookies:</p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Google Analytics (with IP anonymization)</li>
                        <li>Error tracking services (Sentry, Bugsnag)</li>
                        <li>Customer support platforms</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.3 Cookie Control</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        You can control cookies through your browser settings. Note that disabling certain cookies may affect Service functionality.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Your Privacy Rights</h2>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.1 General Rights</h3>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li><strong>Access:</strong> Request a copy of your personal information</li>
                        <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                        <li><strong>Erasure:</strong> Request deletion of your personal information</li>
                        <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                        <li><strong>Restriction:</strong> Limit how we process your information</li>
                        <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.2 GDPR Rights (EEA/UK Users)</h3>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Right to withdraw consent at any time</li>
                        <li>Right to lodge a complaint with supervisory authorities</li>
                        <li>Right to automated decision-making protection</li>
                        <li>Right to be informed about data processing</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.3 CCPA Rights (California Users)</h3>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Right to know what personal information is collected</li>
                        <li>Right to delete personal information</li>
                        <li>Right to opt-out of sale (we do not sell personal information)</li>
                        <li>Right to non-discrimination for exercising privacy rights</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">10.4 Exercising Your Rights</h3>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                        <p className="text-indigo-900 leading-relaxed">
                            To exercise your privacy rights, contact us at <a href="mailto:privacy@usechoco.com" className="bg-indigo-100 px-2 py-1 rounded text-indigo-800 font-medium underline">privacy@usechoco.com</a>
                            or use the data management tools in your dashboard. We will respond within <span className="bg-indigo-100 px-2 py-1 rounded font-medium">30 days</span> (or as required by applicable law).
                        </p>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Children's Privacy</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Our Service is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16.
                    </p>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <p className="text-orange-900 leading-relaxed">
                            If we become aware that we have collected personal information from a <span className="bg-orange-100 px-2 py-1 rounded font-medium">child under 16</span> without verification of parental consent,
                            we will take steps to <span className="bg-orange-100 px-2 py-1 rounded font-medium">remove that information immediately</span>.
                        </p>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Third-Party Links and Services</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Our Service may contain links to third-party websites or integrate with third-party services.
                        This Privacy Policy does not apply to those external sites or services.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        We encourage you to review the privacy policies of any third-party sites or services before providing them with your personal information.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Data Breach Notification</h2>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-900 leading-relaxed mb-4">
                            In the event of a <span className="bg-red-100 px-2 py-1 rounded font-medium">data breach</span> that poses a risk to your rights and freedoms, we will:
                        </p>
                        <ul className="list-disc pl-6 text-red-900">
                            <li>Notify relevant supervisory authorities within <span className="bg-red-100 px-2 py-1 rounded font-medium">72 hours</span> (where required)</li>
                            <li><span className="bg-red-100 px-2 py-1 rounded font-medium">Inform affected users</span> without undue delay</li>
                            <li>Provide clear information about the nature and scope of the breach</li>
                            <li>Describe measures taken to address the breach and prevent future incidents</li>
                            <li>Offer guidance on steps you can take to protect yourself</li>
                        </ul>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Privacy Policy Changes</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws.
                        When we make material changes, we will:
                    </p>
                    <ul className="list-disc pl-6 mb-4 text-gray-700">
                        <li>Notify you via email (to the address associated with your account)</li>
                        <li>Display a prominent notice in our dashboard</li>
                        <li>Update the "Last Updated" date at the top of this policy</li>
                        <li>Provide at least 30 days notice before material changes take effect</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        Your continued use of the Service after the effective date of changes constitutes acceptance of the updated Privacy Policy.
                    </p>

                    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">15. Contact Information</h2>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">15.1 Data Controller</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <p className="text-gray-900 leading-relaxed">
                            <span className="bg-gray-100 px-2 py-1 rounded font-medium">Choco</span><br />
                            Email: <a href="mailto:privacy@usechoco.com" className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium underline">privacy@usechoco.com</a><br />
                            Legal: <a href="mailto:legal@usechoco.com" className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium underline">legal@usechoco.com</a>
                        </p>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">15.2 Data Protection Officer</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <p className="text-gray-900 leading-relaxed">
                            For <span className="bg-gray-100 px-2 py-1 rounded font-medium">GDPR-related inquiries</span>, contact our Data Protection Officer at:<br />
                            Email: <a href="mailto:dpo@usechoco.com" className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium underline">dpo@usechoco.com</a>
                        </p>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">15.3 Supervisory Authority</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        EEA/UK users have the right to lodge a complaint with their local data protection authority if they believe
                        we have not addressed their privacy concerns adequately.
                    </p>

                    <hr className="my-8 border-gray-300" />

                    <p className="text-sm text-gray-600 mb-4">
                        This Privacy Policy was last updated on January 1, 2025. Previous versions are available upon request.
                    </p>
                    <p className="text-sm text-gray-600">
                        For questions about this Privacy Policy or our privacy practices, please contact us at{' '}
                        <a href="mailto:privacy@usechoco.com" className="text-blue-600 underline">privacy@usechoco.com</a>.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    )
}
