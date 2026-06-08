# Mobile-Responsive CRM Design
**Date:** 2026-06-06  
**Status:** Approved  
**Scope:** Make On3oard CRM mobile-friendly for phones & tablets with light management workflows

---

## Overview

**Goal:** Enable sales teams to access and manage key CRM functions on mobile devices (phones + tablets, portrait + landscape) with emphasis on **speed** and **quick task completion** (< 30 seconds per action).

**Approach:** Hybrid model — responsive Tailwind foundation + dedicated mobile-optimized layouts for 4 priority modules (Contacts, Deals, Activities, Dashboard).

**Success Criteria:**
- ✅ Fast performance on mobile hardware
- ✅ Core tasks completable in < 30 seconds
- ✅ Light management workflows (view, create, edit basic info)
- ✅ No breaking changes to desktop experience

---

## Architecture & Navigation

### Mobile-First Layout

**Responsive Breakpoints:**

| Breakpoint | Width | Device | Sidebar | Layout | Nav |
|---|---|---|---|---|---|
| Mobile | < 640px | Phone | Hidden | Single column | Bottom tabs |
| Tablet Portrait | 640–768px | Tablet (portrait) | Hidden | Single column | Bottom tabs |
| Tablet Landscape | 768–1024px | Tablet (landscape) | Visible | Two columns possible | Bottom + sidebar |
| Desktop | > 1024px | Desktop/laptop | Visible | Multi-column | Sidebar + top |

**Navigation Strategy:**
- **Mobile (< 768px):** Bottom tab navigation only (7 tabs: Dashboard, Contacts, Companies, Deals, Activities, Campaigns, Settings)
  - Sidebar hidden with `hidden md:block`
  - Reclaims ~280px of screen width
  - Touch-friendly: 44px+ icon targets, labels below icons
  
- **Tablet & Desktop (≥ 768px):** Sidebar returns, bottom nav hidden with `md:hidden`

### Touch-First Design Principles

**Tap Target Sizes:**
- Minimum: **44px × 44px** (mobile accessibility standard)
- Buttons: `px-4 py-3` padding (increased from `px-3 py-2`)
- Links/interactive elements: add padding around text to prevent mis-taps

**Spacing:**
- Mobile: reduced gutters (`p-4` instead of `p-6`)
- Mobile: reduced gaps between items (`gap-3` instead of `gap-4`)
- Tablet+: maintain current spacing for breathing room

**Typography:**
- Mobile base font: 16px (vs 14px on desktop) for readability
- Avoid small text on mobile (anything < 14px should increase to 16px+)
- Headings: increase slightly for prominence on small screens

**Interactions:**
- Avoid hover states on mobile (use tap-to-reveal or toggle states)
- Forms: use mobile-friendly pickers (native date/time, not desktop calendars)
- Modals: full-screen drawers on mobile, side modals on desktop

---

## Core Responsive Improvements

### Sidebar & Navigation

**Implementation:**
```tsx
// Sidebar: hidden on mobile
<aside className="hidden md:flex ...">
  <Sidebar />
</aside>

// Bottom nav: visible only on mobile
<MobileNav className="md:hidden" />

// Main content: full-width on mobile, constrained on desktop
<main className="max-w-6xl mx-auto md:ml-80">
  <Content />
</main>
```

### Forms (All Modules)

**Column Layout by Breakpoint:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  <FormField /> {/* Stacks vertically on mobile */}
</div>
```

- **Mobile:** single-column, all fields stack vertically
- **Tablet:** 2 columns max
- **Desktop:** 2–3 columns where appropriate

**Button Behavior:**
- Desktop: inline buttons (side-by-side)
- Mobile: **full-width, sticky at bottom** of form (always reachable)
- Reduce secondary actions on mobile (show only Save/Cancel)

### Data Lists & Tables

**Pattern: Card-Based View on Mobile**

Desktop → Mobile transformation:

| Desktop | Mobile |
|---|---|
| Multi-column table | Vertical card stack |
| Columns: Name, Phone, Email, Company, Last Contact | Card: Name + Company + Phone (expandable for full details) |
| Clickable row → full page | Tap card → detail panel or modal |
| Filter sidebar | Simplified filter bar at top |

**Example (Contacts):**
```tsx
// Desktop: table
<div className="hidden md:block">
  <table>
    <tr><td>Name</td><td>Phone</td><td>Email</td>...</tr>
  </table>
