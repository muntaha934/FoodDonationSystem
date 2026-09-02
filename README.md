# FoodShare — Food Waste Management System (Frontend)

A DBMS Lab project connecting people/organizations with surplus food
to the people or organizations that need it. This repository
currently contains **Phase 1: the public frontend shell** — no PHP,
no MySQL yet. Everything runs on HTML, CSS, and vanilla JavaScript,
with mock data standing in for the database.

## What's in Phase 1 + Phase 2

| Area | File(s) |
|---|---|
| Landing page | `index.html` |
| Login page (+ demo role login) | `login.html` |
| Registration page (role-adaptive) | `register.html` |
| Design system (tokens, buttons, forms, cards, badges, modal, toast, table, navbar, footer) | `assets/css/style.css` |
| Responsive rules (tablet/mobile/small-phone) | `assets/css/responsive.css` |
| Dashboard shell (sidebar, topbar, stat cards, filter bar, timeline, pagination) | `assets/css/dashboard.css` |
| Shared UI behaviour (nav + sidebar toggle, toasts, modals, formatting helpers) | `assets/js/app.js` |
| Mock data + data-access functions | `assets/js/mock-data.js` |
| Demo "auth" (session, role guard, demo login, login/register forms) | `assets/js/auth-demo.js` |
| **Donor dashboard** — stats + recent activity | `donor/dashboard.html` |
| **My Donations** — search/filter/sort table | `donor/donations.html` |
| **Create Donation** — validated form | `donor/create-donation.html` |
| **Donation Details** — full info + timeline | `donor/donation-details.html` |
| **Requests** — accept/reject incoming requests | `donor/requests.html` |
| Donor page logic | `assets/js/donations.js`, `assets/js/requests.js` |
| Placeholder dashboards for the other 3 roles (built out in Phases 3–5) | `recipient/dashboard.html`, `volunteer/dashboard.html`, `admin/dashboard.html` |

## How to run it

You don't need PHP or MySQL yet — any static file server works.

**Option A — plain double-click**
Open `index.html` directly in a browser. Everything works except
that `localStorage` (used for demo data) is scoped per-file — fine
for a quick look, but Option B is better for testing navigation.

**Option B — XAMPP (recommended, matches how the final project will run)**
1. Copy the `food-waste-management` folder into your XAMPP `htdocs` directory.
2. Start Apache from the XAMPP control panel.
3. Visit `http://localhost/food-waste-management/index.html`.

All internal links use **relative paths** (not paths starting with
`/`), so the project works no matter what folder it's placed in —
you don't need to configure it as the web server's root.

## How to test the demo flow

1. Open `login.html`.
2. Scroll to **"or preview a dashboard"** and click any of the four
   **Demo login** buttons (Donor / Recipient / Volunteer / Admin).
3. You'll be signed in (via `localStorage`, not a real session) and
   redirected to that role's dashboard placeholder page.
4. Click **Log out** in the top-right to clear the demo session.

You can also register a new account on `register.html` — switching
the role radio buttons swaps the extra fields shown (Donor →
donor type/org, Recipient → recipient type/org, Volunteer → vehicle
type/availability). New accounts are pushed into the same mock data
store, so if you register with an email and then log in with it on
`login.html`, it will recognize you.

To wipe all demo data (users you registered, etc.) and start fresh,
open the browser console on any page and run:
```js
resetDemoData();
```

## Design decisions worth explaining to your instructor

- **Design system in one file** (`style.css`): every button, form
  field, badge, card, modal, and table style is defined once as a
  reusable class, so every future page (donor, recipient, volunteer,
  admin dashboards) stays visually consistent without copy-pasting
  CSS.
- **Status badges** (`badge--available`, `badge--pending`, etc.)
  map directly to the donation/request/pickup status values the
  database will store, so the same class names will work once real
  data arrives.
