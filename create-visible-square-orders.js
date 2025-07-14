/**
 * Create Square orders that will be visible in the dashboard
 * by processing them through the complete order flow
 */

import fetch from 'node-fetch';

async function createVisibleSquareOrder() {
  console.log('Creating a visible Square order...');
  
  // First create the order
  const orderData = {
    reference_id: `bs-visible-${Date.now()}`,
    source: {
      name: "Bean Stalker Coffee Shop"
    },
    location_id: process.env.SQUARE_LOCATION_ID,
    line_items: [{
      uid: `item-visible-1`,
      name: 'Bean Stalker Test Order',
      quantity: '1',
      item_type: 'ITEM',
      base_price_money: {
        amount: 1000, // $10.00 AUD
        currency: 'AUD'
      }
    }],
    fulfillments: [{
      uid: `fulfillment-visible`,
      type: 'PICKUP',
      state: 'PROPOSED',
      pickup_details: {
        recipient: {
          display_name: 'Bean Stalker Customer'
        },
        schedule_type: 'ASAP',
        note: 'Test order from Bean Stalker'
      }
    }]
  };

  try {
    // Create the order
    const orderResponse = await fetch('https://connect.squareupsandbox.com/v2/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-12-13'
      },
      body: JSON.stringify({ order: orderData })
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.text();
      console.log(`Failed to create order: ${error}`);
      return;
    }

    const orderResult = await orderResponse.json();
    const orderId = orderResult.order.id;
    console.log(`Created order: ${orderId}`);

    // Now process payment to make it visible in dashboard
    const paymentData = {
      source_id: 'cnon:card-nonce-ok', // Test card nonce for sandbox
      idempotency_key: `payment-${Date.now()}`,
      amount_money: {
        amount: 1000,
        currency: 'AUD'
      },
      order_id: orderId,
      location_id: process.env.SQUARE_LOCATION_ID
    };

    const paymentResponse = await fetch('https://connect.squareupsandbox.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-12-13'
      },
      body: JSON.stringify(paymentData)
    });

    if (paymentResponse.ok) {
      const paymentResult = await paymentResponse.json();
      console.log(`Payment processed: ${paymentResult.payment.id}`);
      console.log(`Order ${orderId} should now be visible in Square dashboard`);
      
      return {
        success: true,
        orderId: orderId,
        paymentId: paymentResult.payment.id
      };
    } else {
      const paymentError = await paymentResponse.text();
      console.log(`Payment failed: ${paymentError}`);
      console.log(`Order ${orderId} created but not paid - may not appear in dashboard`);
      
      return {
        success: false,
        orderId: orderId,
        error: paymentError
      };
    }

  } catch (error) {
    console.log(`Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Create a test order that should be visible
createVisibleSquareOrder().then(result => {
  console.log('\nResult:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('\nThis order should now appear in your Square dashboard!');
    console.log('Check Orders > All orders for the Bean Stalker test order.');
  }
}).catch(console.error);