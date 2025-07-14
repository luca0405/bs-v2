/**
 * Create properly balanced orders for Square dashboard visibility
 * with correct tender amounts matching line item totals
 */

import fetch from 'node-fetch';

async function createBalancedOrder(orderData) {
  console.log(`Creating balanced order: ${orderData.name}...`);
  
  const squareOrderData = {
    reference_id: orderData.reference_id,
    source: {
      name: "Bean Stalker Coffee Shop"
    },
    location_id: process.env.SQUARE_LOCATION_ID,
    line_items: [{
      uid: `item-${orderData.reference_id}`,
      name: orderData.item_name,
      quantity: '1',
      item_type: 'ITEM',
      base_price_money: {
        amount: orderData.amount,
        currency: 'AUD'
      }
    }],
    fulfillments: [{
      uid: `fulfillment-${orderData.reference_id}`,
      type: 'PICKUP',
      state: 'PROPOSED',
      pickup_details: {
        recipient: {
          display_name: orderData.customer_name
        },
        schedule_type: 'ASAP',
        note: 'Paid with Bean Stalker app credits'
      }
    }]
  };

  try {
    // Step 1: Create the order
    const orderResponse = await fetch('https://connect.squareupsandbox.com/v2/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-12-13'
      },
      body: JSON.stringify({ order: squareOrderData })
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.text();
      console.log(`❌ Failed to create order ${orderData.name}: ${errorData}`);
      return { success: false, error: errorData, name: orderData.name };
    }

    const orderResult = await orderResponse.json();
    const squareOrderId = orderResult.order.id;
    console.log(`Created order ${squareOrderId}`);

    // Step 2: Add payment using Square Payments API
    const paymentData = {
      source_id: 'cnon:card-nonce-ok', // Test card nonce
      idempotency_key: `pay-${Date.now()}`,
      amount_money: {
        amount: orderData.amount,
        currency: 'AUD'
      },
      order_id: squareOrderId,
      location_id: process.env.SQUARE_LOCATION_ID,
      note: `BEAN STALKER APP CREDITS - Customer: ${orderData.customer_name} - Original payment: Store Credit`
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
      console.log(`✅ Created order ${squareOrderId} with payment ${paymentResult.payment.id} - ${orderData.name}`);
      return { 
        success: true, 
        orderId: squareOrderId, 
        paymentId: paymentResult.payment.id,
        name: orderData.name 
      };
    } else {
      const paymentError = await paymentResponse.text();
      console.log(`⚠️ Created order ${squareOrderId} but payment failed for ${orderData.name}: ${paymentError}`);
      return { 
        success: false, 
        orderId: squareOrderId,
        error: paymentError, 
        name: orderData.name 
      };
    }

  } catch (error) {
    console.log(`❌ Error creating ${orderData.name}: ${error.message}`);
    return { success: false, error: error.message, name: orderData.name };
  }
}

async function createVisibleBeanStalkerOrders() {
  const sampleOrders = [
    {
      reference_id: `bs-credit-${Date.now()}-1`,
      name: "Bean Stalker Flat White",
      item_name: "Large Flat White",
      amount: 620, // $6.20 AUD
      customer_name: "Alex Thompson"
    },
    {
      reference_id: `bs-credit-${Date.now()}-2`,
      name: "Bean Stalker Cold Brew", 
      item_name: "Iced Cold Brew Coffee",
      amount: 580, // $5.80 AUD
      customer_name: "Jessica Lee"
    },
    {
      reference_id: `bs-credit-${Date.now()}-3`,
      name: "Bean Stalker Mocha",
      item_name: "Medium Mocha with Whipped Cream",
      amount: 720, // $7.20 AUD
      customer_name: "David Brown"
    }
  ];

  console.log('Creating Bean Stalker orders with credit payments that will appear in Square dashboard...\n');

  const results = [];
  for (const order of sampleOrders) {
    const result = await createBalancedOrder(order);
    results.push(result);
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const successful = results.filter(r => r.success).length;
  console.log(`\n🎉 Successfully created ${successful}/${results.length} orders in Square dashboard`);
  
  if (successful > 0) {
    console.log('\nThese orders should now be visible in your Square dashboard:');
    results.filter(r => r.success).forEach(r => {
      console.log(`- Order: ${r.orderId} | Payment: ${r.paymentId} | ${r.name}`);
    });
    console.log('\nLook for orders with source "Bean Stalker Coffee Shop" and payment notes mentioning "BEAN STALKER APP CREDITS"');
  }

  return results;
}

// Run the script
createVisibleBeanStalkerOrders()
  .then(results => {
    console.log('\nDone! Check your Square dashboard under "All orders" to see the Bean Stalker orders.');
  })
  .catch(console.error);