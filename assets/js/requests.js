/* =========================================================
   FoodShare — requests.js
   Donor-facing "Requests" page: shows requests submitted
   against the signed-in donor's donations, with accept/reject
   actions (frontend-only state change for now).
   ========================================================= */

function renderDonorRequests() {
  const donor = getSession();
  if (!donor) return;

  const myDonations = getDonations({ donorId: donor.userId });
  const myDonationsById = Object.fromEntries(myDonations.map((d) => [d.donationId, d]));
  const myDonationIds = myDonations.map((d) => d.donationId);

  const filterStatus = document.getElementById("filter-request-status")?.value || "";
  let requests = getRequests().filter((r) => myDonationIds.includes(r.donationId));
  if (filterStatus) requests = requests.filter((r) => r.status === filterStatus);
  requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const wrap = document.getElementById("requests-table-wrap");
  const empty = document.getElementById("requests-empty");

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
          <th>Recipient</th>
          <th>Requested qty</th>
          <th>People to serve</th>
          <th>Notes</th>
          <th>Status</th>
          <th>Submitted</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${requests
          .map((r) => {
            const donation = myDonationsById[r.donationId];
            return `
          <tr>
            <td>
              <div class="table-cell-with-thumb">
                <div class="food-thumb">${donation ? categoryEmoji(donation.categoryId) : "🍽️"}</div>
                <div>
                  <div class="table-cell-with-thumb__name">${donation ? donation.title : "Donation removed"}</div>
                  <div class="table-cell-with-thumb__meta">${r.donationId}</div>
                </div>
              </div>
            </td>
            <td>${r.recipientName}</td>
            <td>${r.requestedQuantity}${donation ? " " + donation.unit : ""}</td>
            <td>${r.peopleToServe ?? "—"}</td>
            <td style="white-space: normal; max-width: 220px;">${r.notes || "—"}</td>
            <td><span class="badge ${statusBadgeClass(r.status)}">${statusLabel(r.status)}</span></td>
            <td>${formatDateTime(r.createdAt)}</td>
            <td>
              ${
                r.status === "pending"
                  ? `<div style="display:flex; gap:6px;">
                      <button type="button" class="btn btn--primary btn--sm" onclick="handleRequestDecision('${r.requestId}', 'accepted')">Accept</button>
                      <button type="button" class="btn btn--outline btn--sm" onclick="handleRequestDecision('${r.requestId}', 'rejected')">Reject</button>
                    </div>`
                  : `<span class="text-muted" style="font-size: var(--fs-xsmall);">No action needed</span>`
              }
            </td>
          </tr>`;
          })
          .join("")}
      </tbody>
    </table>`;
}

function handleRequestDecision(requestId, decision) {
  const label = decision === "accepted" ? "accept" : "reject";
  if (!confirm(`Are you sure you want to ${label} this request?`)) return;

  updateRequestStatus(requestId, decision);

  if (decision === "accepted") {
    const request = getRequests().find((r) => r.requestId === requestId);
    if (request) updateDonationStatus(request.donationId, "claimed");
    showToast("Request accepted. A volunteer will be assigned next.", "success");
  } else {
    showToast("Request rejected.");
  }

  renderDonorRequests();
}

function initRequestsPage() {
  const donor = requireRole("donor");
  if (!donor) return;

  const statusFilter = document.getElementById("filter-request-status");
  if (statusFilter) statusFilter.addEventListener("change", renderDonorRequests);

  renderDonorRequests();
}
