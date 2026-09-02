/* =========================================================
   FoodShare — mock-data.js

   Frontend-only data layer. Everything here stands in for the
   eventual 15-table MySQL database:

     AppUser, Donor, Recipient, Volunteer, Admin, Address,
     FoodCategory, FoodDonation, DonationImage, Request,
     PickupAssignment, WasteLog, Feedback, Notification, AuditLog

   HOW THIS IS ORGANISED
   ----------------------
   1. SEED_DATA        — starting sample records, written once
                          into localStorage the first time the
                          app runs.
   2. Storage helpers   — thin wrappers around localStorage.
   3. Data-access API   — getDonations(), createDonation(),
                          getRequests(), createRequest(),
                          updateRequestStatus(), getNotifications(),
                          etc. Every page should go through these
                          functions instead of touching
                          localStorage directly.

   WHY IT'S SHAPED THIS WAY
   -------------------------
   When the PHP/MySQL backend is ready, only the *inside* of
   these functions needs to change (swap localStorage reads for
   fetch() calls to api/*.php). Every page that already calls
   getDonations() etc. keeps working unmodified.
   ========================================================= */

const DB_KEY = "fw_db_v1";

/* ---------- 1. Seed data ---------- */
const SEED_DATA = {
  users: [
    {
      userId: "U-D1",
      role: "donor",
      name: "Amina Rahman",
      email: "donor@demo.com",
      phone: "+880 1711-000111",
      donorType: "Restaurant",
      organizationName: "Green Leaf Kitchen",
      address: "House 12, Road 5, Dhanmondi, Dhaka",
    },
    {
      userId: "U-R1",
      role: "recipient",
      name: "Karim Hasan",
      email: "recipient@demo.com",
      phone: "+880 1811-222333",
      recipientType: "NGO",
      organizationName: "Hope Shelter Trust",
      address: "45 Mirpur Road, Dhaka",
    },
    {
      userId: "U-V1",
      role: "volunteer",
      name: "Tanvir Alam",
      email: "volunteer@demo.com",
      phone: "+880 1911-444555",
      vehicleType: "Motorbike",
      availability: "Evenings & weekends",
      address: "22 Banani, Dhaka",
    },
    {
      userId: "U-A1",
      role: "admin",
      name: "System Admin",
      email: "admin@demo.com",
      phone: "+880 1611-777888",
      address: "FoodShare HQ, Gulshan, Dhaka",
    },
  ],

  foodCategories: [
    { categoryId: "C1", name: "Cooked Meal" },
    { categoryId: "C2", name: "Packaged Food" },
    { categoryId: "C3", name: "Produce" },
    { categoryId: "C4", name: "Bakery" },
  ],

  donations: [
    {
      donationId: "D-1001",
      donorId: "U-D1",
      donorName: "Green Leaf Kitchen",
      title: "Vegetable Biryani Trays",
      categoryId: "C1",
      description: "Freshly cooked vegetable biryani, prepared for a cancelled event.",
      quantity: 12,
      unit: "trays",
      preparedAt: "2026-09-02T10:00",
      expiresAt: "2026-09-02T20:00",
      pickupAddress: "House 12, Road 5, Dhanmondi, Dhaka",
      status: "available",
      createdAt: "2026-09-02T10:15",
      requestCount: 2,
    },
    {
      donationId: "D-1002",
      donorId: "U-D1",
      donorName: "Green Leaf Kitchen",
      title: "Packaged Sandwiches",
      categoryId: "C2",
      description: "Sealed sandwich packs left over from a catering order.",
      quantity: 30,
      unit: "packs",
      preparedAt: "2026-09-02T09:00",
      expiresAt: "2026-09-03T09:00",
      pickupAddress: "House 12, Road 5, Dhanmondi, Dhaka",
      status: "pending",
      createdAt: "2026-09-02T09:20",
      requestCount: 1,
    },
    {
      donationId: "D-1003",
      donorId: "U-D1",
      donorName: "Green Leaf Kitchen",
      title: "Mixed Seasonal Produce",
      categoryId: "C3",
      description: "Excess vegetables from the morning market delivery.",
      quantity: 18,
      unit: "kg",
      preparedAt: "2026-09-01T08:00",
      expiresAt: "2026-09-01T22:00",
      pickupAddress: "House 12, Road 5, Dhanmondi, Dhaka",
      status: "expired",
      createdAt: "2026-09-01T08:10",
      requestCount: 0,
    },
    {
      donationId: "D-1004",
      donorId: "U-D1",
      donorName: "Green Leaf Kitchen",
      title: "Bread & Bakery Assortment",
      categoryId: "C4",
      description: "End-of-day unsold bread and pastries, still fresh.",
      quantity: 24,
      unit: "pieces",
      preparedAt: "2026-09-02T18:00",
      expiresAt: "2026-09-03T08:00",
      pickupAddress: "House 12, Road 5, Dhanmondi, Dhaka",
      status: "delivered",
      createdAt: "2026-08-31T18:10",
      requestCount: 3,
    },
  ],

  requests: [
    {
      requestId: "RQ-1",
      donationId: "D-1001",
      recipientId: "U-R1",
      recipientName: "Hope Shelter Trust",
      requestedQuantity: 6,
      peopleToServe: 25,
      notes: "Serving evening meal at our shelter.",
      status: "pending",
      createdAt: "2026-09-02T11:00",
    },
    {
      requestId: "RQ-2",
      donationId: "D-1004",
      recipientId: "U-R1",
      recipientName: "Hope Shelter Trust",
      requestedQuantity: 24,
      peopleToServe: 20,
      notes: "Breakfast for residents.",
      status: "accepted",
      createdAt: "2026-08-31T19:00",
    },
  ],

  pickupAssignments: [
    {
      assignmentId: "PA-1",
      requestId: "RQ-2",
      donationId: "D-1004",
      volunteerId: "U-V1",
      donorName: "Green Leaf Kitchen",
      recipientName: "Hope Shelter Trust",
      pickupAddress: "House 12, Road 5, Dhanmondi, Dhaka",
      deliveryAddress: "45 Mirpur Road, Dhaka",
      pickupTime: "2026-08-31T19:30",
      deliveryTime: "2026-08-31T20:15",
      status: "delivered",
    },
  ],

  notifications: [
    {
      notificationId: "N-1",
      userId: "U-D1",
      message: "Your donation \"Vegetable Biryani Trays\" received a new request.",
      isRead: false,
      createdAt: "2026-09-02T11:00",
    },
    {
      notificationId: "N-2",
      userId: "U-R1",
      message: "Your request for \"Bread & Bakery Assortment\" was accepted.",
      isRead: true,
      createdAt: "2026-08-31T19:05",
    },
    {
      notificationId: "N-3",
      userId: "U-V1",
      message: "You have been assigned a new pickup.",
      isRead: true,
      createdAt: "2026-08-31T19:10",
    },
    {
      notificationId: "N-4",
      userId: "U-D1",
      message: "\"Mixed Seasonal Produce\" expired without being claimed.",
      isRead: false,
      createdAt: "2026-09-01T22:05",
    },
  ],

  feedback: [
    {
      feedbackId: "F-1",
      donationId: "D-1004",
      fromUserId: "U-R1",
      toUserId: "U-D1",
      rating: 5,
      review: "Well packed and right on time. Thank you!",
      createdAt: "2026-08-31T21:00",
    },
  ],

  wasteLogs: [
    {
      wasteLogId: "W-1",
      donationId: "D-1003",
      categoryId: "C3",
      quantity: 18,
      unit: "kg",
      reason: "No requests before expiry",
      expiresAt: "2026-09-01T22:00",
      loggedAt: "2026-09-01T22:05",
    },
  ],
};

