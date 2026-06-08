# Mobile-Responsive CRM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make On3oard CRM mobile-friendly for phones and tablets with optimized workflows for Contacts, Deals, and Activities modules, prioritizing speed and task completion (< 30 seconds per action).

**Architecture:** Hybrid approach using responsive Tailwind foundation + dedicated mobile-optimized list components for high-priority modules. Desktop experience unchanged. Three-phase rollout: foundation → module optimization → optional performance tuning.

**Tech Stack:** Next.js 14, Tailwind CSS v3, shadcn/ui components, React hooks for state, Supabase for data

---

## File Structure Overview

### New Files (Phase 1 & 2)

```
components/
├── ui/
│   └── fab.tsx                    (Phase 1) Floating action button
│
├── contacts/
│   ├── contact-list-mobile.tsx    (Phase 2) Mobile card list
│   └── contact-card.tsx           (Phase 2) Reusable card component
│
├── deals/
│   ├── deal-list-mobile.tsx       (Phase 2) Mobile card list
│   ├── deal-card.tsx              (Phase 2) Reusable card component
│   └── deal-quick-edit-modal.tsx  (Phase 2) Quick status update modal
│
└── activities/
    ├── activity-list-mobile.tsx   (Phase 2) Mobile card list
    ├── activity-card.tsx          (Phase 2) Reusable card component
    ├── quick-log-fab.tsx          (Phase 2) Quick log button with modal
    └── activity-quick-form.tsx    (Phase 2) Minimal logging form
```

### Modified Files (Phase 1 & 2)

```
components/
├── layout/
│   ├── sidebar.tsx                (Phase 1) Add hidden md:block
│   └── mobile-nav.tsx             (Phase 1) Style improvements, padding fix
│
├── contacts/
│   ├── contact-form.tsx           (Phase 1) Make single-column on mobile
│   └── contacts-page.tsx          (Phase 2) Show/hide list variants
│
├── deals/
│   ├── deal-form.tsx              (Phase 1) Make single-column on mobile
│   └── deals-page.tsx             (Phase 2) Show/hide Kanban vs list
│
└── activities/
    └── activity-form.tsx          (Phase 1) Make single-column on mobile
```

---

## Phase 1: Foundation (Days 1–3)

### Task 1: Responsive Layout Baseline

**Files:**
- Modify: `components/layout/sidebar.tsx`
- Modify: `components/layout/mobile-nav.tsx`
- Modify: `app/(app)/layout.tsx` (main content area padding)

**Goal:** Hide sidebar on mobile, show bottom nav, add spacing for nav on mobile.

- [ ] **Step 1: Update sidebar to hide on mobile**

Open `components/layout/sidebar.tsx` and wrap the entire sidebar in responsive classes:

**Current code (approximate):**
```tsx
export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-80 ...">
      {/* sidebar content */}
    </aside>
  )
}
```

**New code:**
```tsx
export function Sidebar() {
  return (
    <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-80 ...">
      {/* sidebar content */}
    </aside>
  )
}
```

Changes: Add `hidden md:fixed` (hidden on mobile, fixed on desktop)

- [ ] **Step 2: Fix mobile nav bottom spacing**

Open `components/layout/mobile-nav.tsx`. The nav is already `md:hidden`, but the main content needs bottom padding on mobile to avoid being hidden behind the nav.

**Current code:**
```tsx
<nav className="fixed bottom-0 inset-x-0 z-40 flex justify-around border-t border-surface-border bg-surface-raised/95 py-2 md:hidden">
```

No changes needed to nav itself (already correct).

**Now update main content area:** Open `app/(app)/layout.tsx` and find the main content wrapper:

**Current code (approximate):**
```tsx
<main className="flex-1">
  {children}
</main>
```

**New code:**
```tsx
<main className="flex-1 pb-20 md:pb-0">
  {children}
</main>
```

Changes: Add `pb-20` on mobile (accounts for 80px bottom nav), remove on desktop with `md:pb-0`

- [ ] **Step 3: Update sidebar margin on main content**

Since sidebar is now `hidden` on mobile, update the main content area to adjust margin:

**Current code (approximate):**
```tsx
<div className="flex">
  <Sidebar />
  <main>...</main>
</div>
```

**New code:**
```tsx
<div className="flex">
  <Sidebar />
  <main className="flex-1 md:ml-0">
    {/* content */}
  </main>
</div>
```

The sidebar's `fixed` positioning already removes it from flow, so no margin needed on mobile. On desktop, ensure no extra margin.

- [ ] **Step 4: Test responsive layout**

Run: `npm run dev`

Open `http://localhost:3030` in browser.
- Desktop (> 768px): sidebar visible on left, main content full width
- Mobile (< 640px): sidebar hidden, main content full width, bottom nav visible
- Tablet portrait (640-768px): similar to mobile

- [ ] **Step 5: Commit**

