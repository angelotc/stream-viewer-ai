'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BiLogoTwitch } from 'react-icons/bi'

const TWITCH_CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const loginStatus = searchParams.get('login')

  useEffect(() => {
    // Check if we have a success parameter
    if (loginStatus === 'success') {
      localStorage.setItem('isAuthenticated', 'true')
      router.push('/')
      return
    }

    // Handle OAuth error
    if (error) {
      localStorage.removeItem('isAuthenticated')
      alert('Authentication failed: ' + error)
    }
  }, [loginStatus, error, router])

  const handleTwitchLogin = () => {
    const scopes = [
      'channel:moderate',
      'chat:edit',
      'chat:read',
      'channel:read:redemptions',
      'user:read:email',
      'moderator:read:chatters',
      'channel:manage:broadcast',
      'channel:read:vips',
      'moderator:manage:chat_messages',
      'channel:bot',
      'channel:manage:moderators',
      'moderator:read:followers',
      'user:read:follows',
      'user:write:chat',
      'user:read:chat',
      'user:bot'
    ].join(' ')

    const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scopes}`
    window.location.href = twitchAuthUrl
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Welcome to StreamAI
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect with your Twitch account to start transcribing
          </p>
        </div>
        
        <div>
          <button
            onClick={handleTwitchLogin}
            className="group relative flex w-full justify-center items-center space-x-2 rounded-md bg-[#9146FF] px-3 py-3 text-sm font-semibold text-white hover:bg-[#7C2BF1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9146FF]"
          >
            <BiLogoTwitch className="h-5 w-5" />
            <span>Login with Twitch</span>
          </button>
        </div>
      </div>
    </div>
  )
}
