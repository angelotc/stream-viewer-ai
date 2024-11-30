'use client'

import { useRef, useState, useEffect } from 'react'
import { RealtimeTranscriber } from 'assemblyai'
import { useRouter } from 'next/navigation'
import { Transcript } from '@prisma/client'
import { Button } from '../ui/button'

interface AssemblyAITranscript {
  message_type: 'FinalTranscript' | 'PartialTranscript'
  text: string
  audio_start: number
}

export default function HomePage() {
  const realtimeTranscriber = useRef<RealtimeTranscriber | null>(null)
  const recorder = useRef<any>(null)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [transcript, setTranscript] = useState<string>('')
  const [isClient, setIsClient] = useState<boolean>(false)
  const router = useRouter()
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/validate')
        const data = await response.json()
        
        if (!data.authenticated) {
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const getToken = async () => {
    try {
      console.log("=== Getting AssemblyAI Token ===")
      const response = await fetch('/api/assembly-ai/token')
      console.log("Token response status:", response.status)
      console.log("Token response ok:", response.ok)
      
      const data = await response.json()
      console.log("Token response data:", data)
      console.log("============================")
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to get token')
      }
      return data.token
    } catch (error) {
      console.error('Error getting token:', error)
      throw error
    }
  }

  const saveTranscript = async (text: string) => {
    try {
      const response = await fetch('/api/transcripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })
      const savedTranscript = await response.json()
      setTranscripts(prev => [...prev, savedTranscript])
    } catch (error) {
      console.error('Failed to save transcript:', error)
    }
  }

  const startRecording = async () => {
    if (!isClient) return

    try {
      console.log("=== Starting Recording ===")
      const token = await getToken()
      console.log("Got token, initializing transcriber...")
      
      realtimeTranscriber.current = new RealtimeTranscriber({
        token,
        sampleRate: 16_000,
      })

      console.log("Transcriber initialized, setting up event handlers...")
      const texts: Record<number, string> = {}
      realtimeTranscriber.current.on('transcript', (transcript: AssemblyAITranscript) => {
        // only save when transcript is final
        if (transcript.message_type === 'FinalTranscript') {
          let msg = ''
          texts[transcript.audio_start] = transcript.text
          const keys = Object.keys(texts)
          keys.sort((a, b) => Number(a) - Number(b))
          for (const key of keys) {
            if (texts[Number(key)]) {
              msg += ` ${texts[Number(key)]}`
            }
          }
          setTranscript(msg)
          // Save transcript when it changes
          console.log('Saving transcript:', transcript)
          saveTranscript(msg)
        }
      })

      realtimeTranscriber.current.on('error', (error: Error) => {
        console.error(error)
        setError(error.message)
        realtimeTranscriber.current?.close()
        realtimeTranscriber.current = null
      })

      realtimeTranscriber.current.on('close', (code: number, reason: string) => {
        console.log(`Connection closed: ${code} ${reason}`)
        realtimeTranscriber.current = null
      })

      await realtimeTranscriber.current.connect()

      // Dynamically import RecordRTC
      const { default: RecordRTC } = await import('recordrtc')
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      recorder.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm;codecs=pcm',
        recorderType: RecordRTC.StereoAudioRecorder,
        timeSlice: 250,
        desiredSampRate: 16000,
        numberOfAudioChannels: 1,
        bufferSize: 4096,
        audioBitsPerSecond: 128000,
        ondataavailable: async (blob: Blob) => {
          if (!realtimeTranscriber.current) return
          const buffer = await blob.arrayBuffer()
          realtimeTranscriber.current.sendAudio(buffer)
        },
      })
      recorder.current.startRecording()
      setIsRecording(true)
    } catch (error) {
      console.error('Recording error:', error)
      setError(error instanceof Error ? error.message : 'Failed to start recording')
    }
  }

  const stopRecording = async () => {
    try {
      setIsRecording(false)

      if (realtimeTranscriber.current) {
        await realtimeTranscriber.current.close()
        realtimeTranscriber.current = null
      }

      if (recorder.current) {
        recorder.current.pauseRecording()
        recorder.current = null
      }
    } catch (error) {
      console.error('Stop recording error:', error)
      setError(error instanceof Error ? error.message : 'Failed to stop recording')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Real-Time Transcription</h1>
        <p className="text-gray-600">Try AssemblyAI's real-time transcription!</p>
      </header>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="text-center">
          <p className="mb-4">Click start to begin recording!</p>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-6 py-2 rounded-lg font-medium ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>

        {transcript && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold mb-2">Current Transcript</h2>
            <p>{transcript}</p>
          </div>
        )}

        {transcripts.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Previous Transcripts</h2>
            {transcripts.map((t) => (
              <div key={t.id} className="p-4 bg-white shadow rounded-lg">
                <p>{t.text}</p>
                <small className="text-gray-500">
                  {new Date(t.createdAt).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
