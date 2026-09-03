/* =========================================================
   FoodShare — feedback.js
   - Recipient: leave feedback on completed (delivered) requests,
     and see feedback already given.
   - Donor: see feedback received from recipients.
   - Admin: see all feedback platform-wide.
   Uses categoryEmoji() from donations.js on some pages.
   ========================================================= */

function starRatingWidget(inputName, initialValue = 0) {
  return `
    <div class="star-rating" data-star-rating data-input-name="${inputName}">
      ${[1, 2, 3, 4, 5]
        .map(
          (n) => `<button type="button" class="star-rating__star" data-value="${n}" aria-label="${n} star${n > 1 ? "s" : ""}">★</button>`
        )
        .join("")}
      <input type="hidden" name="${inputName}" value="${initialValue}" required />
    </div>`;
}

function initStarRatingWidgets(root = document) {
  root.querySelectorAll("[data-star-rating]").forEach((widget) => {
    const hiddenInput = widget.querySelector('input[type="hidden"]');
    const stars = [...widget.querySelectorAll(".star-rating__star")];

    function paint(value) {
      stars.forEach((s) => s.classList.toggle("is-filled", Number(s.dataset.value) <= value));
    }
    paint(Number(hiddenInput.value) || 0);

    stars.forEach((star) => {
      star.addEventListener("click", () => {
        hiddenInput.value = star.dataset.value;
        paint(Number(star.dataset.value));
      });
    });
  });
}

/* ---------- Recipient: leave + view feedback ---------- */
function renderRecipientFeedbackPage() {
  const recipient = getSession();
  if (!recipient) return;

  const donationsById = Object.fromEntries(getDonations().map((d) => [d.donationId, d]));
  const given = getFeedback({ fromUserId: recipient.userId });
  const givenDonationIds = new Set(given.map((f) => f.donationId));

  const eligible = getRequests({ recipientId: recipient.userId })
    .filter((r) => r.status === "accepted" && donationsById[r.donationId]?.status === "delivered")
    .filter((r) => !givenDonationIds.has(r.donationId));

  const pendingWrap = document.getElementById("feedback-pending-list");
  const pendingEmpty = document.getElementById("feedback-pending-empty");

  if (eligible.length === 0) {
    pendingWrap.hidden = true;
    pendingEmpty.hidden = false;
  } else {
    pendingEmpty.hidden = true;
    pendingWrap.hidden = false;
    pendingWrap.innerHTML = eligible
      .map((r) => {
        const d = donationsById[r.donationId];
        return `
        <div class="card">
          <div class="table-cell-with-thumb" style="margin-bottom: var(--space-3);">
            <div class="food-thumb">${categoryEmoji(d.categoryId)}</div>
            <div>
              <div class="table-cell-with-thumb__name">${d.title}</div>
              <div class="table-cell-with-thumb__meta">from ${d.donorName}</div>
            </div>
          </div>
          <form data-feedback-form data-donation-id="${d.donationId}" data-to-user-id="${d.donorId}" novalidate>
            <div class="field">
              <label class="field__label">Rating</label>
              ${starRatingWidget("rating")}
            </div>
            <div class="field">
              <label class="field__label" for="review-${d.donationId}">Review</label>
              <textarea id="review-${d.donationId}" name="review" placeholder="How was the donation and pickup experience?"></textarea>
            </div>
            <button type="submit" class="btn btn--primary btn--sm">Submit Feedback</button>
          </form>
        </div>`;
      })
      .join("");
    initStarRatingWidgets(pendingWrap);

    pendingWrap.querySelectorAll("[data-feedback-form]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const rating = Number(form.rating.value);
        if (!rating) {
          showToast("Please select a star rating.", "error");
          return;
        }
        createFeedback({
          donationId: form.dataset.donationId,
          fromUserId: recipient.userId,
          toUserId: form.dataset.toUserId,
          rating,
          review: form.review.value.trim(),
        });
        showToast("Thanks — feedback submitted.", "success");
        renderRecipientFeedbackPage();
      });
    });
  }

  const givenWrap = document.getElementById("feedback-given-list");
  const givenEmpty = document.getElementById("feedback-given-empty");
  if (given.length === 0) {
    givenWrap.hidden = true;
    givenEmpty.hidden = false;
  } else {
    givenEmpty.hidden = true;
    givenWrap.hidden = false;
    givenWrap.innerHTML = given
      .map((f) => {
        const d = donationsById[f.donationId];
        return `
        <div class="activity-item">
          <span class="activity-item__dot"></span>
          <div>
            <div>${"★".repeat(f.rating)}${"☆".repeat(5 - f.rating)} — ${d ? d.title : f.donationId}</div>
            <div class="activity-item__meta">${f.review || "No written review."} · ${formatDateTime(f.createdAt)}</div>
          </div>
        </div>`;
      })
      .join("");
  }
}

