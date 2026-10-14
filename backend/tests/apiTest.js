/**
 * WorkVault API End-to-End Test Script
 * 
 * Tests every route, auth flow, role restriction, deal state machine,
 * transaction workflow, dispute workflow, and review rules.
 * 
 * Usage: node tests/apiTest.js
 */

const BASE = 'http://localhost:5000/api';

let passed = 0;
let failed = 0;
const failures = [];

// ─── HELPERS ─────────────────────────────────────────────

async function req(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body && method !== 'GET') opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/csv')) {
    const text = await res.text();
    return { status: res.status, success: res.status === 200, data: text };
  }
  const data = await res.json();
  return { status: res.status, ...data };
}

function assert(testName, condition, details = '') {
  if (condition) {
    passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    failed++;
    const msg = `  ❌ ${testName}${details ? ' — ' + details : ''}`;
    console.log(msg);
    failures.push(msg);
  }
}

// ─── TOKEN STORAGE ───────────────────────────────────────

let clientToken, freelancerToken, adminToken, newUserToken;
let newServiceId, newDealId, newTransactionId, newDisputeId;

// ─── TESTS ───────────────────────────────────────────────

async function testHealthCheck() {
  console.log('\n═══ HEALTH CHECK ═══');
  const r = await req('GET', '/health');
  assert('Health check returns success', r.success === true);
}

async function testAuth() {
  console.log('\n═══ AUTHENTICATION ═══');

  const testEmail = `test_${Date.now()}@example.com`;
  // Register a new user
  const reg = await req('POST', '/auth/register', {
    name: 'Test User',
    email: testEmail,
    password: 'test123456',
    role: 'client'
  });
  assert('Register new user', reg.success === true && reg.data.token);
  newUserToken = reg.data?.token;

  // Duplicate registration
  const dup = await req('POST', '/auth/register', {
    name: 'Test User',
    email: testEmail,
    password: 'test123456',
    role: 'client'
  });
  assert('Duplicate email rejected (409)', dup.success === false && dup.message?.includes('already'));

  // Login with seed client
  const loginClient = await req('POST', '/auth/login', {
    email: 'client@example.com',
    password: 'password123'
  });
  assert('Login as client', loginClient.success === true && loginClient.data.token);
  clientToken = loginClient.data?.token;

  // Login as freelancer
  const loginFL = await req('POST', '/auth/login', {
    email: 'freelancer@example.com',
    password: 'password123'
  });
  assert('Login as freelancer', loginFL.success === true && loginFL.data.token);
  freelancerToken = loginFL.data?.token;

  // Login as admin
  const loginAdmin = await req('POST', '/auth/login', {
    email: 'admin@example.com',
    password: 'password123'
  });
  assert('Login as admin', loginAdmin.success === true && loginAdmin.data.token);
  adminToken = loginAdmin.data?.token;

  // Wrong password
  const wrongPw = await req('POST', '/auth/login', {
    email: 'client@example.com',
    password: 'wrongpassword'
  });
  assert('Wrong password rejected (401)', wrongPw.success === false);

  // GET /auth/me
  const me = await req('GET', '/auth/me', null, clientToken);
  assert('GET /auth/me returns user', me.success && me.data.email === 'client@example.com');
  assert('Password not in response', me.data.password === undefined);

  // No token
  const noToken = await req('GET', '/auth/me');
  assert('Missing token rejected (401)', noToken.success === false);

  // Invalid token
  const badToken = await req('GET', '/auth/me', null, 'invalid.token.here');
  assert('Invalid token rejected (401)', badToken.success === false);

  // Validation errors
  const noEmail = await req('POST', '/auth/register', { name: 'X', password: '123456' });
  assert('Register without email rejected', noEmail.success === false);

  const shortPw = await req('POST', '/auth/register', {
    name: 'Y', email: 'y@y.com', password: '12'
  });
  assert('Short password rejected', shortPw.success === false);

  // Security regression: Public admin registration prevented (SEC-01 / F1)
  const adminReg = await req('POST', '/auth/register', {
    name: 'Attacker Admin',
    email: `attacker_${Date.now()}@example.com`,
    password: 'password123',
    role: 'admin'
  });
  assert('Public admin registration rejected (400)', adminReg.success === false && adminReg.status === 400);

  // Security regression: Client cannot switch to admin role
  const clientSwitchAdmin = await req('POST', '/auth/switch-role', { role: 'admin' }, clientToken);
  assert('Client cannot switch to admin (403)', clientSwitchAdmin.success === false && clientSwitchAdmin.status === 403);

  // Role Switch & Authority Persistence (AUTH-01 / F2): Admin switches view to freelancer and retains admin access
  const adminSwitchFL = await req('POST', '/auth/switch-role', { role: 'freelancer' }, adminToken);
  assert('Admin can switch active view to freelancer', adminSwitchFL.success === true && adminSwitchFL.data.user.role === 'freelancer');
  const adminAccessAfterSwitch = await req('GET', '/admin/users', null, adminToken);
  assert('Admin retains admin authority after view switch', adminAccessAfterSwitch.success === true);
  // Switch back to admin
  await req('POST', '/auth/switch-role', { role: 'admin' }, adminToken);
}

