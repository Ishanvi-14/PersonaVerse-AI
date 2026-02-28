/**
 * Check AWS Transcribe Jobs
 */

const { TranscribeClient, ListTranscriptionJobsCommand, GetTranscriptionJobCommand } = require('@aws-sdk/client-transcribe');

// Load environment variables
require('dotenv').config();

const awsConfig = {
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
};

async function checkTranscribeJobs() {
  const transcribeClient = new TranscribeClient(awsConfig);
  
  try {
    console.log('Checking recent transcription jobs...');
    
    // List recent jobs
    const jobs = await transcribeClient.send(new ListTranscriptionJobsCommand({ 
      MaxResults: 5,
      Status: 'COMPLETED'
    }));
    
    console.log(`Found ${jobs.TranscriptionJobSummaries?.length || 0} completed jobs`);
    
    if (jobs.TranscriptionJobSummaries && jobs.TranscriptionJobSummaries.length > 0) {
      for (const jobSummary of jobs.TranscriptionJobSummaries) {
        console.log(`\n📝 Job: ${jobSummary.TranscriptionJobName}`);
        console.log(`   Status: ${jobSummary.TranscriptionJobStatus}`);
        console.log(`   Language: ${jobSummary.LanguageCode}`);
        console.log(`   Created: ${jobSummary.CreationTime}`);
        
        // Get detailed job info
        try {
          const jobDetail = await transcribeClient.send(new GetTranscriptionJobCommand({
            TranscriptionJobName: jobSummary.TranscriptionJobName
          }));
          
          const job = jobDetail.TranscriptionJob;
          if (job?.Transcript?.TranscriptFileUri) {
            console.log(`   Transcript URL: ${job.Transcript.TranscriptFileUri}`);
            
            // Try to fetch the transcript
            try {
              const response = await fetch(job.Transcript.TranscriptFileUri);
              if (response.ok) {
                const transcript = await response.json();
                console.log(`   Text: "${transcript.results?.transcripts?.[0]?.transcript || 'No text'}"`);
              } else {
                console.log(`   ❌ Failed to fetch transcript: ${response.status}`);
              }
            } catch (fetchError) {
              console.log(`   ❌ Error fetching transcript: ${fetchError.message}`);
            }
          }
        } catch (detailError) {
          console.log(`   ❌ Error getting job details: ${detailError.message}`);
        }
      }
    }
    
    // Also check failed jobs
    const failedJobs = await transcribeClient.send(new ListTranscriptionJobsCommand({ 
      MaxResults: 3,
      Status: 'FAILED'
    }));
    
    if (failedJobs.TranscriptionJobSummaries && failedJobs.TranscriptionJobSummaries.length > 0) {
      console.log(`\n❌ Found ${failedJobs.TranscriptionJobSummaries.length} failed jobs:`);
      for (const job of failedJobs.TranscriptionJobSummaries) {
        console.log(`   - ${job.TranscriptionJobName}: ${job.FailureReason || 'Unknown error'}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Failed to check transcription jobs:');
    console.log(`Error: ${error.message}`);
    console.log(`Code: ${error.name}`);
  }
}

checkTranscribeJobs();