</div>

// Mobile: cards
<div className="md:hidden space-y-3">
  <ContactCard name="John Doe" company="Acme" phone="555-1234" />
</div>
```

### Modals & Drawers

- **Desktop:** Side modal (right-aligned, ~400px wide)
- **Mobile:** Full-screen drawer (covers entire viewport, swipe-down to close)
- **Tablet:** Responsive — side modal on landscape, full-screen on portrait

---

## Module-Specific Mobile Optimizations

### 1. Contacts (Priority #1)

**Goals:**
- Quick contact lookup
- Fast contact creation
- One-tap actions (call, email, message)

**Mobile List View:**
- Card layout: **Name | Company | Phone** (always visible)
- Secondary info: email, last contact date (tap to expand)
- Quick-action buttons: Call, Message, Email (one-tap, uses device capabilities)
- Search: full-width input at top, real-time filtering
- Filter: simplified (by Company, Lead Source) — avoid complex multi-select on mobile
- Add button: **FAB (floating action button)** in bottom-right corner

**Mobile Edit Form:**
- Fields: Name, Email, Phone, Company (dropdown with search), Lead Source, Notes
- Reduce optional fields on mobile (save for desktop edit)
- Save button: full-width, sticky at bottom
- Remove inline validation errors (show on blur, not keystroke)

**Implementation:**
- Create `contact-list-mobile.tsx` (card-based view)
- Keep `contact-form.tsx` responsive (single-column on mobile)
- Reuse `contact-card.tsx` component across views

---

### 2. Deals (Priority #2)

**Goals:**
- View deals by stage
- Quick status updates
- Light deal editing on-the-go

**Desktop (unchanged):**
- Kanban board with drag-drop by stage

**Mobile List View (replaces Kanban):**
- Card layout: **Deal Name | $Value | Stage** (colored badge)
- Secondary info: company, next step (tap card to see full)
- Tap card → quick-edit modal (not full form)
- List sort options: by value (descending), by date (newest first)
- Add button: FAB in bottom-right

**Quick-Edit Modal (mobile-only):**
- Fields: Stage (dropdown), Value (optional), Next Step (text), Notes
- Purpose: fast status update, not full deal edit
- Close: swipe down or X button
- Save button: full-width

**Dashboard Deal Widget:**
- Desktop: top 5 deals with progress bars
- Mobile: top 3 deals, larger font, tappable (links to full deal)

**Implementation:**
- Hide Kanban on mobile with `hidden md:flex` (or `md:block`)
- Create `deal-list-mobile.tsx` (card list)
- Create `deal-quick-edit-modal.tsx` (modal-only form, not full form)
- Reuse `deal-card.tsx` component

---

### 3. Activities (Priority #3)

**Goals:**
- View upcoming & recent activities
- One-tap logging of new activities
- Quick note capture

**Mobile List View:**
- Upcoming activities: card list with time + description
- Logged activities: collapsible section (can toggle show/hide)
- Each card: **Time | Type | Description** (tap to expand)
- Add button: **FAB** for quick logging

**Quick-Log Form (one-tap activity logging):**
- Minimal form: Type (dropdown), Description (text), Date (date picker), Related To (autocomplete)
- Auto-fill "Related To" if viewing a specific deal/contact
- Submit: full-width sticky button
- Goal: complete in < 15 seconds

**Mobile Edit Form:**
- Single-column, all fields stack
- Save button: full-width, sticky
- Reduce optional fields on mobile

**Implementation:**
- Create `activity-list-mobile.tsx` (card list)
- Create `quick-log-fab.tsx` (floating action button component)
- Create `activity-quick-form.tsx` (minimal logging form)
- Keep `activity-form.tsx` responsive for full edits

---

### 4. Dashboard (Priority #4)

**Goals:**
- Quick pipeline overview
- Key metrics at a glance
- Mobile-optimized chart readability

**Mobile Layout:**
- Single-column stack (all charts full-width)
- Order: Pipeline Bar, Conversion Funnel, Revenue Trend, Deal Mix Pie, Top Deals
- Simplified charts: remove legend clutter, use larger fonts
- Top Deals: card list instead of table

**Chart Responsiveness:**
- All existing charts already use Recharts (responsive)
- Adjust chart heights for mobile (taller, narrower charts to fit width)
- Remove hover-based legends (use tap-to-reveal or color-coded badges)

**Touch Interactions:**
- Remove interactive tooltips (they break on touch)
- Use fixed labels or color-coded keys instead

**Implementation:**
- Use existing responsive grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Adjust chart props for mobile (height, margin, responsive container)
- No new components needed (reuse existing charts)

---

## File Structure & Code Organization

### New Mobile Components

```
components/
├── contacts/
│   ├── contact-list.tsx (existing, desktop table)
│   ├── contact-list-mobile.tsx (NEW, card-based)
│   ├── contact-card.tsx (NEW, reusable card)
│   └── contact-form.tsx (existing, make responsive)
│
├── deals/
│   ├── deal-kanban.tsx (existing, desktop only)
│   ├── deal-list-mobile.tsx (NEW, card list)
│   ├── deal-card.tsx (NEW, reusable card)
│   ├── deal-quick-edit-modal.tsx (NEW, quick update modal)
│   └── deal-form.tsx (existing, keep responsive)
│
├── activities/
│   ├── activity-log.tsx (existing, desktop table)
│   ├── activity-list-mobile.tsx (NEW, card list)
│   ├── activity-card.tsx (NEW, reusable card)
│   ├── quick-log-fab.tsx (NEW, FAB component)
│   ├── activity-quick-form.tsx (NEW, minimal form)
│   └── activity-form.tsx (existing, keep responsive)
│
├── dashboard/
│   └── dashboard.tsx (existing, already responsive)
│
└── ui/
    ├── fab.tsx (NEW, floating action button)
    └── responsive-grid.tsx (optional helper)
