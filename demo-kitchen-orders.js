// Demo script to create sample kitchen orders for Bean Stalker demonstration
const baseUrl = 'http://localhost:5000';

async function makeRequest(method, endpoint, data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    return null;
  }
}

async function createSampleOrders() {
  console.log('🍵 Creating sample restaurant orders for Kitchen Display demo...');
  
  // Sample orders with different statuses and priorities
  const sampleOrders = [
    {
      items: [
        { id: 1, name: "Cappuccino", quantity: 2, price: 4.50 },
        { id: 5, name: "Croissant", quantity: 1, price: 3.25 }
      ],
      total: 12.25,
      status: 'pending',
      notes: 'Extra hot, no foam'
    },
    {
      items: [
        { id: 3, name: "Iced Latte", quantity: 1, price: 5.00 },
        { id: 7, name: "Blueberry Muffin", quantity: 2, price: 6.50 }
      ],
      total: 17.50,
      status: 'preparing',
      notes: 'Oat milk substitute'
    },
    {
      items: [
        { id: 2, name: "Espresso", quantity: 3, price: 9.00 },
        { id: 12, name: "Turkey Sandwich", quantity: 1, price: 8.95 }
      ],
      total: 17.95,
      status: 'ready',
      notes: 'Rush order for meeting'
    }
  ];
  
  let orderCount = 0;
  
  for (const order of sampleOrders) {
    try {
      const result = await makeRequest('POST', '/api/orders', order);
      if (result && result.id) {
        console.log(`✅ Created order #${result.id} - $${order.total} (${order.status})`);
        orderCount++;
        
        // Update status if not pending
        if (order.status !== 'pending') {
          await makeRequest('PATCH', `/api/kitchen/orders/${result.id}`, {
            status: order.status
          });
          console.log(`   📋 Updated to ${order.status} status`);
        }
      }
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  }
  
  console.log(`\n🎉 Demo setup complete! Created ${orderCount} sample orders`);
  console.log('📱 Visit /kitchen to see the Kitchen Display System');
  console.log('🔄 Orders refresh automatically every 5 seconds');
}

// Run the demo setup
createSampleOrders();