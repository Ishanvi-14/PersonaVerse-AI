import React from 'react'
import { motion } from 'framer-motion'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import type { PersonaLayer } from '@backend/shared/persona.types'
import { getPersonaColor, formatPercentage, formatScore } from '../../lib/utils'

interface PersonaDNAMapProps {
  persona: PersonaLayer
  className?: string
}

export function PersonaDNAMap({ persona, className = '' }: PersonaDNAMapProps) {
  // Transform persona data for radar chart
  const radarData = [
    {
      attribute: 'Wit',
      value: persona.emotionalBaseline.enthusiasmLevel,
      fullMark: 10,
    },
    {
      attribute: 'Hinglish Ratio',
      value: persona.linguisticDNA.hinglishRatio * 10, // Convert to 0-10 scale
      fullMark: 10,
    },
    {
      attribute: 'Empathy',
      value: persona.emotionalBaseline.empathyLevel,
      fullMark: 10,
    },
    {
      attribute: 'Authority',
      value: persona.emotionalBaseline.authorityLevel,
      fullMark: 10,
    },
    {
      attribute: 'Optimism',
      value: persona.emotionalBaseline.optimismLevel,
      fullMark: 10,
    },
    {
      attribute: 'Formality',
      value: persona.linguisticDNA.formalityLevel,
      fullMark: 10,
    },
  ]

  // Transform data for bar chart (linguistic DNA breakdown)
  const linguisticData = [
    {
      name: 'Hinglish Ratio',
      value: persona.linguisticDNA.hinglishRatio,
      color: '#FF6B35',
    },
    {
      name: 'Formality',
      value: persona.linguisticDNA.formalityLevel / 10,
      color: '#1A936F',
    },
    {
      name: 'Cadence',
      value: persona.linguisticDNA.cadence === 'high' ? 0.8 : persona.linguisticDNA.cadence === 'medium' ? 0.6 : 0.4,
      color: '#004E89',
    },
  ]

  const personaColor = getPersonaColor(persona.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`card ${className}`}
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: personaColor }}
          />
          <h3 className="text-xl font-display font-semibold text-gray-900">
            {persona.name} Persona DNA Map
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Digital Soul fingerprint extracted from multimodal analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart - Core Attributes */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Core Personality Traits</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis
                  dataKey="attribute"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 10]}
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                />
                <Radar
                  name={persona.name}
                  dataKey="value"
                  stroke={personaColor}
                  fill={personaColor}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Linguistic DNA */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Linguistic DNA</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={linguisticData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis
                  domain={[0, 1]}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={formatPercentage}
                />
                <Tooltip
                  formatter={(value: number) => [formatPercentage(value), 'Value']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {linguisticData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">Detailed Analysis</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-primary-600">
              {formatPercentage(persona.linguisticDNA.hinglishRatio)}
            </div>
            <div className="text-xs text-gray-600 mt-1">Hinglish Ratio</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-secondary-600">
              {formatScore(persona.emotionalBaseline.empathyLevel / 10)}
            </div>
            <div className="text-xs text-gray-600 mt-1">Empathy Level</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-accent-600">
              {formatScore(persona.emotionalBaseline.authorityLevel / 10)}
            </div>
            <div className="text-xs text-gray-600 mt-1">Authority</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">
              {persona.linguisticDNA.cadence.toUpperCase()}
            </div>
            <div className="text-xs text-gray-600 mt-1">Cadence</div>
          </div>
        </div>
      </div>

      {/* Cultural Markers */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Cultural Alignment</h4>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-saffron/10 text-saffron-700 rounded-full text-sm font-medium">
            {persona.valueConstraints.culturalAlignment}
          </span>
          <span className="px-3 py-1 bg-emerald/10 text-emerald-700 rounded-full text-sm font-medium">
            {persona.linguisticDNA.vocabularyStyle}
          </span>
          <span className="px-3 py-1 bg-indigo/10 text-indigo-700 rounded-full text-sm font-medium">
            {persona.linguisticDNA.sentenceStructure} sentences
          </span>
          <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
            {persona.valueConstraints.riskTolerance} risk
          </span>
        </div>
      </div>

      {/* Core Beliefs Preview */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Core Beliefs</h4>
        <div className="space-y-2">
          {persona.valueConstraints.coreBeliefs.slice(0, 3).map((belief, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-gray-700">{belief}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}