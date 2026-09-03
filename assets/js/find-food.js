/* =========================================================
   FoodShare — find-food.js
   Recipient-facing logic:
     - Find Food: card grid of available donations + filters
     - Food Details / Request: full info + request form
     - My Requests: the recipient's own requests, with an
       "Active Claims" / "Completed" view via a status filter
   Uses categoryEmoji() / statusBadgeClass() / statusLabel()
   from donations.js — load that file first on these pages.
   ========================================================= */

/* ---------- Find Food grid ---------- */
function renderDonationCards(donations) {
  const grid = document.getElementById("donation-grid");
  const empty = document.getElementById("find-food-empty");
  if (!grid) return;

  if (donations.length === 0) {
    grid.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  grid.hidden = false;

  grid.innerHTML = donations
    .map(
      (d) => `
    <div class="donation-card">
      <div class="donation-card__image">
        ${isExpiringSoon(d.expiresAt) ? '<span class="badge badge--expired donation-card__flag">Expiring soon</span>' : ""}
        ${categoryEmoji(d.categoryId)}
      </div>
      <div class="donation-card__body">
        <h3 class="donation-card__title">${d.title}</h3>
        <div class="donation-card__meta">
          <div class="donation-card__row">
            <span class="badge badge--available">${getCategoryName(d.categoryId)}</span>
          </div>
          <div class="donation-card__row">📦 ${d.quantity} ${d.unit} · from ${d.donorName}</div>
          <div class="donation-card__row">📍 ${d.pickupAddress}</div>
          <div class="donation-card__row">⏱️ ${formatTimeUntil(d.expiresAt)}</div>
        </div>
        <div class="donation-card__actions">
          <a href="food-details.html?id=${d.donationId}" class="btn btn--outline btn--sm">View Details</a>
          <a href="food-details.html?id=${d.donationId}#request" class="btn btn--primary btn--sm">Request Food</a>
        </div>
      </div>
    </div>`
    )
    .join("");
}

function applyFindFoodFilters() {
  const search = (document.getElementById("ff-search")?.value || "").toLowerCase().trim();
  const category = document.getElementById("ff-category")?.value || "";
  const minQuantity = Number(document.getElementById("ff-quantity")?.value || 0);
  const expiryWindow = document.getElementById("ff-expiry")?.value || "";
  const location = (document.getElementById("ff-location")?.value || "").toLowerCase().trim();

  let donations = getDonations({ status: "available" });

  if (search) donations = donations.filter((d) => d.title.toLowerCase().includes(search));
  if (category) donations = donations.filter((d) => d.categoryId === category);
  if (minQuantity > 0) donations = donations.filter((d) => d.quantity >= minQuantity);
  if (location) donations = donations.filter((d) => d.pickupAddress.toLowerCase().includes(location));

  if (expiryWindow) {
    const hours = Number(expiryWindow);
    donations = donations.filter((d) => {
      const diffMs = new Date(d.expiresAt).getTime() - Date.now();
      return diffMs > 0 && diffMs <= hours * 60 * 60 * 1000;
    });
  }

  donations = [...donations].sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
  renderDonationCards(donations);
}

function initFindFoodPage() {
  const recipient = requireRole("recipient");
  if (!recipient) return;

  const categorySelect = document.getElementById("ff-category");
  if (categorySelect) {
    getFoodCategories().forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.categoryId;
      opt.textContent = c.name;
      categorySelect.appendChild(opt);
    });
  }

  ["ff-search", "ff-category", "ff-quantity", "ff-expiry", "ff-location"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", applyFindFoodFilters);
  });

  applyFindFoodFilters();
}