function initRecipientFeedbackPage() {
  const recipient = requireRole("recipient");
  if (!recipient) return;
  document.getElementById("topbar-avatar").textContent = recipient.name.charAt(0).toUpperCase();
  renderRecipientFeedbackPage();
}

/* ---------- Donor: feedback received ---------- */
function initDonorFeedbackPage() {
  const donor = requireRole("donor");
  if (!donor) return;
  document.getElementById("topbar-avatar").textContent = donor.name.charAt(0).toUpperCase();

  const donationsById = Object.fromEntries(getDonations().map((d) => [d.donationId, d]));
  const received = getFeedback({ toUserId: donor.userId });

  const wrap = document.getElementById("feedback-received-list");
  const empty = document.getElementById("feedback-received-empty");

  if (received.length === 0) {
    wrap.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  wrap.hidden = false;

  const avgRating = (received.reduce((sum, f) => sum + f.rating, 0) / received.length).toFixed(1);
  document.getElementById("feedback-average").textContent = `${avgRating} ★ average across ${received.length} review${received.length === 1 ? "" : "s"}`;

  wrap.innerHTML = received
    .map((f) => {
      const d = donationsById[f.donationId];
      return `
      <div class="activity-item">
        <span class="activity-item__dot"></span>
        <div>
          <div>${"★".repeat(f.rating)}${"☆".repeat(5 - f.rating)} — ${d ? d.title : f.donationId}</div>
          <div class="activity-item__meta">${f.review || "No written review."} · ${formatDateTime(f.createdAt)}</div>
        </div>
      </div>`;
    })
    .join("");
}

/* ---------- Admin: all feedback ---------- */
function initAdminFeedbackPage() {
  const admin = requireRole("admin");
  if (!admin) return;
  document.getElementById("topbar-avatar").textContent = admin.name.charAt(0).toUpperCase();

  const donationsById = Object.fromEntries(getDonations().map((d) => [d.donationId, d]));
  const usersById = Object.fromEntries(getUsers().map((u) => [u.userId, u]));
  const feedback = getFeedback();

  const wrap = document.getElementById("admin-feedback-table-wrap");
  const empty = document.getElementById("admin-feedback-empty");

  if (feedback.length === 0) {
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
          <th>From</th>
          <th>To</th>
          <th>Rating</th>
          <th>Review</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${feedback
          .map((f) => {
            const d = donationsById[f.donationId];
            const from = usersById[f.fromUserId];
            const to = usersById[f.toUserId];
            return `
          <tr>
            <td>${d ? d.title : f.donationId}</td>
            <td>${from ? from.name : "—"}</td>
            <td>${to ? to.name : "—"}</td>
            <td>${"★".repeat(f.rating)}${"☆".repeat(5 - f.rating)}</td>
            <td style="white-space:normal; max-width: 280px;">${f.review || "—"}</td>
            <td>${formatDateTime(f.createdAt)}</td>
          </tr>`;
          })
          .join("")}
      </tbody>
    </table>`;
}
