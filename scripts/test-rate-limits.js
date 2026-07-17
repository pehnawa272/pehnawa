const BASE_URL = "http://localhost:3000";

async function testRoute(name, url, method, body, count, expectedLimit) {
  console.log(`\n========================================`);
  console.log(`Testing Route: ${method} ${url}`);
  console.log(`Expected Limit: ${expectedLimit}`);
  console.log(`========================================`);

  const statuses = [];
  const testIp = `192.168.1.${Math.floor(Math.random() * 250) + 1}`;

  for (let i = 0; i < count; i++) {
    // Send requests in sequence to make sure we count them clearly
    try {
      const res = await fetch(`${BASE_URL}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          // Send constant testIp header for this specific route test run
          "X-Forwarded-For": testIp,
        },
        body: JSON.stringify(body),
      });
      statuses.push(res.status);
    } catch (e) {
      statuses.push(`Error: ${e.message}`);
    }
  }

  console.log(`HTTP Statuses returned:`, statuses.join(", "));
  
  // Checking if at least one 429 was returned
  const has429 = statuses.includes(429);
  
  if (has429) {
    console.log(`RESULT: PASS (Rate limiting triggered successfully)`);
    return { name, expectedLimit, behavior: `Triggered 429 correctly after limit exceeded (statuses: ${statuses.slice(0, 3).join(",")}... -> 429)`, pass: true };
  } else {
    console.log(`RESULT: FAIL (No 429 status code returned)`);
    return { name, expectedLimit, behavior: `Did not return 429. Statuses: ${statuses.join(", ")}`, pass: false };
  }
}

async function runAllTests() {
  const results = [];

  // 1. POST /api/consultations (Limit: 3 requests per 10 min)
  // We send 5 requests. Request 4 and 5 should return 429.
  results.push(await testRoute(
    "POST /api/consultations",
    "/api/consultations",
    "POST",
    {
      clientName: "Test Suite User",
      clientEmail: "test-suite@pehnawa.com",
      clientPhone: "+1234567890",
      type: "VIRTUAL",
      message: "Testing rate limits",
    },
    5,
    "3 per 10 minutes"
  ));

  // 2. POST /api/coupons/validate (Limit: 10 requests per minute)
  // We send 12 requests. Request 11 and 12 should return 429.
  results.push(await testRoute(
    "POST /api/coupons/validate",
    "/api/coupons/validate",
    "POST",
    {
      code: "NONEXISTENT",
      cartSubtotal: 100,
    },
    12,
    "10 per minute"
  ));

  // 3. POST /api/payments/create-order (Limit: 5 requests per minute)
  // We send 7 requests. Request 6 and 7 should return 429.
  results.push(await testRoute(
    "POST /api/payments/create-order",
    "/api/payments/create-order",
    "POST",
    {
      shippingForm: {
        name: "Test User",
        email: "test@pehnawa.com",
        phone: "1234567890",
        address: "123 Atelier Street",
        city: "Mumbai",
        state: "Maharashtra",
        zip: "400001",
      },
      items: [
        { id: "non-existent-product-id", quantity: 1 }
      ],
    },
    7,
    "5 per minute"
  ));

  // 4. POST /api/admin/login (Limit: 5 requests per 15 minutes)
  // We send 7 requests. Request 6 and 7 should return 429.
  results.push(await testRoute(
    "POST /api/admin/login",
    "/api/admin/login",
    "POST",
    {
      username: "admin",
      password: "wrongpassword",
    },
    7,
    "5 per 15 minutes"
  ));

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY`);
  console.log(`========================================`);
  console.table(results.map(r => ({
    Route: r.name,
    "Expected Limit": r.expectedLimit,
    "Behavior": r.behavior,
    "Status": r.pass ? "PASS" : "FAIL"
  })));
}

runAllTests().catch(console.error);