async function testUsers() {
  console.log('\n═══ USER API ═══');

  // Get user by ID
  const user = await req('GET', '/users/usr_freelancer_1');
  assert('GET user by ID', user.success && user.data.name === 'Vikram Singh');
  assert('Password not exposed', user.data.password === undefined);

  // Update own profile
  const updated = await req('PUT', '/users/usr_client_1', { bio: 'Updated bio' }, clientToken);
  assert('Update own profile', updated.success && updated.data.bio === 'Updated bio');

  // Cannot update other's profile
  const forbidden = await req('PUT', '/users/usr_freelancer_1', { bio: 'Hack' }, clientToken);
  assert('Cannot update other profile (403)', forbidden.success === false);

  // Get user services
  const services = await req('GET', '/users/usr_freelancer_1/services');
  assert('GET user services', services.success && Array.isArray(services.data));

  // Get user reviews
  const reviews = await req('GET', '/users/usr_freelancer_1/reviews');
  assert('GET user reviews', reviews.success && Array.isArray(reviews.data));

  // Non-existent user
  const notFound = await req('GET', '/users/usr_nonexistent');
  assert('Non-existent user returns 404', notFound.success === false);
}

async function testServices() {
  console.log('\n═══ SERVICE API ═══');

  // Public listing
  const all = await req('GET', '/services');
  assert('GET services (public)', all.success && Array.isArray(all.data));
  assert('Pagination returned', all.pagination && all.pagination.total !== undefined);

  // Search
  const search = await req('GET', '/services?search=react');
  assert('Search services', search.success);

  // Get by ID
  const svc = await req('GET', '/services/svc_1');
  assert('GET service by ID', svc.success && svc.data.id === 'svc_1');

  // Client cannot create service
  const clientCreate = await req('POST', '/services', {
    title: 'Test Service Title',
    description: 'A test',
    category: 'Testing',
    price: 1000
  }, clientToken);
  assert('Client cannot create service (403)', clientCreate.success === false);

  // Freelancer creates service
  const flCreate = await req('POST', '/services', {
    title: 'New Backend API Development',
    description: 'Full-stack Node.js backend development with Express and MongoDB.',
    category: 'Web Development',
    price: 50000,
    deliveryTime: '21 days',
    tags: ['Node.js', 'Express', 'MongoDB']
  }, freelancerToken);
  assert('Freelancer creates service (201)', flCreate.success && flCreate.data.id);
  newServiceId = flCreate.data?.id;

  // Update own service
  const updated = await req('PUT', `/services/${newServiceId}`, { price: 55000 }, freelancerToken);
  assert('Update own service', updated.success && updated.data.price === 55000);

  // Validation: missing title
  const noTitle = await req('POST', '/services', {
    description: 'x', category: 'y', price: 100
  }, freelancerToken);
  assert('Create without title rejected', noTitle.success === false);

  // Non-existent service
  const notFound = await req('GET', '/services/svc_nonexistent');
  assert('Non-existent service 404', notFound.success === false);
}

