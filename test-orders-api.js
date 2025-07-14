/**
 * Test Square Orders API specifically with current credentials
 */

async function testOrdersAPI() {
  console.log('🔍 Testing Square Orders API specifically...');
  
  const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
  const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;
  
  try {
    // Test 1: List locations to see all available locations
    console.log('\n1️⃣ Checking all available locations...');
    const locationsResponse = await fetch('https://connect.squareupsandbox.com/v2/locations', {
      headers: {
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Square-Version': '2023-12-13'
      }
    });
    
    if (locationsResponse.ok) {
      const locationsData = await locationsResponse.json();
      console.log('✅ Available locations:');
      locationsData.locations?.forEach(location => {
        console.log(`   - ${location.id}: ${location.name} (${location.status})`);
      });
      
      // Check if our target location is in the list
      const targetLocation = locationsData.locations?.find(loc => loc.id === SQUARE_LOCATION_ID);
      if (targetLocation) {
        console.log(`✅ Target location ${SQUARE_LOCATION_ID} found and accessible`);
      } else {
        console.log(`❌ Target location ${SQUARE_LOCATION_ID} not found in accessible locations`);
      }
    } else {
      console.log('❌ Could not fetch locations');
    }
    
    // Test 2: Try to search for existing orders (read permission test)
    console.log('\n2️⃣ Testing Orders API read access...');
    const ordersSearchResponse = await fetch('https://connect.squareupsandbox.com/v2/orders/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-12-13'
      },
      body: JSON.stringify({
        location_ids: [SQUARE_LOCATION_ID],
        query: {
          filter: {
            date_time_filter: {
              created_at: {
                start_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Last 24 hours
              }
            }
          }
        },
        limit: 1
      })
    });
    
    const ordersSearchText = await ordersSearchResponse.text();
    console.log(`Orders search status: ${ordersSearchResponse.status}`);
    console.log(`Response: ${ordersSearchText.substring(0, 300)}...`);
    
    if (ordersSearchResponse.ok) {
      console.log('✅ Orders API read access confirmed');
    } else if (ordersSearchResponse.status === 403) {
      console.log('❌ Orders API access denied - token may need regeneration');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOrdersAPI();