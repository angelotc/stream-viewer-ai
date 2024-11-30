'use client'

import { useEffect, useState } from 'react'
import { User } from '@prisma/client'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isBotEnabled, setIsBotEnabled] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      setError('')
      try {
        const response = await fetch('/api/user/settings')
        if (!response.ok) {
          throw new Error('Failed to fetch settings')
        }
        const data = await response.json()
        setUser(data.user)
        setIsBotEnabled(data.settings?.isBotEnabled ?? false)
      } catch (error) {
        console.error('Failed to fetch settings:', error)
        setError('Failed to load settings. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBotEnabled }),
      })

      if (response.ok) {
        setMessage('Settings saved successfully!')
      } else {
        setMessage('Failed to save settings')
      }
    } catch (error) {
      setMessage('Error saving settings')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
          <button 
            onClick={() => window.location.reload()} 
            className="ml-4 text-sm underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Settings</h1>
      
      <div className="space-y-6 rounded-lg bg-white p-6 shadow">
        <div>
          <h2 className="text-xl font-semibold">User Information</h2>
          <p className="mt-2 text-gray-600">Email: {user.email}</p>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold">AI Assistant Settings</h2>
          <div className="mt-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isBotEnabled}
                onChange={(e) => setIsBotEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <span>Enable AI Assistant</span>
            </label>
          </div>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="border-t pt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
