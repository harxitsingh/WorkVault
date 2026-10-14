# WorkVault Prioritized Remaining Issues & Manual Verification Checklist

**Date:** October 14, 2026  
**Status Notice:** **THIS APPLICATION IS NOT CERTIFIED PRODUCTION-READY.**  
Passing build and test runs confirm code correctness within the simulated and local environment, but production deployment requires completing the manual verification and infrastructure hardening steps below.

---

## 1. Prioritized Remaining Issues & Residual Risks

### High Priority
1. **Unverified External Webhooks in Live Environment (F7):**
   - **Risk:** Stripe webhook signature verification is implemented using `express.raw({ type: 'application/json' })`, but has not been verified against a live Stripe dashboard event stream with live TLS headers.
   - **Action Required:** Execute manual checklist in Section 2.1 using Stripe CLI test fixtures.

2. **Single-Instance In-Memory Socket / Polling Architecture:**
   - **Risk:** WebSockets or real-time notification components depend on single-process memory. If deployed behind a load balancer with multiple Node instances without a Redis adapter, notifications may fail to reach connected clients on other worker nodes.
   - **Action Required:** Configure Redis adapter (`@socket.io/redis-adapter`) if horizontal scaling is planned.

### Medium Priority
3. **Frontend Vulnerability Advisory (`source-map-js`):**
   - **Risk:** `npm audit` on frontend flags 1 high-severity advisory in `source-map-js` used by Vite/Rollup dev build tooling.
   - **Action Required:** Monitor for non-breaking upstream patch in Vite/Rollup packages. No runtime exposure exists on production static bundles.

4. **Multi-Document Database Transactions on Standalone MongoDB:**
   - **Risk:** The local test database runs as a standalone MongoDB instance. Multi-document ACID transactions require a replica set or MongoDB Atlas cluster.
   - **Action Required:** Ensure production MongoDB is deployed as a replica set so Mongoose transactions (`session.withTransaction()`) can execute natively.

---

## 2. Manual Verification Checklist for User / Operator

### 2.1 Stripe Test-Mode Webhook Verification
Before going live, perform the following verification using the Stripe CLI:
```bash
# 1. Login to Stripe CLI with your test credentials
stripe login

# 2. Forward webhooks to your local/staging backend
stripe listen --forward-to localhost:5000/api/payments/webhook

# 3. Trigger test checkout session completion
stripe trigger checkout.session.completed

# 4. Confirm in backend logs that the signature was verified and milestone status moved to FUNDED
```

### 2.2 Cloud Storage Integration Verification
If moving from local disk storage (`backend/uploads/`) to Cloudinary or AWS S3:
1. Provide valid environment variable names in `.env`:
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - OR `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BUCKET_NAME`
2. Test upload of an image from `FreelancerProfile.jsx` and confirm the public CDN URL is generated and saved to the user profile.

### 2.3 Secret Rotation & Environment Isolation
1. Confirm all production `.env` files contain cryptographically secure secrets (`JWT_SECRET`, `SESSION_SECRET`, `STRIPE_WEBHOOK_SECRET` with ≥ 32 random bytes).
2. Ensure no test credentials or default fallback secrets exist in production deployment scripts.

### 2.4 Production Database Indexing
Verify that production MongoDB collections have unique compound indexes created:
```javascript
// Recommended indexes to ensure absolute idempotence:
db.transactions.createIndex({ referenceId: 1 }, { unique: true, sparse: true });
db.reviews.createIndex({ deal: 1, reviewer: 1 }, { unique: true });
db.disputes.createIndex({ deal: 1, status: 1 });
```

---

## 3. Product Decisions Needed from Operator
1. **Split Dispute Resolution:** Currently, dispute resolution supports full refund to client (`REFUND_CLIENT`), full release to freelancer (`RELEASE_FREELANCER`), or deal resumption (`RESUME_DEAL`). If the business requires partial/split payouts (e.g., 50% refund, 50% release), explicit arbitration logic must be specified.
2. **Platform Fee Configuration:** Admin settings allow adjusting the platform fee percentage. A decision is needed on whether fee changes apply retroactively to open deals or only to newly created deals.