```

### Responsive Rendering Pattern

**Conditional rendering by breakpoint:**
```tsx
export function ContactsPage() {
  return (
    <>
      {/* Desktop: table view */}
      <div className="hidden md:block">
        <ContactList />
      </div>
      
      {/* Mobile: card view */}
      <div className="md:hidden pb-20"> {/* pb-20 for bottom nav space */}
        <ContactListMobile />
      </div>
    </>
  )
}
```

---

## Performance Optimizations

### Phase 3 Optimizations (Optional Polish)

**Code Splitting:**
- Lazy-load Kanban board (only needed on desktop)
```tsx
const DealKanban = dynamic(() => import('./deal-kanban'), { 
  ssr: false,
  loading: () => <Skeleton /> 
})
```

**List Virtualization:**
- For contact/activity lists > 50 items, use React Window to render only visible cards
- Prevents lag with large datasets

**Image Optimization:**
- Use `next/image` with responsive sizing for avatars/logos
- Serve smaller images on mobile (e.g., 40px vs 80px)
- Use `srcSet` for DPR (device pixel ratio)

**Form Optimization:**
- Debounce company/contact search (avoid excessive API calls)
- Lazy-load autocomplete suggestions on focus
- Avoid real-time validation (validate on blur instead)

---

## Implementation Sequence

### Phase 1: Foundation (Days 1–3)
**High-impact, low-effort baseline**

- [ ] Hide sidebar on mobile (`hidden md:block`)
- [ ] Show bottom nav on mobile (`md:hidden`)
- [ ] Responsive spacing: `p-4` mobile, `p-6` desktop
- [ ] Increase button sizes: `px-4 py-3`
- [ ] Convert tables to cards on mobile (Contacts, Activities)
- [ ] Make forms single-column on mobile
- [ ] Add `<FAB />` component for quick actions

**Impact:** App usable on mobile, basic workflows functional

### Phase 2: Module-Specific UX (Days 4–7)
**Optimized workflows for priority modules**

- [ ] **Contacts:**
  - Build `contact-list-mobile.tsx` with search/filter
  - Add quick-action buttons (call, email)
  - Simplify form (fewer fields on mobile)

- [ ] **Deals:**
  - Build `deal-list-mobile.tsx` (replace Kanban on mobile)
  - Create quick-edit modal for status updates
  - Hide Kanban on mobile (`hidden md:flex`)

- [ ] **Activities:**
  - Build `activity-list-mobile.tsx`
  - Create `quick-log-fab.tsx` + minimal form
  - Enable one-tap activity logging

- [ ] **Dashboard:**
  - Make charts responsive (resize, adjust height)
  - Convert top deals table to cards
  - Single-column layout on mobile

**Impact:** Optimized task completion (< 30 seconds), light management workflows

### Phase 3: Performance (Days 8–9, Optional)
**Speed and smoothness polish**

- [ ] Lazy-load Kanban board
- [ ] Add list virtualization (100+ item lists)
- [ ] Image optimization (`next/image` with srcSet)
- [ ] Form input debouncing
- [ ] Mobile performance audit (Lighthouse)

**Impact:** Faster app, better UX on slow networks

---

## Success Metrics

**After Phase 1:**
- ✅ App renders correctly on mobile (no layout breakage)
- ✅ Navigation works (bottom tabs)
- ✅ Forms are usable

**After Phase 2:**
- ✅ Core tasks completable in < 30 seconds
- ✅ Contacts searchable and creatable on mobile
- ✅ Deals updatable (status, notes)
- ✅ Activities loggable (one-tap)
- ✅ Dashboard viewable (single-column)

**After Phase 3:**
- ✅ App feels snappy on mobile hardware
- ✅ No jank or lag on list interactions
- ✅ Lighthouse score > 85 (performance)

---

## Non-Goals

- **Full feature parity:** Complex workflows (Kanban drag-drop, bulk actions) stay on desktop
- **Offline-first:** No offline caching in v1; focus on fast loading instead
- **Native app:** Web app only (no iOS/Android apps)
- **Desktop changes:** Zero breaking changes to existing desktop UX

---

## Open Questions (Clarified)

- ✅ Target devices: phones + tablets (portrait + landscape)
- ✅ Use case: light management (create/edit basic info, not complex workflows)
- ✅ Success criteria: speed + task completion
- ✅ Priority modules: Contacts → Deals → Activities → Dashboard
- ✅ Approach: hybrid (responsive foundation + mobile-optimized workflows)

---

## Appendix: Component APIs

### `<FAB />` Component

```tsx
<FAB 
  icon={Plus} 
  label="Add Contact" 
  onClick={() => openForm()}
/>
```

**Styling:**
- Position: bottom-right corner (bottom-4 right-4)
- Size: 56px × 56px circle (iOS-style)
- Color: brand primary (#ff914d)
- Shadow: drop-shadow-lg
- Z-index: z-30 (above content, below modals)

### `<ResponseGrid />` Helper

```tsx
<ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
  <Card />
</ResponsiveGrid>
```

Auto-generates: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

## References

- **Tailwind Breakpoints:** https://tailwindcss.com/docs/responsive-design
- **Mobile UX Best Practices:** WCAG 2.1, Apple HIG (44pt tap targets)
- **Next.js Image Optimization:** https://nextjs.org/docs/api-reference/next/image
- **Existing Mobile Nav:** `components/layout/mobile-nav.tsx`

