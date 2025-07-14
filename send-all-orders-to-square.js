/**
 * Send all Bean Stalker orders to Square sandbox account
 */

import fetch from 'node-fetch';
import { Pool } from '@neondatabase/serverless';

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getAllOrders() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT o.id, o.userId, o.total, o.items, o.createdAt, u.username
      FROM orders o
      LEFT JOIN users u ON o.userId = u.id
      ORDER BY o.createdAt DESC
      LIMIT 10
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

async function sendOrderToSquare(order) {
  const items = Array.isArray(order.items) ? order.items : 
                typeof order.items === 'string' ? JSON.parse(order.items) : [];
  
  const squareOrderData = {
    reference_id: `bs-order-${order.id}`,
    source: {
      name: "Bean Stalker Coffee Shop"
    },
    location_id: process.env.SQUARE_LOCATION_ID,
    line_items: items.map((item, index) => ({
      uid: `item-${order.id}-${index}`,
      name: item.name || 'Coffee Item',
      quantity: (item.quantity || 1).toString(),
      item_type: 'ITEM',
      base_price_money: {
        amount: Math.round((item.price || 0) * 100), // Convert to cents
        currency: 'AUD'
      }
    })),
    fulfillments: [{
      uid: `fulfillment-${order.id}`,
      type: 'PICKUP',
      state: 'PROPOSED',
      pickup_details: {
        recipient: {
          display_name: order.username || `Customer #${order.userId}`
        },
        schedule_type: 'ASAP',
        note: `Bean Stalker order #${order.id} - ${new Date(order.createdAt).toLocaleDateString()}`
      }
    }]
  };

  const response = await fetch('https://connect.squareupsandbox.com/v2/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Square-Version': '2023-12-13'
    },
    body: JSON.stringify({
      order: squareOrderData
    })
  });

  if (response.ok) {
    const result = await response.json();
    return {
      success: true,
      squareOrderId: result.order?.id,
      beanStalkerOrderId: order.id,
      total: result.order?.total_money?.amount
    };
  } else {
    const errorData = await response.text();
    return {
      success: false,
      beanStalkerOrderId: order.id,
      error: `${response.status}: ${errorData}`
    };
  }
}

async function main() {
  console.log('Starting Bean Stalker to Square Orders sync...');
  
  try {
    const orders = await getAllOrders();
    console.log(`Found ${orders.length} Bean Stalker orders to sync`);
    
    let successCount = 0;
    const errors = [];
    
    for (const order of orders) {
      try {
        console.log(`Sending order #${order.id} to Square...`);
        const result = await sendOrderToSquare(order);
        
        if (result.success) {
          console.log(`✅ Order #${result.beanStalkerOrderId} → Square order ${result.squareOrderId}`);
          successCount++;
        } else {
          console.log(`❌ Failed to sync order #${result.beanStalkerOrderId}: ${result.error}`);
          errors.push(result.error);
        }
      } catch (error) {
        console.log(`❌ Error processing order #${order.id}: ${error.message}`);
        errors.push(error.message);
      }
    }
    
    console.log(`\n🎉 Successfully synced ${successCount}/${orders.length} orders to Square sandbox`);
    if (errors.length > 0) {
      console.log(`⚠️  ${errors.length} errors occurred:`);
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\nYour Bean Stalker orders should now appear in your Square dashboard!');
    
  } catch (error) {
    console.error('Sync failed:', error);
  } finally {
    await pool.end();
  }
}

main();