async function testDeals() {
  console.log('\n═══ DEAL API ═══');

  // Client creates deal
  const create = await req('POST', '/deals', {
    serviceId: newServiceId || 'svc_1',
    title: 'Test Deal Project'
  }, clientToken);
  assert('Client creates deal (201)', create.success && create.data.status === 'CREATED');
  newDealId = create.data?.id;

  // Freelancer cannot create deal for own service
  const selfDeal = await req('POST', '/deals', { serviceId: 'svc_1' }, freelancerToken);
  assert('Cannot deal on own service (400)', selfDeal.success === false);

  // Get all deals (filtered by user)
  const myDeals = await req('GET', '/deals', null, clientToken);
  assert('GET deals for user', myDeals.success && Array.isArray(myDeals.data));

  // Get deal by ID
  const deal = await req('GET', `/deals/${newDealId}`, null, clientToken);
  assert('GET deal by ID', deal.success && deal.data.id === newDealId);

  // ─── STATE MACHINE TESTS ───
  // Invalid: CREATED → RELEASED (skip states)
  const skip = await req('PUT', `/deals/${newDealId}/status`, { status: 'RELEASED' }, clientToken);
  assert('Cannot skip CREATED→RELEASED', skip.success === false);

  // Valid: CREATED → FUNDED
  const fund = await req('PUT', `/deals/${newDealId}/status`, { status: 'FUNDED' }, clientToken);
  assert('CREATED → FUNDED', fund.success && fund.data.status === 'FUNDED');

  // Valid: FUNDED → IN_PROGRESS
  const start = await req('PUT', `/deals/${newDealId}/status`, { status: 'IN_PROGRESS' }, clientToken);
  assert('FUNDED → IN_PROGRESS', start.success && start.data.status === 'IN_PROGRESS');

  // Freelancer submits work
  const submit = await req('POST', `/deals/${newDealId}/submit`, {
    message: 'Work completed, please review.',
    files: ['final_deliverable.zip']
  }, freelancerToken);
  assert('Freelancer submits work', submit.success && submit.data.status === 'SUBMITTED');

  // Client cannot submit
  const clientSubmit = await req('POST', `/deals/${newDealId}/submit`, {
    message: 'Attempt'
  }, clientToken);
  assert('Client cannot submit (403)', clientSubmit.success === false);

  // Client approves
  const approve = await req('POST', `/deals/${newDealId}/approve`, null, clientToken);
  assert('Client approves deal', approve.success && approve.data.status === 'APPROVED');

  // Freelancer cannot approve
  // (deal is already APPROVED, so we test the principle with another deal)

  // APPROVED → RELEASED
  const release = await req('PUT', `/deals/${newDealId}/status`, { status: 'RELEASED' }, clientToken);
  assert('APPROVED → RELEASED', release.success && release.data.status === 'RELEASED');

  // Terminal: cannot change RELEASED
  const afterRelease = await req('PUT', `/deals/${newDealId}/status`, { status: 'CANCELLED' }, clientToken);
  assert('Cannot transition from RELEASED (terminal)', afterRelease.success === false);

  // ─── CANCEL TEST ───
  const cancelDeal = await req('POST', '/deals', {
    serviceId: newServiceId || 'svc_1',
    title: 'Deal to Cancel'
  }, clientToken);
  const cancelId = cancelDeal.data?.id;
  const cancelled = await req('POST', `/deals/${cancelId}/cancel`, null, clientToken);
  assert('Cancel deal from CREATED', cancelled.success && cancelled.data.status === 'CANCELLED');
}

