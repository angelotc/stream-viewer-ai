import { useRef, useState, useEffect } from 'react';
import { RealtimeTranscriber, RealtimeTranscript } from 'assemblyai/streaming';
import { useRouter } from 'next/router';
import { Transcript } from '@prisma/client';

interface RecordRTC {
  startRecording: () => void;
  pauseRecording: () => void;
  // ... other methods
}

interface AssemblyAITranscript {
  message_type: 'FinalTranscript' | 'PartialTranscript';
  text: string;
  audio_start: number;
}

// Create a client-side only component
const App = () => {
  /** @type {React.MutableRefObject<RealtimeTranscriber>} */
  const realtimeTranscriber = useRef<RealtimeTranscriber | null>(null)
  /** @type {React.MutableRefObject<any>} */
  const recorder = useRef<any>(null)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [transcript, setTranscript] = useState<string>('')
  const [isClient, setIsClient] = useState<boolean>(false)
  const router = useRouter();
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/validate');
        const data = await response.json();
        
        if (!data.authenticated) {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const getToken = async () => {
    try {
      const response = await fetch('/api/assembly-ai/getToken');
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data.token;
    } catch (error) {
      console.error('Error getting token:', error);
      throw error;
    }
  };

  const saveTranscript = async (text: string) => {
    try {
      const response = await fetch('/api/transcripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      const savedTranscript = await response.json();
      setTranscripts(prev => [...prev, savedTranscript]);
    } catch (error) {
      console.error('Failed to save transcript:', error);
    }
  };

  const startTranscription = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    
    if (!isClient) return;

    // Dynamically import RecordRTC
    const { default: RecordRTC } = await import('recordrtc');
    
    realtimeTranscriber.current = new RealtimeTranscriber({
      token: await getToken(),
      sampleRate: 16_000,
    });

    const texts: Record<number, string> = {};
    realtimeTranscriber.current!.on('transcript', (transcript: AssemblyAITranscript) => {
      // only save when transcript is final
      if (transcript.message_type === 'FinalTranscript') {
        let msg = '';
        texts[transcript.audio_start] = transcript.text;
        const keys = Object.keys(texts);
        keys.sort((a, b) => Number(a) - Number(b));
        for (const key of keys) {
          if (texts[Number(key)]) {
            msg += ` ${texts[Number(key)]}`
          }
        }
        setTranscript(msg);
        // Save transcript when it changes
        console.log('Saving transcript:', transcript);
        saveTranscript(msg);
      }
      
    });

    realtimeTranscriber.current?.on('error', (error: Error) => {
      console.error(error);
      realtimeTranscriber.current?.close();
      realtimeTranscriber.current = null;
    });

    realtimeTranscriber.current?.on('close', (code: number, reason: string) => {
      console.log(`Connection closed: ${code} ${reason}`);
      realtimeTranscriber.current = null;
    });

    await realtimeTranscriber.current!.connect();

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
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
            if(!realtimeTranscriber.current) return;
            const buffer = await blob.arrayBuffer();
            realtimeTranscriber.current.sendAudio(buffer);
          },
        });
        recorder.current.startRecording();
      })
      .catch((err) => console.error(err));

    setIsRecording(true)
  }

  const endTranscription = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsRecording(false)

    await realtimeTranscriber.current?.close();
    realtimeTranscriber.current = null;

    recorder.current.pauseRecording();
    recorder.current = null;
  }

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  };

  return (
    <div className="App">
      <header>
        <h1 className="header__title">Real-Time Transcription</h1>
        <p className="header__sub-title">Try AssemblyAI's new real-time transcription endpoint!</p>
      </header>
      <div className="real-time-interface">
        <p id="real-time-title" className="real-time-interface__title">Click start to begin recording!</p>
        {isRecording ? (
          <button className="real-time-interface__button" onClick={endTranscription}>Stop recording</button>
        ) : (
          <button className="real-time-interface__button" onClick={startTranscription}>Record</button>
        )}
      </div>
      <div className="real-time-interface__message">
        {transcript}
      </div>
      <div className="previous-transcripts">
        {transcripts.map((t) => (
          <div key={t.id} className="transcript-item">
            <p>{t.text}</p>
            <small>{new Date(t.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
