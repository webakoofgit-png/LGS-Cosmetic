Customer orders and integrations
===============================

Customer registration/login uses Better Auth with HttpOnly sessions, separately from admin JWT authentication. Checkout requires a customer account. Order totals, discounts and stock are calculated on the server. Customers can access only their own orders at /account and /orders/:number.

Admin Orders provides fulfillment transitions, courier/AWB/tracking URL, payment collection and event history. COD remains Awaiting collection until staff record money received; Delivered requires Paid. Courier location updates come from the supplied courier tracking link; there is no automatic courier API integration.

Razorpay (disabled by default)
-----------------------------
Set backend-only RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET. Configure automatic payment capture in Razorpay. Configure a public HTTPS webhook at /api/payments/razorpay/webhook for payment.captured, payment.failed and payment.authorized. Then explicitly set RAZORPAY_ENABLED=true and restart. Production refuses test key IDs. Do not put secrets in VITE_ variables.

The server creates the gateway order using stored INR totals. Checkout signatures use the stored gateway order ID. The server fetches the payment and checks its order, amount, currency and captured state before recording Paid. Raw-body webhook signatures are checked; duplicate/late events cannot downgrade Paid. Failed/cancelled checkout leaves the order available for retry from customer order details. Unpaid reservations currently require staff cancellation to release stock. Refunds for online payments must be processed in Razorpay; automatic refund reconciliation is not implemented.

Resend (queued by default)
--------------------------
Verify the sending domain in Resend. Set RESEND_API_KEY and ORDER_EMAIL_FROM to an address on that verified domain. Set FRONTEND_URL to the actual website URL. Only after domain verification set RESEND_DOMAIN_VERIFIED=true and RESEND_ENABLED=true, then restart.

Templates cover Placed, Confirmed, Processing, Shipped, Out for delivery, Ready for pickup, Delivered and Cancelled. The durable database outbox is written in the same transaction as each order event. A worker checks the queue every 30 seconds. Failures use bounded exponential retries, up to eight attempts, and never block checkout. Sent means accepted by Resend with an email ID, not guaranteed inbox delivery. Check provider logs for bounces. Requests use event idempotency keys; uncertain requests outside the provider deduplication window require manual review. Review any old queued events before enabling sending: enabling sends existing queued customer notifications too.

Local verification
------------------
With both integrations disabled and the backend running, run node backend/scripts/verify-commerce.mjs. This creates temporary customers/orders, verifies ownership, stock, COD transitions and queued notifications, then removes its own data. Do not run against an active production store. Live Razorpay capture and Resend acceptance still need staging verification after credentials are supplied.