/* ---------- Food Details / Request page ---------- */
function initFoodDetailsPage() {
  const recipient = requireRole("recipient");
  if (!recipient) return;

  const params = new URLSearchParams(window.location.search);
  const donationId = params.get("id");
  const donation = donationId ? getDonationById(donationId) : null;
  const container = document.getElementById("food-details-container");

  if (!donation) {
    container.innerHTML = `<div class="empty-state"><h3>Donation not found</h3><p>It may have been claimed or removed. <a href="find-food.html">Back to Find Food</a></p></div>`;
    return;
  }

  document.title = `${donation.title} — FoodShare`;
  const headingEl = document.getElementById("food-details-heading");
  if (headingEl) headingEl.textContent = donation.title;

  const alreadyRequested = getRequests({ donationId, recipientId: recipient.userId }).length > 0;
  const canRequest = donation.status === "available" && !alreadyRequested;

  container.innerHTML = `
    <div class="details-grid">
      <div class="stack" style="gap: var(--space-5);">
        <div class="food-thumb food-thumb--lg">${categoryEmoji(donation.categoryId)}</div>
        <div class="card">
          <h3>Description</h3>
          <p>${donation.description || "No additional description provided."}</p>
        </div>
        <div class="card">
          <div class="section-head"><h3>Details</h3><span class="badge ${statusBadgeClass(donation.status)}">${statusLabel(donation.status)}</span></div>
          <div class="details-list">
            <div class="details-list__row"><span class="details-list__label">Category</span><span class="details-list__value">${getCategoryName(donation.categoryId)}</span></div>
            <div class="details-list__row"><span class="details-list__label">Quantity available</span><span class="details-list__value">${donation.quantity} ${donation.unit}</span></div>
            <div class="details-list__row"><span class="details-list__label">Expiry</span><span class="details-list__value">${formatDateTime(donation.expiresAt)} · ${formatTimeUntil(donation.expiresAt)}</span></div>
            <div class="details-list__row"><span class="details-list__label">Pickup location</span><span class="details-list__value">${donation.pickupAddress}</span></div>
            <div class="details-list__row"><span class="details-list__label">Donor</span><span class="details-list__value">${donation.donorName}</span></div>
          </div>
        </div>
      </div>

      <div class="stack" style="gap: var(--space-5);" id="request">
        <div class="card" id="request-form-card">
          <h3>Request this food</h3>
          ${
            !canRequest
              ? `<div class="empty-state" style="padding: var(--space-5) var(--space-3);">
                  <p>${alreadyRequested ? "You've already requested this donation." : "This donation is no longer available to request."}</p>
                  <a href="find-food.html" class="btn btn--outline btn--sm">Back to Find Food</a>
                </div>`
              : `
                <form data-request-form novalidate>
                  <div class="field">
                    <label class="field__label" for="requestedQuantity">Requested quantity (max ${donation.quantity} ${donation.unit})</label>
                    <input type="number" id="requestedQuantity" name="requestedQuantity" min="1" max="${donation.quantity}" required />
                    <span class="field__error">Enter a quantity up to ${donation.quantity} ${donation.unit}.</span>
                  </div>
                  <div class="field">
                    <label class="field__label" for="peopleToServe">Number of people to serve</label>
                    <input type="number" id="peopleToServe" name="peopleToServe" min="1" required />
                    <span class="field__error">Enter how many people this will serve.</span>
                  </div>
                  <div class="field">
                    <label class="field__label" for="notes">Reason / notes</label>
                    <textarea id="notes" name="notes" placeholder="What is this for, and any relevant context for the donor"></textarea>
                  </div>
                  <div class="field">
                    <label class="field__label" for="preferredPickup">Preferred pickup information</label>
                    <input type="text" id="preferredPickup" name="preferredPickup" placeholder="e.g. Anytime after 5 PM, or a contact number" />
                  </div>
                  <button type="submit" class="btn btn--primary btn--block">Request This Food</button>
                </form>
                <div id="request-confirmation" class="empty-state" hidden style="padding: var(--space-5) var(--space-3);">
                  <svg class="empty-state__icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="m8.5 12 2.5 2.5 4.5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <h3>Request sent</h3>
                  <p>The donor has been notified. You'll see the status update in My Requests.</p>
                  <a href="requests.html" class="btn btn--primary btn--sm">View My Requests</a>
                </div>`
          }
        </div>
      </div>
    </div>
  `;

  const form = document.querySelector("[data-request-form]");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const requestedQuantity = Number(form.requestedQuantity.value);
      const peopleToServe = Number(form.peopleToServe.value);

      let valid = true;
      valid = validateField(form.requestedQuantity, requestedQuantity > 0 && requestedQuantity <= donation.quantity) && valid;
      valid = validateField(form.peopleToServe, peopleToServe > 0) && valid;

      if (!valid) {
        showToast("Please fix the highlighted fields.", "error");
        return;
      }

      createRequest({
        donationId: donation.donationId,
        recipientId: recipient.userId,
        recipientName: recipient.organizationName || recipient.name,
        requestedQuantity,
        peopleToServe,
        notes: form.notes.value.trim(),
        preferredPickup: form.preferredPickup.value.trim(),
      });

      updateDonationStatus(donation.donationId, "pending");

      form.hidden = true;
      document.getElementById("request-confirmation").hidden = false;
      showToast("Request sent to the donor.", "success");
    });
  }
}

