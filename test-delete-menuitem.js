import https from 'https';
import http from 'http';
import fs from 'fs';

// Function to make HTTP requests with cookies
async function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.headers['set-cookie']) {
          fs.writeFileSync('/tmp/cookie.txt', res.headers['set-cookie'][0].split(';')[0]);
        }
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData ? JSON.parse(responseData) : null
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testDeleteMenuItem() {
  try {
    // Step 1: Login as admin
    console.log("Logging in as admin...");
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const loginData = {
      username: 'admin',
      password: 'admin123'
    };
    
    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log(`Login status: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode !== 200) {
      console.error("Login failed:", loginResponse.data);
      return;
    }
    
    // Get cookie from temp file
    const cookie = fs.readFileSync('/tmp/cookie.txt', 'utf8');
    
    // Get the menu item list to find an item to delete
    console.log("Getting menu items...");
    const menuOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/menu',
      method: 'GET',
      headers: {
        'Cookie': cookie
      }
    };
    
    const menuResponse = await makeRequest(menuOptions);
    console.log(`Menu API status: ${menuResponse.statusCode}`);
    
    if (!menuResponse.data || !menuResponse.data.length) {
      console.error("No menu items found");
      return;
    }
    
    // Pick a menu item to delete (first one)
    const menuItemToDelete = menuResponse.data[0];
    console.log(`Attempting to delete menu item: ${menuItemToDelete.id} - ${menuItemToDelete.name}`);
    
    // Step 2: Delete the menu item
    const deleteOptions = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/admin/menu/${menuItemToDelete.id}`,
      method: 'DELETE',
      headers: {
        'Cookie': cookie
      }
    };
    
    const deleteResponse = await makeRequest(deleteOptions);
    console.log(`Delete menu item status: ${deleteResponse.statusCode}`);
    console.log(deleteResponse.data || "Deletion successful (no content returned)");
    
    // Step 3: Verify deletion by getting the menu again
    const verifyResponse = await makeRequest(menuOptions);
    
    const deletedItem = verifyResponse.data.find(item => item.id === menuItemToDelete.id);
    if (!deletedItem) {
      console.log("Menu item deleted successfully! It no longer appears in the menu.");
    } else {
      console.log("Menu item still exists in the menu. Deletion may have failed.");
    }
    
  } catch (error) {
    console.error("Error testing delete menu item:", error);
  }
}

// Run the test
testDeleteMenuItem().catch(console.error);