# Stripe Live Mode Transition Guide

This document outlines the necessary changes and steps required to switch your application from Stripe Test Mode to Live Mode while maintaining the current functionality.

## Core Files & Components

The following files are responsible for the payment processor implementation:

- **`.env`**: Stores sensitive API keys and configuration.
- **`src/env.js`**: Validates that all required Stripe environment variables are present.
- **`src/lib/stripe.ts`**: Initializes the Stripe server-side client.
- **`src/lib/actions/stripe.ts`**: Contains the logic for creating Payment Intents, Checkout Sessions, and managing Stripe Connect (marketplace functionality).
- **`src/app/api/webhooks/stripe/route.ts`**: Processes real-time updates from Stripe (e.g., successful payments, subscription creations).

## Required Changes

To switch to Live Mode, you will need to update the following in your `.env` file:

### 1. API Keys
Replace your test keys with live keys from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys).
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Replace `pk_test_...` with `pk_live_...`.
- `STRIPE_API_KEY`: Replace `sk_test_...` with `sk_live_...`.

### 2. Webhook Secret
1. Go to the [Stripe Webhooks Dashboard](https://dashboard.stripe.com/webhooks).
2. Add a new endpoint pointing to your production URL: `https://yourdomain.com/api/webhooks/stripe`.
3. Select the events to listen for (at minimum: `payment_intent.succeeded`, `checkout.session.completed`, `invoice.payment_succeeded`).
4. Copy the **Signing secret** and update:
   - `STRIPE_WEBHOOK_SECRET`: Replace `whsec_...` with the new live secret.

### 3. Subscription Price IDs
Since Products and Prices are separate in Test and Live modes, you must re-create your "Standard" and "Pro" plans in the Live dashboard.
- `STRIPE_STD_MONTHLY_PRICE_ID`: Update with the new Live Price ID.
- `STRIPE_PRO_MONTHLY_PRICE_ID`: Update with the new Live Price ID.

## Important Considerations

### Stripe Connect (Marketplace)
The code currently uses a "Test Bypass" logic. If `STRIPE_API_KEY` starts with `sk_test_`, it allows payments even if a store isn't fully connected. 
- **In Live Mode**: This bypass is disabled. Every store **must** complete the Stripe Connect onboarding before they can accept payments.
- **Platform Verification**: Ensure your Stripe Platform account is fully verified for live payments in the Stripe Dashboard.

### Product Data
The `createCheckoutSession` function (marketplace items) pulls name, price, and images directly from your database and creates a "dynamic" price on the fly in Stripe. This will continue to work naturally in Live mode as long as the API keys are correct.

### Webhook Fallback
The webhook handler (`src/app/api/webhooks/stripe/route.ts`) has a fallback to a "Solo-store ID" if it cannot find a connected account for the event. Ensure your `getStoreId()` utility correctly identifies the default store in your live database.
