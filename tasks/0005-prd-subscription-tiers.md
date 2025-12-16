# PRD: Subscription & Payment System

**Status:** In Progress
**Priority:** P0 - Phase 2 Critical
**Phase:** 2 - Monetization & Growth

## Introduction

Mykadoo's monetization strategy relies on a tiered subscription model that balances free access with premium features. This PRD defines the subscription tiers, payment integration with Stripe, and the feature gating system that unlocks capabilities based on user subscription level.

## Problem Statement

Mykadoo needs to:
- Generate recurring revenue to sustain and grow the platform
- Provide a clear value proposition for premium subscriptions
- Offer a frictionless payment experience
- Gate premium features appropriately
- Handle subscription lifecycle (upgrades, downgrades, cancellations)
- Manage billing, invoices, and payment failures gracefully

## Goals

1. Implement 3-tier subscription model (Free, Gold, Platinum)
2. Integrate Stripe for payment processing
3. Achieve <2% payment failure rate with retry logic
4. Support subscription upgrades/downgrades with prorated billing
5. Handle subscription cancellations with grace period
6. Provide clear pricing page with tier comparison
7. Implement feature gating across the application
8. Support promotional codes and discounts
9. Generate invoices and payment receipts
10. Achieve 5% free-to-paid conversion within 6 months

## User Stories

### As a free user:
- I want to understand what premium features offer so I can decide if upgrading is worth it
- I want to see clear pricing so I know what I'll pay
- I want a simple upgrade process so I can subscribe quickly
- I want to try premium features before committing so I can evaluate the value

### As a subscriber:
- I want to manage my subscription easily so I can upgrade, downgrade, or cancel
- I want to see my billing history so I can track my payments
- I want to update my payment method so my subscription continues uninterrupted
- I want to be notified before renewal so I'm not surprised by charges
- I want to cancel anytime without penalties so I feel in control

### As a business stakeholder:
- I want to track subscription metrics (MRR, churn, conversion) so I can measure growth
- I want to offer promotions so I can drive conversions
- I want to handle failed payments gracefully so I don't lose subscribers unnecessarily
- I want to comply with payment regulations (PCI-DSS) so we avoid legal issues

## Subscription Tiers

### Free Tier
**Price:** $0/month
**Target:** New users exploring the platform

**Features:**
- 5 AI gift searches per month
- 3 recipient profiles
- Basic gift recommendations
- Access to gift guides and blog content
- Email support (48-hour response)

**Limitations:**
- No wishlist sharing
- No gift reminders
- Basic recommendation algorithm
- Ads displayed
- No priority support

### Gold Tier
**Price:** $9.99/month or $99/year (save 17%)
**Target:** Regular gift-givers who want enhanced features

**Features:**
- 50 AI gift searches per month
- 10 recipient profiles
- Advanced gift recommendations
- Shareable wishlists (up to 5)
- Gift occasion reminders
- Priority email support (24-hour response)
- No ads
- Export recommendations to PDF

**Limitations:**
- No unlimited searches
- No AI chat assistance
- No family sharing

### Platinum Tier
**Price:** $19.99/month or $199/year (save 17%)
**Target:** Power users and families

**Features:**
- Unlimited AI gift searches
- Unlimited recipient profiles
- Premium recommendation algorithm
- Unlimited shareable wishlists
- Advanced gift calendar with reminders
- AI chat assistance for gift ideas
- Family sharing (up to 5 members)
- Priority phone & email support (4-hour response)
- No ads
- Early access to new features
- Exclusive partner discounts

## Functional Requirements

### 1. Stripe Integration

**1.1** System must integrate with Stripe for:
- Subscription creation and management
- One-time payments (if needed)
- Payment method management (cards)
- Invoice generation
- Webhook event handling

**1.2** Payment methods must support:
- Credit/debit cards (Visa, Mastercard, Amex, Discover)
- Future: Apple Pay, Google Pay (Phase 2)

**1.3** System must handle:
- Successful payments
- Failed payments with automatic retry (up to 4 attempts over 3 weeks)
- Card expiration warnings
- Payment method updates
- Refunds (admin-initiated)

### 2. Subscription Management

**2.1** Users must be able to:
- View current subscription status
- Upgrade to higher tier (immediate, prorated)
- Downgrade to lower tier (end of billing period)
- Cancel subscription (end of billing period with grace)
- Reactivate canceled subscription (within grace period)
- View billing history
- Download invoices

**2.2** System must:
- Prorate charges for mid-cycle upgrades
- Apply changes at end of billing period for downgrades
- Provide 7-day grace period after cancellation
- Send reminder emails before renewal (3 days)
- Handle subscription pausing (up to 3 months)

### 3. Feature Gating

**3.1** System must gate features based on subscription tier:
- Search limit enforcement
- Profile limit enforcement
- Wishlist sharing access
- Gift reminder access
- Ad display toggling
- AI chat access
- Family sharing access

**3.2** Gating must:
- Show upgrade prompts when hitting limits
- Clearly indicate locked features
- Not break user experience on downgrade
- Preserve user data when downgrading

### 4. Promotional System

**4.1** System must support:
- Percentage discounts (e.g., 20% off)
- Fixed amount discounts (e.g., $5 off)
- Free trial periods (7-day, 14-day)
- First month/year discounts
- Referral codes

**4.2** Promotional codes must:
- Have optional expiration dates
- Have optional usage limits
- Be trackable for attribution
- Stack rules (one code per subscription)

### 5. Billing & Invoices