- **Data-access functions**, not raw `localStorage` calls, are used
  everywhere: `getDonations()`, `createDonation()`,
  `getRequests()`, `createRequest()`, `updateRequestStatus()`,
  `getNotifications()`, etc. (see `assets/js/mock-data.js`). When
  the PHP backend exists, only the *inside* of these functions
  changes to a `fetch()` call — the pages that call them won't need
  to change.
- **Demo login vs. real login form**: the login form on
  `login.html` isn't just decorative — typing the email of a demo
  account (e.g. `donor@demo.com`) and any 6+ character password
  logs you in as that user, using the same code path a real login
  will eventually use once it's calling `login.php`.

## Data model alignment

The frontend's fields are named to match the eventual 15-table
schema, so nothing here should need to be redesigned later:

- `FoodDonation` ⇄ donation title, category, quantity, unit,
  prepared/expiry timestamps, pickup address, status, description
- `Request` ⇄ requested quantity, people to serve, notes, status
- `PickupAssignment` ⇄ volunteer, pickup/delivery address & time, status
- `WasteLog` ⇄ donation, quantity, reason, expiry, logged date
- `Feedback` ⇄ rating, review, from/to user
- `Notification` ⇄ user, message, read state, created date

Demo accounts (from `assets/js/mock-data.js`), useful for manual
testing or for logging in on the login form directly:

| Role | Email |
|---|---|
| Donor | `donor@demo.com` |
| Recipient | `recipient@demo.com` |
| Volunteer | `volunteer@demo.com` |
| Admin | `admin@demo.com` |

(Any password of 6+ characters works — there's no real backend to check it against yet.)

## What's next

- ~~**Phase 2** — Donor frontend: dashboard, Create Donation, My
  Donations, Donation Details.~~ ✅ Done
- **Phase 3** — Recipient frontend: dashboard, Find Food, Food
  Details/Request.
- **Phase 4** — Volunteer frontend: dashboard, Pickup Assignments,
  Pickup Details.
- **Phase 5** — Admin frontend: dashboard, User/Donation
  Management, Waste Logs, Audit Logs, Reports.
- **Phase 6** — Shared interactions, deeper validation, polishing
  (this is also where Pickup Status, Notifications, Feedback, and
  Profile pages — currently "coming soon" links in the donor
  sidebar — get built for real).
- **Phase 7** — Prepare the frontend for PHP/MySQL integration
  (swap the inside of the `mock-data.js` functions for `fetch()`
  calls to PHP endpoints backed by the 15-table schema).

## Folder structure

```
food-waste-management/
├── index.html
├── login.html
├── register.html
├── README.md
│
├── donor/
│   ├── dashboard.html         (stats + recent activity)
│   ├── donations.html         (My Donations — search/filter/sort)
│   ├── create-donation.html   (validated donation form)
│   ├── donation-details.html  (full details + timeline)
│   └── requests.html          (accept/reject incoming requests)
├── recipient/
│   └── dashboard.html        (placeholder — full page in Phase 3)
├── volunteer/
│   └── dashboard.html        (placeholder — full page in Phase 4)
├── admin/
│   └── dashboard.html        (placeholder — full page in Phase 5)
│
└── assets/
    ├── css/
    │   ├── style.css         (design system + shared components)
    │   ├── responsive.css    (tablet/mobile/small-phone breakpoints)
    │   └── dashboard.css     (sidebar/topbar dashboard shell + stat cards)
    ├── js/
    │   ├── app.js            (nav + sidebar toggle, toasts, modals, formatters)
    │   ├── mock-data.js       (seed data + data-access functions)
    │   ├── auth-demo.js      (session, role guard, demo login, login/register forms)
    │   ├── donations.js      (My Donations table, Create Donation form, Details page)
    │   └── requests.js       (donor Requests page — accept/reject)
    └── images/                (empty — for donation photos etc.)
```
#   F o o d D o n a t i o n S y s t e m  
 