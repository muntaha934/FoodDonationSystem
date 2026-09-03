# API Integration Guide (Phase 7)

This document is the bridge between the frontend you have now and
the PHP + MySQL backend you'll build next. It does **not** contain
any backend code or SQL — per the project's phased plan, that's
intentionally left for the next stage. What it does do is give you
an exact, page-by-page map of what to build, so the frontend needs
**zero redesign** once the backend exists.

## How to read this document

For every mock-data.js function currently in use, you'll find:

- **Mock function** — the exact name/signature already called
  throughout `donor/`, `recipient/`, `volunteer/`, and `admin/`.
- **Future endpoint** — the PHP file and HTTP method it should
  become.
- **Request** — query params or JSON body shape.
- **Response** — JSON shape the frontend already expects (so the
  PHP endpoint just needs to match it).
- **Table(s)** — which of the 15 schema tables it reads/writes.

When you build the endpoint, keep the response field names
**identical** to what's listed — the frontend reads specific keys
(e.g. `donationId`, `donorName`, `expiresAt`) all over
`assets/js/*.js`, and matching them exactly is what makes the swap
mechanical instead of a rewrite.

---

## 1. Authentication

| Mock function | Future endpoint | Table(s) |
|---|---|---|
| `initLoginForm()` submit handler | `POST /api/login.php` | AppUser, Donor/Recipient/Volunteer/Admin |
| `initRegisterForm()` submit handler | `POST /api/register.php` | AppUser, Address, + role subtype table |
| `logout()` | `POST /api/logout.php` | — (destroys PHP session) |
| `getSession()` | `GET /api/session.php` | AppUser |

**Request — `POST /api/login.php`**
```json
{ "email": "donor@demo.com", "password": "••••••" }
```

**Response — `POST /api/login.php`** (matches the `user` object
shape used everywhere via `getSession()`)
```json
{
  "userId": "U-D1",
  "role": "donor",
  "name": "Amina Rahman",
  "email": "donor@demo.com",
  "phone": "+880 1711-000111",
  "donorType": "Restaurant",
  "organizationName": "Green Leaf Kitchen",
  "address": "House 12, Road 5, Dhanmondi, Dhaka",
  "status": "active"
}
```

**Important change:** today, `getSession()` reads a JSON blob from
`localStorage`. Once real, PHP sessions replace this entirely —
`GET /api/session.php` should return the same shape (or `401` if
not logged in), and `assets/js/auth-demo.js` should be renamed/
rewritten to call it instead of touching `localStorage`. Every
page's `requireRole('donor')` call stays the same; only what's
*inside* that function changes.

---

## 2. Users (Admin)

| Mock function | Future endpoint | Table(s) |
|---|---|---|
| `getUsers()` | `GET /api/users.php` | AppUser + role subtype tables |
| `updateUserStatus(userId, status)` | `PATCH /api/users.php?id={userId}` | AppUser |
| `updateUserProfile(userId, updates)` | `PATCH /api/users.php?id={userId}` | AppUser + role subtype table |

**Response — `GET /api/users.php`** — array of user objects, same
shape as the login response above, plus `registeredAt`.

---

## 3. Food Categories

| Mock function | Future endpoint | Table(s) |
|---|---|---|
| `getFoodCategories()` | `GET /api/categories.php` | FoodCategory |
| `getCategoryName(categoryId)` | (resolved client-side from the list above — no separate endpoint needed) | FoodCategory |

This is close to static reference data — a good candidate to fetch
once per session and cache in memory rather than refetch on every
page.

---

## 4. Donations

| Mock function | Future endpoint | Table(s) |
|---|---|---|
| `getDonations(filters)` | `GET /api/donations.php?status=&donorId=&categoryId=` | FoodDonation |
| `getDonationById(id)` | `GET /api/donations.php?id={id}` | FoodDonation |
| `createDonation(donation)` | `POST /api/donations.php` | FoodDonation (+ DonationImage if a photo was uploaded) |
| `updateDonationStatus(id, status)` | `PATCH /api/donations.php?id={id}` | FoodDonation |

**Request — `POST /api/donations.php`**
```json
{
  "donorId": "U-D1",
  "title": "Vegetable Biryani Trays",
  "categoryId": "C1",
  "description": "...",
  "quantity": 12,
  "unit": "trays",
  "preparedAt": "2026-09-02T10:00",
  "expiresAt": "2026-09-02T20:00",
  "pickupAddress": "...",
  "contact": "...",
  "notes": "..."
}
```

**Response** — same object back, with a generated `donationId`,
`status: "available"`, `createdAt`, `requestCount: 0`.

**Note on images:** the Create Donation form already validates
file type/size client-side (`assets/js/donations.js`). The actual
upload needs `multipart/form-data` rather than JSON — plan for
`POST /api/donations.php` to accept either, or a separate
`POST /api/donation-images.php` that returns a URL to attach.

**Note on `WasteLog`:** nothing in the frontend currently calls an
endpoint to *create* a waste log — in the mock data, expiry is
simulated, not automatic. On the real backend, a scheduled job (a
cron-triggered PHP script, or a MySQL `EVENT`) should check for
donations past `expiresAt` with no accepted request, flip their
`status` to `expired`, and insert a `WasteLog` row. That's backend
logic with no frontend equivalent to preserve — build it however
fits your MySQL setup.