**5.1** System must generate:
- Monthly/annual invoices via Stripe
- Payment receipts via email
- Failed payment notifications
- Subscription change confirmations

**5.2** Invoices must include:
- Company details
- Line items with descriptions
- Tax information (if applicable)
- Payment method (last 4 digits)
- Invoice number and date

## Technical Requirements

### Database Schema

```prisma
model Subscription {
  id                    String    @id @default(cuid())
  userId                String    @unique
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  plan                  SubscriptionPlan @default(FREE)
  status                SubscriptionStatus @default(ACTIVE)

  stripeCustomerId      String?   @unique
  stripeSubscriptionId  String?   @unique
  stripePriceId         String?

  currentPeriodStart    DateTime?
  currentPeriodEnd      DateTime?
  cancelAtPeriodEnd     Boolean   @default(false)
  canceledAt            DateTime?

  trialStart            DateTime?
  trialEnd              DateTime?

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  payments              Payment[]
  usageRecords          UsageRecord[]
}

enum SubscriptionPlan {
  FREE
  GOLD
  PLATINUM
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  PAUSED
  TRIALING
  INCOMPLETE
}

model Payment {
  id                String    @id @default(cuid())
  subscriptionId    String
  subscription      Subscription @relation(fields: [subscriptionId], references: [id])

  stripePaymentId   String    @unique
  amount            Int       // in cents
  currency          String    @default("usd")
  status            PaymentStatus

  invoiceUrl        String?
  receiptUrl        String?

  paidAt            DateTime?
  createdAt         DateTime  @default(now())
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}

model UsageRecord {
  id                String    @id @default(cuid())
  subscriptionId    String
  subscription      Subscription @relation(fields: [subscriptionId], references: [id])

  feature           String    // e.g., "ai_search", "profile_create"
  count             Int       @default(1)
  periodStart       DateTime
  periodEnd         DateTime

  createdAt         DateTime  @default(now())

  @@index([subscriptionId, feature, periodStart])
}

model PromoCode {
  id                String    @id @default(cuid())
  code              String    @unique

  discountType      DiscountType
  discountValue     Int       // percentage or cents

  validFrom         DateTime  @default(now())
  validUntil        DateTime?
  maxUses           Int?
  currentUses       Int       @default(0)

  applicablePlans   SubscriptionPlan[]

  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
}

enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
}
```

### API Endpoints

```
POST   /api/subscriptions/checkout      - Create Stripe checkout session
POST   /api/subscriptions/portal        - Create Stripe billing portal session
GET    /api/subscriptions/current       - Get current subscription
PATCH  /api/subscriptions/upgrade       - Upgrade subscription
PATCH  /api/subscriptions/downgrade     - Downgrade subscription
POST   /api/subscriptions/cancel        - Cancel subscription
POST   /api/subscriptions/reactivate    - Reactivate canceled subscription
GET    /api/subscriptions/invoices      - List invoices
POST   /api/subscriptions/promo/apply   - Apply promo code
POST   /api/webhooks/stripe             - Stripe webhook handler

GET    /api/usage/current               - Get current period usage
GET    /api/usage/history               - Get usage history
```

### Webhook Events to Handle

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `invoice.upcoming`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

## UI Requirements

### Pricing Page
- Clear tier comparison table
- Monthly/annual toggle with savings highlighted
- CTA buttons for each tier
- FAQ section
- Trust badges (secure payment, cancel anytime)

### Subscription Management
- Current plan display with usage stats
- Upgrade/downgrade buttons
- Cancel subscription with reason collection
- Billing history table
- Payment method management
- Promo code input

### Feature Gating UI
- Graceful lock icons on gated features
- Upgrade prompts when limits reached
- Non-intrusive upsell banners
- Clear explanation of what's locked and why

## Success Metrics

- **Conversion Rate:** 5% free-to-paid within 6 months
- **MRR Growth:** 10% month-over-month
- **Churn Rate:** <5% monthly
- **Payment Success Rate:** >98%
- **Upgrade Rate:** 20% Gold to Platinum annually
- **Customer Lifetime Value:** >$100

## Dependencies

- Stripe account with subscription features
- Email service for billing notifications
- PRD 0002 (User Authentication) - for user accounts
- PRD 0007 (Analytics) - for subscription metrics

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Payment failures | Lost revenue | Implement smart retry logic, dunning emails |
| Feature gating bugs | User frustration | Comprehensive testing, graceful fallbacks |
| Pricing too high | Low conversion | A/B test pricing, offer trials |
| Stripe downtime | Can't process payments | Cache subscription state, queue retries |
| Chargeback fraud | Financial loss | Implement fraud detection, clear refund policy |

## Timeline

- **Week 1-2:** Stripe integration, database schema, basic subscription CRUD
- **Week 3-4:** Checkout flow, billing portal, webhook handling
- **Week 5-6:** Feature gating implementation, usage tracking
- **Week 7-8:** UI components, pricing page, testing

## Acceptance Criteria

- [ ] User can subscribe to Gold or Platinum tier
- [ ] User can upgrade/downgrade between tiers
- [ ] User can cancel and reactivate subscription
- [ ] Feature gating works correctly for all tiers
- [ ] Stripe webhooks update subscription status correctly
- [ ] Failed payments trigger retry and dunning flow
- [ ] Usage limits are enforced and tracked
- [ ] Pricing page displays correctly with tier comparison
- [ ] Promo codes can be applied at checkout
- [ ] Invoices are generated and accessible

---

**Document Version:** 1.0
**Created:** 2025-12-16
**Status:** In Progress
**Author:** AI Product Team
