/**
 * Test basic Square connectivity with new credentials
 */

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;

async function testBasicSquareConnection() {
  console.log('🔍 Testing basic Square API connectivity...');
  console.log(`📍 Location ID: ${SQUARE_LOCATION_ID}`);
  console.log(`🔑 Access Token: ${SQUARE_ACCESS_TOKEN ? SQUARE_ACCESS_TOKEN.substring(0, 10) + '...' : 'NOT SET'}`);
  
  try {
    // Test 1: Get location information (usually has fewer permission requirements)
    console.log('\n1️⃣ Testing location info...');
    const locationResponse = await fetch(`https://connect.squareupsandbox.com/v2/locations/${SQUARE_LOCATION_ID}`, {
      headers: {
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Square-Version': '2023-12-13'
      }
    });
    
    if (locationResponse.ok) {
      const locationData = await locationResponse.json();
      console.log('✅ Location API works!');
      console.log(`   Location Name: ${locationData.location?.name || 'Unknown'}`);
      console.log(`   Status: ${locationData.location?.status || 'Unknown'}`);
    } else {
      const errorText = await locationResponse.text();
      console.log('❌ Location API failed:', errorText);
    }
    
    // Test 2: Simple payments test (create a basic payment object)
    console.log('\n2️⃣ Testing payments API...');
    const paymentsResponse = await fetch('https://connect.squareupsandbox.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-12-13'
      },
      body: JSON.stringify({
        source_id: 'FAKE_SOURCE_ID', // This will fail but tells us about permissions
        amount_money: {
          amount: 100,
          currency: 'AUD'
        },
        location_id: SQUARE_LOCATION_ID,
        idempotency_key: `test-${Date.now()}`
      })
    });
    
    const paymentsText = await paymentsResponse.text();
    if (paymentsResponse.status === 400) {
      console.log('✅ Payments API accessible (expected 400 with fake source)');
    } else if (paymentsResponse.status === 403) {
      console.log('❌ Payments API permission denied');
    } else {
      console.log(`ℹ️ Payments API response: ${paymentsResponse.status}`);
    }
    console.log(`   Response: ${paymentsText.substring(0, 200)}...`);
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testBasicSquareConnection();