/**
 * AWS-Powered Dashboard
 * 
 * Production-ready interface for:
 * - Voice-to-text transcription (10+ Indian languages)
 * - Multilingual content generation
 * - User history tracking
 * - Digital Soul evolution
 */

import React, { useState, useRef } from 'react';
import { Mic, Globe, History, User, Sparkles, Languages, Brain } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  awsCode: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', awsCode: 'en-IN' },
  { code: 'hi', name: 'हिन्दी (Hindi)', awsCode: 'hi-IN' },
  { code: 'ta', name: 'தமிழ் (Tamil)', awsCode: 'ta-IN' },
  { code: 'te', name: 'తెలుగు (Telugu)', awsCode: 'te-IN' },
  { code: 'bn', name: 'বাংলা (Bengali)', awsCode: 'bn-IN' },
  { code: 'mr', name: 'मराठी (Marathi)', awsCode: 'mr-IN' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)', awsCode: 'gu-IN' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', awsCode: 'kn-IN' },
  { code: 'ml', name: 'മലയാളം (Malayalam)', awsCode: 'ml-IN' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', awsCode: 'pa-IN' }
];

const PLATFORMS = ['linkedin', 'twitter', 'instagram', 'whatsapp', 'email'];
const PERSONAS = ['founder', 'educator', 'friend', 'professional', 'creator'];

