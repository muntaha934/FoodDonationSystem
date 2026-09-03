/* =========================================================
   FoodShare — profile.js
   Shared across all four roles. Renders the common profile
   fields plus role-specific ones (donor/recipient/volunteer),
   and a password-change section that's demo-only (no real
   passwords are stored anywhere in this frontend).
   ========================================================= */

function roleSpecificProfileFields(user) {
  if (user.role === "donor") {
    return `
      <div class="form-row">
        <div class="field">
          <label class="field__label" for="donorType">Donor type</label>
          <select id="donorType" name="donorType">
            ${["Individual", "Restaurant", "Caterer", "Grocery Store", "Event Organizer"]
              .map((opt) => `<option value="${opt}" ${user.donorType === opt ? "selected" : ""}>${opt}</option>`)
              .join("")}
          </select>
        </div>
        <div class="field">
          <label class="field__label" for="organizationName">Organization name</label>
          <input type="text" id="organizationName" name="organizationName" value="${user.organizationName || ""}" />
        </div>
      </div>`;
  }
  if (user.role === "recipient") {
    return `
      <div class="form-row">
        <div class="field">
          <label class="field__label" for="recipientType">Recipient type</label>
          <select id="recipientType" name="recipientType">
            ${["Individual", "NGO", "Shelter", "Community Kitchen"]
              .map((opt) => `<option value="${opt}" ${user.recipientType === opt ? "selected" : ""}>${opt}</option>`)
              .join("")}
          </select>
        </div>
        <div class="field">
          <label class="field__label" for="organizationName">Organization name</label>
          <input type="text" id="organizationName" name="organizationName" value="${user.organizationName || ""}" />
        </div>
      </div>`;
  }
  if (user.role === "volunteer") {
    return `
      <div class="form-row">
        <div class="field">
          <label class="field__label" for="vehicleType">Vehicle type</label>
          <select id="vehicleType" name="vehicleType">
            ${["On foot", "Bicycle", "Motorbike", "Car", "Van"]
              .map((opt) => `<option value="${opt}" ${user.vehicleType === opt ? "selected" : ""}>${opt}</option>`)
              .join("")}
          </select>
        </div>
        <div class="field">
          <label class="field__label" for="availability">Availability</label>
          <input type="text" id="availability" name="availability" value="${user.availability || ""}" />
        </div>
      </div>`;
  }
  return "";
}

function renderProfilePage() {
  const user = getSession();
  if (!user) return;

  document.getElementById("profile-form-container").innerHTML = `
    <div class="card" style="max-width: 640px;">
      <div style="display:flex; align-items:center; gap: var(--space-4); margin-bottom: var(--space-5);">
        <div class="topbar-avatar" style="width:64px; height:64px; font-size:1.5rem;">${user.name.charAt(0).toUpperCase()}</div>
        <div>
          <div style="font-weight:600;">${user.name}</div>
          <div class="text-muted" style="font-size: var(--fs-small); text-transform: capitalize;">${user.role}</div>
        </div>
      </div>

      <form data-profile-form novalidate>
        <div class="field">
          <label class="field__label" for="name">Full name</label>
          <input type="text" id="name" name="name" value="${user.name}" required />
          <span class="field__error">Enter your full name.</span>
        </div>

        <div class="form-row">
          <div class="field">
            <label class="field__label" for="email">Email</label>
            <input type="email" id="email" name="email" value="${user.email}" required />
            <span class="field__error">Enter a valid email.</span>
          </div>
          <div class="field">
            <label class="field__label" for="phone">Phone</label>
            <input type="tel" id="phone" name="phone" value="${user.phone || ""}" required />
            <span class="field__error">Enter a valid phone number.</span>
          </div>
        </div>

        <div class="field">
          <label class="field__label" for="address">Address</label>
          <input type="text" id="address" name="address" value="${user.address || ""}" required />
          <span class="field__error">Enter your address.</span>
        </div>

        ${roleSpecificProfileFields(user)}

        <button type="submit" class="btn btn--primary">Save Changes</button>
      </form>
    </div>

    <div class="card" style="max-width: 640px; margin-top: var(--space-5);">
      <h3>Change password</h3>
      <p class="text-muted" style="font-size: var(--fs-small);">This is a frontend-only demo — no password is actually stored or checked anywhere yet.</p>
      <form data-password-form novalidate>
        <div class="form-row">
          <div class="field">
            <label class="field__label" for="newPassword">New password</label>
            <input type="password" id="newPassword" name="newPassword" minlength="6" required />
            <span class="field__error">At least 6 characters.</span>
          </div>
          <div class="field">
            <label class="field__label" for="confirmNewPassword">Confirm new password</label>
            <input type="password" id="confirmNewPassword" name="confirmNewPassword" required />
            <span class="field__error">Passwords don't match.</span>
          </div>
        </div>
        <button type="submit" class="btn btn--outline">Update Password</button>
      </form>
    </div>
  `;

  const profileForm = document.querySelector("[data-profile-form]");
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = profileForm.name.value.trim();
    const email = profileForm.email.value.trim();
    const phone = profileForm.phone.value.trim();
    const address = profileForm.address.value.trim();

    let valid = true;
    valid = validateField(profileForm.name, name.length > 1) && valid;
    valid = validateField(profileForm.email, email.includes("@")) && valid;
    valid = validateField(profileForm.phone, phone.length >= 7) && valid;
    valid = validateField(profileForm.address, address.length > 4) && valid;

    if (!valid) {
      showToast("Please fix the highlighted fields.", "error");
      return;
    }

    const updates = { name, email, phone, address };
    if (profileForm.organizationName) updates.organizationName = profileForm.organizationName.value.trim();
    if (profileForm.donorType) updates.donorType = profileForm.donorType.value;
    if (profileForm.recipientType) updates.recipientType = profileForm.recipientType.value;
    if (profileForm.vehicleType) updates.vehicleType = profileForm.vehicleType.value;
    if (profileForm.availability) updates.availability = profileForm.availability.value.trim();

    const updated = updateUserProfile(user.userId, updates);
    if (updated) setSession(updated);
    showToast("Profile updated.", "success");
    document.getElementById("topbar-avatar").textContent = name.charAt(0).toUpperCase();
  });

  const passwordForm = document.querySelector("[data-password-form]");
  passwordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newPassword = passwordForm.newPassword.value;
    const confirmNewPassword = passwordForm.confirmNewPassword.value;

    let valid = true;
    valid = validateField(passwordForm.newPassword, newPassword.length >= 6) && valid;
    valid = validateField(passwordForm.confirmNewPassword, confirmNewPassword === newPassword && confirmNewPassword.length > 0) && valid;

    if (!valid) {
      showToast("Please fix the highlighted fields.", "error");
      return;
    }

    showToast("Password updated (demo only — nothing is actually stored).", "success");
    passwordForm.reset();
  });
}

function initProfilePage(role) {
  const user = requireRole(role);
  if (!user) return;
  document.getElementById("topbar-avatar").textContent = user.name.charAt(0).toUpperCase();
  renderProfilePage();
}
