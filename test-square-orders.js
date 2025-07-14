/**
 * Test script to send Bean Stalker orders to actual Square sandbox account
 */

import fetch from 'node-fetch';

async function testSquareOrdersAPI() {
  console.log('🔄 Testing real Square Orders API integration...');
  
  // Test order data - representing Bean Stalker order
  const testOrder = {
    reference_id: `bs-order-test-${Date.now()}`,
    source: {
      name: "Bean Stalker Coffee Shop"
    },
    location_id: process.env.SQUARE_LOCATION_ID,
    line_items: [{
      uid: `item-test-1`,
      name: 'Egg & Bacon Panini',
      quantity: '1',
      item_type: 'ITEM',
      base_price_money: {
        amount: 1350, // $13.50 AUD in cents
        currency: 'AUD'
      }
    }, {
      uid: `item-test-2`,
      name: 'White Coffee',
      quantity: '1',
      item_type: 'ITEM',
      base_price_money: {
        amount: 520, // $5.20 AUD in cents
        currency: 'AUD'
      }
    }],
    fulfillments: [{
      uid: `fulfillment-test`,
      type: 'PICKUP',
      state: 'PROPOSED',
      pickup_details: {
        recipient: {
          display_name: 'Test Customer - Bean Stalker'
        },
        schedule_type: 'ASAP',
        note: 'Bean Stalker test order'
      }
    }]
  };
  
  try {
    console.log(`📤 Sending test order to Square sandbox...`);
    console.log(`📍 Location ID: ${process.env.SQUARE_LOCATION_ID}`);
    
    // Make actual Square API call
    const response = await fetch('https://connect.squareupsandbox.com/v2/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-12-13'
      },
      body: JSON.stringify({
        order: testOrder
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ SUCCESS! Created Square order: ${result.order?.id}`);
      console.log(`💰 Order total: $${(result.order?.total_money?.amount || 0) / 100}`);
      console.log(`📋 Reference: ${result.order?.reference_id}`);
      
      return {
        success: true,
        squareOrderId: result.order?.id,
        total: result.order?.total_money?.amount,
        message: 'Order successfully created in Square sandbox'
      };
    } else {
      const errorData = await response.text();
      console.error(`❌ Square API error: ${response.status} - ${errorData}`);
      
      return {
        success: false,
        error: `${response.status}: ${errorData}`
      };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testSquareOrdersAPI().then(result => {
  console.log('\n🎯 Final Result:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('\n🎉 Your Bean Stalker orders will now appear in your Square sandbox account!');
    console.log('🔍 Check your Square dashboard to see the order.');
  } else {
    console.log('\n⚠️  Order creation failed. Check your Square API credentials.');
  }
}).catch(console.error);