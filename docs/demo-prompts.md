# Demo Prompts for Adaptive Intelligence

These prompts showcase the adaptive intelligence system across all six domains, demonstrating Bharat-first cultural transcreation and audience-aware generation.

## Education Domain

### Prompt 1: Student Motivation
**Input:** "Explain the importance of consistent study habits"
**Audience Context:** "Targeting Tier-2 college students"
**Expected Output:** Hinglish with cricket/sports metaphors, motivational tone, relatable examples

### Prompt 2: Skill Development
**Input:** "Share tips for learning new technical skills"
**Audience Context:** "Young professionals in Tier-2 cities"
**Expected Output:** Jugaad philosophy, practical examples, friendly tone

## Business Domain

### Prompt 1: Quarterly Goals (The "Sixer Rule" Demo)
**Input:** "We need to work hard to achieve our quarterly goals"
**Audience Context:** "Tier-2 entrepreneurs"
**Expected Output:** Cricket metaphors (Sixer instead of home run), Hinglish, motivational

### Prompt 2: Team Collaboration
**Input:** "Discuss the importance of teamwork in startups"
**Audience Context:** "Startup founders in Bharat"
**Expected Output:** Cultural references (chai pe charcha), authentic Hinglish

## Finance Domain

### Prompt 1: Investment Basics
**Input:** "Explain mutual funds to beginners"
**Audience Context:** "First-time investors from Tier-2 cities"
**Expected Output:** Simple language, regional context, trust-building tone

### Prompt 2: Savings Strategy
**Input:** "Share tips for building an emergency fund"
**Audience Context:** "Young professionals"
**Expected Output:** Practical advice, cultural context (festival expenses), relatable

## Health Domain

### Prompt 1: Fitness Motivation
**Input:** "Encourage people to start exercising regularly"
**Audience Context:** "Working professionals"
**Expected Output:** Narrative style, relatable challenges, motivational

### Prompt 2: Mental Health Awareness
**Input:** "Discuss the importance of mental health"
**Audience Context:** "General audience"
**Expected Output:** Sensitive tone, cultural context, destigmatizing language

## Creator Domain

### Prompt 1: Content Strategy
**Input:** "Share tips for growing on social media"
**Audience Context:** "Aspiring content creators"
**Expected Output:** Storytelling style, authentic voice, practical tips

### Prompt 2: Audience Building
**Input:** "Explain how to connect with your audience"
**Audience Context:** "Regional language creators"
**Expected Output:** Cultural authenticity, regional context, friendly tone

## Government Domain

### Prompt 1: Policy Awareness
**Input:** "Explain a new government scheme for small businesses"
**Audience Context:** "Small business owners"
**Expected Output:** Direct style, high trust, informative, accessible language

### Prompt 2: Civic Engagement
**Input:** "Encourage people to participate in local governance"
**Audience Context:** "General citizens"
**Expected Output:** Authoritative yet friendly, clear call-to-action

## Hinglish Pattern Examples

These prompts specifically test Hinglish detection and cultural transcreation:

### Prompt 1: Natural Hinglish
**Input:** "Yaar, we need to hustle hard to make this startup work"
**Expected:** Maintains Hinglish ratio, adds cultural markers

### Prompt 2: Western Metaphor Replacement
**Input:** "We hit a home run with our last campaign"
**Expected:** Transforms to "We hit a sixer" (Bharat-centric)

### Prompt 3: Regional Context
**Input:** "Share business tips for Tier-2 city entrepreneurs"
**Audience Context:** "Indore, Jaipur, Lucknow audience"
**Expected:** Regional slang, local context, authentic voice

## Testing the Retry Loop

### Low-Quality Prompt (Should Trigger Retry)
**Input:** "thing"
**Expected:** System detects low engagement score, retries with improvements

### High-Quality Prompt (Should Pass First Time)
**Input:** "Share your journey of building a startup in Bharat, focusing on the challenges and learnings that shaped your founder identity"
**Expected:** High engagement score on first attempt, no retry needed

## Memory Evolution Testing

Run these prompts sequentially to see memory learning:

1. **First Generation:** "Business advice" (domain: business)
2. **Second Generation:** "More business tips" (domain: business)
3. **Third Generation:** "Business strategy" (domain: business)
4. **Check Memory:** Domain usage for "business" should increase, preferences should adapt

## Platform-Specific Testing

### LinkedIn (Professional)
**Input:** "Share quarterly business update"
**Platform:** LinkedIn
**Expected:** Formal tone, professional language, minimal emojis

### WhatsApp (Personal)
**Input:** "Share quarterly business update"
**Platform:** WhatsApp
**Expected:** Friendly tone, conversational, appropriate emojis

### Instagram (Visual/Casual)
**Input:** "Share quarterly business update"
**Platform:** Instagram
**Expected:** Casual tone, storytelling, higher emoji density

## Judge Demo Script

For the hackathon demo, use this sequence:

1. **Start:** Show empty memory for new user
2. **Generate 1:** Business domain, LinkedIn, "We need to work hard to achieve our quarterly goals"
   - Show audience analysis (Hinglish, high literacy, formal)
   - Show domain strategy (direct, medium trust, persuasive)
   - Show engagement score breakdown
   - Highlight "Sixer Rule" in action (Western → Indian metaphor)

3. **Generate 2:** Creator domain, Instagram, "Share tips for growing on social media"
   - Show different audience profile (friendly, conversational)
   - Show different domain strategy (narrative, storytelling)
   - Show memory update (domain usage increased)

4. **Show Memory:** Display learned preferences, domain usage chart, history
5. **Highlight:** Cultural resonance score, Hinglish fluency, transcreation quality

## Expected Outcomes

All prompts should demonstrate:
- ✅ Bharat-first cultural authenticity
- ✅ Appropriate Hinglish ratio (70/30 for Hinglish audience)
- ✅ Cultural metaphor replacement (Sixer, not home run)
- ✅ Platform-appropriate tone and format
- ✅ Domain-specific communication strategy
- ✅ Engagement score > 70 (or retry triggered)
- ✅ Memory learning and evolution
