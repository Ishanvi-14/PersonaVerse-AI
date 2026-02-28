/**
 * Test History API Endpoints
 */

const { default: fetch } = require('node-fetch');

async function testHistoryEndpoints() {
  try {
    console.log('Testing History endpoints...');
    
    // Test 1: Save a history entry
    console.log('\n1. Testing POST /aws/history (save entry)...');
    
    const saveResponse = await fetch('http://localhost:3001/aws/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 'demo-user',
        personaId: 'founder',
        platform: 'linkedin',
        inputContent: 'Create a post about AI innovation',
        generatedContent: 'AI innovation is reshaping how we work and live. At PersonaVerse, we believe technology should amplify human creativity, not replace it. Our Digital Identity System ensures every AI interaction feels authentically you. #AIInnovation #PersonaVerse #TechForGood',
        personaAlignmentScore: 0.92,
        metadata: {
          hinglishUsed: false,
          culturalAdaptations: ['TechForGood hashtag'],
          platform: 'linkedin'
        }
      })
    });
    
    const saveResult = await saveResponse.json();
    
    if (saveResponse.ok) {
      console.log('✅ Save history: SUCCESS');
      console.log(`History ID: ${saveResult.data?.historyId}`);
    } else {
      console.log('❌ Save history: FAILED');
      console.log('Error:', JSON.stringify(saveResult, null, 2));
    }
    
    // Test 2: Get history entries
    console.log('\n2. Testing GET /aws/history/demo-user (get entries)...');
    
    const getResponse = await fetch('http://localhost:3001/aws/history/demo-user');
    const getResult = await getResponse.json();
    
    if (getResponse.ok) {
      console.log('✅ Get history: SUCCESS');
      console.log(`Found ${getResult.data?.entries?.length || 0} entries`);
      
      if (getResult.data?.entries?.length > 0) {
        console.log('Recent entries:');
        getResult.data.entries.slice(0, 3).forEach((entry, i) => {
          console.log(`  ${i + 1}. ${entry.platform} - "${entry.output?.text?.substring(0, 50)}..."`);
        });
      }
    } else {
      console.log('❌ Get history: FAILED');
      console.log('Error:', JSON.stringify(getResult, null, 2));
    }
    
    // Test 3: Save another entry with different persona
    console.log('\n3. Testing another save (different persona)...');
    
    const save2Response = await fetch('http://localhost:3001/aws/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 'demo-user',
        personaId: 'educator',
        platform: 'twitter',
        inputContent: 'Explain machine learning simply',
        generatedContent: 'Machine Learning sikhna hai? Think of it like teaching a bachcha to recognize faces. You show thousands of photos, and slowly the computer learns patterns. Bas! That\'s ML in a nutshell. 🧠✨ #MachineLearning #TechEducation #LearnWithMe',
        personaAlignmentScore: 0.88,
        metadata: {
          hinglishUsed: true,
          culturalAdaptations: ['bachcha reference', 'Hinglish mixing'],
          platform: 'twitter'
        }
      })
    });
    
    const save2Result = await save2Response.json();
    
    if (save2Response.ok) {
      console.log('✅ Save history 2: SUCCESS');
      console.log(`History ID: ${save2Result.data?.historyId}`);
    } else {
      console.log('❌ Save history 2: FAILED');
      console.log('Error:', JSON.stringify(save2Result, null, 2));
    }
    
  } catch (error) {
    console.log('\n❌ Test failed with error:');
    console.log(`Error: ${error.message}`);
  }
}

testHistoryEndpoints();