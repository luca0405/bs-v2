/**
 * Quick test to verify new Square credentials are working
 */

async function testNewSquareCredentials() {
  console.log('🔍 Testing new Square credentials...');
  
  try {
    const response = await fetch('http://localhost:5000/api/square/send-single-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId: 51 })
    });
    
    const result = await response.json();
    console.log('✅ Square API test result:', result);
    
    if (result.success) {
      console.log(`🎉 Order successfully sent to Square!`);
      console.log(`📍 Square Order ID: ${result.squareOrderId}`);
      console.log(`💳 Payment ID: ${result.paymentId}`);
      console.log('🏪 This should now appear in your NEW clean Square sandbox');
    } else {
      console.log('❌ Failed to send order:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing credentials:', error.message);
  }
}

testNewSquareCredentials();