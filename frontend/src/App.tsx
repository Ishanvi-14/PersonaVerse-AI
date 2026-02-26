import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, Users, Zap } from 'lucide-react'
import { PersonaDNAMap } from './features/persona-dna/PersonaDNAMap'
import { IdentityDrivenEditor } from './components/IdentityDrivenEditor'
import AdaptiveDashboard from './features/adaptive-intelligence/AdaptiveDashboard'
import { WorkflowToolsTab } from './features/workflow-tools/WorkflowToolsTab'
import { ThemeToggle } from './components/ThemeToggle'
import { personaService } from './services/personaService'
import type { PersonaLayer } from '@backend/shared/persona.types'

function App() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaLayer | null>(null)
  const [personas, setPersonas] = useState<PersonaLayer[]>([])
  const [activeTab, setActiveTab] = useState<'editor' | 'dna' | 'adaptive' | 'workflow'>('editor')

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
    <div className="min-h-screen bg-theme-bg-primary transition-colors duration-200">
      {/* Header */}
      <header className="bg-theme-surface shadow-sm border-b border-theme-border sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-saffron to-primary-600 rounded-lg flex items-center justify-center shadow-md">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-theme-text-primary">
                  PersonaVerse AI
                </h1>
                <p className="text-sm text-theme-text-secondary">Digital Identity System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="flex bg-theme-bg-tertiary rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'editor'
                      ? 'bg-theme-primary text-white shadow-sm'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-hover'
                  }`}
                >
                  Content Editor
                </button>
                <button
                  onClick={() => setActiveTab('adaptive')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'adaptive'
                      ? 'bg-theme-primary text-white shadow-sm'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-hover'
                  }`}
                >
                  Adaptive Intelligence
                </button>
                <button
                  onClick={() => setActiveTab('workflow')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'workflow'
                      ? 'bg-theme-primary text-white shadow-sm'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-hover'
                  }`}
                >
                  Workflow Tools
                </button>
                <button
                  onClick={() => setActiveTab('dna')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === 'dna'
                      ? 'bg-theme-primary text-white shadow-sm'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-hover'
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
        ) : activeTab === 'workflow' ? (
          <WorkflowToolsTab />
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-theme-text-primary mb-2">
                Persona DNA Analysis
              </h2>
              <p className="text-theme-text-secondary">
                Deep dive into the linguistic and cultural fingerprints of each persona
              </p>
            </div>

            {/* Persona Selector for DNA View */}
            <div className="flex justify-center">
              <div className="flex bg-theme-surface rounded-lg p-1 shadow-sm border border-theme-border">
                {personas.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona)}
                    className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                      selectedPersona?.id === persona.id
                        ? 'bg-theme-primary text-white shadow-sm'
                        : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-hover'
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
            <h2 className="text-2xl font-display font-bold text-theme-text-primary mb-4">
              AI for Bharat: Beyond Translation
            </h2>
            <p className="text-theme-text-secondary max-w-2xl mx-auto">
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
                className="card text-center hover:shadow-lg transition-shadow duration-200"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-theme-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-theme-text-secondary">{feature.description}</p>
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
            className="bg-gradient-to-r from-saffron/10 via-primary-100/50 to-emerald/10 rounded-2xl p-8 text-center border border-theme-border shadow-lg"
          >
            <h3 className="text-xl font-display font-bold text-theme-text-primary mb-4">
              Experience the "Sixer Rule" Demo
            </h3>
            <p className="text-theme-text-secondary mb-6 max-w-2xl mx-auto">
              Try entering "We need to work hard to achieve our quarterly goals" and watch 
              how the Founder persona transforms it into authentic Bharat language with 
              cricket metaphors and cultural resonance.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-theme-surface/50 px-4 py-2 rounded-lg border border-theme-border">
                <div className="w-2 h-2 bg-saffron rounded-full"></div>
                <span className="text-theme-text-primary">Western → Indian metaphors</span>
              </div>
              <div className="flex items-center gap-2 bg-theme-surface/50 px-4 py-2 rounded-lg border border-theme-border">
                <div className="w-2 h-2 bg-emerald rounded-full"></div>
                <span className="text-theme-text-primary">Authentic Hinglish integration</span>
              </div>
              <div className="flex items-center gap-2 bg-theme-surface/50 px-4 py-2 rounded-lg border border-theme-border">
                <div className="w-2 h-2 bg-indigo rounded-full"></div>
                <span className="text-theme-text-primary">Cultural resonance scoring</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-theme-surface border-t border-theme-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-theme-text-secondary">
            <p className="mb-2">
              Built for <strong className="text-theme-text-primary">AI for Bharat Hackathon</strong> • Track 2: Digital Identity
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