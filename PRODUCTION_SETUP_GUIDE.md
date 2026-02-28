# PersonaVerse Production Setup Guide

## 🚀 Complete Production-Ready SaaS Platform

PersonaVerse has been upgraded to a full-fledged production SaaS application with authentication, content scheduling, AWS integration, and a professional Indian flag-themed UI.

---

## ✨ What's New

### 1. Authentication System
- User registration and login
- JWT-based authentication
- Protected routes
- Session management
- Secure password hashing with bcrypt

### 2. Enhanced Content Calendar
- Full scheduling capabilities
- Create, edit, delete schedules
- Calendar and list views
- Platform selection (LinkedIn, Instagram, Twitter, Facebook, YouTube)
- Status tracking (Scheduled, Posted, Draft)
- Date and time picker
- DynamoDB storage

### 3. Professional UI/UX
- Indian flag color theme (Saffron, White, Green)
- Smooth animations with Framer Motion
- Hover effects and transitions
- Responsive design
- Modern card-based layouts
- Loading states and error handling

### 4. AWS Integration
- DynamoDB for all data storage
- S3 for media files
- Amazon Transcribe for voice-to-text
- Amazon Translate for multilingual support
- Groq LLM for zero-cost text generation

---

## 📋 Prerequisites

1. Node.js 18+ installed
2. AWS Account with credentials configured
3. Groq API key (free tier)

---

## 🛠️ Setup Instructions

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables

The `.env` file is already configured with:
- AWS credentials
- Groq API key
- DynamoDB table names
- JWT secret

**Important:** Change `JWT_SECRET` in production!

### Step 3: Create DynamoDB Tables

Run the setup script to create all required tables:

```bash
cd backend
npm run setup:dynamodb
```

This creates:
- `personaverse-users` - User accounts
- `personaverse-calendar` - Scheduled content
- `personaverse-user-history` - User activity
- `personaverse-personas` - Persona definitions

### Step 4: Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 🎨 UI/UX Features

### Indian Flag Theme
- **Saffron Orange** (#FF6B35) - Primary actions, headers
- **White** - Clean backgrounds, cards
- **Green** (#1A936F) - Success states, accents
- **Indigo** (#004E89) - Links, secondary actions

### Animations
- Page transitions with Framer Motion
- Smooth hover effects on all interactive elements
- Loading spinners and skeleton screens
- Modal animations

### Responsive Design
- Desktop-first approach
- Mobile-compatible layouts
- Touch-friendly buttons
- Adaptive spacing

---

## 📅 Content Calendar Features

### Scheduling
- Select date and time
- Choose platform (LinkedIn, Instagram, Twitter, Facebook, YouTube)
- Add title, description, and content
- Set status (Scheduled, Posted, Draft)

### Views
- **Calendar View**: Month-based calendar with visual indicators
- **List View**: Detailed list of all schedules

### Management
- Edit existing schedules
- Delete schedules
- Update status
- View upcoming schedules

---

## 🔐 Authentication Flow

### Registration
1. User enters name, email, and password
2. Password is hashed with bcrypt
3. User record created in DynamoDB
4. JWT token generated and returned
5. Token stored in localStorage

### Login
1. User enters email and password
2. Password verified against hash
3. JWT token generated
4. User redirected to dashboard

### Protected Routes
- All API routes (except auth) require JWT token
- Frontend checks authentication state
- Automatic redirect to login if not authenticated

---

## 🗄️ Database Schema

### Users Table
```typescript
{
  userId: string (PK)
  email: string (GSI)
  name: string
  passwordHash: string
  createdAt: string
  updatedAt: string
}
```

### Calendar Table
```typescript
{
  scheduleId: string (PK)
  userId: string (GSI)
  title: string
  description: string
  content: string
  platform: 'linkedin' | 'instagram' | 'twitter' | 'facebook' | 'youtube'
  scheduledDate: string (ISO)
  scheduledTime: string (HH:MM)
  status: 'scheduled' | 'posted' | 'draft'
  createdAt: string
  updatedAt: string
  postedAt?: string
}
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Calendar
- `POST /api/calendar/schedule` - Create schedule
- `GET /api/calendar/schedules` - Get all schedules
- `GET /api/calendar/schedules/:id` - Get specific schedule
- `PUT /api/calendar/schedules/:id` - Update schedule
- `DELETE /api/calendar/schedules/:id` - Delete schedule
- `GET /api/calendar/upcoming` - Get upcoming schedules

### AWS Services
- `POST /aws/generate` - Generate content with AI
- `POST /aws/voice-to-content` - Voice to text conversion
- `POST /aws/translate` - Translate content
- `GET /aws/health` - Check AWS services status

---

## 💰 Cost Optimization

### Zero-Cost Architecture
- **Groq**: Free tier for text generation (Llama 3.3 70B)
- **AWS Transcribe**: 60 minutes/month free
- **AWS Translate**: 2M characters/month free
- **DynamoDB**: 25GB storage free
- **S3**: 5GB storage free

### Total Monthly Cost: ₹0 (within free tier limits)

---

## 🚀 Deployment Checklist

### Before Deploying
- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Update CORS origins to production domain
- [ ] Enable HTTPS
- [ ] Set up proper AWS IAM roles
- [ ] Configure environment variables in production
- [ ] Set up monitoring and logging
- [ ] Enable rate limiting
- [ ] Add input validation
- [ ] Set up backup strategy for DynamoDB

### Production Environment Variables
```bash
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_REGION=ap-south-1
GROQ_API_KEY=<your-key>
```

---

## 🎯 Key Features Summary

✅ User authentication with JWT
✅ Content calendar with full CRUD operations
✅ Indian flag themed UI
✅ Smooth animations and transitions
✅ AWS DynamoDB integration
✅ Voice-to-text with Amazon Transcribe
✅ Multilingual support with Amazon Translate
✅ Zero-cost AI generation with Groq
✅ Responsive design
✅ Protected routes
✅ Error handling and validation
✅ Loading states
✅ Professional SaaS-grade code structure

---

## 📚 Tech Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons

### Backend
- Node.js
- Express
- TypeScript
- JWT
- Bcrypt

### AWS Services
- DynamoDB
- S3
- Transcribe
- Translate
- Bedrock (optional)

### AI
- Groq (Llama 3.3 70B)
- Claude 4.5 (via Bedrock, optional)

---

## 🎨 Design Philosophy

Following PersonaVerse steering principles:
- **Identity as System Primitive**: Not just tone, but persistent digital soul
- **Bharat-First**: Cultural transcreation, not translation
- **Quality Bar**: Persona recognition, platform native-ness, linguistic fluency
- **Zero-Cost**: Free tier AWS services + Groq
- **Production-Ready**: Authentication, validation, error handling

---

## 🐛 Troubleshooting

### DynamoDB Tables Not Created
```bash
# Check AWS credentials
aws configure list

# Manually create tables
npm run setup:dynamodb
```

### Authentication Not Working
- Check JWT_SECRET is set
- Verify DynamoDB users table exists
- Check browser localStorage for token

### Calendar Not Loading
- Verify user is authenticated
- Check DynamoDB calendar table exists
- Verify API endpoints are accessible

---

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Verify AWS credentials are correct
3. Ensure all DynamoDB tables are created
4. Check that all environment variables are set

---

## 🎉 You're Ready!

Your PersonaVerse production SaaS platform is now fully configured and ready to deploy!

**Next Steps:**
1. Test all features locally
2. Create a demo user account
3. Schedule some content
4. Deploy to production
5. Share with the world! 🚀
