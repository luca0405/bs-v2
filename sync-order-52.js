/**
 * Manually sync order #52 to Square
 */

async function syncOrder52() {
  console.log('🔄 Syncing order #52 to Square...');
  
  try {
    // Use the single order sync function directly
    const { sendSingleOrderToSquare } = await import('./server/square-single-order-sync.js');
    const result = await sendSingleOrderToSquare(52);
    
    console.log('📋 Sync result:', result);
    
    if (result.success) {
      console.log(`✅ Order #52 successfully synced to Square!`);
      console.log(`📍 Square Order ID: ${result.squareOrderId}`);
    } else {
      console.log(`❌ Failed to sync order #52: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Error syncing order:', error.message);
  }
}

syncOrder52();