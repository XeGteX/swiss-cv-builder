// import fetch from 'node-fetch'; // Using native fetch in Node 22

const BASE_URL = 'http://localhost:3000/api';
const TEST_USER = {
    email: `test_${Date.now()}@example.com`,
    password: 'password123'
};

async function runTest() {
    console.log('🚀 Starting Backend Verification...');

    // 1. Register
    console.log('\n1. Testing Registration...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USER)
    });

    if (!registerRes.ok) {
        const err = await registerRes.text();
        console.error('❌ Registration Failed:', err);
        process.exit(1);
    }
    const registerData = await registerRes.json();
    console.log('✅ Registered:', registerData.user.email);

    // Get cookie from response
    const cookies = registerRes.headers.get('set-cookie');
    if (!cookies) {
        console.error('❌ No cookie received');
        process.exit(1);
    }
    console.log('✅ Cookie received');

    // 2. Login (to verify logic, though register logs us in)
    console.log('\n2. Testing Login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USER)
    });

    if (!loginRes.ok) {
        console.error('❌ Login Failed');
        process.exit(1);
    }
    console.log('✅ Login Successful');

    // 3. Get Me (Protected Route)
    console.log('\n3. Testing Protected Route (/auth/me)...');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Cookie': cookies }
    });

    if (!meRes.ok) {
        console.error('❌ Get Me Failed');
        process.exit(1);
    }
    const meData = await meRes.json();
    console.log('✅ Authenticated as:', meData.user.email);

    // 4. Test AI Usage (Protected)
    console.log('\n4. Testing AI Usage Endpoint...');
    const usageRes = await fetch(`${BASE_URL}/ai/usage`, {
        headers: { 'Cookie': cookies }
    });

    if (!usageRes.ok) {
        console.error('❌ AI Usage Failed');
        process.exit(1);
    }
    const usageData = await usageRes.json();
    console.log('✅ AI Usage:', usageData);

    console.log('\n✨ Backend Verification Complete: SUCCESS');
}

runTest().catch(console.error);
