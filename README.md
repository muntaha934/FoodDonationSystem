# FoodShare — Food Waste Management System (Frontend)

A DBMS Lab project connecting people/organizations with surplus food
to the people or organizations that need it. This repository
currently contains **Phase 1: the public frontend shell** — no PHP,
no MySQL yet. Everything runs on HTML, CSS, and vanilla JavaScript,
with mock data standing in for the database.

## What's in Phase 1 through Phase 5

| Area | File(s) |
|---|---|
| Landing page | `index.html` |
| Login page (+ demo role login) | `login.html` |
| Registration page (role-adaptive) | `register.html` |
| Design system (tokens, buttons, forms, cards, badges, modal, toast, table, navbar, footer) | `assets/css/style.css` |
| Responsive rules (tablet/mobile/small-phone) | `assets/css/responsive.css` |
| Dashboard shell (sidebar, topbar, stat cards, filter bar, timeline, pagination, donation cards, bar charts) | `assets/css/dashboard.css` |
| Shared UI behaviour (nav + sidebar toggle, toasts, modals, formatting helpers) | `assets/js/app.js` |
| Mock data + data-access functions | `assets/js/mock-data.js` |
| Demo "auth" (session, role guard, demo login, login/register forms) | `assets/js/auth-demo.js` |
| **Donor dashboard, My Donations, Create Donation, Donation Details, Requests** | `donor/*.html` |
| Donor page logic | `assets/js/donations.js`, `assets/js/requests.js` |
| **Recipient dashboard, Find Food, Food Details/Request, My Requests** | `recipient/*.html` |
| Recipient page logic | `assets/js/find-food.js` |
| **Volunteer dashboard, Pickup Assignments, Delivery History, Pickup Details** | `volunteer/*.html` |
| Volunteer page logic | `assets/js/pickups.js` |
| **Admin dashboard** — system stats + status distribution chart | `admin/dashboard.html` |
| **User Management** — search/filter, Activate/Deactivate | `admin/users.html` |
| **Donation Management** — every donation, all donors | `admin/donations.html` |
| **Waste Log** — summary cards + expired/unclaimed donations | `admin/waste-logs.html` |
| **Audit Log** — chronological system/action history | `admin/audit-logs.html` |
| **Reports** — 6 vanilla bar-chart reports (saved by donor, wasted by category, status distribution, volunteer performance, monthly trend, completed vs. expired) | `admin/reports.html` |
| Admin page logic | `assets/js/admin.js` |

All four roles now have a complete frontend. What's left is polish, the still-stubbed pages (Notifications, Feedback, Profile, and a few admin sidebar items), and the eventual PHP/MySQL backend.

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

- ~~**Phase 2** — Donor frontend.~~ ✅ Done
- ~~**Phase 3** — Recipient frontend.~~ ✅ Done
- ~~**Phase 4** — Volunteer frontend.~~ ✅ Done
- ~~**Phase 5** — Admin frontend: dashboard, User/Donation
  Management, Waste Logs, Audit Logs, Reports.~~ ✅ Done
- **Phase 6** — Shared interactions, deeper validation, polishing
  (this is also where Notifications, Feedback, Profile, and the
  admin Requests/Pickup Assignments pages — currently "coming
  soon" links in the sidebars — get built for real).
- **Phase 7** — Prepare the frontend for PHP/MySQL integration
  (swap the inside of the `mock-data.js` functions for `fetch()`
  calls to PHP endpoints backed by the 15-table schema).

## The full lifecycle now works end to end in the demo

1. **Donor** posts a donation (Create Donation).
2. **Recipient** finds it (Find Food) and requests it (Food
   Details / Request).
3. **Donor** accepts the request (Requests page) — the donation
   flips to "claimed".
4. **Volunteer** sees it under Available Assignments and claims it
   — a PickupAssignment is created.
5. **Volunteer** advances it through Confirm Pickup → Mark In
   Transit → Mark Delivered (Pickup Details) — the donation flips
   to "delivered".
6. **Admin** sees all of it reflected live across Dashboard,
   Donation Management, Waste Logs, and Reports — nothing on the
   admin side is separately maintained data.

Try it by demo-logging in as each role in turn and following one
donation through the whole chain, then check the Admin dashboard
to see the same numbers show up there.

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
│   ├── dashboard.html         (stats + recent activity)
│   ├── find-food.html         (browsable card grid + filters)
│   ├── food-details.html      (full details + request form)
│   └── requests.html          (My Requests / Active Claims / Completed)
├── volunteer/
│   ├── dashboard.html         (stats + recent activity)
│   ├── assignments.html       (Available Assignments + My Pickups)
│   ├── history.html           (Delivery History)
│   └── pickup-details.html    (info + timeline + status actions)
├── admin/
│   ├── dashboard.html         (system stats + status chart)
│   ├── users.html             (User Management)
│   ├── donations.html         (Donation Management)
│   ├── waste-logs.html        (Waste Log + summary cards)
│   ├── audit-logs.html        (Audit Log)
│   └── reports.html           (6 vanilla bar-chart reports)
│
└── assets/
    ├── css/
    │   ├── style.css         (design system + shared components)
    │   ├── responsive.css    (tablet/mobile/small-phone breakpoints)
    │   └── dashboard.css     (sidebar/topbar shell, stat cards, donation cards, bar charts)
    ├── js/
    │   ├── app.js            (nav + sidebar toggle, toasts, modals, formatters)
    │   ├── mock-data.js       (seed data + data-access functions)
    │   ├── auth-demo.js      (session, role guard, demo login, login/register forms)
    │   ├── donations.js      (donor: My Donations, Create Donation, Details)
    │   ├── requests.js       (donor: Requests — accept/reject)
    │   ├── find-food.js      (recipient: Find Food, Food Details/Request, My Requests)
    │   ├── pickups.js        (volunteer: Assignments, History, Pickup Details)
    │   └── admin.js          (admin: dashboard, Users, Donations, Waste/Audit Logs, Reports)
    └── images/                (empty — for donation photos etc.)
```