```bash
git add components/layout/sidebar.tsx components/layout/mobile-nav.tsx app/\(app\)/layout.tsx
git commit -m "feat: add responsive sidebar and mobile layout foundation

- Hide sidebar on mobile with hidden md:block
- Add bottom padding on mobile to account for nav bar
- Sidebar fixed positioning unchanged on desktop
- Main content full-width on mobile and tablet

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Responsive Form Styling

**Files:**
- Modify: `components/contacts/contact-form.tsx`
- Modify: `components/deals/deal-form.tsx`
- Modify: `components/activities/activity-form.tsx`
- Modify: `components/companies/company-form.tsx`

**Goal:** Single-column forms on mobile, with sticky submit buttons and increased touch targets.

- [ ] **Step 1: Update contact-form.tsx for responsive grid**

Open `components/contacts/contact-form.tsx`. Find the form grid (likely has `grid grid-cols-2` or similar):

**Current code (example):**
```tsx
<form className="space-y-4">
  <div className="grid grid-cols-2 gap-4">
    <InputField name="fullName" label="Full Name" />
    <InputField name="email" label="Email" />
  </div>
</form>
```

**New code:**
```tsx
<form className="space-y-4 pb-20 md:pb-0">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
    <InputField name="fullName" label="Full Name" />
    <InputField name="email" label="Email" />
  </div>
</form>
```

Changes:
- Add `grid-cols-1` (single column on mobile)
- Add `sm:grid-cols-2` (two columns on tablets)
- Add `md:grid-cols-2` (two columns on desktop)
- Add `gap-3 md:gap-4` (reduced gap on mobile)
- Add `pb-20 md:pb-0` to form (padding to prevent overlap with bottom nav)

- [ ] **Step 2: Update submit button styling**

In the same file, find the submit button section:

**Current code (example):**
```tsx
<div className="flex gap-2">
  <button type="submit">Save</button>
  <button type="button" onClick={onCancel}>Cancel</button>
</div>
```

**New code:**
```tsx
<div className="fixed md:static bottom-0 left-0 right-0 md:flex gap-2 md:p-0 p-4 bg-surface-raised/95 md:bg-transparent border-t md:border-t-0 border-surface-border md:border-none">
  <button type="submit" className="w-full md:w-auto px-4 py-3">Save</button>
  <button type="button" onClick={onCancel} className="w-full md:w-auto px-4 py-3">Cancel</button>
</div>
```

Changes:
- Mobile: `fixed bottom-0` (sticky to bottom), `w-full` (full width)
- Mobile: increased padding `py-3` (44px+ tap target)
- Desktop: `md:static` (inline button layout), `md:w-auto`
- Mobile: `p-4` (padding around sticky bar)
- Mobile: border-top and background for visual separation

- [ ] **Step 3: Update all input field padding**

In the same file, check the input component styling:

**Current code (example in input field):**
```tsx
<input className="px-3 py-2 rounded-md ..." />
```

**New code:**
```tsx
<input className="px-3 py-2 md:py-2 rounded-md ..." />
```

Actually, the current `py-2` is fine. But ensure buttons are at least `py-3`:

```tsx
<button className="px-4 py-3 rounded-md ..." />
```

- [ ] **Step 4: Repeat for deal-form.tsx, activity-form.tsx, company-form.tsx**

Apply the same grid and button changes to all form files. Use this pattern:
- Grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-{N}` (where N is desktop columns)
- Gap: `gap-3 md:gap-4`
- Form: add `pb-20 md:pb-0`
- Buttons: `w-full md:w-auto px-4 py-3`, sticky footer on mobile

**Files to update:**
1. `components/deals/deal-form.tsx`
2. `components/activities/activity-form.tsx`
3. `components/companies/company-form.tsx`

- [ ] **Step 5: Test responsive forms**

Run: `npm run dev`

Open Contacts page and click "Add Contact" or edit a contact:
- Mobile (< 640px): single-column form, sticky button at bottom
- Tablet: two-column form, inline buttons
- Desktop: unchanged

- [ ] **Step 6: Commit**

```bash
git add components/contacts/contact-form.tsx components/deals/deal-form.tsx components/activities/activity-form.tsx components/companies/company-form.tsx
git commit -m "feat: make all forms responsive and touch-friendly

- Single-column layout on mobile (grid-cols-1)
- Two-column on tablets (sm:grid-cols-2)
- Sticky submit buttons on mobile (fixed bottom, full width)
- Increased button padding for 44px tap targets (py-3)
- Reduced gaps on mobile for less scrolling (gap-3)
- Added pb-20 to forms on mobile to prevent nav overlap

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 3: FAB Component

**Files:**
- Create: `components/ui/fab.tsx`

**Goal:** Reusable floating action button for "Add" actions on mobile.

- [ ] **Step 1: Create FAB component file**

Create `components/ui/fab.tsx`:

```tsx
'use client'
import { LucideIcon } from 'lucide-react'

interface FABProps {
  icon: LucideIcon
  label?: string
  onClick: () => void
  className?: string
}

export function FAB({ icon: Icon, label, onClick, className = '' }: FABProps) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-20 md:static right-4
        w-14 h-14 rounded-full
        bg-brand-primary hover:bg-brand-primary/90
        text-surface-raised
        flex items-center justify-center
        shadow-lg hover:shadow-xl
        transition-shadow
        z-30
        md:hidden
        ${className}
      `}
      title={label}
      aria-label={label}
    >
      <Icon size={24} />
    </button>
  )
}
```