---

## 5. Requests

| Mock function | Future endpoint | Table(s) |
|---|---|---|
| `getRequests(filters)` | `GET /api/requests.php?donationId=&recipientId=&status=` | Request |
| `createRequest(request)` | `POST /api/requests.php` | Request |
| `updateRequestStatus(id, status)` | `PATCH /api/requests.php?id={id}` | Request |

**Side effects to replicate server-side** (currently done in the
frontend, e.g. in `donor/requests.js` and `recipient/find-food.js`
— on the real backend these belong in the endpoint, not the
client):
- Accepting a request → also update the related donation's
  `status` to `claimed`, and insert a `Notification` for the
  recipient.
- Submitting a request → increment the donation's `requestCount`,
  and insert a `Notification` for the donor.

---

## 6. Pickup Assignments

| Mock function | Future endpoint | Table(s) |
|---|---|---|
| `getPickupAssignments(filters)` | `GET /api/pickup-assignments.php?volunteerId=&status=` | PickupAssignment |
| `getPickupAssignmentById(id)` | `GET /api/pickup-assignments.php?id={id}` | PickupAssignment |
| `getAvailableAssignments()` | `GET /api/pickup-assignments.php?available=1` | Request, FoodDonation, PickupAssignment (accepted requests with no assignment row) |
| `createPickupAssignment(assignment)` | `POST /api/pickup-assignments.php` | PickupAssignment |
| `updatePickupStatus(id, status)` | `PATCH /api/pickup-assignments.php?id={id}` | PickupAssignment (+ FoodDonation, set to `delivered` when status becomes `delivered`) |

---

## 7. Waste Log

| Mock function | Future endpoint | Table(s) |
|---|---|---|
| `getWasteLogs()` | `GET /api/waste-logs.php` | WasteLog |

Read-only from the frontend's perspective — rows are created by
the backend job described in section 4, not by any user action.

---

## 8. Feedback

| Mock function | Future endpoint | Table(s) |
|---|---|---|
| `getFeedback(filters)` | `GET /api/feedback.php?toUserId=&fromUserId=` | Feedback |
| `createFeedback(feedback)` | `POST /api/feedback.php` | Feedback |

---

## 9. Notifications

| Mock function | Future endpoint | Table(s) |
|---|---|---|
| `getNotifications(userId)` | `GET /api/notifications.php?userId={userId}` | Notification |
| `markNotificationRead(id)` | `PATCH /api/notifications.php?id={id}` | Notification |

Notifications are *created* as a side effect of other endpoints
(accepting a request, assigning a pickup, marking delivered, etc.)
— there's no frontend "create notification" call to preserve, same
as WasteLog above.

---

## 10. Audit Log

| Mock function | Future endpoint | Table(s) |
|---|---|---|
| `getAuditLogs()` | `GET /api/audit-logs.php` | AuditLog |

Like Notification and WasteLog, AuditLog rows should be inserted
by the backend itself whenever a significant action happens
(status changes, user activation/deactivation, etc.), not by a
dedicated frontend call.

---

## Migration checklist

Work through this in the same order the frontend was built —
it mirrors the dependency chain (Donor → Recipient → Volunteer →
Admin), so each stage has something real to test against as soon
as its endpoints exist.

1. **Stand up the schema.** Create the 15 tables per the project's
   data model. Seed `FoodCategory` with the four categories already
   used in the mock data (Cooked Meal, Packaged Food, Produce,
   Bakery) so IDs line up.
2. **Auth first.** Build `login.php`, `register.php`, `logout.php`,
   `session.php`. Swap `assets/js/auth-demo.js` to call them via
   `apiFetch()` (see `assets/js/api-config.js`). Confirm demo-login
   buttons still work end to end before moving on.
3. **Donor endpoints.** Build section 4 & 5's `POST`/`GET` routes.
   Swap the matching functions in `mock-data.js`. Test
   `donor/*.html` fully before continuing.
4. **Recipient endpoints.** Same pattern for Find Food and
   requests. Test the Donor ↔ Recipient request loop end to end.
5. **Volunteer endpoints.** Pickup assignments. Test the full
   Donor → Recipient → Volunteer delivery loop.
6. **Admin endpoints.** Users, Waste Logs, Audit Logs, Feedback,
   Reports — these are mostly reads across tables already built by
   step 5, so they tend to go fastest.
7. **Cut over.** Add `<script src="assets/js/api-config.js"></script>`
   to every page (before `mock-data.js`), set
   `API_CONFIG.useMockData = false`, and update every mock-data.js
   function to call `apiFetch()` per the tables above. Remember the
   async/await change noted in `api-config.js`.
8. **Keep the mock path available.** Leaving `useMockData` as a
   real toggle (rather than deleting the mock code) means you can
   still demo the frontend offline, or fall back quickly if a
   specific endpoint isn't ready yet during grading/demo day.

## What's intentionally not covered here

- Actual `CREATE TABLE` SQL — that's your next deliverable, not a
  frontend one.
- PHP session/auth security specifics (password hashing,
  CSRF, rate limiting) — worth covering with your instructor, since
  DBMS labs vary in how much of this they expect.
- File upload storage strategy for donation photos (local disk vs.
  a dedicated uploads table) — either works with the shape above.