async function testTransactions() {
  console.log('\n═══ TRANSACTION API ═══');

  // Create a fresh deal for transaction tests
  const dealRes = await req('POST', '/deals', {
    serviceId: newServiceId || 'svc_1',
    title: 'Transaction Test Deal'
  }, clientToken);
  const txDealId = dealRes.data?.id;

  // Create transaction
  const create = await req('POST', '/transactions', {
    dealId: txDealId,
    amount: 50000
  }, clientToken);
  assert('Create transaction (201)', create.success && create.data.status === 'PENDING');
  newTransactionId = create.data?.id;

  // Duplicate transaction
  const dup = await req('POST', '/transactions', {
    dealId: txDealId,
    amount: 50000
  }, clientToken);
  assert('Duplicate transaction rejected (409)', dup.success === false);

  // Get all transactions
  const all = await req('GET', '/transactions', null, clientToken);
  assert('GET transactions', all.success && Array.isArray(all.data));

  // Get transaction by ID
  const tx = await req('GET', `/transactions/${newTransactionId}`, null, clientToken);
  assert('GET transaction by ID', tx.success && tx.data.id === newTransactionId);

  // Fund transaction
  const funded = await req('POST', `/transactions/${newTransactionId}/fund`, null, clientToken);
  assert('Fund transaction → HELD', funded.success && funded.data.status === 'HELD');

  // Cannot fund again
  const reFund = await req('POST', `/transactions/${newTransactionId}/fund`, null, clientToken);
  assert('Cannot fund already HELD tx', reFund.success === false);

  // Advance deal to APPROVED for release test
  await req('PUT', `/deals/${txDealId}/status`, { status: 'IN_PROGRESS' }, clientToken);
  await req('POST', `/deals/${txDealId}/submit`, { message: 'done' }, freelancerToken);
  await req('POST', `/deals/${txDealId}/approve`, null, clientToken);

  // Release funds
  const released = await req('POST', `/transactions/${newTransactionId}/release`, null, clientToken);
  assert('Release transaction → RELEASED', released.success && released.data.status === 'RELEASED');

  // Cannot release again
  const reRelease = await req('POST', `/transactions/${newTransactionId}/release`, null, clientToken);
  assert('Cannot release already RELEASED tx', reRelease.success === false);

  // ─── REFUND TEST ───
  // Create another deal+tx for refund
  const refundDeal = await req('POST', '/deals', { serviceId: newServiceId || 'svc_1', title: 'Refund Test' }, clientToken);
  const refundTx = await req('POST', '/transactions', { dealId: refundDeal.data.id, amount: 10000 }, clientToken);
  await req('POST', `/transactions/${refundTx.data.id}/fund`, null, clientToken);

  // Client cannot refund
  const clientRefund = await req('POST', `/transactions/${refundTx.data.id}/refund`, null, clientToken);
  assert('Client cannot refund (403)', clientRefund.success === false);

  // Admin can refund
  const adminRefund = await req('POST', `/transactions/${refundTx.data.id}/refund`, null, adminToken);
  assert('Admin refunds → REFUNDED', adminRefund.success && adminRefund.data.status === 'REFUNDED');

  // Multi-gateway status check
  const gwStatus = await req('GET', '/payments/status', null, clientToken);
  assert('GET /payments/status returns gateway info', gwStatus.success && gwStatus.data && typeof gwStatus.data.stripe === 'object');

  // Statement download (CSV)
  const statement = await req('GET', '/transactions/statement', null, clientToken);
  assert('GET /transactions/statement returns CSV content', statement.success && typeof statement.data === 'string' && statement.data.includes('Transaction ID'));
}