**Key details:**
- `fixed bottom-20` (above bottom nav, 80px from bottom)
- `md:hidden` (only show on mobile, hidden on desktop/tablet with sidebar)
- `w-14 h-14` (56px × 56px, iOS-style)
- `rounded-full` (circle shape)
- `z-30` (above content, below modals)
- Touch-friendly: larger icon (24px)

- [ ] **Step 2: Test FAB component**

Create a test file `components/ui/fab.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { FAB } from './fab'
import { Plus } from 'lucide-react'

describe('FAB Component', () => {
  it('renders with icon and label', () => {
    const handleClick = jest.fn()
    render(
      <FAB icon={Plus} label="Add Item" onClick={handleClick} />
    )
    const button = screen.getByRole('button', { name: /add item/i })
    expect(button).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(
      <FAB icon={Plus} label="Add Item" onClick={handleClick} />
    )
    const button = screen.getByRole('button')
    button.click()
    expect(handleClick).toHaveBeenCalled()
  })

  it('has correct styling classes', () => {
    const handleClick = jest.fn()
    const { container } = render(
      <FAB icon={Plus} label="Add Item" onClick={handleClick} />
    )
    const button = container.querySelector('button')
    expect(button).toHaveClass('fixed', 'bottom-20', 'w-14', 'h-14', 'rounded-full', 'md:hidden')
  })
})
```

- [ ] **Step 3: Run tests**

Run: `npm run test -- components/ui/fab.test.tsx`

Expected: All 3 tests pass

- [ ] **Step 4: Commit**

```bash
git add components/ui/fab.tsx components/ui/fab.test.tsx
git commit -m "feat: add FAB (floating action button) component

- Fixed position above bottom nav (bottom-20)
- 56px circle shape (w-14 h-14 rounded-full)
- Mobile-only (md:hidden)
- z-30 (above content, below modals)
- Accessible (aria-label, title attribute)
- Touch-friendly icon size (24px)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Table-to-Card Conversion Pattern

**Files:**
- Modify: `components/contacts/contact-list.tsx` (existing, desktop table)
- Create: `components/contacts/contact-card.tsx` (new, mobile card)
- Create: `components/contacts/contact-list-mobile.tsx` (new, mobile list)

**Goal:** Establish reusable card component and mobile list pattern to be used in Phase 2.

- [ ] **Step 1: Create card component**

Create `components/contacts/contact-card.tsx`:

```tsx
import { Users } from 'lucide-react'
import Link from 'next/link'

interface ContactCardProps {
  id: string
  name: string
  company?: string
  phone?: string
  email?: string
  onEdit?: () => void
  onDelete?: () => void
}

