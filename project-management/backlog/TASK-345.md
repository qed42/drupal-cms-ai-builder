# TASK-345: Dashboard Subscription Card Deduplication

**Story:** US-063
**Priority:** P1
**Estimated Effort:** S
**Milestone:** M18 — UX Revamp

## Description
Fix the dashboard rendering where `SubscriptionStatus` appears once per site, causing visual duplication. The current code renders `SubscriptionStatus` inside `sites.map()` with a `grid-cols-3` split (2/3 SiteCard + 1/3 Subscription). This must be investigated and restructured.

## Technical Approach

### Step 1: Investigate data model
Examine the Prisma schema to determine whether `subscription` is:
- **Account-level** (one subscription per user) → extract above the loop
- **Site-level** (each site has its own subscription) → collapse into a badge inside `SiteCard`

### Step 2a: If account-level subscription
1. Extract `SubscriptionStatus` above the `sites.map()` loop
2. Query subscription once and render a single status block

### Step 2b: If site-level subscription (current schema suggests this)
1. Remove the separate `SubscriptionStatus` column from the grid
2. Collapse subscription info into a **status badge** inside `SiteCard`:
   ```
   ┌────────────────────────────────────────────────────┐
   │  My Coffee Shop          ● Live    Pro Plan ✓      │
   │  mycoffee.site.com                                 │
   │  [Edit] [Preview] [Settings]                       │
   ├────────────────────────────────────────────────────┤
   │  Portfolio Project        ◐ Generating...  Free    │
   │  myportfolio.site.com                              │
   │  [View Progress]                                   │
   └────────────────────────────────────────────────────┘
   ```
3. Remove the `grid-cols-3` split — `SiteCard` goes full-width
4. Add plan badge (e.g., "Pro Plan ✓", "Free") and status indicator (● Live, ◐ Generating, ○ Draft) to `SiteCard`

### Step 3: Verify with 1 site and multiple sites

## Acceptance Criteria
- [ ] Data model investigated — decision documented in code comment
- [ ] No duplicate subscription cards regardless of number of sites
- [ ] Each `SiteCard` shows its own status (generating, live, draft) + plan badge inline
- [ ] `SiteCard` uses full width — no 2/3 + 1/3 grid split
- [ ] Works correctly for users with 1 site and multiple sites

## Dependencies
- None

## Files/Modules Affected
- `platform-app/src/app/dashboard/page.tsx`
- `platform-app/src/components/dashboard/SiteCard.tsx` (potential status badge addition)
