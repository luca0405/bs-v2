/**
 * Create orders that will definitely appear in Square dashboard
 * by using the correct payment flow for credit-based orders
 */

import fetch from 'node-fetch';

async function createDashboardVisibleOrder(beanStalkerOrder) {
  console.log(`Creating dashboard-visible order for Bean Stalker order #${beanStalkerOrder.id}...`);
  
  try {
    // Step 1: Create the order with COMPLETED state
    const orderData = {
      reference_id: `bs-order-${beanStalkerOrder.id}`,
      source: {
        name: "Bean Stalker Coffee Shop"
      },
      location_id: process.env.SQUARE_LOCATION_ID,
      state: 'COMPLETED', // Create as completed order
      line_items: (beanStalkerOrder.items || []).map((item, index) => ({
        uid: `item-${beanStalkerOrder.id}-${index}`,
        name: item.name || 'Coffee Item',
        quantity: item.quantity?.toString() || '1',
        item_type: 'ITEM',
        base_price_money: {
          amount: Math.round((item.price || 0) * 100),
          currency: 'AUD'
        },
        note: `Paid with Bean Stalker app credits`
      })),
      fulfillments: [{
        uid: `fulfillment-${beanStalkerOrder.id}`,
        type: 'PICKUP',
        state: 'COMPLETED',
        pickup_details: {
          recipient: {
            display_name: beanStalkerOrder.customerName || 'Bean Stalker Customer'
          },
          schedule_type: 'ASAP',
          note: 'Paid with Bean Stalker app credits'
        }
      }],
      tenders: [{
        id_key: `credit-tender-${beanStalkerOrder.id}`,
        type: 'OTHER',
        amount_money: {
          amount: Math.round((beanStalkerOrder.total || 0) * 100),
          currency: 'AUD'
        },
        note: `Bean Stalker App Credits - Customer: ${beanStalkerOrder.customerName || 'Customer'}`
      }]
    };

    const response = await fetch('https://connect.squareupsandbox.com/v2/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-12-13'
      },
      body: JSON.stringify({ order: orderData })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Created completed Square order ${result.order.id} for Bean Stalker order #${beanStalkerOrder.id}`);
      return { success: true, orderId: result.order.id };
    } else {
      const errorData = await response.text();
      console.log(`❌ Failed to create order: ${errorData}`);
      return { success: false, error: errorData };
    }

  } catch (error) {
    console.log(`❌ Error creating order: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Get Bean Stalker orders and create visible Square orders
async function createVisibleOrdersFromBeanStalker() {
  console.log('Fetching Bean Stalker orders...');
  
  try {
    const response = await fetch('http://localhost:5000/api/orders', {
      headers: {
        'Cookie': 'connect.sid=test-session'
      }
    });
    
    if (!response.ok) {
      console.log('Failed to fetch Bean Stalker orders');
      return;
    }
    
    const orders = await response.json();
    console.log(`Found ${orders.length} Bean Stalker orders`);
    
    // Create visible orders for the first 3 orders
    const ordersToProcess = orders.slice(0, 3);
    const results = [];
    
    for (const order of ordersToProcess) {
      // Get customer name
      const userResponse = await fetch(`http://localhost:5000/api/admin/users/${order.userId}`, {
        headers: {
          'Cookie': 'connect.sid=test-session'
        }
      });
      
      let customerName = 'Bean Stalker Customer';
      if (userResponse.ok) {
        const user = await userResponse.json();
        customerName = user.username || customerName;
      }
      
      const orderWithCustomer = {
        ...order,
        customerName
      };
      
      const result = await createDashboardVisibleOrder(orderWithCustomer);
      results.push(result);
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const successful = results.filter(r => r.success).length;
    console.log(`\n🎉 Successfully created ${successful}/${results.length} visible orders in Square dashboard`);
    
    return results;
    
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return [];
  }
}

// Run the script
createVisibleOrdersFromBeanStalker().then(results => {
  console.log('\nResults:', JSON.stringify(results, null, 2));
  console.log('\nThese orders should now appear in your Square dashboard under "All orders"!');
}).catch(console.error);