export function ContactCard({
  id,
  name,
  company,
  phone,
  email,
  onEdit,
  onDelete,
}: ContactCardProps) {
  return (
    <div className="border border-surface-border rounded-lg p-4 bg-surface-raised/30 space-y-3">
      {/* Header: Name + Company */}
      <div>
        <h3 className="font-semibold text-base text-white">{name}</h3>
        {company && <p className="text-sm text-white/60">{company}</p>}
      </div>

      {/* Contact Info */}
      <div className="space-y-2 text-sm">
        {phone && (
          <p className="flex items-center gap-2">
            <span className="text-white/40">Phone:</span>
            <a href={`tel:${phone}`} className="text-brand-primary hover:underline">
              {phone}
            </a>
          </p>
        )}
        {email && (
          <p className="flex items-center gap-2">
            <span className="text-white/40">Email:</span>
            <a href={`mailto:${email}`} className="text-brand-primary hover:underline">
              {email}
            </a>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-surface-border/30">
        <Link href={`/contacts/${id}`} className="flex-1">
          <button className="w-full px-3 py-2 text-sm rounded-md bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary">
            View
          </button>
        </Link>
        {onEdit && (
          <button onClick={onEdit} className="flex-1 px-3 py-2 text-sm rounded-md bg-surface-border hover:bg-surface-border/80 text-white">
            Edit
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="flex-1 px-3 py-2 text-sm rounded-md bg-brand-accent/20 hover:bg-brand-accent/30 text-brand-accent">
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create mobile list component**

Create `components/contacts/contact-list-mobile.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { ContactCard } from './contact-card'
import { FAB } from '@/components/ui/fab'
import { Plus, Search } from 'lucide-react'

interface Contact {
  id: string
  full_name: string
  email?: string
  phone?: string
  company_id?: string
}

interface ContactListMobileProps {
  contacts: Contact[]
  onAddClick: () => void
  onEditClick: (id: string) => void
  onDeleteClick: (id: string) => void
  companies?: Record<string, string> // Map of company_id to company name
}

export function ContactListMobile({
  contacts,
  onAddClick,
  onEditClick,
  onDeleteClick,
  companies = {},
}: ContactListMobileProps) {
  const [search, setSearch] = useState('')

  const filtered = contacts.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4 p-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-white/40" size={18} />
        <Input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Contact List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-white/60 py-8">No contacts found</p>
        ) : (
          filtered.map(contact => (
            <ContactCard
              key={contact.id}
              id={contact.id}
              name={contact.full_name}
              company={contact.company_id ? companies[contact.company_id] : undefined}
              phone={contact.phone}
              email={contact.email}
              onEdit={() => onEditClick(contact.id)}
              onDelete={() => onDeleteClick(contact.id)}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <FAB icon={Plus} label="Add Contact" onClick={onAddClick} />
    </div>
  )
}
```

- [ ] **Step 3: Write tests**

Create `components/contacts/contact-card.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { ContactCard } from './contact-card'

describe('ContactCard', () => {
  const props = {
    id: '123',
    name: 'John Doe',
    company: 'Acme Corp',
    phone: '555-1234',
    email: 'john@example.com',
  }

  it('renders contact name and company', () => {
    render(<ContactCard {...props} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('renders phone and email as clickable links', () => {
    render(<ContactCard {...props} />)
    expect(screen.getByRole('link', { name: /555-1234/i })).toHaveAttribute('href', 'tel:555-1234')
    expect(screen.getByRole('link', { name: /john@example.com/i })).toHaveAttribute('href', 'mailto:john@example.com')
  })

  it('renders action buttons', () => {
    const mockEdit = jest.fn()
    const mockDelete = jest.fn()
    render(<ContactCard {...props} onEdit={mockEdit} onDelete={mockDelete} />)
    expect(screen.getByRole('button', { name: /view/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })
})
```

Run: `npm run test -- components/contacts/contact-card.test.tsx`

Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add components/contacts/contact-card.tsx components/contacts/contact-list-mobile.tsx components/contacts/contact-card.test.tsx
git commit -m "feat: add contact card and mobile list components

- ContactCard: reusable card component with name, company, phone, email
- ContactListMobile: mobile list view with search and FAB
- Establishes pattern for table-to-card conversion
- Includes tests for card rendering and interactions

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: Module-Specific Optimization (Days 4–7)

### Task 5: Contacts Module Mobile Integration

**Files:**
- Modify: `app/(app)/contacts/page.tsx`

**Goal:** Show desktop table on large screens, mobile card list on small screens.

- [ ] **Step 1: Update contacts page to show/hide variants**

Open `app/(app)/contacts/page.tsx`:

**Current code (approximate):**
```tsx
export default async function ContactsPage() {
  const contacts = await fetchContacts()
  return (
    <div>
      <h1>Contacts</h1>
      <ContactList contacts={contacts} />
    </div>
  )
}
```

**New code:**
```tsx
'use client'
import { useState } from 'react'
import { ContactList } from '@/components/contacts/contact-list'
import { ContactListMobile } from '@/components/contacts/contact-list-mobile'
import { Plus } from 'lucide-react'

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]) // Fetch data here
  const [showForm, setShowForm] = useState(false)

  const handleAddContact = () => {
    setShowForm(true)
  }

  const handleEditContact = (id: string) => {
    // Open edit form
  }

  const handleDeleteContact = (id: string) => {
    // Delete contact
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center md:block">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <button onClick={handleAddContact} className="md:hidden px-4 py-2 rounded-md bg-brand-primary text-white">
          <Plus size={18} />
        </button>
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <ContactList
          contacts={contacts}
          onAdd={handleAddContact}
          onEdit={handleEditContact}
          onDelete={handleDeleteContact}
        />
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden">
        <ContactListMobile
          contacts={contacts}
          onAddClick={handleAddContact}
          onEditClick={handleEditContact}
          onDeleteClick={handleDeleteContact}
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <ContactFormModal
          onClose={() => setShowForm(false)}
          onSave={handleSaveContact}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Test contacts page responsive**

Run: `npm run dev`

Open `/contacts`:
- Desktop (> 768px): see table view
- Mobile (< 640px): see card list with FAB

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/contacts/page.tsx
git commit -m "feat: add responsive contacts page with mobile card view

- Show desktop table on md: and up (hidden md:block)
- Show mobile card list on mobile only (md:hidden)
- FAB for adding contacts on mobile
- Unified data handling between views

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 6: Deals Module Mobile Integration

**Files:**
- Create: `components/deals/deal-card.tsx`
- Create: `components/deals/deal-list-mobile.tsx`
- Create: `components/deals/deal-quick-edit-modal.tsx`
- Modify: `app/(app)/deals/page.tsx`
- Modify: `components/deals/deal-kanban.tsx`

**Goal:** Show Kanban on desktop, card list with quick-edit on mobile.

- [ ] **Step 1: Create deal card component**

Create `components/deals/deal-card.tsx`:

```tsx
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface DealCardProps {
  id: string
  name: string
  value: number
  stage: string
  company?: string
  onQuickEdit?: () => void
}

const STAGE_COLORS: Record<string, string> = {
  'lead': 'bg-indigo-500/20 text-indigo-400',
  'contacted': 'bg-blue-500/20 text-blue-400',
  'qualified': 'bg-cyan-500/20 text-cyan-400',
  'proposed': 'bg-orange-500/20 text-orange-400',
  'negotiating': 'bg-amber-500/20 text-amber-400',
  'closed-won': 'bg-green-500/20 text-green-400',
  'closed-lost': 'bg-red-500/20 text-red-400',
}

export function DealCard({
  id,
  name,
  value,
  stage,
  company,
  onQuickEdit,
}: DealCardProps) {
  const stageColor = STAGE_COLORS[stage] || 'bg-gray-500/20 text-gray-400'

  return (
    <div className="border border-surface-border rounded-lg p-4 bg-surface-raised/30 space-y-3">
      {/* Header: Name + Value */}
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-semibold text-base text-white flex-1">{name}</h3>
        <span className="text-lg font-bold text-brand-primary">${(value / 1000).toFixed(0)}k</span>
      </div>

      {/* Company */}
      {company && <p className="text-sm text-white/60">{company}</p>}

      {/* Stage Badge */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${stageColor}`}>
          {stage}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-surface-border/30">
        <Link href={`/deals/${id}`} className="flex-1">
          <button className="w-full px-3 py-2 text-sm rounded-md bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary flex items-center justify-center gap-1">
            View
            <ChevronRight size={16} />
          </button>
        </Link>
        {onQuickEdit && (
          <button
            onClick={onQuickEdit}
            className="flex-1 px-3 py-2 text-sm rounded-md bg-surface-border hover:bg-surface-border/80 text-white"
          >
            Update
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create deal list mobile component**

Create `components/deals/deal-list-mobile.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { DealCard } from './deal-card'
import { FAB } from '@/components/ui/fab'
import { Plus } from 'lucide-react'

interface Deal {
  id: string
  name: string
  value: number
  stage: string
  company_id?: string
}

interface DealListMobileProps {
  deals: Deal[]
  onAddClick: () => void
  onQuickEdit: (id: string) => void
  companies?: Record<string, string>
}

export function DealListMobile({
  deals,
  onAddClick,
  onQuickEdit,
  companies = {},
}: DealListMobileProps) {
  const [sortBy, setSortBy] = useState<'value' | 'date'>('value')

  const sorted = [...deals].sort((a, b) => {
    if (sortBy === 'value') return b.value - a.value
    return 0 // TODO: add date sorting
  })

  return (
    <div className="space-y-4 p-4">
      {/* Sort Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setSortBy('value')}
          className={`flex-1 px-3 py-2 text-sm rounded-md ${
            sortBy === 'value'
              ? 'bg-brand-primary text-white'
              : 'bg-surface-border text-white'
          }`}
        >
          Value
        </button>
        <button
          onClick={() => setSortBy('date')}
          className={`flex-1 px-3 py-2 text-sm rounded-md ${
            sortBy === 'date'
              ? 'bg-brand-primary text-white'
              : 'bg-surface-border text-white'
          }`}
        >
          Date
        </button>
      </div>

      {/* Deal List */}
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <p className="text-center text-white/60 py-8">No deals found</p>
        ) : (
          sorted.map(deal => (
            <DealCard
              key={deal.id}
              id={deal.id}
              name={deal.name}
              value={deal.value}
              stage={deal.stage}
              company={deal.company_id ? companies[deal.company_id] : undefined}
              onQuickEdit={() => onQuickEdit(deal.id)}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <FAB icon={Plus} label="Add Deal" onClick={onAddClick} />
    </div>
  )
}
```

- [ ] **Step 3: Create quick-edit modal**

Create `components/deals/deal-quick-edit-modal.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-react'

interface DealQuickEditModalProps {
  dealId: string
  currentStage: string
  currentValue?: number
  currentNextStep?: string
  onClose: () => void
  onSave: (stage: string, value?: number, nextStep?: string) => Promise<void>
}

const STAGES = [
  { value: 'lead', label: 'Lead' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposed', label: 'Proposed' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'closed-won', label: 'Closed Won' },
  { value: 'closed-lost', label: 'Closed Lost' },
]

export function DealQuickEditModal({
  dealId,
  currentStage,
  currentValue,
  currentNextStep,
  onClose,
  onSave,
}: DealQuickEditModalProps) {
  const [stage, setStage] = useState(currentStage)
  const [value, setValue] = useState(currentValue?.toString() || '')
  const [nextStep, setNextStep] = useState(currentNextStep || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await onSave(stage, value ? parseFloat(value) : undefined, nextStep)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center">
      <div className="w-full md:max-w-md bg-surface-raised rounded-t-lg md:rounded-lg p-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Quick Update</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-border rounded">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Stage */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Stage</label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map(s => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Value */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Value (optional)</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="$0"
              className="w-full px-3 py-2 rounded-md bg-surface-raised border border-surface-border"
            />
          </div>

          {/* Next Step */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Next Step (optional)</label>
            <Textarea
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder="What's next?"
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-surface-border">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-md bg-surface-border text-white">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Hide Kanban on mobile, show in deals page**

Open `components/deals/deal-kanban.tsx` and wrap in responsive div:

**Current code (approximate):**
```tsx
export function DealKanban({ deals, onUpdate }) {
  return (
    <div className="...">
      {/* kanban content */}
    </div>
  )
}
```

**New code:**
```tsx
export function DealKanban({ deals, onUpdate }) {
  return (
    <div className="hidden md:block">
      {/* kanban content */}
    </div>
  )
}
```

- [ ] **Step 5: Update deals page**

Open `app/(app)/deals/page.tsx`:

**New code (similar pattern to contacts):**
```tsx
'use client'
import { useState } from 'react'
import { DealKanban } from '@/components/deals/deal-kanban'
import { DealListMobile } from '@/components/deals/deal-list-mobile'
import { DealQuickEditModal } from '@/components/deals/deal-quick-edit-modal'

export default function DealsPage() {
  const [deals, setDeals] = useState([])
  const [editingDealId, setEditingDealId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Deals</h1>

      {/* Desktop: Kanban */}
      <div className="hidden md:block">
        <DealKanban deals={deals} onUpdate={handleUpdate} />
      </div>

      {/* Mobile: Card List */}
      <div className="md:hidden">
        <DealListMobile
          deals={deals}
          onAddClick={() => setShowForm(true)}
          onQuickEdit={(id) => setEditingDealId(id)}
        />
      </div>

      {/* Quick Edit Modal */}
      {editingDealId && (
        <DealQuickEditModal
          dealId={editingDealId}
          currentStage={deals.find(d => d.id === editingDealId)?.stage || ''}
          onClose={() => setEditingDealId(null)}
          onSave={handleQuickUpdate}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 6: Test deals page**

Run: `npm run dev`

Open `/deals`:
- Desktop: see Kanban board
- Mobile: see card list with sort buttons and FAB
- Tap "Update" on a card → modal appears with stage/value/next-step fields

- [ ] **Step 7: Commit**

```bash
git add components/deals/deal-card.tsx components/deals/deal-list-mobile.tsx components/deals/deal-quick-edit-modal.tsx components/deals/deal-kanban.tsx app/\(app\)/deals/page.tsx
git commit -m "feat: add deals mobile optimization with quick-edit modal

- DealCard: card component showing name, value, stage badge
- DealListMobile: mobile list view with sorting (value/date)
- DealQuickEditModal: quick status update (stage, value, next step)
- Hide Kanban on mobile (hidden md:block), show on desktop
- FAB for adding deals on mobile

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 7: Activities Module Mobile Integration

**Files:**
- Create: `components/activities/activity-card.tsx`
- Create: `components/activities/activity-list-mobile.tsx`
- Create: `components/activities/quick-log-fab.tsx`
- Create: `components/activities/activity-quick-form.tsx`
- Modify: `app/(app)/activities/page.tsx`

**Goal:** Card-based activity view with one-tap logging via FAB.

- [ ] **Step 1: Create activity card component**

Create `components/activities/activity-card.tsx`:

```tsx
import { Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface ActivityCardProps {
  id: string
  type: string
  description: string
  dueDate?: string
  linkedRecord?: string
  status: 'pending' | 'completed' | 'overdue'
  onEdit?: () => void
}

const STATUS_COLORS = {
  'pending': 'text-blue-400',
  'completed': 'text-green-400',
  'overdue': 'text-red-400',
}

export function ActivityCard({
  id,
  type,
  description,
  dueDate,
  linkedRecord,
  status,
  onEdit,
}: ActivityCardProps) {
  const color = STATUS_COLORS[status]

  return (
    <div className="border border-surface-border rounded-lg p-4 bg-surface-raised/30 space-y-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          {status === 'completed' ? (
            <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
          ) : (
            <Clock size={20} className={`${color} flex-shrink-0`} />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{type}</h3>
            {linkedRecord && <p className="text-xs text-white/60">{linkedRecord}</p>}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-white/80">{description}</p>

      {/* Due Date */}
      {dueDate && (
        <p className="text-xs text-white/60">Due: {new Date(dueDate).toLocaleDateString()}</p>
      )}

      {/* Actions */}
      {!['completed'].includes(status) && (
        <div className="flex gap-2 pt-2 border-t border-surface-border/30">
          <Link href={`/activities/${id}`} className="flex-1">
            <button className="w-full px-3 py-2 text-xs rounded-md bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/30">
              View
            </button>
          </Link>
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 px-3 py-2 text-xs rounded-md bg-green-500/20 text-green-400 hover:bg-green-500/30"
            >
              Mark Done
            </button>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create mobile list component**

Create `components/activities/activity-list-mobile.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { ActivityCard } from './activity-card'
import { QuickLogFAB } from './quick-log-fab'

interface Activity {
  id: string
  type: string
  description: string
  due_at?: string
  status: 'pending' | 'completed' | 'overdue'
}

interface ActivityListMobileProps {
  upcomingActivities: Activity[]
  completedActivities: Activity[]
  onQuickLog: () => void
  onMarkDone: (id: string) => void
  onEdit: (id: string) => void
}

export function ActivityListMobile({
  upcomingActivities,
  completedActivities,
  onQuickLog,
  onMarkDone,
  onEdit,
}: ActivityListMobileProps) {
  const [showCompleted, setShowCompleted] = useState(false)

  return (
    <div className="space-y-4 p-4">
      {/* Upcoming Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Upcoming</h2>
        {upcomingActivities.length === 0 ? (
          <p className="text-white/60 text-sm">No upcoming activities</p>
        ) : (
          <div className="space-y-3">
            {upcomingActivities.map(activity => (
              <ActivityCard
                key={activity.id}
                {...activity}
                onEdit={() => onMarkDone(activity.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Section */}
      <div>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="text-sm text-white/60 hover:text-white mb-2"
        >
          {showCompleted ? '▼' : '▶'} Completed ({completedActivities.length})
        </button>
        {showCompleted && (
          <div className="space-y-3">
            {completedActivities.length === 0 ? (
              <p className="text-white/60 text-sm">No completed activities</p>
            ) : (
              completedActivities.map(activity => (
                <ActivityCard key={activity.id} {...activity} />
              ))
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <QuickLogFAB onClick={onQuickLog} />
    </div>
  )
}
```

- [ ] **Step 3: Create quick-log FAB with inline form**

Create `components/activities/quick-log-fab.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { FAB } from '@/components/ui/fab'
import { ActivityQuickForm } from './activity-quick-form'
import { Plus } from 'lucide-react'

interface QuickLogFABProps {
  onClick?: () => void
  onSubmit?: (data: { type: string; description: string; dueDate?: string }) => Promise<void>
}

export function QuickLogFAB({ onClick, onSubmit }: QuickLogFABProps) {
  const [showForm, setShowForm] = useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      setShowForm(true)
    }
  }

  return (
    <>
      <FAB icon={Plus} label="Log Activity" onClick={handleClick} />

      {showForm && (
        <ActivityQuickForm
          onClose={() => setShowForm(false)}
          onSubmit={async (data) => {
            if (onSubmit) {
              await onSubmit(data)
            }
            setShowForm(false)
          }}
        />
      )}
    </>
  )
}
```

- [ ] **Step 4: Create quick activity form**

Create `components/activities/activity-quick-form.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-react'

interface ActivityQuickFormProps {
  onClose: () => void
  onSubmit: (data: { type: string; description: string; dueDate?: string }) => Promise<void>
}

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'note', label: 'Note' },
  { value: 'task', label: 'Task' },
]

export function ActivityQuickForm({ onClose, onSubmit }: ActivityQuickFormProps) {
  const [type, setType] = useState('call')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!description.trim()) return

    setLoading(true)
    try {
      await onSubmit({ type, description, dueDate: dueDate || undefined })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center">
      <div className="w-full md:max-w-md bg-surface-raised rounded-t-lg md:rounded-lg p-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Log Activity</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-border rounded">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you do?"
              rows={4}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date (optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-surface-raised border border-surface-border text-white"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-surface-border">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-md bg-surface-border text-white">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !description.trim()}
            className="flex-1 px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90 disabled:opacity-50"
          >
            {loading ? 'Logging...' : 'Log'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Update activities page**

Open `app/(app)/activities/page.tsx` and update to show mobile list:

**New code:**
```tsx
'use client'
import { useState } from 'react'
import { ActivityListMobile } from '@/components/activities/activity-list-mobile'

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([])

  const upcoming = activities.filter(a => a.status !== 'completed')
  const completed = activities.filter(a => a.status === 'completed')

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 md:block">Activities</h1>

      <div className="md:hidden">
        <ActivityListMobile
          upcomingActivities={upcoming}
          completedActivities={completed}
          onQuickLog={() => {}}
          onMarkDone={(id) => {}}
          onEdit={(id) => {}}
        />
      </div>

      {/* Desktop view - keep existing component */}
      <div className="hidden md:block">
        {/* existing desktop activity view */}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Test activities**

Run: `npm run dev`

Open `/activities`:
- Mobile: see card list with upcoming/completed sections
- Tap FAB → quick-log form appears
- Fill form → logs activity

- [ ] **Step 7: Commit**

```bash
git add components/activities/activity-card.tsx components/activities/activity-list-mobile.tsx components/activities/quick-log-fab.tsx components/activities/activity-quick-form.tsx app/\(app\)/activities/page.tsx
git commit -m "feat: add activities mobile optimization with quick-log

- ActivityCard: card showing type, description, due date, status
- ActivityListMobile: card list with upcoming/completed sections
- QuickLogFAB: one-tap activity logging with modal form
- ActivityQuickForm: minimal logging form (type, description, due date)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 8: Dashboard Responsive Charts

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`
- Modify: `components/dashboard/pipeline-bar.tsx`
- Modify: `components/dashboard/conversion-funnel.tsx`
- Modify: `components/dashboard/revenue-trend.tsx`
- Modify: `components/dashboard/deal-mix-pie.tsx`
- Modify: `components/dashboard/top-deals.tsx`

**Goal:** Single-column responsive layout, touch-friendly chart sizing.

- [ ] **Step 1: Update dashboard layout**

Open `app/(app)/dashboard/page.tsx`:

**Current code (approximate):**
```tsx
return (
  <div className="grid grid-cols-2 gap-4">
    <PipelineBar />
    <ConversionFunnel />
    <RevenueTrend />
    <DealMixPie />
  </div>
)
```

**New code:**
```tsx
return (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-20 md:pb-0">
    <PipelineBar />
    <ConversionFunnel />
    <div className="lg:col-span-2">
      <RevenueTrend />
    </div>
    <DealMixPie />
    <TopDeals />
  </div>
)
```

Changes:
- `grid-cols-1` (single column on mobile)
- `lg:grid-cols-2` (two columns on desktop)
- `pb-20 md:pb-0` (padding for mobile nav)

- [ ] **Step 2: Adjust chart heights for mobile**

Open `components/dashboard/pipeline-bar.tsx`:

**Update ComposedChart height:**
```tsx
<ComposedChart
  data={...}
  height={mobile ? 250 : 300}  // Smaller on mobile
  margin={{ top: 10, right: 20, bottom: 20, left: 50 }}
>
```

Add mobile detection:
```tsx
const [isMobile, setIsMobile] = useState(false)
useEffect(() => {
  setIsMobile(window.innerWidth < 640)
}, [])
```

Do the same for:
- `conversion-funnel.tsx` (height 250 mobile, 300 desktop)
- `revenue-trend.tsx` (height 250 mobile, 300 desktop)
- `deal-mix-pie.tsx` (height 250 mobile, 300 desktop)

- [ ] **Step 3: Update top-deals component for mobile**

Open `components/dashboard/top-deals.tsx`:

If it currently shows a table, convert to card list on mobile:

**New code (example):**
```tsx
export function TopDeals() {
  const [isMobile, setIsMobile] = useState(false)

  return (
    <>
      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table>
          {/* table rows */}
        </Table>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-2">
        {deals.map(deal => (
          <div key={deal.id} className="border border-surface-border rounded-lg p-3 bg-surface-raised/30">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-sm">{deal.name}</h4>
              <span className="text-brand-primary font-bold">${(deal.value / 1000).toFixed(0)}k</span>
            </div>
            <p className="text-xs text-white/60 mt-1">{deal.stage}</p>
          </div>
        ))}
      </div>
    </>
  )
}
```

- [ ] **Step 4: Test dashboard responsiveness**

Run: `npm run dev`

Open `/dashboard`:
- Mobile: single-column layout, smaller charts, card-based top deals
- Tablet: two-column grid
- Desktop: unchanged

Check charts are readable on mobile (not cramped).

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/dashboard/page.tsx components/dashboard/*.tsx
git commit -m "feat: make dashboard responsive with mobile-friendly charts

- Single-column layout on mobile (grid-cols-1 md:lg:grid-cols-2)
- Reduce chart heights on mobile (250px vs 300px desktop)
- Convert top-deals table to cards on mobile
- Charts responsive height based on screen size

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: Performance Optimization (Days 8–9, Optional)

### Task 9: Code Splitting & Lazy Loading

**Files:**
- Modify: `app/(app)/deals/page.tsx`

**Goal:** Lazy-load Kanban board (only on desktop).

- [ ] **Step 1: Wrap Kanban in dynamic import**

Open `app/(app)/deals/page.tsx`:

**Current code:**
```tsx
import { DealKanban } from '@/components/deals/deal-kanban'

export default function DealsPage() {
  return (
    <DealKanban deals={deals} />
  )
}
```

**New code:**
```tsx
import dynamic from 'next/dynamic'

const DealKanban = dynamic(() => import('@/components/deals/deal-kanban').then(m => m.DealKanban), {
  ssr: false,
  loading: () => <div className="p-4 text-center text-white/60">Loading board...</div>,
})

export default function DealsPage() {
  return (
    <div className="hidden md:block">
      <DealKanban deals={deals} />
    </div>
  )
}
```

Changes:
- `dynamic()` with `ssr: false` (only load on client, not server)
- `loading` fallback
- Wrapped in `hidden md:block` (only load on desktop)

- [ ] **Step 2: Test code splitting**

Run: `npm run dev`

Open DevTools Network tab:
- Desktop (`/deals`): Kanban JS chunk loaded
- Mobile (`/deals`): Kanban JS chunk NOT loaded (smaller bundle)

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/deals/page.tsx
git commit -m "perf: lazy-load Kanban board for mobile optimization

- Use dynamic() to code-split Kanban board
- Only load on client (ssr: false)
- Only load on desktop (hidden md:block)
- Reduces mobile bundle size

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 10: Image Optimization

**Files:**
- Modify: any components using `<img>` or Avatar components

**Goal:** Responsive image sizing with srcSet.

- [ ] **Step 1: Find and update avatar/image components**

Search for avatar usage (company logos, contact photos, etc.):

**Current code (example):**
```tsx
<img src={avatar} alt="avatar" className="w-10 h-10 rounded-full" />
```

**New code (using next/image):**
```tsx
import Image from 'next/image'

<Image
  src={avatar}
  alt="avatar"
  width={40}
  height={40}
  className="rounded-full"
  sizes="(max-width: 640px) 32px, 40px"
/>
```

Changes:
- Use `next/image` for automatic optimization
- Add `sizes` prop for responsive sizing (32px on mobile, 40px on desktop)
- Specify `width` and `height` for proper aspect ratio

- [ ] **Step 2: Update all avatar usages**

Find all places avatars/images are used:
- Contact list avatars
- Deal company logos
- Dashboard top deals

Update each to use `next/image` with `sizes` prop.

- [ ] **Step 3: Test image optimization**

Run: `npm run build`

Check `.next/static` folder for optimized images (multiple sizes).

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "perf: optimize images with responsive srcSet

- Use next/image for automatic optimization
- Add sizes prop for responsive sizing
- Reduces mobile image bandwidth

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Summary

**Phase 1 (3 days):** Foundation — responsive sidebar/nav, forms, FAB
**Phase 2 (4 days):** Module optimization — Contacts, Deals, Activities, Dashboard
**Phase 3 (optional 2 days):** Performance — code splitting, images

**Total: 7–9 days** for full mobile-responsive CRM

**All commits follow pattern:** Feature → test → commit (frequent small commits)