/* ---------- My Requests page ---------- */
function renderRecipientRequests() {
  const recipient = getSession();
  if (!recipient) return;

  const donationsById = Object.fromEntries(getDonations().map((d) => [d.donationId, d]));
  const filterValue = document.getElementById("filter-my-request-status")?.value || "";

  let requests = getRequests({ recipientId: recipient.userId }).map((r) => ({
    ...r,
    _donation: donationsById[r.donationId] || null,
  }));

  if (filterValue === "completed") {
    requests = requests.filter((r) => r.status === "accepted" && r._donation?.status === "delivered");
  } else if (filterValue === "accepted") {
    requests = requests.filter((r) => r.status === "accepted" && r._donation?.status !== "delivered");
  } else if (filterValue) {
    requests = requests.filter((r) => r.status === filterValue);
  }

  requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const wrap = document.getElementById("my-requests-table-wrap");
  const empty = document.getElementById("my-requests-empty");

  if (requests.length === 0) {
    wrap.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  wrap.hidden = false;

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Donation</th>
          <th>Donor</th>
          <th>Requested qty</th>
          <th>Status</th>
          <th>Submitted</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${requests
          .map((r) => {
            const d = r._donation;
            const isCompleted = r.status === "accepted" && d?.status === "delivered";
            const displayStatus = isCompleted ? "delivered" : r.status;
            return `
          <tr>
            <td>
              <div class="table-cell-with-thumb">
                <div class="food-thumb">${d ? categoryEmoji(d.categoryId) : "🍽️"}</div>
                <div>
                  <div class="table-cell-with-thumb__name">${d ? d.title : "Donation removed"}</div>
                  <div class="table-cell-with-thumb__meta">${r.donationId}</div>
                </div>
              </div>
            </td>
            <td>${d ? d.donorName : "—"}</td>
            <td>${r.requestedQuantity}${d ? " " + d.unit : ""}</td>
            <td><span class="badge ${statusBadgeClass(displayStatus)}">${statusLabel(displayStatus)}</span></td>
            <td>${formatDateTime(r.createdAt)}</td>
            <td>${d ? `<a href="food-details.html?id=${d.donationId}" class="btn btn--outline btn--sm">View</a>` : "—"}</td>
          </tr>`;
          })
          .join("")}
      </tbody>
    </table>`;
}

function initMyRequestsPage() {
  const recipient = requireRole("recipient");
  if (!recipient) return;

  const params = new URLSearchParams(window.location.search);
  const statusParam = params.get("status");
  const select = document.getElementById("filter-my-request-status");
  if (select && statusParam) select.value = statusParam;
  if (select) select.addEventListener("change", renderRecipientRequests);

  renderRecipientRequests();
}
