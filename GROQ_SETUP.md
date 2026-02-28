# Groq API Setup - Free Tier AI

## Why Groq?
- ✅ **100% FREE** - Generous free tier
- ✅ **Fast** - Fastest inference in the market
- ✅ **Quality** - Llama 3.3 70B model (excellent quality)
- ✅ **No Payment Required** - Just email signup

## Get Your Free Groq API Key (2 minutes)

### Step 1: Sign Up
1. Go to: https://console.groq.com/
2. Click "Sign Up" or "Get Started"
3. Sign up with:
   - Google account (fastest)
   - OR email + password
4. Verify your email

### Step 2: Create API Key
1. Once logged in, go to: https://console.groq.com/keys
2. Click "Create API Key"
3. Give it a name: "PersonaVerse"
4. Click "Submit"
5. **Copy the API key** (starts with `gsk_...`)
6. Save it securely - you won't see it again!

### Step 3: Add to Your Project
1. Open `backend/.env`
2. Find the line: `GROQ_API_KEY=your_groq_api_key_here`
3. Replace with your actual key:
   ```env
   GROQ_API_KEY=gsk_your_actual_key_here
   ```
4. Save the file

### Step 4: Restart Backend
```bash
# Stop current backend (Ctrl+C)
cd backend
npm start
```

## ✅ Done!

Your PersonaVerse now uses:
- **Groq (FREE)** - For AI text generation
- **AWS Transcribe (FREE TIER)** - For voice-to-text (60 min/month)
- **AWS Translate (FREE TIER)** - For multilingual (2M chars/month)
- **AWS DynamoDB (FREE TIER)** - For user history (25GB)
- **AWS S3 (FREE TIER)** - For file storage (5GB)

**Total Cost: ₹0** 🎉

---

## Groq Free Tier Limits

### What You Get FREE:
- **14,400 requests per day**
- **Llama 3.3 70B**: 6,000 tokens/min
- **Llama 3.1 70B**: 6,000 tokens/min
- **Llama 3.1 8B**: 30,000 tokens/min
- **Mixtral 8x7B**: 5,000 tokens/min

### What This Means:
- ~500-1000 generations per day (more than enough!)
- Perfect for development and demos
- No credit card required
- No expiration

---

## Models Available

PersonaVerse uses **Llama 3.3 70B** by default (best quality):
- 70 billion parameters
- Excellent for persona-consistent content
- Fast inference (~1 second)
- Supports JSON output

---

## Testing Your Setup

### Test 1: Check API Key
```bash
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_GROQ_API_KEY"
```

Should return list of available models.

### Test 2: Generate Content
1. Start backend: `cd backend && npm start`
2. Open frontend: http://localhost:3000
3. Try generating LinkedIn content
4. Check backend logs for: `[Groq] Using Groq (free tier)`

---

## Troubleshooting

### Error: "GROQ_API_KEY not set"
**Solution:** 
1. Check `.env` file has the key
2. Restart backend server
3. Make sure no extra spaces around the key

### Error: "Invalid API key"
**Solution:**
1. Go to https://console.groq.com/keys
2. Delete old key
3. Create new key
4. Update `.env` with new key

### Error: "Rate limit exceeded"
**Solution:**
- You've hit the free tier limit (14,400 requests/day)
- Wait 24 hours for reset
- OR create another account (not recommended)

### Slow Response
**Solution:**
- Groq is usually very fast (<1 second)
- Check your internet connection
- Try switching to faster model: `llama-3.1-8b-instant`

---

## Comparison: Groq vs Bedrock

| Feature | Groq | AWS Bedrock |
|---------|------|-------------|
| **Cost** | FREE | ~₹0.40 per generation |
| **Speed** | Very Fast (~1s) | Fast (~2s) |
| **Quality** | Excellent | Excellent |
| **Free Tier** | 14,400 req/day | None |
| **Setup** | 2 minutes | Payment required |
| **Model** | Llama 3.3 70B | Claude 4.5 |

**For Hackathon:** Groq is perfect! ✅

---

## Architecture Benefits

Using Groq maintains your AWS architecture story:
- ✅ Still using AWS for infrastructure (S3, DynamoDB, Transcribe, Translate)
- ✅ Shows smart cost optimization
- ✅ Demonstrates multi-provider integration
- ✅ Production-ready architecture

**Judges will appreciate:**
- Smart use of free tiers
- Cost-conscious design
- Multi-provider flexibility
- Production-ready thinking

---

## Next Steps

1. ✅ Get Groq API key (2 min)
2. ✅ Add to `.env`
3. ✅ Restart backend
4. ✅ Test generation
5. ✅ Build your demo!

**You're now running a fully functional PersonaVerse with ZERO costs!** 🚀
