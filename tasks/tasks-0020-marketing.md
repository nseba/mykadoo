# Tasks: Marketing & Growth Strategy (PRD 0020)

## Relevant Files

### Analytics
- `apps/web/lib/analytics/gtag.ts` - Google Analytics 4
- `apps/web/lib/analytics/mixpanel.ts` - Event tracking
- `apps/web/lib/analytics/attribution.ts` - UTM tracking

### Email Marketing
- `apps/api/src/email/templates/` - Email templates
- `apps/api/src/email/campaigns.service.ts` - Campaign management
- `apps/api/src/email/automation.service.ts` - Email automation

### Referral Program
- `apps/api/src/referral/referral.module.ts` - Referral system
- `apps/web/components/referral/ReferralDashboard.tsx` - Referral UI

### Social Media
- `marketing/social/content-calendar.md` - Content planning
- `marketing/social/templates/` - Post templates

## Notes

```bash
# Analytics
# Google Analytics: https://analytics.google.com
# Mixpanel: https://mixpanel.com

# Email
# Mailchimp API docs: https://mailchimp.com/developer/

# Ads
# Google Ads: https://ads.google.com
# Facebook Ads: https://business.facebook.com
```

## Tasks

### 1.0 Set up analytics and attribution tracking
#### 1.1 Install Google Analytics 4
#### 1.2 Install Mixpanel for event tracking
#### 1.3 Implement UTM parameter tracking
#### 1.4 Create attribution storage logic
#### 1.5 Track page views and sessions
#### 1.6 Implement custom event tracking
#### 1.7 Set up conversion goals
#### 1.8 Create funnel analysis
#### 1.9 Build custom analytics dashboard
#### 1.10 Test attribution accuracy
#### 1.11 Run linter and verify zero warnings
#### 1.12 Run full test suite and verify all tests pass
#### 1.13 Build project and verify successful compilation
#### 1.14 Verify system functionality end-to-end
#### 1.15 Update Docker configurations if deployment changes needed
#### 1.16 Update Helm chart if deployment changes needed

### 2.0 Launch Google Ads campaigns
#### 2.1 Create Google Ads account
#### 2.2 Set up conversion tracking
#### 2.3 Research and select target keywords
#### 2.4 Create search ad campaigns (brand + generic terms)
#### 2.5 Write ad copy variations (5+ per campaign)
#### 2.6 Set up ad extensions (sitelinks, callouts)
#### 2.7 Configure budget and bidding strategy
#### 2.8 Create display remarketing campaigns
#### 2.9 Set up negative keywords list
#### 2.10 Launch campaigns and monitor performance
#### 2.11 Run linter and verify zero warnings
#### 2.12 Run full test suite and verify all tests pass
#### 2.13 Build project and verify successful compilation
#### 2.14 Verify system functionality end-to-end
#### 2.15 Update Docker configurations if deployment changes needed
#### 2.16 Update Helm chart if deployment changes needed

### 3.0 Launch Facebook/Instagram ad campaigns
#### 3.1 Create Facebook Business Manager account
#### 3.2 Set up Facebook Pixel
#### 3.3 Create custom audiences (website visitors, email list)
#### 3.4 Build lookalike audiences from converters
#### 3.5 Design ad creative (carousel, video, story ads)
#### 3.6 Write ad copy variations
#### 3.7 Set up campaign structure (awareness, consideration, conversion)
#### 3.8 Configure targeting (demographics, interests, behaviors)
#### 3.9 Set budget and bidding strategy
#### 3.10 Launch campaigns and monitor performance
#### 3.11 Run linter and verify zero warnings
#### 3.12 Run full test suite and verify all tests pass
#### 3.13 Build project and verify successful compilation
#### 3.14 Verify system functionality end-to-end
#### 3.15 Update Docker configurations if deployment changes needed
#### 3.16 Update Helm chart if deployment changes needed

### 4.0 Build email marketing infrastructure
#### 4.1 Choose email service provider (Mailchimp, SendGrid)
#### 4.2 Set up API integration
#### 4.3 Create email templates (welcome, newsletter, promotional)
#### 4.4 Design email layouts (mobile-responsive)
#### 4.5 Build subscriber list segmentation
#### 4.6 Implement double opt-in
#### 4.7 Create lead magnets (gift guide PDFs)
#### 4.8 Set up pop-up forms on website
#### 4.9 Build email preference center
#### 4.10 Test email deliverability
#### 4.11 Run linter and verify zero warnings
#### 4.12 Run full test suite and verify all tests pass
#### 4.13 Build project and verify successful compilation
#### 4.14 Verify system functionality end-to-end
#### 4.15 Update Docker configurations if deployment changes needed
#### 4.16 Update Helm chart if deployment changes needed

