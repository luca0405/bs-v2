/**
 * Debug script to test which Square location orders are being sent to
 */

async function testSquareLocation() {
  console.log('🔍 Testing Square location configuration...');
  
  // Check environment variables
  console.log('Environment variables:');
  console.log(`SQUARE_LOCATION_ID: ${process.env.SQUARE_LOCATION_ID}`);
  console.log(`SQUARE_ACCESS_TOKEN: ${process.env.SQUARE_ACCESS_TOKEN ? 'Set' : 'Not set'}`);
  
  // Test location API call
  try {
    const locationResponse = await fetch(`https://connect.squareupsandbox.com/v2/locations/${process.env.SQUARE_LOCATION_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-12-13'
      }
    });
    
    if (locationResponse.ok) {
      const locationData = await locationResponse.json();
      console.log('✅ Location data:', JSON.stringify(locationData.location, null, 2));
    } else {
      console.error('❌ Location API error:', await locationResponse.text());
    }
  } catch (error) {
    console.error('❌ Location API exception:', error);
  }
  
  // Test creating a simple order with debugging
  try {
    console.log('\n🔄 Testing order creation...');
    
    const testOrderData = {
      reference_id: `debug-test-${Date.now()}`,
      location_id: process.env.SQUARE_LOCATION_ID,
      line_items: [{
        uid: 'debug-item-1',
        name: 'Debug Test Coffee',
        quantity: '1',
        item_type: 'ITEM',
        base_price_money: {
          amount: 550, // $5.50 in cents
          currency: 'AUD'
        }
      }],
      fulfillments: [{
        uid: 'debug-fulfillment-1',
        type: 'PICKUP',
        state: 'PROPOSED',
        pickup_details: {
          recipient: {
            display_name: 'Debug Test Customer'
          },
          schedule_type: 'ASAP',
          note: 'Debug test order for location verification'
        }
      }]
    };
    
    console.log('📤 Sending order data:');
    console.log(JSON.stringify(testOrderData, null, 2));
    
    const orderResponse = await fetch('https://connect.squareupsandbox.com/v2/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-12-13'
      },
      body: JSON.stringify({
        order: testOrderData
      })
    });
    
    if (orderResponse.ok) {
      const orderResult = await orderResponse.json();
      console.log('✅ Order created successfully:');
      console.log(`Square Order ID: ${orderResult.order?.id}`);
      console.log(`Location ID: ${orderResult.order?.location_id}`);
      console.log(`Reference ID: ${orderResult.order?.reference_id}`);
    } else {
      const errorData = await orderResponse.text();
      console.error('❌ Order creation failed:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Order creation exception:', error);
  }
}

testSquareLocation().catch(console.error);