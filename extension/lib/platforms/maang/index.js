class MaangPlatform {
    static PLATFORM_URLS = [
        'https://maang.in/*',
        'https://*.maang.in/*'
    ]
    
    static PLATFORM_API_BASE = 'https://maang.in/api'
    
    static async getCookiesFromUrl(platformUrl) {
        try {
            const platformCookies = {}
            
            const refreshTokenCookie = await new Promise(resolve => {
                chrome.cookies.get({ url: platformUrl, name: 'refresh_token' }, resolve)
            })
            
            const accessTokenCookie = await new Promise(resolve => {
                chrome.cookies.get({ url: platformUrl, name: 'access_token' }, resolve)
            })
            
            if (refreshTokenCookie) {
                platformCookies.refreshToken = refreshTokenCookie.value
            }
            
            if (accessTokenCookie) {
                platformCookies.accessToken = accessTokenCookie.value
            }
            
            const hasTokens = Object.keys(platformCookies).length > 0
            return {
                success: true,
                error: null,
                message: hasTokens ? 'Platform cookies retrieved successfully' : 'No platform cookies found',
                data: { cookies: platformCookies }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Cookie error',
                message: `Failed to get platform cookies: ${error.message}`,
                data: null
            }
        }
    }

    static async setCookiesToUrl(platformUrl, tokens) {
        try {
            const results = []
            
            // Set refresh token cookie
            if (tokens.refreshToken) {
                const refreshResult = await new Promise(resolve => {
                    chrome.cookies.set({
                        url: platformUrl,
                        name: 'refresh_token',
                        value: tokens.refreshToken,
                        httpOnly: false,
                        secure: true,
                        sameSite: 'lax'
                    }, resolve)
                })
                results.push({ type: 'refresh_token', success: !!refreshResult })
            }
            
            // Set access token cookie
            if (tokens.accessToken) {
                const accessResult = await new Promise(resolve => {
                    chrome.cookies.set({
                        url: platformUrl,
                        name: 'access_token',
                        value: tokens.accessToken,
                        httpOnly: false,
                        secure: true,
                        sameSite: 'lax'
                    }, resolve)
                })
                results.push({ type: 'access_token', success: !!accessResult })
            }
            
            const successCount = results.filter(r => r.success).length
            return {
                success: successCount > 0,
                error: successCount === 0 ? 'Failed to set cookies' : null,
                message: `Successfully set ${successCount} cookie(s)`,
                data: { results, count: successCount }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Cookie error',
                message: `Failed to set platform cookies: ${error.message}`,
                data: null
            }
        }
    }

    static async validateRefreshToken(refreshToken) {
        try {
            // Check if the refresh token is present in browser cookies
            const cookiesResult = await this.getCookiesFromUrl('https://maang.in')
            
            if (!cookiesResult.success) {
                return {
                    success: false,
                    error: 'Cookie access failed',
                    message: 'Unable to access browser cookies',
                    data: null
                }
            }

            const cookies = cookiesResult.data.cookies
            const storedRefreshToken = cookies?.refreshToken

            if (!storedRefreshToken) {
                console.log('No refresh token found in cookies')
                return {
                    success: false,
                    error: 'No refresh token',
                    message: 'Refresh token not found in browser cookies',
                    data: null
                }
            }

            // Check if the provided refresh token matches the one in cookies
            if (refreshToken && refreshToken !== storedRefreshToken) {
                console.log('Token mismatch - provided:', refreshToken, 'stored:', storedRefreshToken)
                return {
                    success: false,
                    error: 'Token mismatch',
                    message: 'Provided refresh token does not match browser cookies',
                    data: null
                }
            }

            return {
                success: true,
                error: null,
                message: 'Refresh token validated successfully',
                data: {
                    refreshToken: storedRefreshToken,
                }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Validation error',
                message: `Refresh token validation failed: ${error.message}`,
                data: null
            }
        }
    }

    static async getMaangTabs() {
        try {
            const tabs = await chrome.tabs.query({ url: this.PLATFORM_URLS })
            return {
                success: true,
                error: null,
                message: `Found ${tabs.length} Maang tabs`,
                data: { tabs }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Tab query error',
                message: `Failed to get Maang tabs: ${error.message}`,
                data: null
            }
        }
    }

    static isMaangDomain(url) {
        try {
            if (!url) {
                return {
                    success: true,
                    error: null,
                    message: 'No URL provided',
                    data: { isMaang: false }
                }
            }
            
            const isMaang = url.includes('maang.in')
            return {
                success: true,
                error: null,
                message: isMaang ? 'URL is Maang domain' : 'URL is not Maang domain',
                data: { isMaang }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Domain check error',
                message: `Failed to check domain: ${error.message}`,
                data: null
            }
        }
    }
}
