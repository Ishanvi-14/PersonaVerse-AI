# PersonaVerse AI - Frontend Dashboard

React 19 frontend dashboard for PersonaVerse AI Digital Identity System, built for the AI for Bharat Hackathon.

## 🚀 Features

### Identity-Driven Content Editor
- **Persona Layer Selection**: Choose between Founder, Educator, and Casual personas
- **Platform Targeting**: Optimize content for LinkedIn, WhatsApp, Email, Twitter, Instagram
- **Emotion Tuning**: Fine-tune urgency, enthusiasm, formality, and authority levels
- **Real-time Transcreation**: Transform generic content into culturally authentic Bharat voice
- **Voice Drift Detection**: Alerts when content doesn't match persona authenticity
- **Audience Mirroring**: Simulate reactions from Tier-1 and Tier-2 demographics

### Persona DNA Analysis
- **Radar Chart Visualization**: Core personality traits (Wit, Hinglish Ratio, Empathy, Authority)
- **Linguistic DNA Breakdown**: Bar charts showing language patterns and formality
- **Cultural Alignment Indicators**: Visual representation of Bharat-first values
- **Core Beliefs Display**: Key values that drive persona behavior

## 🛠️ Tech Stack

- **React 19**: Latest React with concurrent features
- **TypeScript**: Full type safety with backend integration
- **Tailwind CSS**: Utility-first styling with Bharat-inspired color palette
- **Framer Motion**: Smooth animations and micro-interactions
- **Recharts**: Data visualization for persona analytics
- **Vite**: Fast development and build tooling

## 🎨 Design System

### Colors
- **Primary (Saffron)**: `#FF6B35` - Main brand color inspired by Indian flag
- **Secondary (Blue)**: `#0ea5e9` - Professional accent
- **Accent (Green)**: `#22c55e` - Success and positive feedback
- **Bharat Palette**: Saffron `#FF6B35`, Emerald `#1A936F`, Indigo `#004E89`

### Typography
- **Display Font**: Poppins (headings and brand elements)
- **Body Font**: Inter (readable content and UI text)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎭 Demo Script Integration

The frontend implements the complete demo script scenarios:

### Scene 1: Digital Soul Ingestion
- Persona DNA Map visualizes extracted identity vectors
- Multimodal analysis indicators (text, audio, image support)

### Scene 2: "Sixer Rule" Transcreation
- Input: "We need to work hard to achieve our quarterly goals"
- Output (Founder + LinkedIn): "Success in Bharat isn't about quarterly spreadsheets..."
- Demonstrates Western → Indian metaphor replacement

### Scene 3: Persona Multi-Layering
- Same input, different persona (Casual + WhatsApp)
- Output: "Arre, quarter results will come and go, but the mehnat must stay constant..."
- Shows consistent values with different linguistic DNA

### Scene 4: Voice Drift Detection
- Real-time alerts for generic AI language
- Flags phrases like "maximize synergy" → suggests "hustle together"

### Scene 5: Audience Mirror
- Split-screen simulation results
- Tier-2 Student (Indore) and Tier-1 VC (Bangalore) reactions
- Confidence and cultural resonance scoring

## 🔗 Backend Integration

### Mock Provider Connection
```typescript
// Direct integration with backend mock provider
import { MockBedrockProvider } from '@backend/services/persona-engine/__mocks__/bedrockProvider'

// Type-safe API calls
const response = await personaService.generateContent({
  personaId: 'founder',
  platform: 'linkedin',
  content: 'Your input text',
  emotionSliders: { urgency: 7, enthusiasm: 8 }
})
```

### Shared Types
- Full TypeScript integration with `@backend/shared/persona.types.ts`
- Type-safe persona definitions, generation requests/responses
- Consistent error handling and API response formats

## 📱 Responsive Design

- **Mobile-first**: Optimized for Indian smartphone users
- **WhatsApp-style UX**: Familiar interaction patterns for Bharat audience
- **Low-bandwidth friendly**: SVG icons, optimized assets
- **Accessibility**: WCAG compliant with proper contrast ratios

## 🎯 Key Components

### `IdentityDrivenEditor`
Main content creation interface with persona selection, platform targeting, and emotion tuning.

### `PersonaDNAMap`
Data visualization component showing persona characteristics using radar and bar charts.

### `personaService`
Frontend service layer that interfaces with the backend mock provider.

## 🚨 Development Notes

- **Mock Provider Active**: All Bedrock calls are mocked to save credits
- **Type Safety**: Full TypeScript coverage with backend integration
- **Hot Reload**: Vite provides instant feedback during development
- **Production Ready**: Optimized build with code splitting and tree shaking

## 🔄 State Management

Simple React state management with:
- `useState` for component-level state
- `useEffect` for data fetching
- Props drilling for shared state (suitable for hackathon scope)

## 🎨 Animation System

Framer Motion animations for:
- Page transitions and component mounting
- Button hover/tap feedback
- Loading states and progress indicators
- Smooth chart transitions

## 📊 Analytics Integration Ready

Components are instrumented for future analytics:
- Persona selection tracking
- Content generation metrics
- Voice drift incident logging
- Audience simulation accuracy

---

**Ready for Demo**: The frontend is fully functional and demonstrates all key PersonaVerse AI features with authentic Bharat cultural integration.