### 5.0 Create email automation workflows
#### 5.1 Build welcome email series (5 emails, 10 days)
#### 5.2 Create re-engagement campaign (inactive 30 days)
#### 5.3 Build win-back campaign (inactive 90 days)
#### 5.4 Implement milestone emails (1st search, 10th search)
#### 5.5 Create referral reminder emails
#### 5.6 Set up abandoned search recovery
#### 5.7 Build seasonal campaign automations
#### 5.8 Implement A/B testing for subject lines
#### 5.9 Create personalization tokens
#### 5.10 Test all automation workflows
#### 5.11 Run linter and verify zero warnings
#### 5.12 Run full test suite and verify all tests pass
#### 5.13 Build project and verify successful compilation
#### 5.14 Verify system functionality end-to-end
#### 5.15 Update Docker configurations if deployment changes needed
#### 5.16 Update Helm chart if deployment changes needed

### 6.0 Implement referral program
#### 6.1 Create referral code generation logic
#### 6.2 Build referral tracking system
#### 6.3 Implement reward fulfillment (1 month free premium)
#### 6.4 Create referral dashboard UI
#### 6.5 Build sharing functionality (email, social, link)
#### 6.6 Generate QR codes for in-person sharing
#### 6.7 Implement fraud detection
#### 6.8 Create leaderboard for top referrers
#### 6.9 Design promotional materials
#### 6.10 Test referral flow end-to-end
#### 6.11 Run linter and verify zero warnings
#### 6.12 Run full test suite and verify all tests pass
#### 6.13 Build project and verify successful compilation
#### 6.14 Verify system functionality end-to-end
#### 6.15 Update Docker configurations if deployment changes needed
#### 6.16 Update Helm chart if deployment changes needed

### 7.0 Build social media presence
#### 7.1 Create Instagram business account
#### 7.2 Create TikTok account
#### 7.3 Create Pinterest business account
#### 7.4 Create Twitter/X account
#### 7.5 Design profile images and bios
#### 7.6 Create content calendar (30 days)
#### 7.7 Produce initial content (30+ posts)
#### 7.8 Set up social media scheduling tool (Buffer, Hootsuite)
#### 7.9 Create hashtag strategy
#### 7.10 Launch social media accounts
#### 7.11 Run linter and verify zero warnings
#### 7.12 Run full test suite and verify all tests pass
#### 7.13 Build project and verify successful compilation
#### 7.14 Verify system functionality end-to-end
#### 7.15 Update Docker configurations if deployment changes needed
#### 7.16 Update Helm chart if deployment changes needed

### 8.0 Launch influencer and affiliate partnerships
#### 8.1 Create influencer outreach list (50+ targets)
#### 8.2 Design influencer pitch email
#### 8.3 Reach out to micro-influencers
#### 8.4 Create affiliate program structure
#### 8.5 Set up affiliate tracking (20% commission)
#### 8.6 Build affiliate dashboard
#### 8.7 Create affiliate marketing materials
#### 8.8 Onboard first 10 affiliates
#### 8.9 Set up monthly affiliate newsletter
#### 8.10 Track partnership performance
#### 8.11 Run linter and verify zero warnings
#### 8.12 Run full test suite and verify all tests pass
#### 8.13 Build project and verify successful compilation
#### 8.14 Verify system functionality end-to-end
#### 8.15 Update Docker configurations if deployment changes needed
#### 8.16 Update Helm chart if deployment changes needed

### 9.0 Implement A/B testing framework
#### 9.1 Choose A/B testing platform (Google Optimize, Optimizely)
#### 9.2 Set up testing infrastructure
#### 9.3 Create landing page variants (3+ versions)
#### 9.4 Test headline variations
#### 9.5 Test CTA button variations
#### 9.6 Run signup flow tests
#### 9.7 Test pricing page variations
#### 9.8 Implement statistical significance checks
#### 9.9 Document test results and learnings
#### 9.10 Implement winning variations
#### 9.11 Run linter and verify zero warnings
#### 9.12 Run full test suite and verify all tests pass
#### 9.13 Build project and verify successful compilation
#### 9.14 Verify system functionality end-to-end
#### 9.15 Update Docker configurations if deployment changes needed
#### 9.16 Update Helm chart if deployment changes needed

### 10.0 Launch campaigns and optimize growth
#### 10.1 Create seasonal campaign calendar
#### 10.2 Launch Mother's Day campaign
#### 10.3 Launch Father's Day campaign
#### 10.4 Create holiday season campaigns
#### 10.5 Run user acquisition campaign (10,000 users target)
#### 10.6 Monitor and optimize ad spend (CAC <$10)
#### 10.7 Track retention metrics (40% MAU target)
#### 10.8 Analyze LTV:CAC ratio (>3:1 target)
#### 10.9 Build growth dashboard
#### 10.10 Create monthly growth reports
#### 10.11 Iterate based on performance data
#### 10.12 Run linter and verify zero warnings
#### 10.13 Run full test suite and verify all tests pass
#### 10.14 Build project and verify successful compilation
#### 10.15 Verify system functionality end-to-end
#### 10.16 Update Docker configurations if deployment changes needed
#### 10.17 Update Helm chart if deployment changes needed

---

**Status:** Ready for Implementation
**Priority:** P2 - Advanced Features (Phase 4)
**Estimated Duration:** 12 weeks (ongoing)
**Dependencies:** PRD 0001-0004 (Product ready), PRD 0019 (Analytics)
