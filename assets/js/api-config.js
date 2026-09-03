/* =========================================================
   FoodShare — api-config.js  (Phase 7: integration prep)

   This file is NOT loaded by any page yet, and nothing in
   mock-data.js calls it. It exists so the switch from mock
   data to a real PHP backend is a small, mechanical change
   later, instead of a redesign.

   HOW THE SWITCH WILL WORK
   -------------------------
   1. Build the PHP endpoints described in API_INTEGRATION.md.
   2. Add <script src="assets/js/api-config.js"></script> to
      every page, right before mock-data.js.
   3. Inside mock-data.js, replace each function body with a
      call to apiFetch() against the matching endpoint, keeping
      the exact same function name and return shape. Pages call
      getDonations(), createRequest(), etc. today and will keep
      calling the exact same functions after the swap — nothing
      in donor/, recipient/, volunteer/, or admin/ needs to
      change.
   4. Set API_CONFIG.useMockData to false once the backend is
      reachable, so it's a one-line rollback if something breaks
      mid-migration.
   ========================================================= */

const API_CONFIG = {
  // Adjust to wherever the project sits under XAMPP's htdocs,
  // e.g. "/food-waste-management/api" if the project folder is
  // htdocs/food-waste-management and PHP files live in /api.
  baseUrl: "/food-waste-management/api",

  // Flip to false once real endpoints exist. Kept here (rather
  // than deleted) so mock data stays available for demos/testing
  // even after the backend is live.
  useMockData: true,
};

/**
 * Thin wrapper around fetch() that all future data-access
 * functions will use. Centralizes JSON parsing, error handling,
 * and sending the PHP session cookie, so individual functions in
 * mock-data.js stay short.
 *
 * @param {string} path - endpoint path, e.g. "/donations.php"
 * @param {RequestInit} [options] - standard fetch options
 * @returns {Promise<any>} parsed JSON response body
 * @throws {Error} if the response status is not ok, or the body
 *   isn't valid JSON when one was expected
 */
async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_CONFIG.baseUrl}${path}`, {
    credentials: "include", // send the PHP session cookie
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let body = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch (err) {
      throw new Error(`Expected JSON from ${path} but got something else.`);
    }
  }

  if (!response.ok) {
    const message = (body && body.message) || `Request to ${path} failed (${response.status}).`;
    throw new Error(message);
  }

  return body;
}

/* Example of what a migrated mock-data.js function will look
   like once this is wired in (shown here only as reference —
   not executed):

   async function getDonations(filters = {}) {
     const params = new URLSearchParams(filters).toString();
     return apiFetch(`/donations.php?${params}`);
   }

   async function createDonation(donation) {
     return apiFetch("/donations.php", {
       method: "POST",
       body: JSON.stringify(donation),
     });
   }

   Note the shift from synchronous mock functions to async ones —
   every call site (e.g. `const donations = getDonations();`) will
   need an `await`, since real network requests aren't instant the
   way reading localStorage is. That's the one non-mechanical part
   of the migration; see API_INTEGRATION.md for the full checklist. */
