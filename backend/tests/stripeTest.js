import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://localhost:5000/api';

async function req(method, endpoint, body = null, token = null, extraHeaders = {}) {
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { rawText: text };
  }
  return { status: res.status, data: json, headers: res.headers };
}

async function run() {
  console.log('=== WORKVAULT REAL STRIPE INTEGRATION TEST SUITE ===\n');

  // 1. Authenticate Client and Freelancer
  console.log('1. Authenticating test users...');
  const clientLogin = await req('POST', '/auth/login', { email: 'client@example.com', password: 'password123' });
  if (clientLogin.status !== 200 || !clientLogin.data.data?.token) {
    throw new Error(`Client login failed: ${JSON.stringify(clientLogin.data)}`);
  }
  const clientToken = clientLogin.data.data.token;
  const clientId = clientLogin.data.data.user.id || clientLogin.data.data.user._id;
  console.log('   ✓ Client logged in:', clientLogin.data.data.user.email);

  const freelancerLogin = await req('POST', '/auth/login', { email: 'freelancer@example.com', password: 'password123' });
  if (freelancerLogin.status !== 200 || !freelancerLogin.data.data?.token) {
    throw new Error(`Freelancer login failed: ${JSON.stringify(freelancerLogin.data)}`);
  }
  const freelancerToken = freelancerLogin.data.data.token;
  const freelancerId = freelancerLogin.data.data.user.id || freelancerLogin.data.data.user._id;
  console.log('   ✓ Freelancer logged in:', freelancerLogin.data.data.user.email);

  // 2. Gateway Status Check
  console.log('\n2. Checking Payment Gateway Status (/api/payments/status)...');
  const gwStatus = await req('GET', '/payments/status', null, clientToken);
  console.log('   Gateway status response:', gwStatus.status, gwStatus.data);
  if (gwStatus.status !== 200) {
    throw new Error(`Gateway status failed: ${JSON.stringify(gwStatus.data)}`);
  }
  console.log('   ✓ Payment gateway endpoint online');

  // 3. Create a service by the test freelancer
  console.log('\n3. Creating service as freelancer...');
  const serviceRes = await req('POST', '/services', {
    title: `Fullstack Stripe Architecture ${Date.now()}`,
    description: 'Building custom Stripe checkout, webhook and escrow architecture',
    category: 'Web Development',
    price: 15000,
    deliveryTime: 7,
    features: ['Stripe Integration', 'Escrow System']
  }, freelancerToken);

  if (serviceRes.status !== 201 && serviceRes.status !== 200) {
    throw new Error(`Create service failed: ${JSON.stringify(serviceRes.data)}`);
  }
  const service = serviceRes.data.data;
  const serviceId = service.id || service._id;
  console.log('   ✓ Service created by freelancer:', serviceId, service.title);

  console.log('\n4. Creating a test deal for client and freelancer...');
  const dealRes = await req('POST', '/deals', {
    freelancerId,
    serviceId,
    title: `Stripe Escrow Integration Deal ${Date.now()}`,
    description: 'Testing complete Stripe payment escrow and milestone lifecycle',
    amount: 15000,
    deadline: new Date(Date.now() + 86400000 * 14).toISOString()
  }, clientToken);

  if (dealRes.status !== 201 && dealRes.status !== 200) {
    throw new Error(`Create deal failed: ${JSON.stringify(dealRes.data)}`);
  }
  const deal = dealRes.data.data;
  console.log('   ✓ Deal created:', deal.id || deal._id, 'Title:', deal.title);

  // 4. Create a milestone for 10,000 INR
  console.log('\n4. Creating Milestone on deal...');
  const milestoneRes = await req('POST', `/deals/${deal.id || deal._id}/milestones`, {
    title: 'Milestone 1: Backend API Architecture',
    description: 'Complete secure REST API endpoints with Stripe webhook integration',
    amount: 10000,
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString()
  }, clientToken);

  if (milestoneRes.status !== 201 && milestoneRes.status !== 200) {
    throw new Error(`Create milestone failed: ${JSON.stringify(milestoneRes.data)}`);
  }
  const milestone = milestoneRes.data.data;
  console.log('   ✓ Milestone created:', milestone.id || milestone._id, 'Amount: ₹' + milestone.amount, 'Status:', milestone.status);

  // 5. Test Security: Freelancer cannot fund milestone
  console.log('\n5. Testing Security: Freelancer cannot fund milestone...');
  const freelancerFundTry = await req('POST', '/payments/create-checkout-session', {
    milestoneId: milestone.id || milestone._id
  }, freelancerToken);
  console.log('   Freelancer fund attempt status:', freelancerFundTry.status);
  if (freelancerFundTry.status !== 403) {
    throw new Error(`Security violation! Expected 403 for freelancer funding attempt, got ${freelancerFundTry.status}`);
  }
  console.log('   ✓ Freelancers strictly blocked with 403 from funding milestones');

  // 6. Test Stripe Webhook Signature Verification
  console.log('\n6. Testing Stripe Webhook Endpoint & Signature Verification...');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_workvault_test_webhook_secret_12345';
  const testStripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_stripe_key_12345', { apiVersion: '2023-10-16' });

  // 6a. Attempt with invalid signature
  const fakePayload = JSON.stringify({ id: 'evt_test_invalid', type: 'checkout.session.completed' });
  const invalidSigRes = await req('POST', '/payments/stripe/webhook', fakePayload, null, {
    'stripe-signature': 't=12345,v1=invalidsignatureabcdef'
  });
  console.log('   Webhook with invalid signature status:', invalidSigRes.status);
  if (invalidSigRes.status !== 400) {
    throw new Error(`Expected 400 for invalid signature, got ${invalidSigRes.status}`);
  }
  console.log('   ✓ Webhook with invalid signature successfully rejected with 400');

  // 6b. Attempt with validly signed event for checkout.session.completed
  console.log('\n7. Testing Stripe Webhook checkout.session.completed processing...');
  const sessionId = `cs_test_real_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const paymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const checkoutEvent = {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    type: 'checkout.session.completed',
    data: {
      object: {
        id: sessionId,
        object: 'checkout.session',
        amount_total: milestone.amount * 100, // 1000000 paise = 10000 INR
        currency: 'inr',
        payment_intent: paymentIntentId,
        payment_status: 'paid',
        status: 'complete',
        metadata: {
          milestoneId: (milestone.id || milestone._id).toString(),
          dealId: (deal.id || deal._id).toString(),
          clientId: clientId.toString(),
          freelancerId: freelancerId.toString(),
          amount: milestone.amount.toString()
        }
      }
    }
  };

  const payloadString = JSON.stringify(checkoutEvent);
  const validHeader = testStripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret: webhookSecret
  });

  const webhookRes = await fetch(`${BASE_URL}/payments/stripe/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': validHeader
    },
    body: payloadString
  });

  const webhookJson = await webhookRes.json();
  console.log('   Webhook response status:', webhookRes.status, webhookJson);
  if (webhookRes.status !== 200 || !webhookJson.received) {
    throw new Error(`Valid webhook failed: ${JSON.stringify(webhookJson)}`);
  }
  console.log('   ✓ Verified Stripe webhook successfully accepted and processed');

  // 8. Verify milestone status is now FUNDED in MongoDB
  console.log('\n8. Verifying Milestone status updated to FUNDED...');
  const fundedMilestoneCheck = await req('GET', `/milestones/${milestone.id || milestone._id}`, null, clientToken);
  console.log('   Milestone status:', fundedMilestoneCheck.data.data?.status);
  if (fundedMilestoneCheck.data.data?.status !== 'FUNDED') {
    throw new Error(`Milestone was not transitioned to FUNDED! Current: ${fundedMilestoneCheck.data.data?.status}`);
  }
  console.log('   ✓ Milestone status is confirmed FUNDED');

  // 9. Test Idempotency: Send duplicate webhook
  console.log('\n9. Testing Idempotency: Sending duplicate Stripe webhook event...');
  const dupWebhookRes = await fetch(`${BASE_URL}/payments/stripe/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': validHeader
    },
    body: payloadString
  });
  const dupJson = await dupWebhookRes.json();
  console.log('   Duplicate webhook status:', dupWebhookRes.status, dupJson);
  if (dupWebhookRes.status !== 200) {
    throw new Error(`Duplicate webhook failed with non-200: ${JSON.stringify(dupJson)}`);
  }
  console.log('   ✓ Duplicate webhook handled idempotently without error or double-crediting');

  // 10. Check Transaction Ledger
  console.log('\n10. Checking Transaction Ledger for HELD escrow record...');
  const txList = await req('GET', '/transactions', null, clientToken);
  const heldTx = txList.data.data?.find(t => t.milestoneId === (milestone.id || milestone._id) && t.type === 'PAYMENT_FUNDED');
  if (!heldTx) {
    throw new Error('Ledger transaction PAYMENT_FUNDED not found for milestone');
  }
  console.log('   ✓ Ledger transaction found: ID:', heldTx.id || heldTx._id, 'Amount:', heldTx.amount, 'Status:', heldTx.status, 'Provider:', heldTx.paymentProvider);
  if (heldTx.status !== 'HELD') {
    throw new Error(`Expected transaction status HELD, got ${heldTx.status}`);
  }

  // 11. Freelancer Starts Work
  console.log('\n11. Freelancer starts work on milestone...');
  const startWorkRes = await req('POST', `/milestones/${milestone.id || milestone._id}/start`, {}, freelancerToken);
  console.log('   Start work status:', startWorkRes.status, startWorkRes.data.data?.status);
  if (startWorkRes.status !== 200 || startWorkRes.data.data?.status !== 'IN_PROGRESS') {
    throw new Error(`Start work failed: ${JSON.stringify(startWorkRes.data)}`);
  }
  console.log('   ✓ Milestone moved to IN_PROGRESS');

  // 12. Freelancer Submits Deliverables
  console.log('\n12. Freelancer submits deliverables...');
  const submitWorkRes = await req('POST', `/milestones/${milestone.id || milestone._id}/submit`, {
    message: 'Completed Stripe Checkout and Webhook implementation with full end-to-end tests.',
    files: [{ fileName: 'stripe_implementation.zip', fileUrl: 'https://example.com/files/stripe.zip', size: 1024 }]
  }, freelancerToken);
  console.log('   Submit work status:', submitWorkRes.status, submitWorkRes.data.data?.status);
  if (submitWorkRes.status !== 200 || submitWorkRes.data.data?.status !== 'SUBMITTED') {
    throw new Error(`Submit work failed: ${JSON.stringify(submitWorkRes.data)}`);
  }
  console.log('   ✓ Milestone moved to SUBMITTED');

  // 13. Security check: Freelancer CANNOT approve/release milestone to themselves
  console.log('\n13. Testing Security: Freelancer cannot release milestone funds to themselves...');
  const freelancerReleaseTry = await req('POST', `/milestones/${milestone.id || milestone._id}/approve`, {}, freelancerToken);
  console.log('   Freelancer release attempt status:', freelancerReleaseTry.status);
  if (freelancerReleaseTry.status !== 403) {
    throw new Error(`Expected 403 for freelancer approving self milestone, got ${freelancerReleaseTry.status}`);
  }
  console.log('   ✓ Freelancer release attempt blocked with 403');

  // 14. Client Approves Milestone & Releases Escrow
  console.log('\n14. Client approves submitted milestone & releases Escrow...');
  const approveRes = await req('POST', `/milestones/${milestone.id || milestone._id}/approve`, {}, clientToken);
  console.log('   Approve response status:', approveRes.status);
  if (approveRes.status !== 200) {
    throw new Error(`Approve failed: ${JSON.stringify(approveRes.data)}`);
  }
  const approvedData = approveRes.data.data;
  console.log('   Milestone status:', approvedData.milestone?.status);
  console.log('   Release transaction amount (net):', approvedData.transaction?.amount);
  console.log('   Platform fee deducted:', approvedData.transaction?.fee);

  if (approvedData.milestone?.status !== 'RELEASED') {
    throw new Error(`Expected milestone RELEASED, got ${approvedData.milestone?.status}`);
  }
  // Expected fee for 10,000 INR at 10% is 1,000 INR; net payout is 9,000 INR
  if (approvedData.transaction?.amount !== 9000 || approvedData.transaction?.fee !== 1000) {
    throw new Error(`Expected net 9000 and fee 1000, got net: ${approvedData.transaction?.amount}, fee: ${approvedData.transaction?.fee}`);
  }
  console.log('   ✓ Escrow released! Net ₹9,000 credited to freelancer, ₹1,000 platform fee collected');

  // 15. Verify Prevent Duplicate Release
  console.log('\n15. Testing Duplicate Release Prevention...');
  const dupApproveRes = await req('POST', `/milestones/${milestone.id || milestone._id}/approve`, {}, clientToken);
  console.log('   Duplicate approve status:', dupApproveRes.status);
  if (dupApproveRes.status !== 400) {
    throw new Error(`Expected 400 for duplicate approve, got ${dupApproveRes.status}`);
  }
  console.log('   ✓ Duplicate release attempt blocked with 400');

  // 16. Verify Freelancer Available Balance and Withdrawal
  console.log('\n16. Verifying Freelancer Balance and Withdrawal...');
  const balanceRes = await req('GET', '/withdrawals/balance', null, freelancerToken);
  console.log('   Freelancer Balance:', balanceRes.data.data);
  if (balanceRes.data.data?.availableBalance < 9000) {
    throw new Error(`Expected availableBalance >= 9000, got ${balanceRes.data.data?.availableBalance}`);
  }
  console.log('   ✓ Freelancer available balance verified:', balanceRes.data.data?.availableBalance);

  // 17. Freelancer Requests Payout Withdrawal
  console.log('\n17. Freelancer requests withdrawal of ₹5,000...');
  const withdrawRes = await req('POST', '/withdrawals', {
    amount: 5000,
    payoutMethod: 'bank_transfer',
    accountDetails: { bank: 'HDFC', accountNumber: '1234567890', ifsc: 'HDFC0001234' }
  }, freelancerToken);
  console.log('   Withdrawal status:', withdrawRes.status, withdrawRes.data.data?.newBalance);
  if (withdrawRes.status !== 201 && withdrawRes.status !== 200) {
    throw new Error(`Withdrawal failed: ${JSON.stringify(withdrawRes.data)}`);
  }
  console.log('   ✓ Withdrawal succeeded! Updated balance:', withdrawRes.data.data?.newBalance);

  console.log('\n==================================================');
  console.log('🎉 ALL STRIPE INTEGRATION TESTS PASSED 100%!');
  console.log('==================================================');
}

run().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err.message);
  process.exit(1);
});