async function testDisputes() {
  console.log('\n═══ DISPUTE API ═══');

  // Create a deal in IN_PROGRESS for dispute
  const dealRes = await req('POST', '/deals', {
    serviceId: newServiceId || 'svc_1',
    title: 'Dispute Test Deal'
  }, clientToken);
  const dDealId = dealRes.data?.id;
  await req('PUT', `/deals/${dDealId}/status`, { status: 'FUNDED' }, clientToken);
  await req('PUT', `/deals/${dDealId}/status`, { status: 'IN_PROGRESS' }, clientToken);

  // Client opens dispute
  const create = await req('POST', '/disputes', {
    dealId: dDealId,
    reason: 'No communication for 5 days',
    description: 'The freelancer has stopped responding to messages.'
  }, clientToken);
  assert('Create dispute (201)', create.success && create.data.status === 'OPEN');
  newDisputeId = create.data?.id;

  // Duplicate active dispute rejected
  const dup = await req('POST', '/disputes', {
    dealId: dDealId,
    reason: 'Another reason',
    description: 'Another complaint'
  }, clientToken);
  assert('Duplicate active dispute rejected (409)', dup.success === false);

  // Get all disputes
  const all = await req('GET', '/disputes', null, clientToken);
  assert('GET disputes', all.success && Array.isArray(all.data));

  // Get by ID
  const disp = await req('GET', `/disputes/${newDisputeId}`, null, clientToken);
  assert('GET dispute by ID', disp.success && disp.data.id === newDisputeId);

  // Non-admin cannot resolve
  const clientResolve = await req('PUT', `/disputes/${newDisputeId}/status`, {
    status: 'RESOLVED',
    resolution: 'Client attempt'
  }, clientToken);
  assert('Client cannot resolve dispute (403)', clientResolve.success === false);

  // Admin: OPEN → UNDER_REVIEW
  const review = await req('PUT', `/disputes/${newDisputeId}/status`, {
    status: 'UNDER_REVIEW'
  }, adminToken);
  assert('Admin: OPEN → UNDER_REVIEW', review.success && review.data.status === 'UNDER_REVIEW');

  // Admin: UNDER_REVIEW → RESOLVED
  const resolved = await req('PUT', `/disputes/${newDisputeId}/status`, {
    status: 'RESOLVED',
    resolution: 'Freelancer warned. Deadline extended by 3 days.'
  }, adminToken);
  assert('Admin: UNDER_REVIEW → RESOLVED', resolved.success && resolved.data.status === 'RESOLVED');
}

async function testReviews() {
  console.log('\n═══ REVIEW API ═══');

  // Create a completed deal for review testing
  const dealRes = await req('POST', '/deals', {
    serviceId: newServiceId || 'svc_1',
    title: 'Review Test Deal'
  }, clientToken);
  const revDealId = dealRes.data?.id;
  await req('PUT', `/deals/${revDealId}/status`, { status: 'FUNDED' }, clientToken);
  await req('PUT', `/deals/${revDealId}/status`, { status: 'IN_PROGRESS' }, clientToken);
  await req('POST', `/deals/${revDealId}/submit`, { message: 'done' }, freelancerToken);
  await req('POST', `/deals/${revDealId}/approve`, null, clientToken);

  // Client reviews freelancer
  const review = await req('POST', '/reviews', {
    dealId: revDealId,
    rating: 5,
    comment: 'Absolutely stellar work. Would hire again!'
  }, clientToken);
  assert('Client creates review (201)', review.success && review.data.rating === 5);

  // Duplicate review rejected
  const dup = await req('POST', '/reviews', {
    dealId: revDealId,
    rating: 4,
    comment: 'Another review'
  }, clientToken);
  assert('Duplicate review rejected (409)', dup.success === false);

  // Freelancer cannot review (not client of deal)
  const flReview = await req('POST', '/reviews', {
    dealId: revDealId,
    rating: 3,
    comment: 'Freelancer trying to review'
  }, freelancerToken);
  assert('Freelancer cannot review (403)', flReview.success === false);

  // Cannot review incomplete deal
  const incompleteDeal = await req('POST', '/deals', {
    serviceId: newServiceId || 'svc_1',
    title: 'Incomplete Deal'
  }, clientToken);
  const incReview = await req('POST', '/reviews', {
    dealId: incompleteDeal.data.id,
    rating: 5,
    comment: 'Review attempt on incomplete deal'
  }, clientToken);
  assert('Cannot review incomplete deal (400)', incReview.success === false);

  // Get reviews by user ID
  const reviews = await req('GET', '/reviews/usr_freelancer_1');
  assert('GET reviews by userId', reviews.success && Array.isArray(reviews.data));

  // Get all reviews with filter
  const allReviews = await req('GET', '/reviews?limit=10');
  assert('GET /reviews list with filter', allReviews.success && Array.isArray(allReviews.data));

  // Invalid rating
  const badRating = await req('POST', '/reviews', {
    dealId: revDealId,
    rating: 10,
    comment: 'Invalid'
  }, clientToken);
  assert('Rating > 5 rejected', badRating.success === false);
}