/* ---------- 2. Storage helpers ---------- */
function loadDb() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Corrupt local data, reseeding.", e);
    }
  }
  const fresh = structuredClone(SEED_DATA);
  localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  return fresh;
}

function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function resetDemoData() {
  localStorage.setItem(DB_KEY, JSON.stringify(structuredClone(SEED_DATA)));
}

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

/* ---------- 3. Data-access API ----------
   These are written the way PHP endpoints will eventually be
   called, e.g. getDonations() will become:
     fetch('api/donations.php').then(r => r.json())
   Keeping the same function names/shapes means pages will not
   need to change when that swap happens.                     */

function getFoodCategories() {
  return loadDb().foodCategories;
}

function getCategoryName(categoryId) {
  const category = loadDb().foodCategories.find((c) => c.categoryId === categoryId);
  return category ? category.name : "Uncategorized";
}

function getDonations(filters = {}) {
  let list = loadDb().donations;
  if (filters.status) list = list.filter((d) => d.status === filters.status);
  if (filters.donorId) list = list.filter((d) => d.donorId === filters.donorId);
  if (filters.categoryId) list = list.filter((d) => d.categoryId === filters.categoryId);
  return list;
}

function getDonationById(donationId) {
  return loadDb().donations.find((d) => d.donationId === donationId) || null;
}

