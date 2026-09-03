# FoodShare — Food Waste Management System (Frontend)

A DBMS Lab project connecting people/organizations with surplus food
to the people or organizations that need it. This repository
currently contains **Phase 1: the public frontend shell** — no PHP,
no MySQL yet. Everything runs on HTML, CSS, and vanilla JavaScript,
with mock data standing in for the database.

## What's in Phase 1 through Phase 6

| Area | File(s) |
|---|---|
| Landing page | `index.html` |
| Login page (+ demo role login) | `login.html` |
| Registration page (role-adaptive) | `register.html` |
| Design system (tokens, buttons, forms, cards, badges, modal, toast, table, navbar, footer, star rating) | `assets/css/style.css` |
| Responsive rules (tablet/mobile/small-phone) | `assets/css/responsive.css` |
| Dashboard shell (sidebar, topbar, stat cards, filter bar, timeline, pagination, donation cards, bar charts) | `assets/css/dashboard.css` |
| Shared UI behaviour (nav + sidebar toggle, toasts, modals, formatting helpers) | `assets/js/app.js` |
| Mock data + data-access functions | `assets/js/mock-data.js` |
| Demo "auth" (session, role guard, demo login, login/register forms) | `assets/js/auth-demo.js` |
| **Donor**: dashboard, My Donations, Create Donation, Donation Details, Requests, Notifications, Feedback (received), Profile | `donor/*.html` |
| Donor page logic | `assets/js/donations.js`, `assets/js/requests.js` |
| **Recipient**: dashboard, Find Food, Food Details/Request, My Requests, Notifications, Feedback (give/view), Profile | `recipient/*.html` |
| Recipient page logic | `assets/js/find-food.js` |
| **Volunteer**: dashboard, Pickup Assignments, Delivery History, Pickup Details, Notifications, Profile | `volunteer/*.html` |
| Volunteer page logic | `assets/js/pickups.js` |
| **Admin**: dashboard, Users, Donations, Requests, Pickup Assignments, Waste Logs, Feedback, Notifications, Audit Logs, Reports, Profile | `admin/*.html` |
| Admin page logic | `assets/js/admin.js` |
| Shared Notifications / Profile / Feedback logic (used across roles) | `assets/js/notifications.js`, `assets/js/profile.js`, `assets/js/feedback.js` |

