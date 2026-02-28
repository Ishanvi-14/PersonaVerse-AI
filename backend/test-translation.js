/**
 * Test AWS Translation with Cultural Transcreation
 */

const { default: fetch } = require('node-fetch');

async function testTranslation() {
  try {
    console.log('Testing AWS Translation with Cultural Transcreation...');
    
    const testText = "That was a home run! Our startup is hitting it out of the park with this new AI feature.";
    
    const response = await fetch('http://localhost:3001/aws/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: testText,
        targetLanguage: 'hi',
        sourceLanguage: 'en'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('\n✅ Translation Test: SUCCESS');
      console.log(`Original: "${testText}"`);
      console.log(`Translated: "${result.data.translatedText}"`);
      console.log(`Language: ${result.data.targetLanguage}`);
      console.log(`Transcreation Applied: ${result.data.transcreationApplied}`);
      
      if (result.data.metaphorsReplaced && result.data.metaphorsReplaced.length > 0) {
        console.log('Metaphors Replaced:');
        result.data.metaphorsReplaced.forEach(metaphor => {
          console.log(`  - "${metaphor.original}" → "${metaphor.replacement}"`);
        });
      }
    } else {
      console.log('\n❌ Translation Test: FAILED');
      console.log('Error:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.log('\n❌ Test failed with error:');
    console.log(`Error: ${error.message}`);
  }
}

testTranslation();