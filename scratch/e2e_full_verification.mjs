import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  return { ...data, status: res.status, apiStatus: data.status };
}

async function runE2E() {
  console.log('==================================================');
  console.log('🚀 WORKVAULT FULL END-TO-END VERIFICATION SUITE');
  console.log('==================================================\n');

  // 1. HEALTH CHECK
  console.log('1. Checking backend health...');
  const health = await request('GET', '/health');
  assert.strictEqual(health.status, 200);
  assert.strictEqual(health.success, true);
  console.log('   ✅ Health check passed: Backend running and connected.\n');

  // 2. INVALID LOGIN TESTS
  console.log('2. Testing invalid login scenarios...');
  const invalidEmail = await request('POST', '/auth/login', {
    email: 'nonexistent@example.com',
    password: 'password123'
  });
  assert.strictEqual(invalidEmail.status, 401);
  assert.strictEqual(invalidEmail.success, false);
  console.log('   ✅ Non-existent email correctly returns 401 (Invalid email or password).');

  const invalidPass = await request('POST', '/auth/login', {
    email: 'client@example.com',
    password: 'wrong_password_xyz'
  });
  assert.strictEqual(invalidPass.status, 401);
  assert.strictEqual(invalidPass.success, false);
  console.log('   ✅ Wrong password correctly returns 401.');

  const emptyCreds = await request('POST', '/auth/login', {
    email: '',
    password: ''
  });
  assert.strictEqual(emptyCreds.status, 400);
  assert.strictEqual(emptyCreds.success, false);
  console.log('   ✅ Empty credentials rejected with 400 validation error.\n');

  // 3. SIGNUP NEW TEST USER
  const uniqueId = Date.now();
  const testUserEmail = `maya_${uniqueId}@test.com`;
  console.log(`3. Registering new freelancer user: ${testUserEmail}...`);

  const signupRes = await request('POST', '/auth/register', {
    name: 'Maya Lin',
    email: testUserEmail,
    password: 'password123',
    role: 'freelancer'
  });

  assert.strictEqual(signupRes.status, 201);
  assert.strictEqual(signupRes.success, true);
  assert(signupRes.data.token, 'Token must be returned');
  assert.strictEqual(signupRes.data.user.name, 'Maya Lin');
  assert.strictEqual(signupRes.data.user.role, 'freelancer');
  const userToken = signupRes.data.token;
  const userId = signupRes.data.user.id;
  console.log(`   ✅ User registered successfully. ID: ${userId}, Role: freelancer.\n`);

  // 4. GET CURRENT USER PROFILE (/api/auth/me)
  console.log('4. Verifying token persistence & auth profile (/api/auth/me)...');
  const meRes = await request('GET', '/auth/me', null, userToken);
  assert.strictEqual(meRes.status, 200);
  assert.strictEqual(meRes.data.name, 'Maya Lin');
  assert.strictEqual(meRes.data.email, testUserEmail);
  console.log('   ✅ /api/auth/me returns correct user data.\n');

  // 5. UPDATE USER PROFILE (Name, Title, Bio, Location)
  console.log('5. Updating user profile in MongoDB...');
  const updatedName = 'Maya Lin Senior Architect';
  const updatedTitle = 'Principal Cloud Solutions Engineer';
  const updatedBio = '10+ years specializing in distributed systems and Go microservices.';
  const updatedLocation = 'Bengaluru, India';

  const updateProfileRes = await request('PUT', `/users/${userId}`, {
    name: updatedName,
    title: updatedTitle,
    bio: updatedBio,
    location: updatedLocation,
    skills: ['Go', 'Kubernetes', 'Docker', 'AWS']
  }, userToken);

  assert.strictEqual(updateProfileRes.status, 200);
  assert.strictEqual(updateProfileRes.data.name, updatedName);
  assert.strictEqual(updateProfileRes.data.title, updatedTitle);
  assert.strictEqual(updateProfileRes.data.location, updatedLocation);
  console.log(`   ✅ Profile updated in MongoDB to "${updatedName}".`);

  // Verify persistence by refetching
  const verifyProfileRes = await request('GET', `/users/${userId}`);
  assert.strictEqual(verifyProfileRes.data.name, updatedName);
  console.log('   ✅ Re-fetched user document: Updated name persisted in MongoDB.\n');

  // 6. LOGOUT & RE-LOGIN
  console.log('6. Testing Login again with updated user credentials...');
  const loginRes = await request('POST', '/auth/login', {
    email: testUserEmail,
    password: 'password123'
  });
  assert.strictEqual(loginRes.status, 200);
  assert.strictEqual(loginRes.data.user.name, updatedName);
  console.log(`   ✅ Logged in successfully. Current user name matches updated name: "${loginRes.data.user.name}".\n`);

  // 7. SERVICES CRUD: CREATE
  console.log('7. Testing Service CRUD: CREATE...');
  const createServiceRes = await request('POST', '/services', {
    title: 'High-Performance Go Microservices Architecture',
    category: 'Web Development',
    description: 'Enterprise grade microservices built with Go, gRPC, and high-throughput Kafka streaming.',
    price: 35000,
    deliveryTime: '10 days',
    deliveryDays: 10,
    tags: ['Go', 'gRPC', 'Microservices', 'Kafka'],
    includes: ['Architecture Diagrams', 'Source Code', 'Helm Charts', 'Unit Tests'],
    requirements: ['System architecture requirements', 'Cloud provider access']
  }, userToken);

  assert.strictEqual(createServiceRes.status, 201);
  assert.strictEqual(createServiceRes.success, true);
  const createdService = createServiceRes.data;
  assert(createdService.id, 'Service ID must be returned');
  assert.strictEqual(createdService.title, 'High-Performance Go Microservices Architecture');
  assert.strictEqual(createdService.price, 35000);
  console.log(`   ✅ Service created successfully in MongoDB. ID: ${createdService.id}\n`);

  // 8. SERVICES CRUD: READ (My Services)
  console.log('8. Testing Service CRUD: READ (Freelancer services query)...');
  const myServicesRes = await request('GET', `/services?freelancer=${userId}&status=all`);
  assert.strictEqual(myServicesRes.status, 200);
  assert(Array.isArray(myServicesRes.data), 'Services data must be an array');
  const foundService = myServicesRes.data.find(s => s.id === createdService.id);
  assert(foundService, 'Newly created service must appear in freelancer services');
  console.log(`   ✅ Freelancer services queried: Found created service with title "${foundService.title}".\n`);

  // 9. SERVICES CRUD: UPDATE
  console.log('9. Testing Service CRUD: UPDATE...');
  const updatedServiceTitle = 'Enterprise Distributed Go Microservices Architecture';
  const updatedPrice = 40000;

  const updateServiceRes = await request('PUT', `/services/${createdService.id}`, {
    title: updatedServiceTitle,
    price: updatedPrice,
    description: 'Updated enterprise grade microservices with automated CI/CD and observability.'
  }, userToken);

  assert.strictEqual(updateServiceRes.status, 200);
  assert.strictEqual(updateServiceRes.data.title, updatedServiceTitle);
  assert.strictEqual(updateServiceRes.data.price, updatedPrice);
  console.log(`   ✅ Service updated in MongoDB: New title "${updatedServiceTitle}", Price ₹${updatedPrice}.`);

  // Verify persistence
  const getSingleService = await request('GET', `/services/${createdService.id}`);
  assert.strictEqual(getSingleService.data.title, updatedServiceTitle);
  assert.strictEqual(getSingleService.data.price, updatedPrice);
  console.log('   ✅ Re-fetched service: Updated values persisted in MongoDB.\n');

  // 10. SERVICES CRUD: DELETE
  console.log('10. Testing Service CRUD: DELETE...');
  const deleteRes = await request('DELETE', `/services/${createdService.id}`, null, userToken);
  assert.strictEqual(deleteRes.status, 200);
  assert.strictEqual(deleteRes.success, true);
  console.log('   ✅ Service deleted from MongoDB.');

  // Verify it is gone
  const getDeleted = await request('GET', `/services/${createdService.id}`);
  assert.strictEqual(getDeleted.status, 404);
  console.log('   ✅ Re-fetch confirmed: Service returns 404 (completely removed).\n');

  // 11. ROLE RESTRICTION & ACCESS CONTROL
  console.log('11. Testing Role-based Access Control...');
  // Client trying to create a service (must be 403 Forbidden)
  const clientLogin = await request('POST', '/auth/login', {
    email: 'client@example.com',
    password: 'password123'
  });
  const clientToken = clientLogin.data.token;

  const clientCreateAttempt = await request('POST', '/services', {
    title: 'Client trying to offer service',
    category: 'Testing',
    description: 'Should fail with 403',
    price: 5000
  }, clientToken);
  assert.strictEqual(clientCreateAttempt.status, 403);
  console.log('   ✅ Client role cannot create a service (403 Forbidden).');

  // Non-admin trying to access admin endpoints
  const nonAdminAttempt = await request('GET', '/admin/users', null, clientToken);
  assert.strictEqual(nonAdminAttempt.status, 403);
  console.log('   ✅ Client role cannot access admin routes (403 Forbidden).');

  const freelancerAdminAttempt = await request('GET', '/admin/users', null, userToken);
  assert.strictEqual(freelancerAdminAttempt.status, 403);
  console.log('   ✅ Freelancer role cannot access admin routes (403 Forbidden).\n');

  console.log('==================================================');
  console.log('🎉 ALL END-TO-END FLOWS AND CHECKS PASSED 100%!');
  console.log('==================================================');
}

runE2E().catch(err => {
  console.error('\n❌ E2E Verification failed:', err);
  process.exit(1);
});
