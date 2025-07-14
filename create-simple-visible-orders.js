/**
 * Create simple orders that will appear in Square dashboard
 * using the correct format for credit-based payments
 */

import fetch from 'node-fetch';

async function createVisibleOrder(orderData) {
  console.log(`Creating visible order: ${orderData.name}...`);
  
  const squareOrderData = {
    reference_id: orderData.reference_id,
    source: {
      name: "Bean Stalker Coffee Shop"
    },
    location_id: process.env.SQUARE_LOCATION_ID,
    state: 'COMPLETED',
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
      state: 'COMPLETED',
      pickup_details: {
        recipient: {
          display_name: orderData.customer_name
        },
        schedule_type: 'ASAP',
        note: 'Paid with Bean Stalker app credits'
      }
    }],
    tenders: [{
      id_key: `credit-tender-${orderData.reference_id}`,
      type: 'OTHER',
      amount_money: {
        amount: orderData.amount,
        currency: 'AUD'
      },
      note: `Bean Stalker App Credits - ${orderData.customer_name}`
    }]
  };

  try {
    const response = await fetch('https://connect.squareupsandbox.com/v2/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-12-13'
      },
      body: JSON.stringify({ order: squareOrderData })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Created order ${result.order.id} - ${orderData.name}`);
      return { success: true, orderId: result.order.id, name: orderData.name };
    } else {
      const errorData = await response.text();
      console.log(`❌ Failed to create ${orderData.name}: ${errorData}`);
      return { success: false, error: errorData, name: orderData.name };
    }
  } catch (error) {
    console.log(`❌ Error creating ${orderData.name}: ${error.message}`);
    return { success: false, error: error.message, name: orderData.name };
  }
}

// Create sample Bean Stalker orders that will be visible
async function createSampleVisibleOrders() {
  const sampleOrders = [
    {
      reference_id: `bs-credit-order-${Date.now()}-1`,
      name: "Bean Stalker Latte Order",
      item_name: "Large Latte with Oat Milk",
      amount: 650, // $6.50 AUD
      customer_name: "Sarah Chen"
    },
    {
      reference_id: `bs-credit-order-${Date.now()}-2`,
      name: "Bean Stalker Espresso Order", 
      item_name: "Double Espresso",
      amount: 450, // $4.50 AUD
      customer_name: "Mike Johnson"
    },
    {
      reference_id: `bs-credit-order-${Date.now()}-3`,
      name: "Bean Stalker Cappuccino Order",
      item_name: "Regular Cappuccino",
      amount: 550, // $5.50 AUD
      customer_name: "Emma Wilson"
    }
  ];

  console.log('Creating sample Bean Stalker orders with credit payments...\n');

  const results = [];
  for (const order of sampleOrders) {
    const result = await createVisibleOrder(order);
    results.push(result);
    
    // Wait between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const successful = results.filter(r => r.success).length;
  console.log(`\n🎉 Successfully created ${successful}/${results.length} orders visible in Square dashboard`);
  
  if (successful > 0) {
    console.log('\nThese orders should now appear in your Square dashboard:');
    results.filter(r => r.success).forEach(r => {
      console.log(`- Order ID: ${r.orderId} (${r.name})`);
    });
    console.log('\nLook for orders with source "Bean Stalker Coffee Shop" and payment type "OTHER" showing credit payments.');
  }

  return results;
}

// Run the script
createSampleVisibleOrders()
  .then(results => {
    console.log('\nAll orders created. Check your Square dashboard under "All orders".');
  })
  .catch(console.error);