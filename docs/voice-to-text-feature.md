# Voice-to-Text Feature Documentation

## Overview

The Voice-to-Text feature enables users to input text using their voice across the entire PersonaVerse AI application. This feature uses browser MediaRecorder API for audio capture and AWS Transcribe for speech-to-text conversion.

## Features

### User Interface
- **Microphone Button**: Orange-to-green gradient button next to every text input and textarea
- **Recording Indicator**: Red pulsing animation when recording is active
- **Timer Display**: Shows recording duration and 2-minute limit
- **Loading State**: Spinner animation during transcription
- **Error Handling**: User-friendly error messages with auto-dismiss

### Technical Implementation

#### Frontend Components

1. **VoiceInput.tsx** - Reusable voice input component
   - Location: `frontend/src/components/VoiceInput.tsx`
   - Features:
     - Browser MediaRecorder API integration
     - 2-minute recording limit
     - Real-time timer display
     - Audio format: WebM with Opus codec
     - Automatic cleanup of media streams

2. **Integration Points**:
   - IdentityDrivenEditor (main content editor)
   - ContentSimplifier (content input and audience context)
   - AdaptiveDashboard (prompt and audience context)
   - CalendarGenerator (niche and target audience)
   - GapAnalyzer (post entries and niche context)

#### Backend Services

1. **VoiceToTextService** - Core transcription service
   - Location: `backend/services/voice-to-text/voiceToText.service.ts`
   - Workflow:
     1. Upload audio to S3
     2. Start AWS Transcribe job
     3. Poll for completion (max 60 attempts, 2s intervals)
     4. Extract transcript from result
     5. Clean up S3 file and transcription job

2. **API Endpoint**:
   - Route: `POST /voice/transcribe`
   - Accepts: multipart/form-data with 'audio' field
   - Max file size: 10MB (~2 minutes of audio)
   - Returns: `{ success: true, transcript: string }`

### AWS Configuration

#### Required Environment Variables
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=personaverse-voice-transcriptions
```

#### AWS Services Used
1. **S3**: Temporary audio file storage
   - Files are automatically deleted after transcription
   - Bucket: `personaverse-voice-transcriptions`

2. **Amazon Transcribe**: Speech-to-text conversion
   - Language: English (India) - `en-IN`
   - Format: WebM, OGG, WAV, MP3, MP4
   - Jobs are automatically deleted after completion

### Security Features

- AWS credentials never exposed to frontend
- File size validation (10MB limit)
- Audio format validation
- Automatic cleanup of temporary files
- No persistent storage of audio data

### User Experience

#### Recording Flow
1. User clicks microphone button
2. Browser requests microphone permission (first time only)
3. Recording starts with red pulsing indicator
4. Timer shows elapsed time / 2:00 limit
5. User clicks again to stop, or auto-stops at 2 minutes
6. Loading spinner shows during transcription
7. Transcript automatically fills the input field
8. User can edit the transcribed text

#### Error Handling
- Microphone access denied
- Recording too short
- Network errors
- Transcription failures
- File size exceeded

All errors show user-friendly messages that auto-dismiss after 5 seconds.

### Browser Compatibility

Requires browsers with MediaRecorder API support:
- Chrome 47+
- Firefox 25+
- Edge 79+
- Safari 14.1+
- Opera 36+

### Cost Optimization

1. **Automatic Cleanup**: All S3 files and transcription jobs are deleted immediately after use
2. **File Size Limits**: 10MB maximum prevents excessive costs
3. **Time Limits**: 2-minute recording limit
4. **Efficient Polling**: 2-second intervals with 60-attempt maximum

### Testing

#### Manual Testing Steps
1. Open any page with text input
2. Click the microphone button (orange-green gradient)
3. Allow microphone access when prompted
4. Speak clearly for a few seconds
5. Click microphone again to stop
6. Verify transcript appears in the input field
7. Test error cases (deny permission, network offline, etc.)

#### Test Cases
- ✅ Short recording (5 seconds)
- ✅ Long recording (approaching 2 minutes)
- ✅ Multiple recordings in sequence
- ✅ Recording with existing text (appends)
- ✅ Recording in different input fields
- ✅ Error handling (permission denied)
- ✅ Network error handling

### Maintenance

#### Monitoring
- Check AWS CloudWatch for Transcribe job failures
- Monitor S3 bucket for orphaned files (should be none)
- Review backend logs for transcription errors

#### Troubleshooting

**Issue**: Microphone button not appearing
- **Solution**: Check browser compatibility, ensure VoiceInput component is imported

**Issue**: "Failed to access microphone"
- **Solution**: User needs to grant microphone permission in browser settings

**Issue**: Transcription fails
- **Solution**: Check AWS credentials, verify S3 bucket exists, check AWS service status

**Issue**: Slow transcription
- **Solution**: Normal for longer audio; AWS Transcribe typically takes 30-60 seconds

### Future Enhancements

Potential improvements:
- Support for multiple languages (Hindi, regional languages)
- Real-time transcription (streaming)
- Custom vocabulary for domain-specific terms
- Speaker identification for multi-person recordings
- Confidence scores display
- Transcript editing with audio playback

## Dependencies

### Backend
```json
{
  "@aws-sdk/client-s3": "^3.515.0",
  "@aws-sdk/client-transcribe": "^3.515.0",
  "multer": "^1.4.5-lts.1",
  "uuid": "^9.0.1"
}
```

### Frontend
- lucide-react (for Mic and Loader2 icons)
- Native browser MediaRecorder API

## API Reference

### POST /voice/transcribe

**Request**:
```
Content-Type: multipart/form-data

audio: <audio file blob>
```

**Response** (Success):
```json
{
  "success": true,
  "transcript": "This is the transcribed text from the audio."
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Status Codes**:
- 200: Success
- 400: Invalid request (no file, file too large, invalid format)
- 500: Server error (AWS error, transcription failed)

## Conclusion

The Voice-to-Text feature provides a seamless, accessible way for users to input text across the entire PersonaVerse AI application. It maintains the existing UI design while adding powerful voice input capabilities with robust error handling and cost-efficient AWS integration.
