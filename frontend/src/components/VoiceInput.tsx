/**
 * Voice Input Component
 * 
 * Reusable microphone button for voice-to-text transcription
 * Features:
 * - Orange-to-green gradient design
 * - Recording indicator (red pulse)
 * - Loading spinner during transcription
 * - 2-minute recording limit
 * - Error handling
 */

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onError,
  className = '',
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_RECORDING_TIME = 120; // 2 minutes in seconds

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        await handleRecordingComplete();
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          
          // Auto-stop at 2 minutes
          if (newTime >= MAX_RECORDING_TIME) {
            stopRecording();
          }
          
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to access microphone';
      onError?.(errorMsg);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleRecordingComplete = async () => {
    if (audioChunksRef.current.length === 0) {
      onError?.('No audio recorded');
      setRecordingTime(0);
      return;
    }

    setIsTranscribing(true);

    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
      
      // Create form data
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // Send to backend
      const response = await fetch('http://localhost:3001/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.transcript) {
        onTranscript(data.transcript);
      } else {
        throw new Error(data.error || 'Transcription failed');
      }

    } catch (error) {
      console.error('Transcription error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to transcribe audio';
      onError?.(errorMsg);
    } finally {
      setIsTranscribing(false);
      setRecordingTime(0);
      audioChunksRef.current = [];
    }
  };

  const handleClick = () => {
    if (disabled || isTranscribing) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isTranscribing}
        className={`
          relative p-2 rounded-lg transition-all duration-200
          ${isRecording 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-gradient-to-r from-orange-400 to-green-400 hover:from-orange-500 hover:to-green-500'
          }
          ${(disabled || isTranscribing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        title={isRecording ? 'Stop recording' : 'Start voice recording'}
      >
        {isTranscribing ? (
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        ) : (
          <Mic className={`w-5 h-5 text-white ${isRecording ? 'animate-pulse' : ''}`} />
        )}
        
        {/* Recording indicator dot */}
        {isRecording && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-ping" />
        )}
      </button>

      {/* Recording timer */}
      {isRecording && (
        <span className="ml-2 text-sm font-mono text-red-600 font-semibold">
          {formatTime(recordingTime)} / {formatTime(MAX_RECORDING_TIME)}
        </span>
      )}

      {/* Transcribing indicator */}
      {isTranscribing && (
        <span className="ml-2 text-sm text-gray-600">
          Transcribing...
        </span>
      )}
    </div>
  );
};
