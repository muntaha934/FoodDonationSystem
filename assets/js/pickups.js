/* =========================================================
   FoodShare — pickups.js
   Volunteer-facing logic:
     - Available Assignments: accepted requests with no
       volunteer yet, claimable with one click
     - My Pickups: this volunteer's active assignments
     - Delivery History: this volunteer's completed/cancelled
       assignments
     - Pickup Details: full info + timeline + status-advance
       action buttons
   Uses categoryEmoji() / statusBadgeClass() / statusLabel()
   from donations.js — load that file first on these pages.
   ========================================================= */

/* ---------- Available Assignments ---------- */
function renderAvailableAssignments() {
  const list = document.getElementById("available-assignments-list");
  const empty = document.getElementById("available-assignments-empty");
  if (!list) return;

  const entries = getAvailableAssignments();

  if (entries.length === 0) {
    list.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  list.hidden = false;

  list.innerHTML = entries
    .map(
      ({ request, donation }) => `
    <div class="card" style="display:flex; flex-wrap:wrap; gap: var(--space-4); align-items:center; justify-content: space-between;">
      <div class="table-cell-with-thumb">
        <div class="food-thumb">${categoryEmoji(donation.categoryId)}</div>
        <div>
          <div class="table-cell-with-thumb__name">${donation.title}</div>
          <div class="table-cell-with-thumb__meta">${donation.donorName} → ${request.recipientName}</div>
          <div class="table-cell-with-thumb__meta">📍 Pickup: ${donation.pickupAddress}</div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap: var(--space-3);">
        <span class="badge badge--pickup-pending">Pickup pending</span>
        <button type="button" class="btn btn--primary btn--sm" onclick="handleAcceptAssignment('${request.requestId}')">Accept Assignment</button>
      </div>
    </div>`
    )
    .join("");
}

function handleAcceptAssignment(requestId) {
  const volunteer = getSession();
  if (!volunteer) return;
  if (!confirm("Accept this pickup assignment?")) return;

  const request = getRequests().find((r) => r.requestId === requestId);
  if (!request) return;
  const donation = getDonationById(request.donationId);
  if (!donation) return;

  createPickupAssignment({
    requestId: request.requestId,
    donationId: donation.donationId,
    volunteerId: volunteer.userId,
    donorName: donation.donorName,
    recipientName: request.recipientName,
    pickupAddress: donation.pickupAddress,
    deliveryAddress: "Recipient address on file",
    pickupTime: "",
    deliveryTime: "",
  });

  showToast("Assignment accepted. It's now in My Pickups.", "success");
  renderAvailableAssignments();
  renderMyPickupsTable();
}

/* ---------- My Pickups table (also reused, filtered, for history) ---------- */
function renderPickupsTable(assignments, targetId) {
  const wrap = document.getElementById(targetId);
  if (!wrap) return;

  if (assignments.length === 0) {
    wrap.innerHTML = "";
    return;
  }

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Food donation</th>
          <th>Donor</th>
          <th>Recipient</th>
          <th>Pickup location</th>
          <th>Delivery location</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${assignments
          .map((a) => {
            const donation = getDonationById(a.donationId);
            return `
          <tr>
            <td>
              <div class="table-cell-with-thumb">
                <div class="food-thumb">${donation ? categoryEmoji(donation.categoryId) : "🍽️"}</div>
                <div class="table-cell-with-thumb__name">${donation ? donation.title : "Donation removed"}</div>
              </div>
            </td>
            <td>${a.donorName}</td>
            <td>${a.recipientName}</td>
            <td>${a.pickupAddress}</td>
            <td>${a.deliveryAddress}</td>
            <td><span class="badge ${statusBadgeClass(a.status)}">${statusLabel(a.status)}</span></td>
            <td><a href="pickup-details.html?id=${a.assignmentId}" class="btn btn--outline btn--sm">View</a></td>
          </tr>`;
          })
          .join("")}
      </tbody>
    </table>`;
}

function renderMyPickupsTable() {
  const volunteer = getSession();
  if (!volunteer) return;
  const wrap = document.getElementById("my-pickups-table-wrap");
  const empty = document.getElementById("my-pickups-empty");
  if (!wrap) return;

  const active = getPickupAssignments({ volunteerId: volunteer.userId }).filter(
    (a) => !["delivered", "cancelled"].includes(a.status)
  );

  if (active.length === 0) {
    wrap.hidden = true;
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;
  wrap.hidden = false;
  renderPickupsTable(active, "my-pickups-table-wrap");
}

function initAssignmentsPage() {
  const volunteer = requireRole("volunteer");
  if (!volunteer) return;
  renderAvailableAssignments();
  renderMyPickupsTable();
}

/* ---------- Delivery History ---------- */
function renderDeliveryHistory() {
  const volunteer = getSession();
  if (!volunteer) return;
  const wrap = document.getElementById("history-table-wrap");
  const empty = document.getElementById("history-empty");

  const filterValue = document.getElementById("filter-history-status")?.value || "";
  let history = getPickupAssignments({ volunteerId: volunteer.userId }).filter((a) =>
    ["delivered", "cancelled"].includes(a.status)
  );
  if (filterValue) history = history.filter((a) => a.status === filterValue);

  if (history.length === 0) {
    wrap.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  wrap.hidden = false;
  renderPickupsTable(history, "history-table-wrap");
}

function initHistoryPage() {
  const volunteer = requireRole("volunteer");
  if (!volunteer) return;

  const select = document.getElementById("filter-history-status");
  if (select) select.addEventListener("change", renderDeliveryHistory);

  renderDeliveryHistory();
}

/* ---------- Pickup Details ---------- */
const PICKUP_STAGES = ["assigned", "picked-up", "in-transit", "delivered"];

function initPickupDetailsPage() {
  const volunteer = requireRole("volunteer");
  if (!volunteer) return;

  const params = new URLSearchParams(window.location.search);
  const assignmentId = params.get("id");
  const assignment = assignmentId ? getPickupAssignmentById(assignmentId) : null;
  const container = document.getElementById("pickup-details-container");
  const headingEl = document.getElementById("pickup-details-heading");

  if (!assignment) {
    container.innerHTML = `<div class="empty-state"><h3>Assignment not found</h3><p>It may have been removed. <a href="assignments.html">Back to Assignments</a></p></div>`;
    if (headingEl) headingEl.textContent = "Assignment not found";
    return;
  }

  const donation = getDonationById(assignment.donationId);
  const request = getRequests().find((r) => r.requestId === assignment.requestId);

  if (headingEl) headingEl.textContent = donation ? donation.title : assignment.assignmentId;
  document.title = `${donation ? donation.title : "Pickup"} — FoodShare`;

  const stageIndex = PICKUP_STAGES.indexOf(assignment.status);
  const isCancelled = assignment.status === "cancelled";

  const timelineSteps = [
    { key: "assigned", label: "Assigned", meta: "Volunteer accepted the assignment" },
    { key: "picked-up", label: "Picked up", meta: assignment.status === "picked-up" || stageIndex > 1 ? "Confirmed at pickup location" : "Not yet" },
    { key: "in-transit", label: "In transit", meta: stageIndex > 2 ? "On the way to recipient" : "Not yet" },
    { key: "delivered", label: "Delivered", meta: assignment.status === "delivered" ? formatDateTime(assignment.deliveryTime) : "Not yet" },
  ];

  const actionButton = (() => {
    if (isCancelled) return "";
    if (assignment.status === "assigned") return `<button class="btn btn--primary btn--block" onclick="advancePickup('picked-up')">Confirm Pickup</button>`;
    if (assignment.status === "picked-up") return `<button class="btn btn--primary btn--block" onclick="advancePickup('in-transit')">Mark In Transit</button>`;
    if (assignment.status === "in-transit") return `<button class="btn btn--primary btn--block" onclick="advancePickup('delivered')">Mark Delivered</button>`;
    return `<p class="text-muted" style="margin-bottom:0; text-align:center;">This delivery is complete.</p>`;
  })();

  container.innerHTML = `
    <div class="details-grid">
      <div class="stack" style="gap: var(--space-5);">
        <div class="card">
          <div class="section-head"><h3>Food</h3><span class="badge ${statusBadgeClass(assignment.status)}">${statusLabel(assignment.status)}</span></div>
          <div class="details-list">
            <div class="details-list__row"><span class="details-list__label">Food name</span><span class="details-list__value">${donation ? donation.title : "—"}</span></div>
            <div class="details-list__row"><span class="details-list__label">Quantity</span><span class="details-list__value">${donation ? `${donation.quantity} ${donation.unit}` : "—"}</span></div>
            <div class="details-list__row"><span class="details-list__label">Expiry</span><span class="details-list__value">${donation ? formatDateTime(donation.expiresAt) : "—"}</span></div>
          </div>
        </div>

        <div class="card">
          <h3>Assignment timeline</h3>
          <ul class="timeline">
            ${timelineSteps
              .map(
                (s, i) => `
              <li class="${isCancelled ? "" : i <= Math.max(stageIndex, 0) ? "is-complete" : ""}">
                <strong>${s.label}</strong>
                <span>${s.meta}</span>
              </li>`
              )
              .join("")}
          </ul>
        </div>
      </div>

      <div class="stack" style="gap: var(--space-5);">
        <div class="card">
          <h3>Donor</h3>
          <div class="details-list">
            <div class="details-list__row"><span class="details-list__label">Name</span><span class="details-list__value">${assignment.donorName}</span></div>
            <div class="details-list__row"><span class="details-list__label">Pickup address</span><span class="details-list__value">${assignment.pickupAddress}</span></div>
          </div>
        </div>

        <div class="card">
          <h3>Recipient</h3>
          <div class="details-list">
            <div class="details-list__row"><span class="details-list__label">Name</span><span class="details-list__value">${assignment.recipientName}</span></div>
            <div class="details-list__row"><span class="details-list__label">Delivery address</span><span class="details-list__value">${assignment.deliveryAddress}</span></div>
            ${request ? `<div class="details-list__row"><span class="details-list__label">Serving</span><span class="details-list__value">${request.peopleToServe ?? "—"} people</span></div>` : ""}
          </div>
        </div>

        <div class="card">${actionButton}</div>
        <a href="assignments.html" class="btn btn--outline btn--block">Back to Assignments</a>
      </div>
    </div>
  `;
}

function advancePickup(nextStatus) {
  const params = new URLSearchParams(window.location.search);
  const assignmentId = params.get("id");
  if (!assignmentId) return;

  const labels = { "picked-up": "picked up", "in-transit": "in transit", delivered: "delivered" };
  if (!confirm(`Mark this pickup as ${labels[nextStatus]}?`)) return;

  updatePickupStatus(assignmentId, nextStatus);

  if (nextStatus === "delivered") {
    const assignment = getPickupAssignmentById(assignmentId);
    if (assignment) updateDonationStatus(assignment.donationId, "delivered");
  }

  showToast(`Marked as ${labels[nextStatus]}.`, "success");
  initPickupDetailsPage();
}
