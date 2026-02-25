import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, Users, Zap } from 'lucide-react'
import { PersonaDNAMap } from './features/persona-dna/PersonaDNAMap'
import { IdentityDrivenEditor } from './components/IdentityDrivenEditor'
import AdaptiveDashboard from './features/adaptive-intelligence/AdaptiveDashboard'
import { personaService } from './services/personaService'
import type { PersonaLayer } from '@backend/shared/persona.types'

function App() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaLayer | null>(null)
  const [personas, setPersonas] = useState<PersonaLayer[]>([])
  const [activeTab, setActiveTab] = useState<'editor' | 'dna' | 'adaptive'>('editor')

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

  const features = [
    {
      icon: Brain,
      title: 'Digital Soul Extraction',
      description: 'Multimodal analysis captures your authentic voice patterns',
    },
    {
      icon: Sparkles,
      title: 'Bharat Transcreation',
      description: 'Cultural metaphor replacement with the "Sixer Rule"',
    },
    {
      icon: Users,
      title: 'Audience Mirroring',
      description: 'Predict reactions across Tier-1 and Tier-2 demographics',
    },
    {
      icon: Zap,
      title: 'Voice Drift Detection',
      description: 'Maintain authenticity with real-time alignment scoring',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-saffron to-primary-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-gray-900">
                  PersonaVerse AI
                </h1>
                <p className="text-sm text-gray-600">Digital Identity System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'editor'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Content Editor
                </button>
                <button
                  onClick={() => setActiveTab('adaptive')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'adaptive'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Adaptive Intelligence
                </button>
                <button
                  onClick={() => setActiveTab('dna')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'dna'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  DNA Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'editor' ? (
          <IdentityDrivenEditor />
        ) : activeTab === 'adaptive' ? (
          <AdaptiveDashboard />
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
                Persona DNA Analysis
              </h2>
              <p className="text-gray-600">
                Deep dive into the linguistic and cultural fingerprints of each persona
              </p>
            </div>

            {/* Persona Selector for DNA View */}
            <div className="flex justify-center">
              <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                {personas.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona)}
                    className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                      selectedPersona?.id === persona.id
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {persona.name}
                  </button>
                ))}
              </div>
            </div>

            {/* DNA Map */}
            {selectedPersona && (
              <PersonaDNAMap persona={selectedPersona} />
            )}
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
              AI for Bharat: Beyond Translation
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              PersonaVerse doesn't just translate—it transcreates. Experience authentic 
              digital identity that scales without losing your soul.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Demo Script Callout */}
        <div className="mt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-saffron/10 to-primary-100 rounded-2xl p-8 text-center"
          >
            <h3 className="text-xl font-display font-bold text-gray-900 mb-4">
              Experience the "Sixer Rule" Demo
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Try entering "We need to work hard to achieve our quarterly goals" and watch 
              how the Founder persona transforms it into authentic Bharat language with 
              cricket metaphors and cultural resonance.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-saffron rounded-full"></div>
                <span>Western → Indian metaphors</span>
              </div>
              <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-emerald rounded-full"></div>
                <span>Authentic Hinglish integration</span>
              </div>
              <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-indigo rounded-full"></div>
                <span>Cultural resonance scoring</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              Built for <strong>AI for Bharat Hackathon</strong> • Track 2: Digital Identity
            </p>
            <p className="text-sm">
              Powered by AWS Bedrock, Claude 4.5, and Amazon Nova • Mock Provider Active
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App