export function AWSPoweredDashboard() {
  const [activeTab, setActiveTab] = useState<'voice' | 'text' | 'history'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  // Form state
  const [userId] = useState('demo-user-' + Date.now());
  const [personaId, setPersonaId] = useState('founder');
  const [platform, setPlatform] = useState('linkedin');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [textInput, setTextInput] = useState('');
  
  // Results state
  const [transcription, setTranscription] = useState<any>(null);
  const [generation, setGeneration] = useState<any>(null);
  const [translation, setTranslation] = useState<any>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Microphone access denied. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process voice to content
  const processVoiceToContent = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('userId', userId);
      formData.append('personaId', personaId);
      formData.append('platform', platform);
      formData.append('targetLanguage', targetLanguage);
      formData.append('autoDetectLanguage', 'true');

      const response = await fetch('http://localhost:3001/aws/voice-to-content', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setTranscription(result.data.transcription);
        setGeneration(result.data.generation);
        setTranslation(result.data.translation);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Voice processing failed:', error);
      alert('Failed to process voice. Check if backend is running.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Process text to content
  const processTextToContent = async () => {
    if (!textInput.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:3001/aws/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textInput,
          userId,
          personaId,
          platform,
          targetLanguage,
          sourceLanguage: 'en',
          domain: 'general'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneration(result.data.generation);
        setTranslation(result.data.translation);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Text processing failed:', error);
      alert('Failed to process text. Check if backend is running.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Load user history
  const loadUserHistory = async () => {
    try {
      const response = await fetch(`http://localhost:3001/aws/history/${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setUserHistory(result.data.entries);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  // Load user profile
  const loadUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3001/aws/profile/${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setUserProfile(result.data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Sparkles className="text-purple-600" />
            AWS-Powered PersonaVerse
          </h1>
          <p className="text-gray-600">
            Voice transcription • Multilingual generation • Cultural transcreation • History tracking
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'voice'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Mic size={20} />
            Voice Input
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'text'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Globe size={20} />
            Text Input
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              loadUserHistory();
              loadUserProfile();
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <History size={20} />
            History & Profile
          </button>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Brain size={20} className="text-purple-600" />
            Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Persona
              </label>
              <select
                value={personaId}
                onChange={(e) => setPersonaId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {PERSONAS.map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {PLATFORMS.map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Languages size={16} />
                Target Language
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'voice' && (
          <div className="space-y-6">
            {/* Voice Recording */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Voice to Content</h2>
              <div className="flex flex-col items-center gap-6">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                  isRecording ? 'bg-red-500 animate-pulse' : 'bg-purple-600'
                }`}>
                  <Mic size={48} className="text-white" />
                </div>
                
                <div className="flex gap-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      disabled={isProcessing}
                      className="px-8 py-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-all"
                    >
                      Start Recording
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="px-8 py-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
                    >
                      Stop Recording
                    </button>
                  )}
                  
                  {audioBlob && !isRecording && (
                    <button
                      onClick={processVoiceToContent}
                      disabled={isProcessing}
                      className="px-8 py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-all"
                    >
                      {isProcessing ? 'Processing...' : 'Process Audio'}
                    </button>
                  )}
                </div>

                {audioBlob && (
                  <div className="text-center text-sm text-gray-600">
                    Audio recorded ({(audioBlob.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
            </div>

            {/* Transcription Result */}
            {transcription && (
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="font-bold text-lg mb-2 text-blue-900">Transcription</h3>
                <p className="text-gray-800 mb-2">{transcription.text}</p>
                <div className="text-sm text-gray-600">
                  Language: {transcription.language} • Confidence: {(transcription.confidence * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-6">
            {/* Text Input */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Text to Content</h2>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter your prompt here... (e.g., 'Share thoughts on quarterly goals')"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <button
                onClick={processTextToContent}
                disabled={isProcessing || !textInput.trim()}
                className="mt-4 px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-all"
              >
                {isProcessing ? 'Generating...' : 'Generate Content'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* User Profile */}
            {userProfile && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <User size={24} className="text-purple-600" />
                  Digital Soul Profile
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Generations</div>
                    <div className="text-3xl font-bold text-purple-600">
                      {userProfile.profile.statistics.totalGenerations}
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Dominant Language</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {userProfile.insights.dominantLanguage.toUpperCase()}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Avg Engagement</div>
                    <div className="text-3xl font-bold text-green-600">
                      {userProfile.profile.statistics.avgEngagementScore.toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">Evolution Trend</div>
                  <div className="text-lg text-gray-900">{userProfile.insights.evolutionTrend}</div>
                </div>
              </div>
            )}

            {/* History */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Recent History</h2>
              {userHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No history yet. Generate some content!</p>
              ) : (
                <div className="space-y-4">
                  {userHistory.map((entry, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-gray-900">{entry.platform} • {entry.personaId}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Input: {entry.input.text.substring(0, 100)}...
                      </div>
                      <div className="text-sm text-gray-800">
                        Output: {entry.output.text.substring(0, 150)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Generation Results */}
        {generation && (activeTab === 'voice' || activeTab === 'text') && (
          <div className="space-y-6">
            {/* Generated Content */}
            <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
              <h3 className="font-bold text-lg mb-4 text-green-900">Generated Content</h3>
              <p className="text-gray-800 mb-4 whitespace-pre-wrap">{generation.content}</p>
              
              {/* Persona Alignment */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Linguistic</div>
                  <div className="text-lg font-bold text-green-600">
                    {(generation.personaAlignment.linguisticMatch * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Values</div>
                  <div className="text-lg font-bold text-green-600">
                    {(generation.personaAlignment.valueAlignment * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Emotional</div>
                  <div className="text-lg font-bold text-green-600">
                    {(generation.personaAlignment.emotionalConsistency * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Overall</div>
                  <div className="text-lg font-bold text-purple-600">
                    {(generation.personaAlignment.overallScore * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Cultural Adaptations */}
              {generation.culturalAdaptations && generation.culturalAdaptations.length > 0 && (
                <div className="bg-white rounded-lg p-4">
                  <div className="font-medium text-gray-900 mb-2">Cultural Transcreation Applied:</div>
                  {generation.culturalAdaptations.map((adapt: any, idx: number) => (
                    <div key={idx} className="text-sm text-gray-700 mb-1">
                      • "{adapt.original}" → "{adapt.adapted}" ({adapt.reason})
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Translation */}
            {translation && (
              <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
                <h3 className="font-bold text-lg mb-2 text-yellow-900">
                  Translation ({translation.language})
                </h3>
                <p className="text-gray-800 mb-2">{translation.text}</p>
                {translation.transcreationApplied && (
                  <div className="text-sm text-gray-600">
                    ✨ Cultural transcreation applied • {translation.metaphorsReplaced.length} metaphors adapted
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
