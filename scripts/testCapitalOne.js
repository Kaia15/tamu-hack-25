import axios from 'axios';

const API_KEY = 'e843883bf3bf06f479c79f5d6ced895b';
const BASE_URL = 'http://api.nessieisreal.com';

async function testAPI() {
  try {
    // Create a test customer
    console.log('\n1. Creating test customer...');
    const newCustomer = await axios.post(`${BASE_URL}/customers?key=${API_KEY}`, {
      first_name: "Test",
      last_name: "User",
      address: {
        street_number: "123",
        street_name: "Test St",
        city: "Boston",
        state: "MA",
        zip: "02110"
      }
    });
    
    const customerId = newCustomer.data.objectCreated._id;
    console.log('✅ Created customer with ID:', customerId);

    // Create a test account
    console.log('\n2. Creating account for customer...');
    const newAccount = await axios.post(`${BASE_URL}/customers/${customerId}/accounts?key=${API_KEY}`, {
      type: "Credit Card",
      nickname: "Test Card",
      rewards: 0,
      balance: 1000
    });

    const accountId = newAccount.data.objectCreated._id;
    console.log('✅ Created account with ID:', accountId);

    // Create a test merchant
    console.log('\n3. Creating test merchant...');
    const newMerchant = await axios.post(`${BASE_URL}/merchants?key=${API_KEY}`, {
      name: "Test Store",
      category: "Food",
      address: {
        street_number: "456",
        street_name: "Commerce St",
        city: "Boston",
        state: "MA",
        zip: "02110"
      },
      geocode: {
        lat: 42.3601,
        lng: -71.0589
      }
    });

    const merchantId = newMerchant.data.objectCreated._id;
    console.log('✅ Created merchant with ID:', merchantId);

    // Create test purchases
    console.log('\n4. Creating test purchases...');
    const purchases = [
      { amount: 50.00, description: "Groceries" },
      { amount: 25.00, description: "Restaurant" },
      { amount: 30.00, description: "Movie Theater" }
    ];

    for (const purchase of purchases) {
      await axios.post(`${BASE_URL}/accounts/${accountId}/purchases?key=${API_KEY}`, {
        merchant_id: merchantId,
        medium: "balance",
        purchase_date: new Date().toISOString(),
        amount: purchase.amount,
        description: purchase.description,
        status: "completed"
      });
    }

    console.log('✅ Created test purchases');
    console.log('\n✅ All tests completed successfully!');
    console.log('\nUse these IDs in your .env file:');
    console.log('CUSTOMER_ID:', customerId);
    console.log('ACCOUNT_ID:', accountId);
    console.log('MERCHANT_ID:', merchantId);


  } catch (error) {
    console.error('❌ Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
}

testAPI(); 