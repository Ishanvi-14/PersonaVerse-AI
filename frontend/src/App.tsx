import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, Users, Zap, LogOut, User as UserIcon, History as HistoryIcon } from 'lucide-react'
import { PersonaDNAMap } from './features/persona-dna/PersonaDNAMap'
import { IdentityDrivenEditor } from './components/IdentityDrivenEditor'
import { WorkflowToolsTab } from './features/workflow-tools/WorkflowToolsTab'
import { EnhancedContentCalendar } from './features/calendar/EnhancedContentCalendar'
import { UserHistory } from './features/history/UserHistory'
import { ThemeToggle } from './components/ThemeToggle'
import { LoginPage } from './components/LoginPage'
import { ChatbotAssistant } from './components/ChatbotAssistant'
import { useAuth } from './contexts/AuthContext'
import { personaService } from './services/personaService'
import type { PersonaLayer } from '@backend/shared/persona.types'

function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [selectedPersona, setSelectedPersona] = useState<PersonaLayer | null>(null)
  const [personas, setPersonas] = useState<PersonaLayer[]>([])
  const [activeTab, setActiveTab] = useState<'editor' | 'dna' | 'workflow' | 'calendar' | 'history'>('editor')

  // Load personas - must be called before any conditional returns
  useEffect(() => {
    if (isAuthenticated) {
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
    }
  }, [isAuthenticated])

  // Show login page if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-white to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Brain className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-gray-600">Loading PersonaVerse...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

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
      <header className="bg-theme-surface shadow-lg border-b border-theme-border sticky top-0 z-50 backdrop-blur-md bg-opacity-98">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-saffron via-orange-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-theme-text-primary tracking-tight">
                  PersonaVerse AI
                </h1>
                <p className="text-xs text-theme-text-secondary font-medium">Digital Identity System for Bharat</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-theme-bg-tertiary to-theme-hover rounded-xl border border-theme-border shadow-sm">
                <UserIcon className="w-4 h-4 text-theme-text-secondary" />
                <span className="text-sm font-semibold text-theme-text-primary">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-theme-text-secondary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
              <ThemeToggle />
              <div className="flex bg-theme-bg-tertiary rounded-xl p-1.5 shadow-md border border-theme-border">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'editor'
                      ? 'bg-gradient-to-r from-saffron to-orange-500 text-white shadow-md'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-hover'
                  }`}
                >
                  Editor
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'calendar'
                      ? 'bg-gradient-to-r from-saffron to-orange-500 text-white shadow-md'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-hover'
                  }`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setActiveTab('workflow')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'workflow'
                      ? 'bg-gradient-to-r from-saffron to-orange-500 text-white shadow-md'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-hover'
                  }`}
                >
                  Tools
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'history'
                      ? 'bg-gradient-to-r from-saffron to-orange-500 text-white shadow-md'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-hover'
                  }`}
                >
                  <HistoryIcon className="w-4 h-4 inline mr-1" />
                  History
                </button>
                <button
                  onClick={() => setActiveTab('dna')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'dna'
                      ? 'bg-gradient-to-r from-saffron to-orange-500 text-white shadow-md'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-hover'
                  }`}
                >
                  DNA
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
        ) : activeTab === 'workflow' ? (
          <WorkflowToolsTab />
        ) : activeTab === 'calendar' ? (
          <EnhancedContentCalendar />
        ) : activeTab === 'history' ? (
          <UserHistory />
        ) : (
          <div className="space-y-8">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-saffron/20 via-primary-100 to-emerald/20 rounded-2xl mb-4 shadow-lg">
                <Brain className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-4xl font-display font-bold text-theme-text-primary mb-3">
                Persona DNA Analysis
              </h2>
              <p className="text-lg text-theme-text-secondary max-w-2xl mx-auto">
                Deep dive into the linguistic and cultural fingerprints of each persona
              </p>
            </motion.div>

            {/* Persona Selector for DNA View */}
            <div className="flex justify-center">
              <div className="flex bg-theme-surface rounded-xl p-2 shadow-lg border border-theme-border">
                {personas.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona)}
                    className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      selectedPersona?.id === persona.id
                        ? 'bg-gradient-to-r from-saffron to-orange-500 text-white shadow-md transform scale-105'
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
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-display font-bold text-theme-text-primary mb-4">
                Powered by Advanced AI Technology
              </h2>
              <p className="text-lg text-theme-text-secondary max-w-3xl mx-auto">
                PersonaVerse leverages cutting-edge AI to create authentic digital identities 
                that preserve your unique voice, cultural context, and personal brand across all platforms.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative card text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-saffron/5 via-transparent to-emerald/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-saffron/20 via-primary-100 to-emerald/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <feature.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-lg text-theme-text-primary mb-3">{feature.title}</h3>
                  <p className="text-sm text-theme-text-secondary leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-r from-saffron/10 via-primary-50/50 to-emerald/10 rounded-3xl p-10 border border-theme-border shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-saffron to-orange-600">
                  10+
                </div>
                <div className="text-sm font-medium text-theme-text-secondary uppercase tracking-wide">
                  Indian Languages Supported
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                  AI-Powered
                </div>
                <div className="text-sm font-medium text-theme-text-secondary uppercase tracking-wide">
                  Cultural Transcreation Engine
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald to-green-600">
                  Real-Time
                </div>
                <div className="text-sm font-medium text-theme-text-secondary uppercase tracking-wide">
                  Voice & Identity Analysis
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-theme-surface via-theme-bg-secondary to-theme-surface border-t border-theme-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-saffron via-orange-500 to-emerald rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-theme-text-primary">PersonaVerse AI</span>
            </div>
            <p className="text-theme-text-secondary max-w-2xl mx-auto">
              Built for <strong className="text-transparent bg-clip-text bg-gradient-to-r from-saffron to-emerald font-semibold">AI for Bharat Hackathon</strong> • Track 2: Digital Identity
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm pt-4">
              <span className="px-4 py-2 bg-theme-bg-tertiary rounded-lg border border-theme-border text-theme-text-secondary">
                AWS Bedrock
              </span>
              <span className="px-4 py-2 bg-theme-bg-tertiary rounded-lg border border-theme-border text-theme-text-secondary">
                Claude 4.5
              </span>
              <span className="px-4 py-2 bg-theme-bg-tertiary rounded-lg border border-theme-border text-theme-text-secondary">
                Amazon Transcribe
              </span>
              <span className="px-4 py-2 bg-theme-bg-tertiary rounded-lg border border-theme-border text-theme-text-secondary">
                Amazon Translate
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot Assistant */}
      <ChatbotAssistant />
    </div>
  )
}

export default App