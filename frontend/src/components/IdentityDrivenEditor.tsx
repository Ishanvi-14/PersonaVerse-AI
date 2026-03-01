import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Zap,
  Heart,
  Crown,
  Clock
} from 'lucide-react'
import type { PersonaLayer, GenerationResponse, SupportedPlatform } from '@backend/shared/persona.types'
import { personaService } from '../services/personaService'
import { cn, getPersonaColor, getPlatformIcon } from '../lib/utils'
import { VoiceInput } from './VoiceInput'
import { DownloadAsImage } from '../features/distribution/DownloadAsImage'
import { PlatformFormatter } from '../features/distribution/PlatformFormatter'
import { RemixModal } from '../features/distribution/RemixModal'
import { useAuth } from '../contexts/AuthContext'

interface IdentityDrivenEditorProps {
  className?: string
}

interface EmotionSliders {
  urgency: number
  enthusiasm: number
  formality: number
  authority: number
}

export function IdentityDrivenEditor({ className = '' }: IdentityDrivenEditorProps) {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<PersonaLayer[]>([])
  const [selectedPersona, setSelectedPersona] = useState<PersonaLayer | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<SupportedPlatform>('linkedin')
  const [inputContent, setInputContent] = useState('')
  const [generatedContent, setGeneratedContent] = useState<GenerationResponse | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [isRemixModalOpen, setIsRemixModalOpen] = useState(false)
  const [emotionSliders, setEmotionSliders] = useState<EmotionSliders>({
    urgency: 5,
    enthusiasm: 7,
    formality: 6,
    authority: 6,
  })
  const [targetLanguage, setTargetLanguage] = useState<string>('en')
  const [translatedContent, setTranslatedContent] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)

  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'bn', name: 'Bengali' },
    { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' },
  ]

  const platforms: { id: SupportedPlatform; name: string; description: string }[] = [
    { id: 'linkedin', name: 'LinkedIn', description: 'Professional networking' },
    { id: 'whatsapp', name: 'WhatsApp', description: 'Casual messaging' },
    { id: 'email', name: 'Email', description: 'Formal communication' },
    { id: 'twitter', name: 'Twitter', description: 'Social media posts' },
    { id: 'instagram', name: 'Instagram', description: 'Visual storytelling' },
  ]

  // Load personas on component mount
  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const personaList = await personaService.getPersonas()
        setPersonas(personaList)
        if (personaList.length > 0) {
          setSelectedPersona(personaList[0])
        }
      } catch (error) {
        console.error('Failed to load personas:', error)
      }
    }
    loadPersonas()
  }, [])

  const handleTranscreate = async () => {
    if (!selectedPersona || !inputContent.trim()) return

    setIsGenerating(true)
    setTranslatedContent(null)
    try {
      const response = await personaService.generateContent({
        personaId: selectedPersona.id,
        platform: selectedPlatform,
        content: inputContent,
        emotionSliders: {
          urgency: emotionSliders.urgency,
          enthusiasm: emotionSliders.enthusiasm,
          formality: emotionSliders.formality,
        },
      })
      setGeneratedContent(response)
      
      // Save to history
      await saveToHistory(response)
    } catch (error) {
      console.error('Failed to generate content:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTranslate = async () => {
    if (!generatedContent || targetLanguage === 'en') return

    setIsTranslating(true)
    try {
      const response = await fetch('http://localhost:3001/aws/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: generatedContent.generatedContent,
          targetLanguage,
          sourceLanguage: 'en',
        }),
      })

      const data = await response.json()
      if (data.success) {
        setTranslatedContent(data.data.translatedText)
      }
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  const saveToHistory = async (content: GenerationResponse) => {
    if (!user?.userId) {
      console.warn('Cannot save history: user not authenticated');
      return;
    }

    try {
      await fetch('http://localhost:3001/aws/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          personaId: selectedPersona?.id,
          platform: selectedPlatform,
          inputContent,
          generatedContent: content.generatedContent,
          personaAlignmentScore: content.personaAlignmentScore,
          metadata: content.metadata,
        }),
      })
    } catch (error) {
      console.error('Failed to save history:', error)
    }
  }

  const handleSliderChange = (key: keyof EmotionSliders, value: number) => {
    setEmotionSliders(prev => ({ ...prev, [key]: value }))
  }

  const handleVoiceTranscript = (transcript: string) => {
    const newContent = inputContent ? `${inputContent} ${transcript}` : transcript
    setInputContent(newContent)
    setVoiceError(null)
  }

  const handleVoiceError = (error: string) => {
    setVoiceError(error)
    setTimeout(() => setVoiceError(null), 5000)
  }

  const handleSaveRemix = (remixedContent: string) => {
    setInputContent(remixedContent)
    setIsRemixModalOpen(false)
  }

  const getAlignmentColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50'
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-theme-text-primary mb-2">
          Identity-Driven Content Editor
        </h2>
        <p className="text-theme-text-secondary">
          Transform your ideas with authentic Bharat voice transcreation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Persona Selection */}
          <div className="card">
            <h3 className="font-semibold text-theme-text-primary mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary-500" />
              Select Persona Layer
            </h3>
            <div className="space-y-3">
              {personas.map((persona) => (
                <motion.button
                  key={persona.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPersona(persona)}
                  className={cn(
                    'w-full p-3 rounded-lg border-2 text-left transition-all duration-200',
                    selectedPersona?.id === persona.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-theme-border hover:border-theme-border/60 bg-theme-surface'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getPersonaColor(persona.id) }}
                    />
                    <div>
                      <div className="font-medium text-theme-text-primary">{persona.name}</div>
                      <div className="text-sm text-theme-text-secondary">
                        {Math.round(persona.linguisticDNA.hinglishRatio * 100)}% Hinglish • 
                        {persona.linguisticDNA.cadence} cadence
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Platform Selection */}
          <div className="card">
            <h3 className="font-semibold text-theme-text-primary mb-4">Target Platform</h3>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={cn(
                    'p-3 rounded-lg border text-center transition-all duration-200',
                    selectedPlatform === platform.id
                      ? 'border-primary-500 bg-primary-500/10 text-primary-600'
                      : 'border-theme-border hover:border-theme-border/60 bg-theme-surface text-theme-text-primary'
                  )}
                >
                  <div className="text-lg mb-1">{getPlatformIcon(platform.id)}</div>
                  <div className="text-sm font-medium">{platform.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Emotion Sliders */}
          <div className="card">
            <h3 className="font-semibold text-theme-text-primary mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Emotion Tuning
            </h3>
            <div className="space-y-4">
              {[
                { key: 'urgency' as const, label: 'Urgency', icon: Clock, color: 'text-red-500' },
                { key: 'enthusiasm' as const, label: 'Enthusiasm', icon: Zap, color: 'text-yellow-500' },
                { key: 'formality' as const, label: 'Formality', icon: Crown, color: 'text-blue-500' },
                { key: 'authority' as const, label: 'Authority', icon: Crown, color: 'text-purple-500' },
              ].map(({ key, label, icon: Icon, color }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-theme-text-primary">
                      <Icon className={cn('w-4 h-4', color)} />
                      {label}
                    </label>
                    <span className="text-sm text-theme-text-secondary">{emotionSliders[key]}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={emotionSliders[key]}
                    onChange={(e) => handleSliderChange(key, parseInt(e.target.value))}
                    className="w-full h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer slider-track"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Editor */}
          <div className="card">
            <h3 className="font-semibold text-theme-text-primary mb-4">Your Input</h3>
            <div className="relative">
              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="Enter your content here... (e.g., 'We need to work hard to achieve our quarterly goals')"
                className="w-full h-32 p-4 border border-theme-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-theme-surface text-theme-text-primary placeholder-theme-text-tertiary"
              />
              <div className="absolute top-2 right-2">
                <VoiceInput
                  onTranscript={handleVoiceTranscript}
                  onError={handleVoiceError}
                  disabled={isGenerating}
                />
              </div>
            </div>
            {voiceError && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {voiceError}
              </div>
            )}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-theme-text-secondary">
                {inputContent.length} characters
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTranscreate}
                disabled={!selectedPersona || !inputContent.trim() || isGenerating}
                className={cn(
                  'btn-primary flex items-center gap-2',
                  (!selectedPersona || !inputContent.trim() || isGenerating) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Transcreating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Transcreate
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Generated Output */}
          <AnimatePresence>
            {generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-theme-text-primary">Generated Content</h3>
                  <div className="flex items-center gap-3">
                    <DownloadAsImage 
                      content={generatedContent.generatedContent} 
                      personaName={selectedPersona?.name}
                    />
                    <button
                      onClick={() => setIsRemixModalOpen(true)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Remix
                    </button>
                    <div className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2',
                      getAlignmentColor(generatedContent.personaAlignmentScore)
                    )}>
                      <CheckCircle className="w-4 h-4" />
                      {Math.round(generatedContent.personaAlignmentScore * 100)}% Aligned
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-theme-bg-tertiary rounded-lg mb-4">
                  <p className="text-theme-text-primary leading-relaxed">
                    {generatedContent.generatedContent}
                  </p>
                </div>

                {/* Translation Section */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-blue-900 flex items-center gap-2">
                      <span>🌐</span>
                      AWS Translate (Cultural Transcreation)
                    </h4>
                    <div className="flex items-center gap-2">
                      <select
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        className="px-3 py-1 border border-blue-300 rounded-lg text-sm bg-white"
                      >
                        {supportedLanguages.map(lang => (
                          <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleTranslate}
                        disabled={isTranslating || targetLanguage === 'en'}
                        className={cn(
                          'px-4 py-1 rounded-lg text-sm font-medium transition-colors',
                          isTranslating || targetLanguage === 'en'
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        )}
                      >
                        {isTranslating ? 'Translating...' : 'Translate'}
                      </button>
                    </div>
                  </div>
                  {translatedContent && (
                    <div className="p-3 bg-white border border-blue-300 rounded-lg">
                      <p className="text-gray-800 leading-relaxed">{translatedContent}</p>
                    </div>
                  )}
                  {!translatedContent && targetLanguage !== 'en' && (
                    <p className="text-sm text-blue-700 italic">
                      Select a language and click Translate to see culturally adapted version
                    </p>
                  )}
                </div>

                {/* Platform Formatting Section */}
                <div className="mb-4">
                  <PlatformFormatter content={generatedContent.generatedContent} />
                </div>

                {/* Voice Drift Alert */}
                {generatedContent.voiceDriftAlert && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-800">Voice Drift Alert</div>
                      <div className="text-sm text-yellow-700">{generatedContent.voiceDriftAlert}</div>
                    </div>
                  </div>
                )}

                {/* Audience Simulation */}
                {generatedContent.audienceSimulation && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-theme-text-primary flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Audience Mirror
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {generatedContent.audienceSimulation.map((reaction, index) => (
                        <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="font-medium text-green-800 text-sm">
                            {reaction.demographic}
                          </div>
                          <div className="text-sm text-green-700 mt-1">
                            "{reaction.reaction}"
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="text-xs text-green-600">
                              {Math.round(reaction.confidence * 100)}% confidence
                            </div>
                            <div className="text-xs text-green-600">
                              {Math.round(reaction.culturalResonance * 100)}% cultural resonance
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="mt-4 pt-4 border-t border-theme-border">
                  <div className="flex items-center justify-between text-sm text-theme-text-secondary">
                    <span>Generated in {generatedContent.metadata.processingTimeMs}ms</span>
                    <span>{generatedContent.metadata.modelVersion}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Remix Modal */}
      {generatedContent && (
        <RemixModal
          isOpen={isRemixModalOpen}
          onClose={() => setIsRemixModalOpen(false)}
          content={generatedContent.generatedContent}
          onSave={handleSaveRemix}
        />
      )}
    </div>
  )
}