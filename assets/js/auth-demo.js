/* =========================================================
   Sufra — auth-demo.js

   Frontend-only "authentication". Nothing here is secure and
   none of it should be reused as-is once PHP sessions exist —
   it only lets us preview every dashboard and demo the
   request/register flows before the backend is built.

   Replace later with:
     - login.php  (starts a real PHP session)
     - register.php (inserts into AppUser + role table)
     - logout.php (destroys the session)
   The function names below (getSession, setSession, logout)
   are kept the same so page code barely has to change.
   ========================================================= */

const SESSION_KEY = "fw_session_v1";

function apiRequest(path, options = {}) {
  if (typeof apiFetch === "function") {
    return apiFetch(path, options);
  }

  const isJsonBody = options.body && typeof options.body === "string" && options.body.startsWith("{");
  return fetch(`${API_CONFIG.baseUrl}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  }).then(async (response) => {
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    if (!response.ok) {
      throw new Error((body && body.message) || "Request failed.");
    }
    return body;
  });
}

/* ---------- Session helpers ---------- */
function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

async function syncSessionFromServer() {
  if (window.API_CONFIG && window.API_CONFIG.useMockData) {
    return null;
  }

  try {
    const user = await apiRequest("/session.php");
    if (user) {
      setSession(user);
    }
    return user;
  } catch (error) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

// Works whether the current page is at the project root
// (index/login/register) or one level down (donor/, recipient/,
// volunteer/, admin/) — avoids relying on the site being hosted
// at the web server's root, which XAMPP often doesn't do.
function basePath() {
  const inRoleFolder = /\/(donor|recipient|volunteer|admin)\//.test(window.location.pathname);
  return inRoleFolder ? "../" : "";
}

async function logout() {
  try {
    if (window.API_CONFIG && !window.API_CONFIG.useMockData) {
      await apiRequest("/logout.php", { method: "POST" });
    }
  } catch (error) {
    console.warn("Logout API request failed.", error);
  }

  localStorage.removeItem(SESSION_KEY);
  window.location.href = basePath() + "login.html";
}

function dashboardPathForRole(role) {
  const paths = {
    donor: "donor/dashboard.html",
    recipient: "recipient/dashboard.html",
    volunteer: "volunteer/dashboard.html",
    admin: "admin/dashboard.html",
  };
  return basePath() + (paths[role] || "login.html");
}

/* ---------- Route guard for role-specific pages ----------
   Call at the top of every donor/recipient/volunteer/admin page:
     const currentUser = requireRole("donor");
   Redirects to login with a toast if there's no session, or if
   the session's role doesn't match the page. Returns the user
   object so the page can use it immediately.                  */
function requireRole(role) {
  const user = getSession();
  if (!user || user.role !== role) {
    sessionStorage.setItem("fw_redirect_notice", "Please log in to view that page.");
    window.location.href = basePath() + "login.html";
    return null;
  }
  return user;
}

/* ---------- Demo role login (used on the login page) ---------- */
function demoLoginAs(role) {
  const demoUsers = {
    donor: "donor@demo.com",
    recipient: "recipient@demo.com",
    volunteer: "volunteer@demo.com",
    admin: "admin@demo.com",
  };

  const email = demoUsers[role];
  if (!email) {
    showToast("No demo account found for that role.", "error");
    return;
  }

  apiRequest("/login.php", {
    method: "POST",
    body: JSON.stringify({ email, password: "demo123" }),
  })
    .then((user) => {
      setSession(user);
      showToast(`Signed in as ${user.name} (${capitalize(role)}) — live backend mode.`, "success");
      setTimeout(() => {
        window.location.href = dashboardPathForRole(role);
      }, 500);
    })
    .catch((error) => {
      console.warn("Demo login failed.", error);
      const user = getUserByRole(role);
      if (!user) {
        showToast("No demo account found for that role.", "error");
        return;
      }
      setSession(user);
      showToast(`Signed in as ${user.name} (${capitalize(role)}) — demo mode fallback.`, "success");
      setTimeout(() => {
        window.location.href = dashboardPathForRole(role);
      }, 500);
    });
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/* ---------- Real-looking login form ----------
   Since there's no backend yet, a matching demo email logs
   the visitor in as that user. Any other input shows a
   friendly nudge toward the demo buttons below the form.     */
function initLoginForm() {
  const form = document.querySelector("[data-login-form]");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value;

    let valid = true;
    valid = validateField(form.email, email.length > 0 && email.includes("@")) && valid;
    valid = validateField(form.password, password.length >= 6) && valid;
    if (!valid) return;

    try {
      const user = await apiRequest("/login.php", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setSession(user);
      showToast(`Welcome back, ${user.name}.`, "success");
      setTimeout(() => {
        window.location.href = dashboardPathForRole(user.role);
      }, 500);
    } catch (error) {
      const user = getUserByEmail(email);
      if (user) {
        setSession(user);
        showToast(`Welcome back, ${user.name}.`, "success");
        setTimeout(() => {
          window.location.href = dashboardPathForRole(user.role);
        }, 500);
        return;
      }

      showToast("No account matches that email. Try a demo login or check your credentials.", "error");
    }
  });
}

function validateField(input, isValid) {
  const field = input.closest(".field");
  if (!field) return isValid;
  field.classList.toggle("has-error", !isValid);
  return isValid;
}

/* ---------- Registration form ----------
   Shows/hides role-specific fields and validates before
   "creating" the account in mock data.                       */
function initRegisterForm() {
  const form = document.querySelector("[data-register-form]");
  if (!form) return;

  const roleInputs = form.querySelectorAll('input[name="role"]');
  const roleSections = document.querySelectorAll("[data-role-fields]");

  function syncRoleFields() {
    const selected = form.querySelector('input[name="role"]:checked')?.value;
    roleSections.forEach((section) => {
      const show = section.dataset.roleFields === selected;
      section.hidden = !show;
      section.querySelectorAll("input, select").forEach((el) => {
        el.disabled = !show;
      });
    });
  }

  roleInputs.forEach((input) => input.addEventListener("change", syncRoleFields));
  syncRoleFields();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.fullName.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const address = form.address.value.trim();
    const role = form.querySelector('input[name="role"]:checked')?.value;

    let valid = true;
    valid = validateField(form.fullName, name.length > 1) && valid;
    valid = validateField(form.email, email.includes("@")) && valid;
    valid = validateField(form.phone, phone.length >= 7) && valid;
    valid = validateField(form.password, password.length >= 6) && valid;
    valid = validateField(form.confirmPassword, confirmPassword === password && confirmPassword.length > 0) && valid;
    valid = validateField(form.address, address.length > 4) && valid;

    if (getUserByEmail(email)) {
      valid = validateField(form.email, false);
      showToast("An account with that email already exists in this demo.", "error");
    }

    if (!valid) {
      showToast("Please fix the highlighted fields.", "error");
      return;
    }

    const payload = {
      name,
      email,
      phone,
      password,
      address,
      role,
    };

    if (role === "donor") {
      payload.donorType = form.donorType.value;
      payload.organizationName = form.donorOrg.value.trim();
    }
    if (role === "recipient") {
      payload.recipientType = form.recipientType.value;
      payload.organizationName = form.recipientOrg.value.trim();
    }
    if (role === "volunteer") {
      payload.vehicleType = form.vehicleType.value;
      payload.availability = form.availability.value.trim();
    }

    try {
      await apiRequest("/register.php", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      showToast("Account created. Redirecting to login…", "success");
      setTimeout(() => {
        window.location.href = basePath() + "login.html";
      }, 900);
      return;
    } catch (error) {
      console.warn("Register API failed.", error);
    }

    const newUser = {
      userId: genId("U"),
      role,
      name,
      email,
      phone,
      address,
      status: "active",
      registeredAt: new Date().toISOString(),
    };

    if (role === "donor") {
      newUser.donorType = form.donorType.value;
      newUser.organizationName = form.donorOrg.value.trim();
    }
    if (role === "recipient") {
      newUser.recipientType = form.recipientType.value;
      newUser.organizationName = form.recipientOrg.value.trim();
    }
    if (role === "volunteer") {
      newUser.vehicleType = form.vehicleType.value;
      newUser.availability = form.availability.value.trim();
    }

    const db = loadDb();
    db.users.push(newUser);
    saveDb(db);

    showToast("Account created. Redirecting to login…", "success");
    setTimeout(() => {
      window.location.href = basePath() + "login.html";
    }, 900);
  });
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initLoginForm();
  initRegisterForm();
  syncSessionFromServer();

  const notice = sessionStorage.getItem("fw_redirect_notice");
  if (notice) {
    sessionStorage.removeItem("fw_redirect_notice");
    showToast(notice, "error");
  }
});
