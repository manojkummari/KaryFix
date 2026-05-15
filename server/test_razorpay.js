const axios = require('axios');
async function test() {
  try {
    // We need to login first to get a cookie
    const loginRes = await axios.post('http://localhost:8000/api/auth/login', {
      email: 'tech@example.com', // Let's guess a valid tech or user
      password: 'password123'
    });
    const cookie = loginRes.headers['set-cookie'];
    console.log("Cookie:", cookie);

    const res = await axios.post('http://localhost:8000/api/wallet/add-money', { amount: 500 }, {
      headers: { Cookie: cookie }
    });
    console.log("Success:", res.data);
  } catch (error) {
    console.log("Error:", error.response?.data || error.message);
  }
}
test();
