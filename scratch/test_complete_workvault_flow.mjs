import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function req(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  return { ...data, httpStatus: res.status, status: data.status || res.status };
}

async function runTest() {
  console.log('╔═════════════════════════════════════════════════════════════════════╗');
  console.log('║       WORKVAULT COMPREHENSIVE END-TO-END FLOW VERIFICATION          ║');
  console.log('╚═════════════════════════════════════════════════════════════════════╝\n');

  // Step 1: Login users
  console.log('1. Logging in Client, Freelancer, and Admin...');
  const clientLogin = await req('POST', '/auth/login', { email: 'client@example.com', password: 'password123' });
  assert.strictEqual(clientLogin.httpStatus, 200);
  const clientToken = clientLogin.data.token;
  const clientId = clientLogin.data.user.id;
  console.log(`   ✅ Client logged in (ID: ${clientId})`);

  const flLogin = await req('POST', '/auth/login', { email: 'freelancer@example.com', password: 'password123' });
  assert.strictEqual(flLogin.httpStatus, 200);
  const flToken = flLogin.data.token;
  const flId = flLogin.data.user.id;
  console.log(`   ✅ Freelancer logged in (ID: ${flId})`);

  const adminLogin = await req('POST', '/auth/login', { email: 'admin@example.com', password: 'password123' });
  assert.strictEqual(adminLogin.httpStatus, 200);
  const adminToken = adminLogin.data.token;
  console.log(`   ✅ Admin logged in\n`);

  // Step 2: Get a service
  console.log('2. Client fetches available services...');
  const servicesRes = await req('GET', `/services?freelancer=${flId}`);
  assert.strictEqual(servicesRes.httpStatus, 200);
  assert(servicesRes.data.length > 0);
  const targetService = servicesRes.data[0];
  console.log(`   ✅ Selected service: "${targetService.title}" (₹${targetService.price})\n`);

  // Step 3: Create Deal
  console.log('3. Client creates a deal...');
  const dealRes = await req('POST', '/deals', {
    serviceId: targetService.id,
    title: `E2E Milestone Project ${Date.now()}`,
    description: 'Complete multi-milestone enterprise web project.'
  }, clientToken);
  assert.strictEqual(dealRes.httpStatus, 201);
  const dealId = dealRes.data.id;
  console.log(`   ✅ Deal created (ID: ${dealId}, Status: ${dealRes.data.status})\n`);

  // Step 4: Create Milestones
  console.log('4. Client creates Milestones for deal...');
  const m1Res = await req('POST', `/deals/${dealId}/milestones`, {
    title: 'Milestone 1: Backend Architecture & Database Design',
    description: 'Set up Express server, MongoDB schemas, and authentication.',
    amount: 15000,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    order: 1
  }, clientToken);
  assert.strictEqual(m1Res.httpStatus, 201);
  const m1Id = m1Res.data.id;
  assert.strictEqual(m1Res.data.status, 'PENDING');
  console.log(`   ✅ Milestone 1 created (ID: ${m1Id}, Amount: ₹15,000, Status: PENDING)`);

  const m2Res = await req('POST', `/deals/${dealId}/milestones`, {
    title: 'Milestone 2: Frontend Implementation & Integration',
    description: 'Build React UI, state management, and API integration.',
    amount: 25000,
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    order: 2
  }, clientToken);
  assert.strictEqual(m2Res.httpStatus, 201);
  const m2Id = m2Res.data.id;
  console.log(`   ✅ Milestone 2 created (ID: ${m2Id}, Amount: ₹25,000, Status: PENDING)\n`);

  // Step 5: Fund Milestone 1 into Escrow
  console.log('5. Client funds Milestone 1 into Escrow...');
  const fundM1 = await req('POST', `/milestones/${m1Id}/fund`, {}, clientToken);
  assert.strictEqual(fundM1.httpStatus, 200);
  assert.strictEqual(fundM1.data.milestone.status, 'FUNDED');
  assert.strictEqual(fundM1.data.transaction.status, 'HELD');
  assert.strictEqual(fundM1.data.transaction.type, 'PAYMENT_FUNDED');
  console.log(`   ✅ Milestone 1 funded into Escrow. Status: ${fundM1.data.milestone.status}`);
  console.log(`   ✅ Ledger Transaction created: Type: ${fundM1.data.transaction.type}, Status: ${fundM1.data.transaction.status}, Amount: ₹${fundM1.data.transaction.amount}\n`);

  // Step 6: Freelancer starts work on Milestone 1
  console.log('6. Freelancer starts work on Milestone 1...');
  const startM1 = await req('POST', `/milestones/${m1Id}/start`, {}, flToken);
  assert.strictEqual(startM1.httpStatus, 200);
  assert.strictEqual(startM1.data.status, 'IN_PROGRESS');
  console.log(`   ✅ Milestone 1 status transitioned to: ${startM1.data.status}\n`);

  // Step 7: Freelancer submits work
  console.log('7. Freelancer submits work for Milestone 1...');
  const submitM1 = await req('POST', `/milestones/${m1Id}/submit`, {
    message: 'Architecture diagrams and REST API controllers completed.',
    files: [
      { fileName: 'api_specs.pdf', fileUrl: '/uploads/sample_spec.pdf', size: 102400 }
    ]
  }, flToken);
  assert.strictEqual(submitM1.httpStatus, 200);
  assert.strictEqual(submitM1.data.status, 'SUBMITTED');
  console.log(`   ✅ Milestone 1 submitted. Submission message: "${submitM1.data.submission.message}"\n`);

  // Step 8: Client requests revision
  console.log('8. Client requests revision on Milestone 1...');
  const revisionM1 = await req('POST', `/milestones/${m1Id}/revision`, {
    revisionNotes: 'Please add OpenAPI / Swagger spec docs as well.'
  }, clientToken);
  assert.strictEqual(revisionM1.httpStatus, 200);
  assert.strictEqual(revisionM1.data.status, 'IN_PROGRESS');
  assert.strictEqual(revisionM1.data.submission.status, 'REVISION_REQUESTED');
  console.log(`   ✅ Revision requested. Status back to: ${revisionM1.data.status}, Notes: "${revisionM1.data.submission.revisionNotes}"\n`);

  // Step 9: Freelancer resubmits work
  console.log('9. Freelancer resubmits updated work...');
  const resubmitM1 = await req('POST', `/milestones/${m1Id}/submit`, {
    message: 'Added Swagger JSON and updated endpoints.',
    files: [
      { fileName: 'api_specs_v2.pdf', fileUrl: '/uploads/sample_spec_v2.pdf', size: 120400 }
    ]
  }, flToken);
  assert.strictEqual(resubmitM1.httpStatus, 200);
  assert.strictEqual(resubmitM1.data.status, 'SUBMITTED');
  console.log(`   ✅ Milestone 1 resubmitted successfully.\n`);

  // Step 10: Client approves work and releases payment
  console.log('10. Client approves work and releases payment to Freelancer...');
  const releaseM1 = await req('POST', `/milestones/${m1Id}/approve`, {}, clientToken);
  assert.strictEqual(releaseM1.httpStatus, 200);
  assert.strictEqual(releaseM1.data.milestone.status, 'RELEASED');
  assert.strictEqual(releaseM1.data.transaction.type, 'PAYMENT_RELEASED');
  assert.strictEqual(releaseM1.data.transaction.status, 'RELEASED');
  console.log(`   ✅ Milestone 1 APPROVED & RELEASED.`);
  console.log(`   ✅ Freelancer net payout: ₹${releaseM1.data.transaction.amount} (Fee: ₹${releaseM1.data.transaction.fee})\n`);

  // Step 11: Fund Milestone 2
  console.log('11. Client funds Milestone 2...');
  const fundM2 = await req('POST', `/milestones/${m2Id}/fund`, {}, clientToken);
  assert.strictEqual(fundM2.httpStatus, 200);
  assert.strictEqual(fundM2.data.milestone.status, 'FUNDED');
  console.log(`   ✅ Milestone 2 funded.\n`);

  // Step 12: Raise Dispute on Milestone 2
  console.log('12. Raising Dispute on Milestone 2...');
  const disputeRes = await req('POST', '/disputes', {
    dealId,
    milestoneId: m2Id,
    reason: 'Scope misalignment on frontend components',
    description: 'Freelancer and client cannot agree on responsive dashboard mocks.'
  }, clientToken);
  assert.strictEqual(disputeRes.httpStatus, 201);
  const disputeId = disputeRes.data.id;
  console.log(`   ✅ Dispute opened (ID: ${disputeId}, Status: ${disputeRes.data.status})`);

  // Verify milestone status is DISPUTED
  const m2Check = await req('GET', `/milestones/${m2Id}`, null, clientToken);
  assert.strictEqual(m2Check.data.status, 'DISPUTED');
  console.log(`   ✅ Milestone 2 is locked in DISPUTED state.`);

  // Verify normal release is blocked while disputed
  const blockedRelease = await req('POST', `/milestones/${m2Id}/approve`, {}, clientToken);
  assert.strictEqual(blockedRelease.httpStatus, 400);
  console.log(`   ✅ Verified: Release attempt on DISPUTED milestone is correctly blocked with 400.\n`);

  // Step 13: Add evidence to dispute
  console.log('13. Freelancer attaches evidence to Dispute...');
  const evidenceRes = await req('POST', `/disputes/${disputeId}/evidence`, {
    fileUrl: '/uploads/chat_screenshot.png',
    fileName: 'Client_Requirements_Chat.png',
    note: 'Screenshot of client confirming dashboard requirements.'
  }, flToken);
  assert.strictEqual(evidenceRes.httpStatus, 200);
  assert(evidenceRes.data.evidence.length > 0);
  console.log(`   ✅ Evidence attached to dispute (Total evidence items: ${evidenceRes.data.evidence.length})\n`);

  // Step 14: Admin resolves dispute
  console.log('14. Admin reviews and resolves dispute with REFUND_CLIENT...');
  const resolveRes = await req('POST', `/disputes/${disputeId}/resolve`, {
    decision: 'REFUND_CLIENT',
    resolutionNotes: 'Agreement was not reached on Milestone 2. Full refund issued to client.'
  }, adminToken);
  assert.strictEqual(resolveRes.httpStatus, 200);
  assert.strictEqual(resolveRes.data.status, 'RESOLVED');
  assert.strictEqual(resolveRes.data.adminDecision, 'REFUND_CLIENT');
  console.log(`   ✅ Dispute resolved by Admin: Decision: ${resolveRes.data.adminDecision}`);

  // Verify milestone is refunded
  const m2AfterDispute = await req('GET', `/milestones/${m2Id}`, null, clientToken);
  assert.strictEqual(m2AfterDispute.data.status, 'REFUNDED');
  console.log(`   ✅ Milestone 2 transitioned to REFUNDED.\n`);

  // Step 15: Freelancer checks balance and requests withdrawal
  console.log('15. Checking Freelancer ledger balance & withdrawal flow...');
  const balanceRes = await req('GET', '/withdrawals/balance', null, flToken);
  assert.strictEqual(balanceRes.httpStatus, 200);
  const availableBal = balanceRes.data.availableBalance;
  console.log(`   ✅ Freelancer Total Earnings: ₹${balanceRes.data.totalEarnings}, Available Balance: ₹${availableBal}`);

  // Test over-withdrawal rejection
  const overWithdraw = await req('POST', '/withdrawals', {
    amount: availableBal + 50000,
    payoutMethod: 'bank_transfer'
  }, flToken);
  assert.strictEqual(overWithdraw.httpStatus, 400);
  console.log(`   ✅ Over-withdrawal correctly rejected with 400 (Insufficient funds).`);

  // Valid withdrawal
  const withdrawAmount = Math.min(5000, availableBal);
  if (withdrawAmount > 0) {
    const validWithdraw = await req('POST', '/withdrawals', {
      amount: withdrawAmount,
      payoutMethod: 'bank_transfer',
      accountDetails: { bankName: 'HDFC Bank', accountNumber: '50100123456789', ifsc: 'HDFC0001234' }
    }, flToken);
    assert(validWithdraw.httpStatus === 200 || validWithdraw.httpStatus === 201);
    assert.strictEqual(validWithdraw.data.withdrawal.status, 'COMPLETED');
    assert.strictEqual(validWithdraw.data.transaction.type, 'WITHDRAWAL');
    console.log(`   ✅ Payout completed: ₹${withdrawAmount} withdrawn. New balance: ₹${validWithdraw.data.newBalance}\n`);
  }

  // Step 16: Statement CSV Download
  console.log('16. Verifying Statement CSV Download...');
  const stmtRes = await fetch(`${BASE_URL}/transactions/statement`, {
    headers: { 'Authorization': `Bearer ${flToken}` }
  });
  assert.strictEqual(stmtRes.status, 200);
  const csvText = await stmtRes.text();
  assert(csvText.includes('Date,Transaction ID,Deal / Milestone,Type,Amount (INR),Status,Reference ID,Description'));
  assert(csvText.includes('PAYMENT_RELEASED'));
  console.log(`   ✅ Statement CSV generated with real ledger data (${csvText.split('\n').length} rows).\n`);

  // Step 17: Dynamic Trust Metrics Verification
  console.log('17. Verifying Platform Trust Metrics calculation...');
  const trustRes = await req('GET', `/users/${flId}/trust-metrics`, null, flToken);
  assert.strictEqual(trustRes.httpStatus, 200);
  const metrics = trustRes.data.metrics;
  console.log(`   ✅ Trust Metrics calculated:`);
  console.log(`      • Trust Score: ${metrics.trustScore}/100`);
  console.log(`      • Completed Earnings: ₹${metrics.completedEarnings}`);
  console.log(`      • Milestones Completed: ${metrics.milestonesCompleted}`);
  console.log(`      • Client Approval Rate: ${metrics.clientApprovalRate}%`);
  console.log(`      • On-time Delivery Rate: ${metrics.onTimeDeliveryRate}%`);
  console.log(`      • Formula weights:`, metrics.formulaBreakdown);

  // Step 18: Client Trust Metrics
  const clientTrust = await req('GET', `/users/${clientId}/trust-metrics`, null, clientToken);
  assert.strictEqual(clientTrust.httpStatus, 200);
  console.log(`   ✅ Client Trust Score: ${clientTrust.data.metrics.trustScore}/100\n`);

  // Step 19: Admin Overview Checks
  console.log('19. Verifying Admin Management APIs...');
  const adminDeals = await req('GET', '/admin/deals', null, adminToken);
  assert.strictEqual(adminDeals.httpStatus, 200);
  const adminTxs = await req('GET', '/admin/transactions', null, adminToken);
  assert.strictEqual(adminTxs.httpStatus, 200);
  const adminDisps = await req('GET', '/admin/disputes', null, adminToken);
  assert.strictEqual(adminDisps.httpStatus, 200);
  console.log(`   ✅ Admin verified: Deals (${adminDeals.data.length}), Ledger Transactions (${adminTxs.data.length}), Disputes (${adminDisps.data.length})\n`);

  console.log('=======================================================================');
  console.log('🎉 ALL 19 END-TO-END ESCROW, MILESTONE & LEDGER TESTS PASSED 100%!');
  console.log('=======================================================================');
}

runTest().catch(err => {
  console.error('\n❌ Comprehensive flow test failed:', err);
  process.exit(1);
});