Every sidebar link across all four roles now goes somewhere real — the only intentional placeholder left is Donor → "Pickup Status" (tracking a donor's own donations through pickup from their side), which is a reasonable Phase 7+ addition once the backend exists.

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
- ~~**Phase 5** — Admin frontend.~~ ✅ Done
- ~~**Phase 6** — Shared interactions, deeper validation, polishing:
  Notifications, Feedback, and Profile for every role, plus the
  admin Requests and Pickup Assignments views.~~ ✅ Done
- ~~**Phase 7** — Prepare the frontend for PHP/MySQL integration.~~ ✅ Done

**That's the full 7-phase frontend plan.** What's left from here is
the actual PHP + MySQL backend — a separate deliverable by design,
not a frontend task. See **`API_INTEGRATION.md`** for exactly what
to build and how it plugs into what already exists.

## Preparing for the backend (Phase 7)

Two things exist purely to make the eventual PHP/MySQL swap
mechanical rather than a rewrite:

- **`API_INTEGRATION.md`** — a full map from every `mock-data.js`
  function to its future PHP endpoint (method, path, request/
  response shape) and which of the 15 schema tables it touches,
  plus a step-by-step migration checklist in the same phase order
  the frontend was built.
- **`assets/js/api-config.js`** — a dormant `fetch()` wrapper
  (`apiFetch()`) that isn't called by anything yet, but is ready to
  drop into `mock-data.js` function bodies once real endpoints
  exist. Each function in `mock-data.js` also has a one-line
  comment pointing at the relevant section of the integration
  guide.

Neither of these touches PHP or SQL — building those is the next,
separate stage.

## The full lifecycle now works end to end in the demo

1. **Donor** posts a donation (Create Donation).
2. **Recipient** finds it (Find Food) and requests it (Food
   Details / Request).
3. **Donor** accepts the request (Requests page) — the donation
   flips to "claimed"; both sides get a notification.
4. **Volunteer** sees it under Available Assignments and claims it
   — a PickupAssignment is created.
5. **Volunteer** advances it through Confirm Pickup → Mark In
   Transit → Mark Delivered (Pickup Details) — the donation flips
   to "delivered".
6. **Recipient** leaves feedback on the completed donation
   (Feedback page); the **donor** sees it show up as feedback
   received.
7. **Admin** sees all of it reflected live across Dashboard,
   Donation Management, Requests, Pickup Assignments, Waste Logs,
   Feedback, and Reports — nothing on the admin side is separately
   maintained data.

Try it by demo-logging in as each role in turn and following one
donation through the whole chain, then check the Admin views to
see the same numbers show up there.

## Notes on Phase 6 specifically

- **Notifications**: shared logic (`notifications.js`) works for
  all four roles — click a notification to mark it read, or use
  "Mark all as read". The topbar bell icon on each dashboard links
  here too.
- **Profile**: shared logic (`profile.js`) renders the right
  fields per role (donor/recipient/volunteer-specific fields, plus
  the common ones) and saves back into the mock user record. The
  password-change section is explicitly demo-only — no password is
  stored anywhere in this frontend.
- **Feedback**: recipients leave a star rating + review on
  donations that reached "delivered"; donors see what they've
  received; admins see everything. The star widget is plain
  vanilla JS/CSS, no library.
- **Admin Requests / Pickup Assignments**: read-only platform-wide
  views — actioning a request or pickup still happens on the
  donor's/volunteer's own pages, exactly as the real workflow would
  expect.

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
│   ├── requests.html          (accept/reject incoming requests)
│   ├── notifications.html     (unread/read, mark as read)
│   ├── feedback.html          (feedback received from recipients)
│   └── profile.html           (profile + demo password change)
├── recipient/
│   ├── dashboard.html         (stats + recent activity)
│   ├── find-food.html         (browsable card grid + filters)
│   ├── food-details.html      (full details + request form)
│   ├── requests.html          (My Requests / Active Claims / Completed)
│   ├── notifications.html     (unread/read, mark as read)
│   ├── feedback.html          (leave feedback + view given)
│   └── profile.html           (profile + demo password change)
├── volunteer/
│   ├── dashboard.html         (stats + recent activity)
│   ├── assignments.html       (Available Assignments + My Pickups)
│   ├── history.html           (Delivery History)
│   ├── pickup-details.html    (info + timeline + status actions)
│   ├── notifications.html     (unread/read, mark as read)
│   └── profile.html           (profile + demo password change)
├── admin/
│   ├── dashboard.html          (system stats + status chart)
│   ├── users.html              (User Management)
│   ├── donations.html          (Donation Management)
│   ├── requests.html           (all requests, platform-wide, view-only)
│   ├── pickup-assignments.html (all pickups, platform-wide, view-only)
│   ├── waste-logs.html         (Waste Log + summary cards)
│   ├── feedback.html           (all feedback, platform-wide)
│   ├── notifications.html      (unread/read, mark as read)
│   ├── audit-logs.html         (Audit Log)
│   ├── reports.html            (6 vanilla bar-chart reports)
│   └── profile.html            (profile + demo password change)
│
└── assets/
    ├── css/
    │   ├── style.css         (design system + shared components + star rating)
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
    │   ├── admin.js          (admin: dashboard, Users, Donations, Requests, Pickups, Waste/Audit Logs, Reports)
    │   ├── notifications.js  (shared: Notifications page, all roles)
    │   ├── profile.js        (shared: Profile page, all roles)
    │   ├── feedback.js       (Feedback: recipient give/view, donor received, admin all)
    │   └── api-config.js     (Phase 7 — dormant fetch() wrapper, not yet in use)
    └── images/                (empty — for donation photos etc.)
```

See **`API_INTEGRATION.md`** at the project root for the backend
integration map referenced above.