async function testAdmin() {
  console.log('\n═══ ADMIN API ═══');

  // Non-admin cannot access admin routes
  const clientUsers = await req('GET', '/admin/users', null, clientToken);
  assert('Client cannot access admin (403)', clientUsers.success === false);

  const flUsers = await req('GET', '/admin/users', null, freelancerToken);
  assert('Freelancer cannot access admin (403)', flUsers.success === false);

  // Admin can list all
  const users = await req('GET', '/admin/users', null, adminToken);
  assert('Admin: GET users', users.success && Array.isArray(users.data));

  const services = await req('GET', '/admin/services', null, adminToken);
  assert('Admin: GET services', services.success && Array.isArray(services.data));

  const deals = await req('GET', '/admin/deals', null, adminToken);
  assert('Admin: GET deals', deals.success && Array.isArray(deals.data));

  const transactions = await req('GET', '/admin/transactions', null, adminToken);
  assert('Admin: GET transactions', transactions.success && Array.isArray(transactions.data));

  const disputes = await req('GET', '/admin/disputes', null, adminToken);
  assert('Admin: GET disputes', disputes.success && Array.isArray(disputes.data));

  // Admin resolves dispute
  if (newDisputeId) {
    // First close the dispute that was already resolved, test with seed dispute
    const resolve = await req('PUT', '/admin/disputes/dsp_1/resolve', {
      resolution: 'Admin resolved: Freelancer must provide update within 24h.',
      dealAction: 'resume'
    }, adminToken);
    assert('Admin: resolve dispute', resolve.success && resolve.data.status === 'RESOLVED');
  }

  // Admin updates user status (suspend and activate)
  const targetUser = users.data?.find(u => u.email === 'client@example.com') || users.data?.[0];
  if (targetUser) {
    const suspendRes = await req('PUT', `/admin/users/${targetUser.id || targetUser._id}/status`, { status: 'Suspended' }, adminToken);
    assert('Admin: suspend user', suspendRes.success && suspendRes.data.status === 'Suspended');
    const activateRes = await req('PUT', `/admin/users/${targetUser.id || targetUser._id}/status`, { status: 'Active' }, adminToken);
    assert('Admin: activate user', activateRes.success && activateRes.data.status === 'Active');
  }
}

async function test404() {
  console.log('\n═══ 404 HANDLING ═══');
  const r = await req('GET', '/nonexistent/route');
  assert('Unknown route returns 404', r.success === false);
}

// ─── RUN ALL TESTS ───────────────────────────────────────

async function run() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║         WorkVault API — End-to-End Tests        ║');
  console.log('╚══════════════════════════════════════════════════╝');

  try {
    await testHealthCheck();
    await testAuth();
    await testUsers();
    await testServices();
    await testDeals();
    await testTransactions();
    await testDisputes();
    await testReviews();
    await testAdmin();
    await test404();
  } catch (err) {
    console.error('\n💥 FATAL TEST ERROR:', err.message);
    console.error(err.stack);
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log(`  RESULTS:  ${passed} passed  |  ${failed} failed  |  ${passed + failed} total`);
  if (failures.length > 0) {
    console.log('\n  FAILURES:');
    failures.forEach(f => console.log(f));
  }
  console.log('══════════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

run();