function createDonation(donation) {
  const db = loadDb();
  const record = {
    donationId: genId("D"),
    status: "available",
    createdAt: new Date().toISOString(),
    requestCount: 0,
    ...donation,
  };
  db.donations.unshift(record);
  saveDb(db);
  return record;
}

function updateDonationStatus(donationId, status) {
  const db = loadDb();
  const donation = db.donations.find((d) => d.donationId === donationId);
  if (donation) {
    donation.status = status;
    saveDb(db);
  }
  return donation || null;
}

function getRequests(filters = {}) {
  let list = loadDb().requests;
  if (filters.donationId) list = list.filter((r) => r.donationId === filters.donationId);
  if (filters.recipientId) list = list.filter((r) => r.recipientId === filters.recipientId);
  if (filters.status) list = list.filter((r) => r.status === filters.status);
  return list;
}

function createRequest(request) {
  const db = loadDb();
  const record = {
    requestId: genId("RQ"),
    status: "pending",
    createdAt: new Date().toISOString(),
    ...request,
  };
  db.requests.unshift(record);
  saveDb(db);
  return record;
}

function updateRequestStatus(requestId, status) {
  const db = loadDb();
  const req = db.requests.find((r) => r.requestId === requestId);
  if (req) {
    req.status = status;
    saveDb(db);
  }
  return req || null;
}

function getPickupAssignments(filters = {}) {
  let list = loadDb().pickupAssignments;
  if (filters.volunteerId) list = list.filter((p) => p.volunteerId === filters.volunteerId);
  if (filters.status) list = list.filter((p) => p.status === filters.status);
  return list;
}

function updatePickupStatus(assignmentId, status) {
  const db = loadDb();
  const a = db.pickupAssignments.find((p) => p.assignmentId === assignmentId);
  if (a) {
    a.status = status;
    saveDb(db);
  }
  return a || null;
}

function getNotifications(userId) {
  return loadDb()
    .notifications.filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function markNotificationRead(notificationId) {
  const db = loadDb();
  const n = db.notifications.find((x) => x.notificationId === notificationId);
  if (n) {
    n.isRead = true;
    saveDb(db);
  }
  return n || null;
}

function getFeedback(filters = {}) {
  let list = loadDb().feedback;
  if (filters.toUserId) list = list.filter((f) => f.toUserId === filters.toUserId);
  return list;
}

function getWasteLogs() {
  return loadDb().wasteLogs;
}

function getUsers() {
  return loadDb().users;
}

function getUserByEmail(email) {
  return loadDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function getUserByRole(role) {
  return loadDb().users.find((u) => u.role === role) || null;
}
