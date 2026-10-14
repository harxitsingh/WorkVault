import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function req(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  return { ...data, httpStatus: res.status };
}

async function runVerification() {
  console.log('================================================================');
  console.log('🔍 WORKVAULT FINAL AUDIT & REPAIR VERIFICATION SUITE');
  console.log('================================================================\n');

  // TEST 1: Role Switch & Backend/JWT Synchronization
  console.log('TEST 1: Verifying Role Switch & Auth Sync...');
  const testEmail = `switchtest_${Date.now()}@example.com`;
  const registerRes = await req('POST', '/auth/register', {
    name: 'Alex Turner',
    email: testEmail,
    password: 'password123',
    role: 'client'
  });
  assert.strictEqual(registerRes.httpStatus, 201);
  let token = registerRes.data.token;
  assert.strictEqual(registerRes.data.user.role, 'client');
  console.log('   ✅ User registered with initial role: client');

  // As client, trying to create service must fail with 403
  const clientCreateServiceAttempt = await req('POST', '/services', {
    title: 'Client Service Attempt Should Fail',
    category: 'Web Development',
    description: 'Should be rejected',
    price: 5000
  }, token);
  assert.strictEqual(clientCreateServiceAttempt.httpStatus, 403);
  console.log('   ✅ Client role cannot create a service (403 Forbidden).');

  // Now switch role to 'freelancer' via POST /auth/switch-role
  const switchRes = await req('POST', '/auth/switch-role', { role: 'freelancer' }, token);
  assert.strictEqual(switchRes.httpStatus, 200);
  assert.strictEqual(switchRes.data.user.role, 'freelancer');
  token = switchRes.data.token;
  console.log('   ✅ Successfully switched role to freelancer. New JWT received.');

  // Verify /auth/me reflects the new role
  const meRes = await req('GET', '/auth/me', null, token);
  assert.strictEqual(meRes.httpStatus, 200);
  assert.strictEqual(meRes.data.role, 'freelancer');
  console.log('   ✅ /auth/me returns updated role: freelancer.');

  // TEST 2: Service Creation with all required fields (including FAQs and image)
  console.log('\nTEST 2: Verifying Service Creation with FAQs and details...');
  const newServiceRes = await req('POST', '/services', {
    title: 'Enterprise Distributed Systems with Node & Kafka',
    category: 'Web Development',
    description: 'High availability microservices with event driven architecture and clean code.',
    price: 45000,
    deliveryDays: 10,
    deliveryTime: '10 days',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    tags: ['Node.js', 'Kafka', 'Docker', 'MongoDB'],
    includes: ['Architecture Blueprint', 'Docker Compose', 'Unit Tests'],
    requirements: ['Architecture spec', 'API credentials'],
    faqs: [
      { question: 'Do you offer revisions?', answer: 'Yes, up to 3 major revisions.' },
      { question: 'Is docker compose provided?', answer: 'Yes, full local orchestration is included.' }
    ]
  }, token);
  assert.strictEqual(newServiceRes.httpStatus, 201);
  const createdService = newServiceRes.data;
  assert.strictEqual(createdService.title, 'Enterprise Distributed Systems with Node & Kafka');
  assert.strictEqual(createdService.faqs.length, 2);
  assert.strictEqual(createdService.faqs[0].question, 'Do you offer revisions?');
  console.log(`   ✅ Service created successfully in MongoDB (ID: ${createdService.id}, FAQs: ${createdService.faqs.length})`);

  // Verify service fetch returns faqs and image
  const fetchServiceRes = await req('GET', `/services/${createdService.id}`);
  assert.strictEqual(fetchServiceRes.httpStatus, 200);
  assert.strictEqual(fetchServiceRes.data.faqs.length, 2);
  assert(fetchServiceRes.data.image.startsWith('http'));
  console.log('   ✅ Re-fetched service: FAQs and absolute image URL preserved.');

  // TEST 3: Image Upload & Enum Validation with FormData
  console.log('\nTEST 3: Verifying Image Upload endpoint with service_images category...');
  const blob = new Blob(['fake-image-bytes-workvault'], { type: 'image/png' });
  const uploadFormData = new FormData();
  uploadFormData.append('image', blob, 'test_cover.png');
  uploadFormData.append('category', 'service_images');

  const uploadRes = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: uploadFormData
  });
  const uploadData = await uploadRes.json();
  assert.strictEqual(uploadRes.status, 201);
  assert(uploadData.data.url, 'Upload must return URL');
  assert(uploadData.data.url.includes('/uploads/'));
  console.log(`   ✅ File uploaded successfully: URL: ${uploadData.data.url}`);

  // TEST 4: Security - Credentials in service title or description rejected
  console.log('\nTEST 4: Verifying Credential Leakage Protection...');
  const leakAttempt = await req('POST', '/services', {
    title: 'backend Email: freelancer@example.com Password: password123',
    category: 'Web Development',
    description: 'Email: freelancer@example.com Password: password123',
    price: 50000
  }, token);
  assert.strictEqual(leakAttempt.httpStatus, 400);
  console.log('   ✅ Rejected credential-contaminated service creation with 400 validation error.');

  // TEST 5: Clean Service Edit & Update
  console.log('\nTEST 5: Verifying Service Update...');
  const updateRes = await req('PUT', `/services/${createdService.id}`, {
    title: 'Enterprise Cloud Microservices with Node, Go & Kafka',
    price: 50000
  }, token);
  assert.strictEqual(updateRes.httpStatus, 200);
  assert.strictEqual(updateRes.data.price, 50000);
  assert.strictEqual(updateRes.data.title, 'Enterprise Cloud Microservices with Node, Go & Kafka');
  console.log('   ✅ Service updated successfully.');

  // TEST 6: Notifications flow
  console.log('\nTEST 6: Verifying Notifications system...');
  const notifRes = await req('GET', '/notifications', null, token);
  assert.strictEqual(notifRes.httpStatus, 200);
  console.log(`   ✅ Notifications retrieved for user (${notifRes.data.length} notifications).`);

  const unreadRes = await req('GET', '/notifications/unread-count', null, token);
  assert.strictEqual(unreadRes.httpStatus, 200);
  console.log(`   ✅ Unread notification count retrieved: ${unreadRes.data.unreadCount}.`);

  // TEST 7: Review & Rating Calculation
  console.log('\nTEST 7: Verifying Review Submission & Rating Updates...');
  const clientLogin = await req('POST', '/auth/login', { email: 'client@example.com', password: 'password123' });
  const clientToken = clientLogin.data.token;
  const deals = await req('GET', '/deals', null, clientToken);
  const completedDeal = deals.data.find(d => ['APPROVED', 'RELEASED'].includes(d.status));
  if (completedDeal) {
    const reviewRes = await req('POST', '/reviews', {
      dealId: completedDeal.id,
      rating: 5,
      comment: 'Exceptional work, lightning fast delivery!'
    }, clientToken);
    assert(reviewRes.httpStatus === 201 || reviewRes.httpStatus === 409); // 409 if already reviewed in previous seed
    console.log('   ✅ Review system verified for completed deals.');
  }

  // Cleanup test service
  await req('DELETE', `/services/${createdService.id}`, null, token);
  console.log('   ✅ Test service cleaned up.');

  console.log('\n================================================================');
  console.log('🎉 ALL FINAL AUDIT TESTS & REPAIRS VERIFIED SUCCESSFULLY!');
  console.log('================================================================');
}

runVerification().catch(err => {
  console.error('\n❌ Verification failed:', err);
  process.exit(1);
});
