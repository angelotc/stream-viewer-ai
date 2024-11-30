'use client'

import { useEffect, useState } from 'react'
import { User } from '@prisma/client'
import { Tooltip } from '../../ui/tooltip'

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
        setIsBotEnabled(data.user?.isBotEnabled ?? false)
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
      <h1 className="mb-8 text-3xl font-bold text-white">Settings</h1>

      <div className="space-y-6 rounded-lg bg-gray-900 p-6 shadow-lg border border-gray-800">

        <h2 className="text-xl font-semibold text-white">AI Assistant Settings</h2>
        <div className="mt-4">
          <Tooltip text="If enabled, 'ViewerAiBot' will automatically join your stream when you go live. If disabled, it will not join or perform any functions.">
            <label className="flex items-center space-x-3 text-gray-300 cursor-help">
              <input
                type="checkbox"
                checked={isBotEnabled}
                onChange={(e) => setIsBotEnabled(e.target.checked)}
                className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Enable AI Assistant</span>
            </label>
          </Tooltip>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded ${message.includes('success')
              ? 'bg-green-900 text-green-200'
              : 'bg-red-900 text-red-200'
            }`}>
            {message}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white rounded-lg shadow-sm transition-colors duration-150 ease-in-out flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
